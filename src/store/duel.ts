import { create } from 'zustand'
import { DuelState, Phase, PlayerState, ZoneCard } from '../types/duel'
import { Effect } from '../types/effects'
import { CardData } from '../types/card'
import { playSound } from '../lib/sound'
import { useSettingsStore } from './settings'
import { canNormalSummonNow, tributeRequirementFor, canChangePositionNow } from '../lib/rules'

function createEmptyBoard(): Omit<PlayerState, 'name'> {
	return {
		lifePoints: 8000,
		deck: [],
		hand: [],
		graveyard: [],
		banished: [],
		extra: [],
		monsterZone: [null, null, null, null, null],
		spellTrapZone: [null, null, null, null, null],
	}
}

function logPush(state: DuelState, msg: string) {
	state.log = [...state.log, msg]
}

export interface DuelStore extends DuelState {
	resetWithDecks: (p1: CardData[], p2: CardData[]) => void
	draw: (seat: 0 | 1, count?: number) => void
	normalSummon: (seat: 0 | 1, handIndex: number, zoneIndex: number) => void
	setFromHand: (seat: 0 | 1, handIndex: number, zoneIndex: number) => void
	flipSummon: (seat: 0 | 1, zoneIndex: number) => void
	changePosition: (seat: 0 | 1, zoneIndex: number, to: 'ATK' | 'DEF') => void
	endPhase: () => void
	declareAttack: (attackerIndex: number, targetIndex?: number) => void
	queueEffect: (e: Effect) => void
	resolveChain: () => void
	surrender: (seat: 0 | 1) => void
	openChainWindow: () => void
	passPriority: () => void
	destroyMonster: (seat: 0 | 1, index: number) => void
	destroyAllMonsters: (which: 'both' | 0 | 1) => void
	destroyAllSpellsTraps: (which: 'both' | 0 | 1) => void
	setMonsterToSet: (seat: 0 | 1, index: number) => void
}

