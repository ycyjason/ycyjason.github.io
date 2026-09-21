import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import Intro from '../components/sections/Intro'
import WorksGrid from '../components/sections/WorksGrid'
import ToolsGrid from '../components/sections/ToolsGrid'
import ExperienceList from '../components/sections/ExperienceList'
import ScrollToTop from '../components/ui/ScrollToTop'

export default function Landing() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <>
      <Shell>
        <Intro />
        <WorksGrid />
        <ToolsGrid />
        <ExperienceList />
      </Shell>
      <ScrollToTop />
    </>
  )
}
