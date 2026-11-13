import fs from 'node:fs'
import path from 'node:path'

const CONTENT_DIR = path.resolve(process.cwd(), 'src/content')
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const MEDIA_DIR = path.join(PUBLIC_DIR, 'media')
const ALLOWED_TYPES = new Set(['works', 'tools', 'experience', 'site'])
// Only these two schemas carry media (cover + section image/video blocks);
// experience and site have no such fields, so they're skipped entirely.
const MEDIA_TYPES = new Set(['works', 'tools'])
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'])
// Formats a browser <video> plays natively, so no transcoding step is needed.
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm'])
// The "-<Date.now()>" suffix the upload endpoint gives every file it writes;
// the orphan sweep only touches names with it, so hand-placed files survive.
const UPLOADED_NAME = /-\d{13}\.[a-z0-9]+$/
const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024

// Directory and file names come from author-typed slugs and picked filenames,
// so they are reduced to a conservative charset before touching a real path.
// Stripping separators and leading/trailing dots is what makes "../.." collapse
// to an empty segment that the caller then drops.
const safeSegment = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

// Vite's dev server keeps an in-memory set of known publicDir files, and only
// refreshes it from its own file watcher's 'add' event — a file written
// straight to disk here isn't recognized as servable until that event fires,
// so the browser's very first request for it (issued the instant this
// responds) falls through to Vite's SPA fallback instead of the real file.
// This is why an upload appeared not to load until an unrelated save: saving
// triggers a full client reload, and the *second* request for the same image
// succeeds because the watcher has caught up by then. Waiting for the same
// 'add' event before responding closes that gap for the first request too.
function waitUntilPublic(server, absolutePath, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      server.watcher.off('add', onAdd)
      clearTimeout(timer)
      resolve()
    }
    const onAdd = (file) => {
      if (path.resolve(file) === absolutePath) finish()
    }
    server.watcher.on('add', onAdd)
    const timer = setTimeout(finish, timeoutMs)
  })
}

