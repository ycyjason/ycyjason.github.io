import { createContext, useContext } from 'react'
import { getSite, getWorks, getTools, getExperience, getItemBySlug } from './content'

// Default null: on the public site nothing ever wraps a <ContentProvider>,
// so every hook falls through to the static content.js getters below and
// behaves exactly as a direct getWorks()/getSite() call would. The editor
// is the only consumer that ever supplies a value, feeding in-memory draft
// state instead of the build-time JSON.
const ContentContext = createContext(null)

export const ContentProvider = ContentContext.Provider

export function useSite() {
  return useContext(ContentContext)?.site ?? getSite()
}

export function useWorks() {
  return useContext(ContentContext)?.works ?? getWorks()
}

export function useTools() {
  return useContext(ContentContext)?.tools ?? getTools()
}

export function useExperience() {
  return useContext(ContentContext)?.experience ?? getExperience()
}

export function useItemBySlug(slug) {
  const ctx = useContext(ContentContext)
  if (!ctx) return getItemBySlug(slug)
  return ctx.works.find((item) => item.slug === slug) ?? ctx.tools.find((item) => item.slug === slug)
}
