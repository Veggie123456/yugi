import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { loadAllCards } from '../lib/cards'
import { useSettingsStore } from '../store/settings'
import { playSound } from '../lib/sound'
import Hand from '../components/Hand'
import Board from '../components/Board'
import { CardData } from '../types/card'

export default function Play() {
	const soundsEnabled = useSettingsStore((s) => s.soundsEnabled)
	const [deck, setDeck] = useState<CardData[]>([])
	const [hand, setHand] = useState<CardData[]>([])
	const [monsterZone, setMonsterZone] = useState<CardData[]>([])
	const [spellTrapZone, setSpellTrapZone] = useState<CardData[]>([])
	const [graveyard, setGraveyard] = useState<CardData[]>([])

	useEffect(() => {
		loadAllCards().then((all) => {
			const startDeck = [...all, ...all].slice(0, 40)
			setDeck(startDeck)
			setHand(startDeck.slice(0, 5))
		})
	}, [])

	function drawCard() {
		setDeck((d) => {
			if (d.length === 0) return d
			const [top, ...rest] = d
			setHand((h) => [...h, top])
			playSound('draw', soundsEnabled)
			return rest
		})
	}

	function normalSummon(index: number) {
		setHand((h) => {
			const card = h[index]
			if (!card) return h
			setMonsterZone((mz) => [...mz, card])
			playSound('summon', soundsEnabled)
			return h.filter((_, i) => i !== index)
		})
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Play</h1>
			<div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
				<button onClick={drawCard}>Draw</button>
			</div>
			<Board
				monsterZone={monsterZone}
				spellTrapZone={spellTrapZone}
				graveyard={graveyard}
			/>
			<h3>Your Hand</h3>
			<Hand cards={hand} onCardClick={(_, i) => normalSummon(i)} />
		</motion.div>
	)
}


