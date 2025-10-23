import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Play from './pages/Play'
import Decks from './pages/Decks'
import Database from './pages/Database'
import Settings from './pages/Settings'

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="play" element={<Play />} />
					<Route path="decks" element={<Decks />} />
					<Route path="database" element={<Database />} />
					<Route path="settings" element={<Settings />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}
