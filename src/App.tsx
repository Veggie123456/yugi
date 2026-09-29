import { HashRouter, Routes, Route } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Play from './pages/Play'
import Decks from './pages/Decks'
import Database from './pages/Database'
import Settings from './pages/Settings'
import EffectsDemo from './pages/EffectsDemo'

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="lobby" element={<Lobby />} />
            <Route path="play" element={<Play />} />
            <Route path="decks" element={<Decks />} />
            <Route path="database" element={<Database />} />
            <Route path="effects" element={<EffectsDemo />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </DndProvider>
  )
}
