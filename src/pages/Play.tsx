import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import type { CardData } from '../types/card'
import { loadAllCards } from '../lib/cards'
import { isCardLegalInGoat } from '../lib/goatFilter'
import { validateGoatDeck, isFusionMonster } from '../lib/deckRules'
import { useSettingsStore } from '../store/settings'
import Hand from '../components/Hand'
import Board from '../components/Board'
import HUD from '../components/HUD'
import CardInspector from '../components/CardInspector'
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
	const log = useDuelStore((s) => s.log)
	const player = players[turnPlayer]
	const opponent = players[turnPlayer === 0 ? 1 : 0]
	const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null)
	const [selectedHand, setSelectedHand] = useState<number | null>(null)
	const [inspectedCard, setInspectedCard] = useState<CardData | null>(null)
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
	const displayCard = inspectedCard ?? selectedCard ?? player.hand[0] ?? null
	const openMonsterZone = useMemo(() => player.monsterZone.findIndex((zone) => zone === null), [player.monsterZone])
	const openSpellZone = useMemo(() => player.spellTrapZone.findIndex((zone) => zone === null), [player.spellTrapZone])
	const opponentHasMonster = opponent.monsterZone.some(Boolean)
	const lastLog = log[log.length - 1] || 'Duel ready'

	function chooseOwnMonster(index: number) {
		const card = player.monsterZone[index]?.card
		if (card) setInspectedCard(card)
		if (phase !== 'BATTLE') return
		setSelectedAttacker((current) => current === index ? null : index)
	}

	function chooseOpponentMonster(index: number) {
		const card = opponent.monsterZone[index]?.card
		if (card) setInspectedCard(card)
		if (selectedAttacker === null) return
		declareAttack(selectedAttacker, index)
		setSelectedAttacker(null)
	}

	function chooseHandCard(card: CardData, index: number) {
		setInspectedCard(card)
		setSelectedHand(index)
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duel-screen">
			<div className="rotate-hint">
				<strong>Rotate your phone</strong>
				<span>GOAT Online is designed to duel in landscape.</span>
			</div>

			<CardInspector card={displayCard} />

			<section className="duel-cockpit">
				<div className="duel-utility-bar">
					<Link to="/lobby" className="duel-back">‹ Lobby</Link>
					<div className="duel-format-label">
						GOAT FORMAT
						{classicStarter && <span> · Classic {classicStarter}</span>}
					</div>
					<button className="duel-icon-button" title="Settings">⚙</button>
				</div>

				<HUD />

				<div className="opponent-hand-dock">
					<Hand cards={opponent.hand} opponent />
				</div>

				<div className="arena-wrap">
					<Board
						player={player}
						opponent={opponent}
						selectedAttacker={selectedAttacker}
						onOwnMonsterClick={chooseOwnMonster}
						onOpponentMonsterClick={chooseOpponentMonster}
						onInspect={setInspectedCard}
					/>
					<PhaseBar />
				</div>

				{selectedAttacker !== null && !opponentHasMonster && (
					<button
						className="direct-attack-button"
						onClick={() => { declareAttack(selectedAttacker); setSelectedAttacker(null) }}
					>
						DIRECT ATTACK
					</button>
				)}

				<div className="player-hand-dock">
					<Hand cards={player.hand} onCardClick={chooseHandCard} />
				</div>

				{selectedCard && (
					<div className="duel-command-tray">
						<div className="command-card-name">{selectedCard.name}</div>
						<div className="command-actions">
							{selectedCard.cardType === 'Monster' && (
								<>
									<button disabled={openMonsterZone < 0} onClick={() => {
										if (openMonsterZone >= 0 && selectedHand !== null) normalSummon(turnPlayer, selectedHand, openMonsterZone)
										setSelectedHand(null)
									}}>SUMMON</button>
									<button disabled={openMonsterZone < 0} onClick={() => {
										if (openMonsterZone >= 0 && selectedHand !== null) setFromHand(turnPlayer, selectedHand, openMonsterZone)
										setSelectedHand(null)
									}}>SET</button>
								</>
							)}
							{selectedCard.cardType === 'Spell' && (
								<button onClick={() => {
									if (selectedHand !== null) tryActivateFromHand(turnPlayer, selectedHand)
									setSelectedHand(null)
								}}>ACTIVATE</button>
							)}
							{(selectedCard.cardType === 'Spell' || selectedCard.cardType === 'Trap') && (
								<button disabled={openSpellZone < 0} onClick={() => {
									if (openSpellZone >= 0 && selectedHand !== null) setSpellTrapFromHand(turnPlayer, selectedHand, openSpellZone)
									setSelectedHand(null)
								}}>SET</button>
							)}
							<button className="cancel-command" onClick={() => setSelectedHand(null)}>CANCEL</button>
						</div>
					</div>
				)}

				<div className="duel-status-strip">
					<span className="status-pulse" />
					<span>{lastLog}</span>
				</div>
			</section>

			<ChainPrompt />
		</motion.div>
	)
}
