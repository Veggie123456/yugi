import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Home() {
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hero">
			<section>
				<div className="eyebrow">AUGUST 2005 CARD POOL · APRIL 2005 BANLIST</div>
				<h1>GOAT<br/><span>ONLINE</span></h1>
				<p>A focused Yu-Gi-Oh! simulator built only for GOAT Format: legal cards, 2005 rules, deck building, automatic duels, matchmaking, replays, universal card animations and sound.</p>
				<div className="hero-actions">
					<Link to="/lobby">Enter Duel Lobby</Link>
					<Link to="/decks" className="secondary">Build a Deck</Link>
					<Link to="/database" className="secondary">Browse Cards</Link>
				</div>
			</section>
			<aside className="status-stack">
				<div className="status-card">
					<strong><span className="status-dot" />GOAT card pool + deck validator</strong>
					<small>Legal printings, April 2005 list, Main/Side/Fusion and .ydk import/export.</small>
				</div>
				<div className="status-card">
					<strong><span className="status-dot" />Playable duel shell</strong>
					<small>LP, phases, fixed zones, battle, first-turn rules, sounds and animation hooks.</small>
				</div>
				<div className="status-card">
					<strong><span className="status-dot building" />Automatic card-effects engine</strong>
					<small>Project Ignis ocgcore-wasm MODE_GOAT is the target rules authority for complete card interactions.</small>
				</div>
				<div className="status-card">
					<strong><span className="status-dot building" />Online rooms + matchmaking</strong>
					<small>The lobby is in place; server-authoritative duel synchronization is the networking milestone.</small>
				</div>
			</aside>
		</motion.div>
	)
}
