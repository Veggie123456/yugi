import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat, maxCopiesForCard } from '../lib/goatFilter'
import { useSettingsStore } from '../store/settings'
import Card from '../components/Card'

export default function Decks() {
	const rules = useSettingsStore((s) => s.goatRules)
	const [cards, setCards] = useState<any[]>([])
	const [deck, setDeck] = useState<any[]>([])
	useEffect(() => { loadAllCards().then(setCards) }, [])
	const legalCards = useMemo(() => cards.filter((c) => isCardLegalInGoat(c, rules)), [cards, rules])
	function addToDeck(card: any) {
		const copies = deck.filter((d) => d.name === card.name).length
		if (copies < maxCopiesForCard(card, rules) && deck.length < 60) {
			setDeck((d) => [...d, card])
		}
	}
	function removeFromDeck(index: number) { setDeck((d) => d.filter((_, i) => i !== index)) }
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Decks</h1>
			<p>Create and manage your GOAT decks.</p>
			<div style={{ display: 'flex', gap: 16 }}>
				<div style={{ flex: 1 }}>
					<h3>All Legal Cards</h3>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
						{legalCards.map((c) => (
							<div key={c.id} onClick={() => addToDeck(c)} style={{ cursor: 'pointer' }}>
								<Card card={c} />
								<div style={{ textAlign: 'center', marginTop: 4 }}>{c.name}</div>
							</div>
						))}
					</div>
				</div>
				<div style={{ flex: 1 }}>
					<h3>Deck ({deck.length})</h3>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
						{deck.map((c, i) => (
							<div key={`${c.id}-${i}`} onClick={() => removeFromDeck(i)} style={{ cursor: 'pointer' }}>
								<Card card={c} />
							</div>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	)
}


