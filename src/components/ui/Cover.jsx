import { assetUrl } from '../../lib/assetUrl'
import Placeholder from './Placeholder'

// `src` is a path under public/ (e.g. "media/works/my-project/shot-123.webp").
// Decorative: the card's own heading and summary already name the item, so the
// image is hidden from assistive tech rather than announced twice.
export default function Cover({ src }) {
  if (!src) return <Placeholder />

  return (
    <span className="shot" aria-hidden="true">
      <img src={assetUrl(src)} alt="" />
    </span>
  )
}
