import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import Intro from '../components/sections/Intro'
import WorksGrid from '../components/sections/WorksGrid'
import ToolsGrid from '../components/sections/ToolsGrid'
import ExperienceList from '../components/sections/ExperienceList'
import ScrollToTop from '../components/ui/ScrollToTop'

export default function Landing() {
  const { hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (!hash) return
    // Only a clicked nav link (PUSH) glides; a refresh or back/forward (POP)
    // must land on the section at once, not scroll down to it in view.
    const behavior = navigationType === 'PUSH' ? 'smooth' : 'instant'
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior })
  }, [hash, navigationType])

  return (
    <>
      <Shell>
        <Intro />
        <ToolsGrid />
        <WorksGrid />
        <ExperienceList />
      </Shell>
      <ScrollToTop />
    </>
  )
}
