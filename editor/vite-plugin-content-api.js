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
// mp4/webm only: broad browser <video> support without a transcoding step.
const VIDEO_EXTENSIONS = new Set(['.mp4','.mov' ,'.webm'])
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

// Rejects without destroying the socket: req and res share one connection,
// so destroying req on an over-limit upload resets the connection before the
// error response can be sent — the client sees a bare network failure
// instead of "file is larger than 12MB". Once over the limit this stops
// buffering (bounded memory) but keeps draining the incoming bytes so the
// socket stays healthy enough to deliver the response.
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

// Every path a save of works.json/tools.json can reference: each item's
// cover, plus every image/video block's src across all of its sections.
function collectMediaPaths(items) {
  const paths = new Set()
  for (const item of items ?? []) {
    if (item.cover) paths.add(item.cover)
    for (const section of item.sections ?? []) {
      for (const block of section.blocks ?? []) {
        if ((block.type === 'image' || block.type === 'video') && block.src) {
          paths.add(block.src)
        }
      }
    }
  }
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

      if (item.cover) item.cover = rewrite(item.cover)
      for (const section of item.sections ?? []) {
        for (const block of section.blocks ?? []) {
          if ((block.type === 'image' || block.type === 'video') && block.src) {
            block.src = rewrite(block.src)
          }
        }
      }
    } catch (err) {
      console.warn(
        `[content-api] failed to migrate media for renamed slug "${oldSlug}" -> "${newSlug}":`,
        err.message,
      )
    }
  }
}

// Deletes whatever media a save just dropped a reference to — a removed
// block, a removed section, a removed item, a cleared field, or a path
// replaced by a fresh upload all show up here the same way: present in the
// old content, absent from the new. Best-effort: a cleanup failure must
// never fail the actual content save.
function cleanupOrphanedMedia(oldItems, newItems) {
  const oldPaths = collectMediaPaths(oldItems)
  const newPaths = collectMediaPaths(newItems)

  for (const relPath of oldPaths) {
    if (newPaths.has(relPath)) continue

    const absPath = path.resolve(PUBLIC_DIR, relPath)
    if (!absPath.startsWith(`${PUBLIC_DIR}${path.sep}`)) continue

    try {
      fs.unlinkSync(absPath)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn(`[content-api] failed to remove orphaned media "${relPath}":`, err.message)
      }
    }
  }
}

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
              const oldData = MEDIA_TYPES.has(type)
                ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                : null

              if (oldData) migrateRenamedSlugs(type, oldData, data)

              fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
              if (oldData) cleanupOrphanedMedia(oldData, data)

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
