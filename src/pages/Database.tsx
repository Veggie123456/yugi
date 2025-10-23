import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat } from '../lib/goatFilter'
import { useSettingsStore } from '../store/settings'
import Card from '../components/Card'

export default function Database() {
	const rules = useSettingsStore((s) => s.goatRules)
	const [cards, setCards] = useState<any[]>([])
	useEffect(() => { loadAllCards().then(setCards) }, [])
	const legalCards = useMemo(() => cards.filter((c) => isCardLegalInGoat(c, rules)), [cards, rules])
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Card Database</h1>
			<p>Browse cards filtered to GOAT format.</p>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
				{legalCards.map((c) => (
					<div key={c.id}>
						<Card card={c} />
						<div style={{ textAlign: 'center', marginTop: 4 }}>{c.name}</div>
					</div>
				))}
			</div>
		</motion.div>
	)
}


