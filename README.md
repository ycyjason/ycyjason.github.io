# Portfolio

Personal portfolio site (works / tools / experience) with a local content editor. React + Vite, static JSON content, GitHub Pages deploy.

## Goal

- Public site: fast, minimal, static. No backend, no database, no auth.
- Content editable via a local-only visual editor (`npm run edit`), not by hand-editing JSON (though that works too).
- Editor writes directly to the same JSON files the public site statically imports at build time — single source of truth, zero sync step.

## Stack

- React 19, react-router-dom 7, Vite 8, Tailwind 4.
- No state library, no backend, no DB. No TypeScript — plain JSX/JS, string-literal types.
- No test framework configured.

## Architecture

Two separate Vite apps sharing `src/`:

| App | Entry | Config | Base | Purpose |
|---|---|---|---|---|
| Public site | `index.html` → `src/main.jsx` | `vite.config.js` | `/` | Deployed site, build-only, static JSON import |
| Editor | `editor/index.html` → `editor/main.jsx` | `vite.editor.config.js` | `/edit/` | Local-only, dev server + content API, never deployed |

Editor reuses public components directly (`Shell`, `Intro`, `WorksGrid`, `ToolsGrid`, `ExperienceList`, `DetailBody`) so the preview is the real site, not a mock.

### Data flow

```
src/content/*.json  --(static import, build time)-->  public site (read-only)
src/content/*.json  <--(GET/PUT via dev-server middleware)--  editor (read/write)
```

- `src/lib/content.js`: statically imports `works.json`, `tools.json`, `experience.json`, `site.json`. Public site has no runtime fetch.
- `editor/vite-plugin-content-api.js`: Vite dev middleware, editor-only. Exposes `/api/content/:type` (GET/PUT, writes JSON to disk) and `/api/upload` (writes files to `public/media/...`). Also handles orphaned-media cleanup and slug-rename migration by scanning `blocks[].src`.
- `editor/lib/api.js`: client wrappers (`fetchContent`, `saveContent`, `uploadFile`) calling the above.
- Editor state is in-memory draft (`useState`) until "save" — no autosave except on delete.

### Content model

`src/content/`:
- `site.json` — single object: `name`, `headline` (optional), `intro`, `externalLinks[]`.
- `works.json`, `tools.json` — arrays of "item" objects, shared shape, rendered by the same detail page (different route prefix: `/work/:slug` vs `/tools/:slug`).
- `experience.json` — array of `{ id, range, company, ... }`.

Item shape (works/tools):
```js
{
  id, slug, title, company, date, summary, tags: [],   // company, date: optional free text, shown as "company ▪ date"
  cover,        // works only
  meta: [],     // free-form extra line items on detail page
  lead, linkUrl, linkLabel,
  sections: [{ id, label, blocks: [] }]
}
```

Block shape (inside `section.blocks[]`), discriminated by `type`, no schema enforcement — string literal + `if` chains in both editor and renderer:
```js
{ id, type: 'heading',   text }
{ id, type: 'paragraph', text }
{ id, type: 'code',      text }                              // plain monospace, no highlighting/language
{ id, type: 'metrics',   items: [{ id, label, text }] }       // grid of label + result cards, one block = one group
{ id, type: 'table',     items: [{ id, label, text }] }       // heading left, paragraph right, hairline between rows
{ id, type: 'image',     src, caption }                       // src relative to public/
{ id, type: 'video',     src, caption, mode }                 // mode: click-to-play | autoplay-once | autoplay-loop
```

Adding a new block type touches exactly 3 places: `BLOCK_KINDS`/`createBlock`/`BlockFields` in `editor/components/SectionsBuilder.jsx`, and the `Block` renderer in `src/components/sections/DetailBody.jsx`. A 4th place (`vite-plugin-content-api.js` media cleanup) only if the new type carries a `src`.

### Routing

- `/` — `Landing.jsx` (intro + works grid + tools grid + experience list)
- `/work/:slug`, `/tools/:slug` — `ItemDetail.jsx` (shared `DetailBody`, looked up via `getItemBySlug`)

## Commands

```
npm run dev     # public site, dev server
npm run build   # public site, production build -> dist/ (+ 404.html copy for SPA fallback on Pages)
npm run preview # preview the build
npm run edit    # local content editor, dev server + content API, never built/deployed
```

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`: build → `actions/upload-pages-artifact` → `actions/deploy-pages`. Requires repo Settings → Pages → Source = "GitHub Actions" (one-time manual setting, not in code).

## Conventions

- No comments except where a non-obvious constraint/invariant needs explaining (see existing JSX files for examples — e.g. why `onChange` emits patches instead of merged objects).
- No new dependencies unless necessary; prefer hand-rolled over adding a library for small needs (e.g. code block has no syntax highlighting by choice).
- Editor and public site must stay visually/behaviorally identical — editor renders real components, not a parallel implementation.
