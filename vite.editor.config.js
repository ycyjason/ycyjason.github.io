import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import contentApi from './editor/vite-plugin-content-api.js'

// dev-only: this config has no build step and is never used for the
// public site. `npm run edit` is the only script that touches it.
export default defineConfig({
  root: 'editor',
  base: '/edit/',
  // serve the project's public/ (not editor/public), so an image uploaded to
  // public/media previews in the editor the moment it lands on disk
  publicDir: '../public',
  plugins: [react(), tailwindcss(), contentApi()],
})
