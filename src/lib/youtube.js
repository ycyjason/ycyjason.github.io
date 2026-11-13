// Video blocks store either a media path or a pasted YouTube link. Returns the
// 11-character video id for the common link shapes (watch, youtu.be, embed,
// shorts, live), or null when the value is not a YouTube link.
const YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/

export const youtubeId = (src) => src?.match(YOUTUBE)?.[1] ?? null
