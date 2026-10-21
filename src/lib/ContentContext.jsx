import { createContext, useContext } from 'react'
import site from '../content/site.json'
import works from '../content/works.json'
import tools from '../content/tools.json'
import experience from '../content/experience.json'

// Default is the build-time JSON: on the public site nothing ever wraps a
// <ContentProvider>, so every hook reads the static content directly. The
// editor is the only consumer that supplies a value, feeding in-memory draft
// state ({ site, works, tools, experience }) instead.
const ContentContext = createContext({ site, works, tools, experience })

export const ContentProvider = ContentContext.Provider

export const useSite = () => useContext(ContentContext).site
export const useWorks = () => useContext(ContentContext).works
export const useTools = () => useContext(ContentContext).tools
export const useExperience = () => useContext(ContentContext).experience

// works and tools share the "item detail" shape and route (/work/:slug,
// /tools/:slug) so a single lookup covers both without the caller caring
// which list an item came from
export function useItemBySlug(slug) {
  const { works, tools } = useContext(ContentContext)
  return works.find((item) => item.slug === slug) ?? tools.find((item) => item.slug === slug)
}
