import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Home() {
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="home-island">
			<div className="home-water-shimmer" aria-hidden="true" />
			<section className="home-hero-copy">
				<div className="home-kicker">GOAT FORMAT · SUMMER 2005</div>
				<h1>
					<span>DUELIST</span>
					<strong>ISLAND</strong>
				</h1>
				<p>
					Classic Yu-Gi-Oh! rebuilt for the browser with the GOAT card pool,
					period rules, deck building, rooms, matchmaking, animations and sound.
				</p>
				<div className="home-actions">
					<Link to="/lobby" className="island-cta primary">ENTER THE ISLAND</Link>
					<Link to="/decks" className="island-cta">BUILD A DECK</Link>
					<Link to="/database" className="island-cta">CARD LIBRARY</Link>
				</div>
			</section>

			<div className="home-format-strip">
				<span><b>2005</b> rules</span>
				<span><b>4</b> classic starter decks</span>
				<span><b>GOAT</b> only</span>
				<span><b>ONLINE</b> duels</span>
			</div>
		</motion.div>
	)
}
