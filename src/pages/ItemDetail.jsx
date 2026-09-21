import { Navigate, useParams } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import DetailBody from '../components/sections/DetailBody'
import ScrollToTop from '../components/ui/ScrollToTop'
import { useItemBySlug } from '../lib/ContentContext'

export default function ItemDetail() {
  const { slug } = useParams()
  const item = useItemBySlug(slug)

  if (!item) return <Navigate to="/" replace />

  return (
    <>
      <Shell>
        <DetailBody item={item} />
      </Shell>
      <ScrollToTop />
    </>
  )
}