const readContent = (type) => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${type}.json`), 'utf-8'))

// Calls fn(holder, key) for every media path an item references: its cover,
// plus every image/video block's src. Defined once so the sweep and the slug
// migration can never disagree about what counts as "in use".
function forEachMediaRef(item, fn) {
  if (item.cover) fn(item, 'cover')
  for (const section of item.sections ?? []) {
    for (const block of section.blocks ?? []) {
      if ((block.type === 'image' || block.type === 'video') && block.src) fn(block, 'src')
    }
  }
}

function collectMediaPaths(items) {
  const paths = new Set()
  for (const item of items ?? []) forEachMediaRef(item, (holder, key) => paths.add(holder[key]))
  return paths
}

// If an item's slug changed since the last save, its media directory (named
// after the OLD slug) is moved to match the NEW slug, and every path this
// item references is rewritten to point at the new location — otherwise the
// folder name silently drifts away from the project it belongs to, and a
// later rename would leave a stale old-slug folder behind. Matches items by
// id (stable across a rename), not slug. Mutates `newItems` in place so the
// caller writes the corrected paths, not the stale ones.
function migrateRenamedSlugs(type, oldItems, newItems) {
  const oldById = new Map((oldItems ?? []).map((item) => [item.id, item]))

  for (const item of newItems ?? []) {
    const oldItem = oldById.get(item.id)
    const oldSlug = safeSegment(oldItem?.slug)
    const newSlug = safeSegment(item.slug)
    if (!oldItem || !oldSlug || !newSlug || oldSlug === newSlug) continue

    try {
      const oldDir = path.join(MEDIA_DIR, type, oldSlug)
      if (!fs.existsSync(oldDir)) continue

      const newDir = path.join(MEDIA_DIR, type, newSlug)
      fs.mkdirSync(path.dirname(newDir), { recursive: true })

      if (fs.existsSync(newDir)) {
        // newSlug's folder already exists (e.g. renamed to match another
        // item's old slug) — merge files in rather than clobbering it.
        for (const file of fs.readdirSync(oldDir)) {
          fs.renameSync(path.join(oldDir, file), path.join(newDir, file))
        }
        fs.rmdirSync(oldDir)
      } else {
        fs.renameSync(oldDir, newDir)
      }

      const oldPrefix = `media/${type}/${oldSlug}/`
      const newPrefix = `media/${type}/${newSlug}/`
      const rewrite = (p) => (p && p.startsWith(oldPrefix) ? newPrefix + p.slice(oldPrefix.length) : p)

      forEachMediaRef(item, (holder, key) => {
        holder[key] = rewrite(holder[key])
      })
    } catch (err) {
      console.warn(
        `[content-api] failed to migrate media for renamed slug "${oldSlug}" -> "${newSlug}":`,
        err.message,
      )
    }
  }
}

// Deletes every editor-uploaded file under public/media/<type>/ that no
// works/tools item references, and prunes folders left empty. Sweeping the folder instead of
// diffing old content against new also catches uploads that never reached a
// save (upload, clear, upload again, save). Best-effort: a cleanup failure
// must never fail the content save.
function sweepUnreferencedMedia(type, data) {
  const referenced = collectMediaPaths(data)
  for (const other of MEDIA_TYPES) {
    if (other === type) continue
    try {
      for (const p of collectMediaPaths(readContent(other))) referenced.add(p)
    } catch {
      // unreadable sibling: it contributes no references
    }
  }

  // Returns how many entries remain, so the caller can prune an empty folder
  // without reading it a second time.
  const walk = (dir) => {
    let remaining = 0
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        if (walk(abs) === 0) fs.rmdirSync(abs)
        else remaining++
      } else if (entry.isFile() && UPLOADED_NAME.test(entry.name)) {
        const relPath = path.relative(PUBLIC_DIR, abs).split(path.sep).join('/')
        if (referenced.has(relPath)) remaining++
        else fs.unlinkSync(abs)
      } else {
        remaining++ // hand-placed files, dotfiles and symlinks are left alone
      }
    }
    return remaining
  }

  try {
    walk(path.join(MEDIA_DIR, type))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`[content-api] failed to sweep unreferenced media in "media/${type}":`, err.message)
    }
  }
}

// Rejects without destroying the socket: req and res share one connection,
// so destroying req on an over-limit upload resets the connection before the
// error response can be sent — the client sees a bare network failure
// instead of "file is larger than 12MB". Once over the limit this stops
// buffering (bounded memory) but keeps draining the incoming bytes so the
// socket stays healthy enough to deliver the response.
const readBody = (req, limit) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let rejected = false

    req.on('data', (chunk) => {
      if (rejected) return
      size += chunk.length
      if (size > limit) {
        rejected = true
        chunks.length = 0
        reject(new Error(`file is larger than ${Math.round(limit / 1024 / 1024)}MB`))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (!rejected) resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })

// Dev-only middleware: lets the editor read/write src/content/*.json directly
// on disk. Only registered on the editor's own Vite config, so it never runs
// as part of the public site's dev server or production build.
export default function contentApiPlugin() {
  return {
    name: 'content-api',
    configureServer(server) {
      server.middlewares.use('/api/content/', (req, res) => {
        const type = req.url.replace(/^\/+/, '').split('?')[0]

        if (!ALLOWED_TYPES.has(type)) {
          res.statusCode = 404
          res.end('unknown content type')
          return
        }

        const filePath = path.join(CONTENT_DIR, `${type}.json`)

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(filePath, 'utf-8'))
          return
        }

        if (req.method === 'PUT') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const hasMedia = MEDIA_TYPES.has(type)

              if (hasMedia) migrateRenamedSlugs(type, readContent(type), data)

              fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
              if (hasMedia) sweepUnreferencedMedia(type, data)

              res.statusCode = 204
              res.end()
            } catch (err) {
              res.statusCode = 400
              res.end(String(err))
            }
          })
          return
        }

        res.statusCode = 405
        res.end('method not allowed')
      })

      // Raw-body upload: the bytes are the request body and the metadata rides
      // in the query string, which avoids hand-rolling a multipart parser.
      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('method not allowed')
          return
        }

        const query = new URLSearchParams(req.url.split('?')[1] ?? '')
        const name = query.get('name') ?? ''
        // basename() only strips an extension it matches case-sensitively, so
        // the original casing is kept for that and lowercased for everything else
        const rawExtension = path.extname(name)
        const extension = rawExtension.toLowerCase()

        const isVideo = VIDEO_EXTENSIONS.has(extension)

        if (!IMAGE_EXTENSIONS.has(extension) && !isVideo) {
          res.statusCode = 400
          res.end(`unsupported file type "${extension || name}"`)
          return
        }

        const segments = (query.get('dir') ?? '')
          .split('/')
          .map(safeSegment)
          .filter(Boolean)
          .slice(0, 3)
        // Date.now() keeps a re-upload under the same name from being served
        // out of a stale browser cache.
        const filename = `${safeSegment(path.basename(name, rawExtension)) || 'image'}-${Date.now()}${extension}`
        const target = path.join(MEDIA_DIR, ...segments, filename)

        if (!target.startsWith(`${MEDIA_DIR}${path.sep}`)) {
          res.statusCode = 400
          res.end('invalid upload path')
          return
        }

        try {
          const body = await readBody(req, isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)

          if (body.length === 0) {
            res.statusCode = 400
            res.end('file was empty')
            return
          }

          fs.mkdirSync(path.dirname(target), { recursive: true })
          fs.writeFileSync(target, body)
          await waitUntilPublic(server, target)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ path: ['media', ...segments, filename].join('/') }))
        } catch (err) {
          // The over-limit path in readBody stops reading before the client
          // finishes sending; force the socket closed so the unread
          // remainder can't desync a reused keep-alive connection.
          res.setHeader('Connection', 'close')
          res.statusCode = 400
          res.end(String(err.message ?? err))
        }
      })
    },
  }
}
