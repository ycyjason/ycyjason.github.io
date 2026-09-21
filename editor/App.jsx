import { useEffect, useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ContentProvider } from '../src/lib/ContentContext'
import Shell from '../src/components/layout/Shell'
import Intro from '../src/components/sections/Intro'
import WorksGrid from '../src/components/sections/WorksGrid'
import ToolsGrid from '../src/components/sections/ToolsGrid'
import ExperienceList from '../src/components/sections/ExperienceList'
import DetailBody from '../src/components/sections/DetailBody'
import { fetchContent, saveContent } from './lib/api'
import { slugify } from './lib/slugify'
import CardOverlay from './components/CardOverlay'
import AddAffordance from './components/AddAffordance'
import SettingsDrawer from './components/SettingsDrawer'
import DetailDrawer from './components/DetailDrawer'

function createItem(type) {
  if (type === 'experience') return { id: `exp-${Date.now()}`, range: '', company: '' }
  const noun = type === 'works' ? 'work' : 'tool'
  const slug = `${slugify(`new ${noun}`)}-${Date.now()}`
  return {
    id: slug,
    slug,
    title: `New ${noun}`,
    date: '',
    summary: '',
    tags: [],
    ...(type === 'works' && { cover: '' }), // only works render a cover
    meta: [],
    lead: '',
    linkUrl: '',
    linkLabel: '',
    sections: [],
  }
}

// Renders the real public components (Shell/Intro/WorksGrid/ToolsGrid/
// ExperienceList/DetailBody) against in-memory draft state, so the preview
// is the actual site, not a mock. Composes them directly rather than going
// through Landing.jsx/ItemDetail.jsx so the grids can be given the optional
// renderOverlay/renderAddAffordance props those public pages never pass.
export default function App() {
  const [draft, setDraft] = useState(null)
  const [view, setView] = useState({ mode: 'grid' })
  const [editing, setEditing] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    Promise.all([
      fetchContent('works'),
      fetchContent('tools'),
      fetchContent('experience'),
      fetchContent('site'),
    ]).then(([works, tools, experience, site]) => setDraft({ works, tools, experience, site }))
  }, [])

  if (!draft) return <p className="field-label p-8">loading&hellip;</p>

  // patch may be a value or an updater `(prevItem) => nextItem` — the latter
  // is required for anything that follows an async gap (image uploads), so
  // the merge always lands on whatever state is actually current when the
  // async call resolves, not the snapshot that was current when it started.
  const updateItem = (type, id, patch) => {
    const apply = (prev) => (typeof patch === 'function' ? patch(prev) : patch)
    setDraft((d) =>
      type === 'site'
        ? { ...d, site: apply(d.site) }
        : { ...d, [type]: d[type].map((item) => (item.id === id ? apply(item) : item)) },
    )
  }

  const addItem = (type) => {
    const item = createItem(type)
    setDraft((d) => ({ ...d, [type]: [...d[type], item] }))
    setEditing({ type, id: item.id })
  }

  // Shared by the manual save button and delete's auto-save below. Takes the
  // draft to persist as an argument rather than reading the `draft` closure,
  // so a caller that just computed a new draft (delete) can hand it over
  // directly — reading `draft` right after setDraft would still see the
  // pre-update value, since the state update hasn't landed yet.
  const persist = async (fullDraft) => {
    setStatus('saving…')
    await Promise.all([
      saveContent('works', fullDraft.works),
      saveContent('tools', fullDraft.tools),
      saveContent('experience', fullDraft.experience),
      saveContent('site', fullDraft.site),
    ])
    setStatus('saved')
    setTimeout(() => setStatus(''), 1500)
  }

  const saveAll = () => persist(draft)

  // Deleting is already behind an explicit confirm() — that confirmation is
  // the commit point, so it saves immediately rather than leaving the item
  // gone from the preview but still on disk until the next manual save.
  const deleteItem = (type, id) => {
    const noun = type === 'experience' ? 'entry' : type.slice(0, -1)
    if (!window.confirm(`Delete this ${noun}?`)) return
    const nextDraft = { ...draft, [type]: draft[type].filter((item) => item.id !== id) }
    setDraft(nextDraft)
    setEditing(null)
    setView({ mode: 'grid' })
    persist(nextDraft)
  }

  const activeItem = editing
    ? editing.type === 'site'
      ? draft.site
      : draft[editing.type].find((item) => item.id === editing.id)
    : null

  const detailItem =
    view.mode === 'detail' ? draft[view.type].find((item) => item.slug === view.slug) : null

  return (
    <div className="editor-body">
      <div className="editor-preview">
        <MemoryRouter>
          <ContentProvider value={draft}>
            {view.mode === 'detail' ? (
              <Shell>
                <DetailBody item={detailItem} />
              </Shell>
            ) : (
              <Shell>
                <Intro
                  renderOverlay={() => (
                    <CardOverlay inline onEdit={() => setEditing({ type: 'site', id: 'site' })} />
                  )}
                />
                <WorksGrid
                  renderOverlay={(item) => (
                    <CardOverlay onEdit={() => setEditing({ type: 'works', id: item.id })} />
                  )}
                  renderAddAffordance={() => (
                    <AddAffordance label="+ add work" onClick={() => addItem('works')} />
                  )}
                  onItemClick={(item) => setView({ mode: 'detail', type: 'works', slug: item.slug })}
                />
                <ToolsGrid
                  renderOverlay={(item) => (
                    <CardOverlay onEdit={() => setEditing({ type: 'tools', id: item.id })} />
                  )}
                  renderAddAffordance={() => (
                    <AddAffordance label="+ add tool" onClick={() => addItem('tools')} />
                  )}
                  onItemClick={(item) => setView({ mode: 'detail', type: 'tools', slug: item.slug })}
                />
                <ExperienceList
                  renderOverlay={(item) => (
                    <CardOverlay onEdit={() => setEditing({ type: 'experience', id: item.id })} />
                  )}
                  renderAddAffordance={() => (
                    <AddAffordance
                      label="+ add experience"
                      compact
                      onClick={() => addItem('experience')}
                    />
                  )}
                />
              </Shell>
            )}
          </ContentProvider>
        </MemoryRouter>
      </div>

      {view.mode === 'detail' ? (
        <DetailDrawer
          item={detailItem}
          onChange={(patch) => updateItem(view.type, detailItem.id, patch)}
          onBack={() => setView({ mode: 'grid' })}
          onSave={saveAll}
          status={status}
          dir={`${view.type}/${detailItem.slug}`}
        />
      ) : (
        editing &&
        activeItem && (
          <SettingsDrawer
            kind={
              editing.type === 'site'
                ? 'site'
                : editing.type === 'experience'
                  ? 'experience'
                  : editing.type.slice(0, -1)
            }
            item={activeItem}
            onChange={(patch) => updateItem(editing.type, editing.id, patch)}
            onDelete={() => deleteItem(editing.type, editing.id)}
            onClose={() => setEditing(null)}
            onSave={saveAll}
            status={status}
          />
        )
      )}
    </div>
  )
}
