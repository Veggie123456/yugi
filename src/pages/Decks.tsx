import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { CardData } from '../types/card'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat, maxCopiesForCard } from '../lib/goatFilter'
import { isFusionMonster, validateGoatDeck } from '../lib/deckRules'
import { useSettingsStore } from '../store/settings'
import Card from '../components/Card'

type DeckTarget = 'main' | 'side' | 'fusion'
type CardFilter = 'All' | 'Monster' | 'Spell' | 'Trap' | 'Fusion'

function readStoredDeck(key: string, fallbackKey?: string): CardData[] {
	try {
		const raw = localStorage.getItem(key) ?? (fallbackKey ? localStorage.getItem(fallbackKey) : null)
		return raw ? JSON.parse(raw) : []
	} catch {
		return []
	}
}

export default function Decks() {
	const rules = useSettingsStore((s) => s.goatRules)
	const [cards, setCards] = useState<CardData[]>([])
	const [main, setMain] = useState<CardData[]>(() => readStoredDeck('deck.main'))
	const [side, setSide] = useState<CardData[]>(() => readStoredDeck('deck.side'))
	const [fusion, setFusion] = useState<CardData[]>(() => readStoredDeck('deck.fusion', 'deck.extra'))
	const [target, setTarget] = useState<DeckTarget>('main')
	const [query, setQuery] = useState('')
	const [filter, setFilter] = useState<CardFilter>('All')
	const [notice, setNotice] = useState('')

	useEffect(() => { loadAllCards().then(setCards) }, [])
	useEffect(() => { localStorage.setItem('deck.main', JSON.stringify(main)) }, [main])
	useEffect(() => { localStorage.setItem('deck.side', JSON.stringify(side)) }, [side])
	useEffect(() => {
		localStorage.setItem('deck.fusion', JSON.stringify(fusion))
		localStorage.setItem('deck.extra', JSON.stringify(fusion))
	}, [fusion])

	const legalCards = useMemo(() => cards.filter((card) => isCardLegalInGoat(card, rules)), [cards, rules])
	const visibleCards = useMemo(() => {
		const q = query.trim().toLowerCase()
		return legalCards.filter((card) => {
			if (q && !card.name.toLowerCase().includes(q) && !card.description?.toLowerCase().includes(q)) return false
			if (filter === 'Fusion') return isFusionMonster(card)
			if (filter !== 'All' && card.cardType !== filter) return false
			return true
		}).slice(0, 240)
	}, [legalCards, query, filter])

	const validation = useMemo(() => validateGoatDeck({ main, side, fusion }, rules), [main, side, fusion, rules])

	function totalCopies(name: string) {
		return [...main, ...side, ...fusion].filter((card) => card.name === name).length
	}

	function addCard(card: CardData) {
		const max = maxCopiesForCard(card, rules)
		if (totalCopies(card.name) >= max) {
			setNotice(`${card.name} is already at its ${max}-copy limit.`)
			return
		}

		if (target === 'fusion') {
			if (!isFusionMonster(card)) {
				setNotice('Only Fusion Monsters can go in the Fusion Deck.')
				return
			}
			setFusion((current) => [...current, card])
		} else if (target === 'side') {
			if (side.length >= 15) {
				setNotice('Side Deck is already at 15 cards.')
				return
			}
			setSide((current) => [...current, card])
		} else {
			if (isFusionMonster(card)) {
				setNotice('Fusion Monsters belong in the Fusion Deck.')
				return
			}
			if (main.length >= 60) {
				setNotice('The online Main Deck cap is 60 cards.')
				return
			}
			setMain((current) => [...current, card])
		}
		setNotice(`Added ${card.name} to ${target === 'fusion' ? 'Fusion' : target === 'side' ? 'Side' : 'Main'} Deck.`)
	}

	function removeCard(section: DeckTarget, index: number) {
		if (section === 'main') setMain((current) => current.filter((_, i) => i !== index))
		if (section === 'side') setSide((current) => current.filter((_, i) => i !== index))
		if (section === 'fusion') setFusion((current) => current.filter((_, i) => i !== index))
	}

	function clearDeck() {
		setMain([])
		setSide([])
		setFusion([])
		setNotice('Deck cleared.')
	}

	function exportYdk() {
		const lines = [
			'#created by GOAT Duel Online',
			'#main',
			...main.map((card) => card.id),
			'#extra',
			...fusion.map((card) => card.id),
			'!side',
			...side.map((card) => card.id),
		]
		const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'goat-deck.ydk'
		a.click()
		URL.revokeObjectURL(url)
	}

	function importYdk(text: string) {
		const idToCard = new Map(cards.map((card) => [String(card.id), card]))
		const sections: Record<DeckTarget, string[]> = { main: [], side: [], fusion: [] }
		let section: DeckTarget = 'main'

		for (const rawLine of text.split(/\r?\n/)) {
			const line = rawLine.trim()
			if (!line || line.startsWith('#created')) continue
			if (line === '#main') { section = 'main'; continue }
			if (line === '#extra') { section = 'fusion'; continue }
			if (line === '!side') { section = 'side'; continue }
			if (line.startsWith('#')) continue
			sections[section].push(line)
		}

		const mapIds = (ids: string[]) => ids.map((id) => idToCard.get(id)).filter((card): card is CardData => !!card)
		const importedMain = mapIds(sections.main)
		const importedSide = mapIds(sections.side)
		const importedFusion = mapIds(sections.fusion)
		setMain(importedMain)
		setSide(importedSide)
		setFusion(importedFusion)
		const result = validateGoatDeck({ main: importedMain, side: importedSide, fusion: importedFusion }, rules)
		setNotice(result.valid ? 'Imported a legal GOAT deck.' : `Imported deck with ${result.errors.length} legality issue(s).`)
	}

	const renderDeckSection = (title: string, section: DeckTarget, deck: CardData[]) => (
		<div className="deck-section">
			<div className="deck-section-title">
				<strong>{title}</strong>
				<span>{deck.length}</span>
			</div>
			<div className="deck-thumbnails">
				{deck.map((card, index) => (
					<div key={`${section}-${card.id}-${index}`} className="deck-thumb" onClick={() => removeCard(section, index)} title={`Remove ${card.name}`}>
						<Card card={card} small />
					</div>
				))}
				{deck.length === 0 && <div className="muted">No cards yet.</div>}
			</div>
		</div>
	)

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-stack">
			<div className="page-heading">
				<div>
					<div className="eyebrow">GOAT FORMAT · APRIL 2005 BANLIST</div>
					<h1>Deck Builder</h1>
					<p>Build with the GOAT card pool, import old .ydk lists, and validate before dueling.</p>
				</div>
				<div className={`legal-pill ${validation.valid ? 'valid' : 'invalid'}`}>
					{validation.valid ? '✓ Duel Ready' : `${validation.errors.length} issue${validation.errors.length === 1 ? '' : 's'}`}
				</div>
			</div>

			<div className="deck-builder-grid">
				<section className="panel card-browser">
					<div className="toolbar">
						<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cards or card text…" />
						<select value={filter} onChange={(event) => setFilter(event.target.value as CardFilter)}>
							<option>All</option>
							<option>Monster</option>
							<option>Spell</option>
							<option>Trap</option>
							<option>Fusion</option>
						</select>
					</div>

					<div className="target-tabs">
						{(['main','side','fusion'] as DeckTarget[]).map((value) => (
							<button key={value} className={target === value ? 'active' : ''} onClick={() => setTarget(value)}>
								Add to {value === 'fusion' ? 'Fusion' : value === 'side' ? 'Side' : 'Main'}
							</button>
						))}
					</div>

					<div className="browser-meta">{visibleCards.length} shown · {legalCards.length} GOAT-legal cards loaded</div>
					<div className="card-grid">
						{visibleCards.map((card) => (
							<button className="card-result" key={card.id} onClick={() => addCard(card)} title={card.description}>
								<Card card={card} small />
								<span>{card.name}</span>
								<small>{card.cardType}{card.subType ? ` · ${card.subType}` : ''}</small>
							</button>
						))}
					</div>
				</section>

				<section className="panel deck-workspace">
					<div className="deck-actions">
						<label className="file-button">
							<input type="file" accept=".ydk,.txt" onChange={(event) => {
								const file = event.target.files?.[0]
								if (file) file.text().then(importYdk)
							}} />
							Import .ydk
						</label>
						<button onClick={exportYdk}>Export .ydk</button>
						<button onClick={clearDeck}>Clear</button>
					</div>
					{notice && <div className="notice">{notice}</div>}
					{renderDeckSection('Main Deck', 'main', main)}
					{renderDeckSection('Side Deck', 'side', side)}
					{renderDeckSection('Fusion Deck', 'fusion', fusion)}

					<div className="validation-box">
						<strong>Deck check</strong>
						{validation.valid && <div className="success-text">This deck is legal for the current GOAT Online rules.</div>}
						{validation.errors.map((error) => <div className="error-text" key={error}>• {error}</div>)}
						{validation.warnings.map((warning) => <div className="warning-text" key={warning}>• {warning}</div>)}
					</div>
				</section>
			</div>
		</motion.div>
	)
}
