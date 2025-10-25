import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { loadAllCards } from '../lib/cards'
import Hand from '../components/Hand'
import Board from '../components/Board'
import HUD from '../components/HUD'
import Log from '../components/Log'
import { useDuelStore } from '../store/duel'
import PhaseBar from '../components/PhaseBar'
import TargetingOverlay from '../components/TargetingOverlay'
import ChainPrompt from '../components/ChainPrompt'
import { tryActivateFromHand } from '../effects/engine'

export default function Play() {
	const resetWithDecks = useDuelStore((s) => s.resetWithDecks)
	const draw = useDuelStore((s) => s.draw)
	const normalSummon = useDuelStore((s) => s.normalSummon)
	const setFromHand = useDuelStore((s) => s.setFromHand)
	const declareAttack = useDuelStore((s) => s.declareAttack)
	const p = useDuelStore((s) => s.players[s.turnPlayer])
	const opp = useDuelStore((s) => s.players[s.turnPlayer===0?1:0])
	const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null)

	useEffect(() => {
		loadAllCards().then((all) => {
			const deck1 = [...all].slice(0, 40)
			const deck2 = [...all].slice(40, 80)
			resetWithDecks(deck1, deck2)
			draw(0, 5); draw(1, 5)
		})
	}, [resetWithDecks, draw])

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Play</h1>
			<PhaseBar />
			<HUD />
			<Board
				monsterZone={p.monsterZone.filter(Boolean).map((z: any) => z.card)}
				spellTrapZone={p.spellTrapZone.filter(Boolean) as any}
				graveyard={p.graveyard}
				opponentMonsterZone={opp.monsterZone.filter(Boolean).map((z: any) => z.card)}
				opponentSpellTrapZone={opp.spellTrapZone.filter(Boolean) as any}
				opponentGraveyard={opp.graveyard}
				onAttack={(attIdx, tgtIdx) => {
					// Click own monster to select attacker
					if (typeof attIdx === 'number' && attIdx >= 0 && tgtIdx === undefined) {
						setSelectedAttacker(attIdx)
						return
					}
					// If attacker selected and opponent clicked -> targeted attack
					if (selectedAttacker !== null && typeof tgtIdx === 'number') {
						declareAttack(selectedAttacker, tgtIdx)
						setSelectedAttacker(null)
						return
					}
					// If attacker selected and you click attacker again -> direct attack
					if (selectedAttacker !== null && typeof attIdx === 'number' && attIdx === selectedAttacker) {
						declareAttack(selectedAttacker)
						setSelectedAttacker(null)
					}
				}}
				onOpponentSpellTrapClick={(_, i) => {
					// If we were in a targeting state for MST (or similar), select it via engine
					// Engine will validate target filter.
				}}
			/>
			<h3>Your Hand</h3>
			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<Hand cards={p.hand} onCardClick={(_, i) => {
					// Try to activate a spell from hand; if not, attempt Normal Summon
					tryActivateFromHand(0, i)
					// Fallback to normal summon to first empty slot
					normalSummon(0, i, (p.monsterZone.findIndex((z) => z === null) + 5) % 5)
				}} />
			</div>
			<Log />
			<TargetingOverlay active={selectedAttacker !== null} />
			<ChainPrompt />
		</motion.div>
	)
}


