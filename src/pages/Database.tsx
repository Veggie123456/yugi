import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { CardData } from '../types/card'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat } from '../lib/goatFilter'
import { useSettingsStore } from '../store/settings'
import Card from '../components/Card'

export default function Database() {
	const rules = useSettingsStore((s) => s.goatRules)
	const [cards, setCards] = useState<CardData[]>([])
	const [query, setQuery] = useState('')
	const [type, setType] = useState('All')

	useEffect(() => { loadAllCards().then(setCards) }, [])

	const legalCards = useMemo(() => cards.filter((card) => isCardLegalInGoat(card, rules)), [cards, rules])
	const visible = useMemo(() => {
		const q = query.trim().toLowerCase()
		return legalCards.filter((card) => {
			if (type !== 'All' && card.cardType !== type) return false
			return !q || card.name.toLowerCase().includes(q) || card.description?.toLowerCase().includes(q)
		}).slice(0, 400)
	}, [legalCards, query, type])

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-stack">
			<div className="page-heading">
				<div>
					<div className="eyebrow">LEGAL CARD POOL</div>
					<h1>GOAT Card Database</h1>
					<p>{legalCards.length} cards currently available to the deck builder and duel client.</p>
				</div>
			</div>
			<div className="panel toolbar">
				<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or effect text…" />
				<select value={type} onChange={(event) => setType(event.target.value)}>
					<option>All</option>
					<option>Monster</option>
					<option>Spell</option>
					<option>Trap</option>
				</select>
			</div>
			<div className="database-grid">
				{visible.map((card) => (
					<div className="database-card panel" key={card.id}>
						<Card card={card} />
						<div>
							<strong>{card.name}</strong>
							<div className="muted">{card.cardType}{card.subType ? ` · ${card.subType}` : ''}{card.setCode ? ` · ${card.setCode}` : ''}</div>
							<p>{card.description}</p>
						</div>
					</div>
				))}
			</div>
		</motion.div>
	)
}
