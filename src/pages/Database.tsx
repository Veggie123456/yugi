import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat } from '../lib/goatFilter'
import { useSettingsStore } from '../store/settings'
import Card from '../components/Card'
import { FixedSizeGrid as Grid } from 'react-window'

export default function Database() {
	const rules = useSettingsStore((s) => s.goatRules)
	const [cards, setCards] = useState<any[]>([])
	useEffect(() => { loadAllCards().then(setCards) }, [])
	const legalCards = useMemo(() => cards.filter((c) => isCardLegalInGoat(c, rules)), [cards, rules])
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Card Database</h1>
			<p>Browse cards filtered to GOAT format.</p>
			<div style={{ height: 600 }}>
				<Grid columnCount={6} columnWidth={170} height={600} rowCount={Math.ceil(legalCards.length/6)} rowHeight={270} width={1040}>
					{({ columnIndex, rowIndex, style }) => {
						const idx = rowIndex*6 + columnIndex
						const c = legalCards[idx]
						if (!c) return <div style={style} />
						return (
							<div style={{ ...style, padding: 6 }}>
								<Card card={c} />
								<div style={{ textAlign: 'center', marginTop: 4 }}>{c.name}</div>
							</div>
						)
					}}
				</Grid>
			</div>
		</motion.div>
	)
}


