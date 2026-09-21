import site from '../content/site.json'
import works from '../content/works.json'
import tools from '../content/tools.json'
import experience from '../content/experience.json'

export function getSite() {
  return site
}

export function getWorks() {
  return works
}

export function getTools() {
  return tools
}

export function getExperience() {
  return experience
}

// works and tools share the "item detail" shape and route (/work/:slug,
// /tools/:slug) so a single lookup covers both without the caller caring
// which list an item came from
export function getItemBySlug(slug) {
  return works.find((item) => item.slug === slug) ?? tools.find((item) => item.slug === slug)
}
