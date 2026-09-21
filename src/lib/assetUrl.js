// Content stores media paths without a leading slash (e.g. "media/works/a.webp").
// Detail pages live at nested routes, so those paths need the deploy base
// prepended or the browser would resolve them against the current route.
export const assetUrl = (path) => (path ? `${import.meta.env.BASE_URL}${path}` : '')
