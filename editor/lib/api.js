export async function fetchContent(type) {
  const res = await fetch(`/api/content/${type}`)
  if (!res.ok) throw new Error(`failed to load ${type}`)
  return res.json()
}

// Resolves to the stored path relative to public/ (e.g. "media/works/a/b.webp"
// or "media/works/a/clip.mp4"), which is what content holds and what
// assetUrl() expands at render time. Works for any file the upload endpoint
// accepts — images and videos alike.
//
// One retry on a network-level failure: right after the editor dev server
// starts (or a config file changes), Vite can drop an in-flight request to
// force a full client reload while re-optimizing its dependency cache. The
// upload endpoint writes the file to disk before responding, so the write
// already succeeded when that happens — only the response was lost. Retrying
// is safe (each attempt gets its own Date.now()-suffixed filename) and costs
// nothing when the first attempt simply works.
export async function uploadFile(file, dir, { _retried } = {}) {
  const query = new URLSearchParams({ dir, name: file.name })
  let res
  try {
    res = await fetch(`/api/upload?${query}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
  } catch (err) {
    if (_retried) throw err
    return uploadFile(file, dir, { _retried: true })
  }
  if (!res.ok) throw new Error(await res.text())
  const { path } = await res.json()
  return path
}

export async function saveContent(type, data) {
  const res = await fetch(`/api/content/${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`failed to save ${type}`)
}