export const useDuelStore = create<DuelStore>((set, get) => ({
	turnPlayer: 0,
	phase: 'DRAW',
	players: [
		{ name: 'Player 1', ...createEmptyBoard() },
		{ name: 'Player 2', ...createEmptyBoard() },
	],
	log: [],
	chainWindowOpen: false,
	prioritySeat: 0,
	passesInChainWindow: 0,
	resetWithDecks: (p1, p2) => set(() => {
		const shuffled1 = [...p1]
		const shuffled2 = [...p2]
		for (let i = shuffled1.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1)); [shuffled1[i], shuffled1[j]] = [shuffled1[j], shuffled1[i]]
		}
		for (let i = shuffled2.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1)); [shuffled2[i], shuffled2[j]] = [shuffled2[j], shuffled2[i]]
		}
		return {
			turnPlayer: 0,
			phase: 'DRAW' as Phase,
			players: [
				{ name: 'Player 1', ...createEmptyBoard(), deck: shuffled1 },
				{ name: 'Player 2', ...createEmptyBoard(), deck: shuffled2 },
			],
			log: ['Duel started']
		}
	}),
	draw: (seat, count = 1) => set((state) => {
		const s = useSettingsStore.getState()
		const p = state.players[seat]
		for (let i = 0; i < count; i++) {
			const top = p.deck[0]
			if (!top) break
			p.deck = p.deck.slice(1)
			p.hand = [...p.hand, top]
			logPush(state, `${p.name} drew a card`)
			playSound('draw', s.soundsEnabled)
		}
		return { ...state, players: [...state.players] as any }
	}),
	normalSummon: (seat, handIndex, zoneIndex) => set((state) => {
		const s = useSettingsStore.getState()
		const p = state.players[seat]
		const card = p.hand[handIndex]
		if (!card) return state
		if (!canNormalSummonNow(state.phase)) return state
		if (p.monsterZone[zoneIndex]) return state
		if (p.normalSummonUsedThisTurn) return state
		// tribute check (simplified - use open zones and count tributes from own field)
		const needTributes = tributeRequirementFor(card)
		const availableTributes = p.monsterZone.filter(Boolean).length
		if (needTributes > availableTributes) return state
		p.hand = p.hand.filter((_, i) => i !== handIndex)
		const zone: ZoneCard = { card, position: 'ATK' }
		p.monsterZone[zoneIndex] = zone
		p.normalSummonUsedThisTurn = true
		logPush(state, `${p.name} Normal Summoned ${card.name}`)
		playSound('summon', s.soundsEnabled)
		return { ...state, players: [...state.players] as any }
	}),
	setFromHand: (seat, handIndex, zoneIndex) => set((state) => {
		const p = state.players[seat]
		const card = p.hand[handIndex]
		if (!card) return state
		if (state.phase !== 'MAIN1' && state.phase !== 'MAIN2') return state
		if (p.monsterZone[zoneIndex]) return state
		p.hand = p.hand.filter((_, i) => i !== handIndex)
		p.monsterZone[zoneIndex] = { card, position: 'SET' }
		logPush(state, `${p.name} Set a monster`)
		return { ...state, players: [...state.players] as any }
	}),
	flipSummon: (seat, zoneIndex) => set((state) => {
		const p = state.players[seat]
		const z = p.monsterZone[zoneIndex]
		if (!z || z.position !== 'SET') return state
		if (state.phase !== 'MAIN1' && state.phase !== 'MAIN2') return state
		p.monsterZone[zoneIndex] = { ...z, position: 'ATK', hasPositionChangedThisTurn: true }
		logPush(state, `${p.name} Flip Summoned ${z.card.name}`)
		return { ...state, players: [...state.players] as any }
	}),
	changePosition: (seat, zoneIndex, to) => set((state) => {
		const p = state.players[seat]
		const z = p.monsterZone[zoneIndex]
		if (!z || z.position === 'SET') return state
		if (!canChangePositionNow(state.phase)) return state
		if (z.hasPositionChangedThisTurn) return state
		p.monsterZone[zoneIndex] = { ...z, position: to, hasPositionChangedThisTurn: true }
		logPush(state, `${p.name} changed ${z.card.name} to ${to}`)
		return { ...state, players: [...state.players] as any }
	}),
	endPhase: () => set((state) => {
		const order: Phase[] = ['DRAW','STANDBY','MAIN1','BATTLE','MAIN2','END']
		const i = order.indexOf(state.phase)
		let next = order[(i + 1) % order.length]
		let turnPlayer = state.turnPlayer
		if (state.phase === 'END') {
			next = 'DRAW'
			turnPlayer = state.turnPlayer === 0 ? 1 : 0
			// reset once per turn flags
			state.players[turnPlayer].monsterZone = state.players[turnPlayer].monsterZone.map((z) => z ? { ...z, hasAttackedThisTurn: false, hasPositionChangedThisTurn: false } : z)
			state.players[turnPlayer].normalSummonUsedThisTurn = false
		}
		logPush(state, `Phase → ${next}${next==='DRAW' ? ` (Turn: ${turnPlayer===0?'P1':'P2'})` : ''}`)
		return { ...state, phase: next, turnPlayer }
	}),
	declareAttack: (attackerIndex, targetIndex) => set((state) => {
		if (state.phase !== 'BATTLE') return state
		const atkPlayer = state.players[state.turnPlayer]
		const defPlayer = state.players[state.turnPlayer === 0 ? 1 : 0]
		const attacker = atkPlayer.monsterZone[attackerIndex]
		if (!attacker || attacker.position !== 'ATK' || attacker.hasAttackedThisTurn) return state
		let damage = 0
		if (typeof targetIndex === 'number' && defPlayer.monsterZone[targetIndex]) {
			const target = defPlayer.monsterZone[targetIndex]!
			const atk = attacker.card.attack ?? 0
			const def = target.position === 'ATK' ? (target.card.attack ?? 0) : (target.card.defense ?? 0)
			if (target.position === 'ATK') {
				if (atk > def) { damage = atk - def; defPlayer.graveyard = [...defPlayer.graveyard, target.card]; defPlayer.monsterZone[targetIndex] = null }
				else if (atk < def) { damage = def - atk; atkPlayer.lifePoints -= damage }
				else { defPlayer.monsterZone[targetIndex] = null; defPlayer.graveyard = [...defPlayer.graveyard, target.card] }
			} else {
				if (atk > def) { defPlayer.monsterZone[targetIndex] = null; defPlayer.graveyard = [...defPlayer.graveyard, target.card] }
				else if (atk < def) { damage = def - atk; atkPlayer.lifePoints -= damage }
			}
			logPush(state, `${atkPlayer.name} attacked ${target.card.name}${damage?` (${damage} damage)`:''}`)
		} else {
			// direct
			const atk = attacker.card.attack ?? 0
			defPlayer.lifePoints -= atk
			logPush(state, `${atkPlayer.name} attacked directly for ${atk}`)
		}
		atkPlayer.monsterZone[attackerIndex] = { ...attacker, hasAttackedThisTurn: true }
		// win checks
		if (defPlayer.lifePoints <= 0) return { ...state, players: [...state.players] as any, winner: state.turnPlayer }
		if (atkPlayer.lifePoints <= 0) return { ...state, players: [...state.players] as any, winner: (state.turnPlayer===0?1:0) }
		return { ...state, players: [...state.players] as any }
	}),
	queueEffect: (e) => set((state) => {
		const chain = state.chain ? [...state.chain] : []
		chain.push(() => {
			const s = useSettingsStore.getState()
			const st = get()
			const p = st.players[e.seat]
			switch (e.type) {
				case 'DRAW': {
					get().draw(e.seat, e.params?.count ?? 1)
					break
				}
				case 'LP_CHANGE': {
					p.lifePoints += e.params?.delta ?? 0
					break
				}
			}
		})
		logPush(state, `Effect queued: ${e.type}`)
		return { ...state, chain }
	}),
	resolveChain: () => set((state) => {
		const chain = [...(state.chain ?? [])]
		while (chain.length) {
			const eff = chain.pop()!
			eff()
		}
		logPush(state, 'Chain resolved')
		// post-chain win checks (deck-out placeholder)
		const p0 = state.players[0], p1 = state.players[1]
		if (p0.lifePoints <= 0 && p1.lifePoints <= 0) return { ...state, chain: [], winner: 'draw' }
		if (p0.lifePoints <= 0) return { ...state, chain: [], winner: 1 }
		if (p1.lifePoints <= 0) return { ...state, chain: [], winner: 0 }
		return { ...state, chain: [] }
	}),
	surrender: (seat) => set((state) => ({ ...state, winner: seat===0?1:0, log: [...state.log, `${state.players[seat].name} surrendered`] })),
	openChainWindow: () => set({ chainWindowOpen: true, prioritySeat: get().turnPlayer as 0|1, passesInChainWindow: 0 }),
	passPriority: () => set((state) => {
		if (!state.chainWindowOpen) return state
		const nextSeat = (state.prioritySeat === 0 ? 1 : 0) as 0|1
		const passes = state.passesInChainWindow! + 1
		if (passes >= 2) {
			// both players passed; close window and resolve chain if any
			const hasChain = !!state.chain && state.chain.length > 0
			return { ...state, chainWindowOpen: false, passesInChainWindow: 0, prioritySeat: nextSeat, ...(hasChain ? {} : {}) }
		}
		return { ...state, prioritySeat: nextSeat, passesInChainWindow: passes }
	}),
	destroyMonster: (seat, index) => set((state) => {
		const p = state.players[seat]
		const z = p.monsterZone[index]
		if (!z) return state
		p.monsterZone[index] = null
		p.graveyard = [...p.graveyard, z.card]
		logPush(state, `${p.name}'s ${z.card.name} was destroyed`)
		return { ...state, players: [...state.players] as any }
	}),
	destroyAllMonsters: (which) => set((state) => {
		const seats: (0|1)[] = which === 'both' ? [0,1] : [which]
		for (const seat of seats) {
			const p = state.players[seat]
			for (let i=0;i<p.monsterZone.length;i++) {
				const z = p.monsterZone[i]
				if (z) { p.graveyard = [...p.graveyard, z.card]; p.monsterZone[i] = null }
			}
		}
		logPush(state, `All monsters on ${which==='both'?'both sides':which===0?'P1':'P2'} were destroyed`)
		return { ...state, players: [...state.players] as any }
	}),
	destroyAllSpellsTraps: (which) => set((state) => {
		const seats: (0|1)[] = which === 'both' ? [0,1] : [which]
		for (const seat of seats) {
			const p = state.players[seat]
			for (let i=0;i<p.spellTrapZone.length;i++) {
				const c = p.spellTrapZone[i]
				if (c) { p.graveyard = [...p.graveyard, c]; p.spellTrapZone[i] = null }
			}
		}
		logPush(state, `All Spells/Traps on ${which==='both'?'both sides':which===0?'P1':'P2'} were destroyed`)
		return { ...state, players: [...state.players] as any }
	}),
	setMonsterToSet: (seat, index) => set((state) => {
		const p = state.players[seat]
		const z = p.monsterZone[index]
		if (!z) return state
		p.monsterZone[index] = { ...z, position: 'SET' }
		logPush(state, `${p.name}'s ${z.card.name} was set face-down`)
		return { ...state, players: [...state.players] as any }
	}),
}))


