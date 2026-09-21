import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import ItemDetail from './pages/ItemDetail'
import ScrollRestoration from './components/layout/ScrollRestoration'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/work/:slug" element={<ItemDetail />} />
        <Route path="/tools/:slug" element={<ItemDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
