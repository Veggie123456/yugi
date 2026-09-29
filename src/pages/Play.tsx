import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { CardData } from '../types/card'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat } from '../lib/goatFilter'
import { validateGoatDeck, isFusionMonster } from '../lib/deckRules'
import { useSettingsStore } from '../store/settings'
import Hand from '../components/Hand'
import Board from '../components/Board'
import HUD from '../components/HUD'
import Log from '../components/Log'
import { useDuelStore } from '../store/duel'
import PhaseBar from '../components/PhaseBar'
import ChainPrompt from '../components/ChainPrompt'
import { tryActivateFromHand } from '../effects/engine'

function readDeck(key: string): CardData[] {
	try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function starterDeck(cards: CardData[]): CardData[] {
	return cards.filter((card) => !isFusionMonster(card)).slice(0, 40)
}

export default function Play() {
	const rules = useSettingsStore((s) => s.goatRules)
	const resetWithDecks = useDuelStore((s) => s.resetWithDecks)
	const draw = useDuelStore((s) => s.draw)
	const normalSummon = useDuelStore((s) => s.normalSummon)
	const setFromHand = useDuelStore((s) => s.setFromHand)
	const setSpellTrapFromHand = useDuelStore((s) => s.setSpellTrapFromHand)
	const declareAttack = useDuelStore((s) => s.declareAttack)
	const turnPlayer = useDuelStore((s) => s.turnPlayer)
	const phase = useDuelStore((s) => s.phase)
	const players = useDuelStore((s) => s.players)
	const player = players[turnPlayer]
	const opponent = players[turnPlayer === 0 ? 1 : 0]
	const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null)
	const [selectedHand, setSelectedHand] = useState<number | null>(null)
	const [usingSavedDeck, setUsingSavedDeck] = useState(false)
	const [classicStarter, setClassicStarter] = useState('')

	useEffect(() => {
		loadAllCards().then((all) => {
			const legal = all.filter((card) => isCardLegalInGoat(card, rules))
			const storedMain = readDeck('deck.main')
			const storedSide = readDeck('deck.side')
			const storedFusion = readDeck('deck.fusion')
			const saved = validateGoatDeck({ main: storedMain, side: storedSide, fusion: storedFusion }, rules)
			const isClassicStarter = localStorage.getItem('deck.mode') === 'classic-starter' && storedMain.length >= 40
			const starterName = localStorage.getItem('deck.preset') || ''
			const deck1 = isClassicStarter ? storedMain : saved.valid ? storedMain : starterDeck(legal)
			const deck2 = starterDeck([...legal].reverse())
			setUsingSavedDeck(isClassicStarter || saved.valid)
			setClassicStarter(isClassicStarter ? starterName : '')
			resetWithDecks(deck1, deck2)
			draw(0, 5)
			draw(1, 5)
		})
	}, [rules, resetWithDecks, draw])

	useEffect(() => {
		setSelectedAttacker(null)
		setSelectedHand(null)
	}, [turnPlayer, phase])

	const selectedCard = selectedHand === null ? null : player.hand[selectedHand]
	const openMonsterZone = useMemo(() => player.monsterZone.findIndex((zone) => zone === null), [player.monsterZone])
	const openSpellZone = useMemo(() => player.spellTrapZone.findIndex((zone) => zone === null), [player.spellTrapZone])
	const opponentHasMonster = opponent.monsterZone.some(Boolean)

	function chooseOwnMonster(index: number) {
		if (phase !== 'BATTLE') return
		setSelectedAttacker((current) => current === index ? null : index)
	}

	function chooseOpponentMonster(index: number) {
		if (selectedAttacker === null) return
		declareAttack(selectedAttacker, index)
		setSelectedAttacker(null)
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-stack duel-page">
			<div className="page-heading compact">
				<div>
					<div className="eyebrow">LOCAL DUEL ALPHA</div>
					<h1>GOAT Duel</h1>
				</div>
				<div className="engine-badge">{
					classicStarter
						? `Classic Starter · ${classicStarter.charAt(0).toUpperCase() + classicStarter.slice(1)}`
						: usingSavedDeck ? 'Using your saved deck' : 'Using legal starter deck'
				}</div>
			</div>

			<div className="alpha-banner">
				The GOAT-only duel UI is live while the Project Ignis rules core is being wired underneath it. Zones, phases, LP, battle math, deck-out, first-turn draw, first-turn battle restriction, animation hooks and sounds work now; complex card effects still use the temporary prototype engine.
			</div>

			<HUD />
			<PhaseBar />
			<Board
				player={player}
				opponent={opponent}
				selectedAttacker={selectedAttacker}
				onOwnMonsterClick={chooseOwnMonster}
				onOpponentMonsterClick={chooseOpponentMonster}
			/>

			{selectedAttacker !== null && !opponentHasMonster && (
				<div className="action-strip">
					<button onClick={() => { declareAttack(selectedAttacker); setSelectedAttacker(null) }}>Direct Attack</button>
				</div>
			)}

			<div className="hand-header">
				<strong>{player.name} Hand · {player.hand.length}</strong>
				<span className="muted">Select a card, then choose an action.</span>
			</div>
			<Hand cards={player.hand} onCardClick={(_, index) => setSelectedHand(index)} />

			{selectedCard && (
				<div className="panel selected-card-actions">
					<div className="selected-card-copy">
						<strong>{selectedCard.name}</strong>
						<div className="muted">{selectedCard.cardType}{selectedCard.subType ? ` · ${selectedCard.subType}` : ''}</div>
						<small>{selectedCard.description}</small>
					</div>
					<div className="action-strip">
						{selectedCard.cardType === 'Monster' && (
							<>
								<button disabled={openMonsterZone < 0} onClick={() => {
									if (openMonsterZone >= 0 && selectedHand !== null) normalSummon(turnPlayer, selectedHand, openMonsterZone)
									setSelectedHand(null)
								}}>Normal Summon</button>
								<button disabled={openMonsterZone < 0} onClick={() => {
									if (openMonsterZone >= 0 && selectedHand !== null) setFromHand(turnPlayer, selectedHand, openMonsterZone)
									setSelectedHand(null)
								}}>Set Monster</button>
							</>
						)}
						{selectedCard.cardType === 'Spell' && (
							<button onClick={() => {
								if (selectedHand !== null) tryActivateFromHand(turnPlayer, selectedHand)
								setSelectedHand(null)
							}}>Activate</button>
						)}
						{(selectedCard.cardType === 'Spell' || selectedCard.cardType === 'Trap') && (
							<button disabled={openSpellZone < 0} onClick={() => {
								if (openSpellZone >= 0 && selectedHand !== null) setSpellTrapFromHand(turnPlayer, selectedHand, openSpellZone)
								setSelectedHand(null)
							}}>Set Spell/Trap</button>
						)}
						<button onClick={() => setSelectedHand(null)}>Cancel</button>
					</div>
				</div>
			)}

			<Log />
			<ChainPrompt />
		</motion.div>
	)
}
