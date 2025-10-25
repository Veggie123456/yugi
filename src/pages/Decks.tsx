import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat, maxCopiesForCard } from '../lib/goatFilter'
import { useSettingsStore } from '../store/settings'
import Card from '../components/Card'

export default function Decks() {
	const rules = useSettingsStore((s) => s.goatRules)
	const [cards, setCards] = useState<any[]>([])
	const [deck, setDeck] = useState<any[]>(() => {
		try { return JSON.parse(localStorage.getItem('deck.main') || '[]') } catch { return [] }
	})
	const [side, setSide] = useState<any[]>(() => {
		try { return JSON.parse(localStorage.getItem('deck.side') || '[]') } catch { return [] }
	})
	const [extra, setExtra] = useState<any[]>(() => {
		try { return JSON.parse(localStorage.getItem('deck.extra') || '[]') } catch { return [] }
	})
	useEffect(() => { loadAllCards().then(setCards) }, [])
	const legalCards = useMemo(() => cards.filter((c) => isCardLegalInGoat(c, rules)), [cards, rules])
	function addToDeck(card: any) {
		const copies = deck.filter((d) => d.name === card.name).length
		if (copies < maxCopiesForCard(card, rules) && deck.length < 60) {
			setDeck((d) => [...d, card])
		}
	}
	function removeFromDeck(index: number) { setDeck((d) => d.filter((_, i) => i !== index)) }
	useEffect(() => { localStorage.setItem('deck.main', JSON.stringify(deck)) }, [deck])
	useEffect(() => { localStorage.setItem('deck.side', JSON.stringify(side)) }, [side])
	useEffect(() => { localStorage.setItem('deck.extra', JSON.stringify(extra)) }, [extra])

	function exportYdk() {
		const lines = [
			'#created by goat-proto',
			'#main',
			...deck.map((c) => c.id),
			'#extra',
			...extra.map((c) => c.id),
			'!side',
			...side.map((c) => c.id),
		]
		const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url; a.download = 'deck.ydk'; a.click(); URL.revokeObjectURL(url)
	}

	function importYdk(text: string) {
		const lines = text.split(/\r?\n/)
		let section: 'main' | 'extra' | 'side' = 'main'
		const mainIds: string[] = [], extraIds: string[] = [], sideIds: string[] = []
		for (const ln of lines) {
			if (ln.startsWith('#')) { if (ln === '#extra') section = 'extra'; if (ln === '!side') section = 'side'; continue }
			if (!ln.trim()) continue
			if (section === 'main') mainIds.push(ln.trim())
			else if (section === 'extra') extraIds.push(ln.trim())
			else sideIds.push(ln.trim())
		}
		const idToCard = new Map(cards.map((c: any) => [String(c.id), c]))
		setDeck(mainIds.map((id) => idToCard.get(id)).filter(Boolean))
		setExtra(extraIds.map((id) => idToCard.get(id)).filter(Boolean))
		setSide(sideIds.map((id) => idToCard.get(id)).filter(Boolean))
	}
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
				<div style={{ width: 320 }}>
					<h3>Side ({side.length})</h3>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{side.map((c, i) => <div key={`s-${c.id}-${i}`}><Card card={c} small /></div>)}
					</div>
					<h3>Extra ({extra.length})</h3>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{extra.map((c, i) => <div key={`e-${c.id}-${i}`}><Card card={c} small /></div>)}
					</div>
					<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
						<button onClick={exportYdk}>Export .ydk</button>
						<label style={{ display: 'inline-block' }}>
							<input type="file" accept=".ydk,.txt" style={{ display: 'none' }} onChange={(e) => {
								const f = e.target.files?.[0]; if (!f) return; f.text().then(importYdk)
							}} />
							<span className="panel" style={{ padding: '6px 10px', cursor: 'pointer' }}>Import .ydk</span>
						</label>
					</div>
				</div>
			</div>
		</motion.div>
	)
}


