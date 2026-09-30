import { create } from 'zustand'
import type { DuelState, Phase, PlayerState, ZoneCard } from '../types/duel'
import type { Effect } from '../types/effects'
import type { CardData } from '../types/card'
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

function shuffle<T>(items: T[]): T[] {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

function logPush(state: DuelState, msg: string) {
	state.log = [...state.log, msg]
}

export interface DuelStore extends DuelState {
	resetWithDecks: (p1: CardData[], p2: CardData[]) => void
	draw: (seat: 0 | 1, count?: number) => void
	drawForTurn: () => void
	normalSummon: (seat: 0 | 1, handIndex: number, zoneIndex: number, tributeIndexes?: number[]) => void
	setFromHand: (seat: 0 | 1, handIndex: number, zoneIndex: number, tributeIndexes?: number[]) => void
	setSpellTrapFromHand: (seat: 0 | 1, handIndex: number, zoneIndex: number) => void
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
	turnNumber: 1,
	turnDrawn: false,
	phase: 'DRAW',
	players: [
		{ name: 'Player 1', ...createEmptyBoard() },
		{ name: 'Player 2', ...createEmptyBoard() },
	],
	log: [],
	chainWindowOpen: false,
	prioritySeat: 0,
	passesInChainWindow: 0,

	resetWithDecks: (p1, p2) => set({
		turnPlayer: 0,
		turnNumber: 1,
		turnDrawn: false,
		phase: 'DRAW',
		players: [
			{ name: 'Player 1', ...createEmptyBoard(), deck: shuffle(p1) },
			{ name: 'Player 2', ...createEmptyBoard(), deck: shuffle(p2) },
		],
		log: ['Duel started · Player 1 goes first'],
		chain: [],
		winner: undefined,
	}),

	draw: (seat, count = 1) => set((state) => {
		const settings = useSettingsStore.getState()
		const player = state.players[seat]
		for (let i = 0; i < count; i++) {
			const top = player.deck[0]
			if (!top) {
				state.winner = seat === 0 ? 1 : 0
				logPush(state, `${player.name} could not draw and lost the duel.`)
				break
			}
			player.deck = player.deck.slice(1)
			player.hand = [...player.hand, top]
			logPush(state, `${player.name} drew a card`)
			playSound('draw', settings.soundsEnabled)
		}
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	drawForTurn: () => {
		const state = get()
		if (state.phase !== 'DRAW' || state.turnDrawn || state.winner !== undefined) return
		get().draw(state.turnPlayer, 1)
		set({ turnDrawn: true })
	},

	normalSummon: (seat, handIndex, zoneIndex, tributeIndexes = []) => set((state) => {
		const settings = useSettingsStore.getState()
		if (seat !== state.turnPlayer || !canNormalSummonNow(state.phase)) return state
		const player = state.players[seat]
		const card = player.hand[handIndex]
		if (!card || card.cardType !== 'Monster' || player.normalSummonUsedThisTurn) return state

		const needed = tributeRequirementFor(card)
		const uniqueTributes = [...new Set(tributeIndexes)]
		if (uniqueTributes.length !== needed || uniqueTributes.some((index) => !player.monsterZone[index])) return state
		if (player.monsterZone[zoneIndex] && !uniqueTributes.includes(zoneIndex)) return state

		for (const index of uniqueTributes) {
			const tribute = player.monsterZone[index]
			if (tribute) player.graveyard = [...player.graveyard, tribute.card]
			player.monsterZone[index] = null
		}

		player.hand = player.hand.filter((_, i) => i !== handIndex)
		const zone: ZoneCard = { card, position: 'ATK' }
		player.monsterZone[zoneIndex] = zone
		player.normalSummonUsedThisTurn = true
		logPush(state, `${player.name} Normal Summoned ${card.name}`)
		playSound('summon', settings.soundsEnabled)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	setFromHand: (seat, handIndex, zoneIndex, tributeIndexes = []) => set((state) => {
		const settings = useSettingsStore.getState()
		if (seat !== state.turnPlayer || !canNormalSummonNow(state.phase)) return state
		const player = state.players[seat]
		const card = player.hand[handIndex]
		if (!card || card.cardType !== 'Monster' || player.normalSummonUsedThisTurn) return state

		const needed = tributeRequirementFor(card)
		const uniqueTributes = [...new Set(tributeIndexes)]
		if (uniqueTributes.length !== needed || uniqueTributes.some((index) => !player.monsterZone[index])) return state
		if (player.monsterZone[zoneIndex] && !uniqueTributes.includes(zoneIndex)) return state

		for (const index of uniqueTributes) {
			const tribute = player.monsterZone[index]
			if (tribute) player.graveyard = [...player.graveyard, tribute.card]
			player.monsterZone[index] = null
		}

		player.hand = player.hand.filter((_, i) => i !== handIndex)
		player.monsterZone[zoneIndex] = { card, position: 'SET' }
		player.normalSummonUsedThisTurn = true
		logPush(state, `${player.name} Set a monster`)
		playSound('set', settings.soundsEnabled)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	setSpellTrapFromHand: (seat, handIndex, zoneIndex) => set((state) => {
		const settings = useSettingsStore.getState()
		if (seat !== state.turnPlayer || (state.phase !== 'MAIN1' && state.phase !== 'MAIN2')) return state
		const player = state.players[seat]
		const card = player.hand[handIndex]
		if (!card || (card.cardType !== 'Spell' && card.cardType !== 'Trap')) return state
		if (player.spellTrapZone[zoneIndex]) return state
		player.hand = player.hand.filter((_, i) => i !== handIndex)
		player.spellTrapZone[zoneIndex] = card
		logPush(state, `${player.name} Set a Spell/Trap`)
		playSound('set', settings.soundsEnabled)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	flipSummon: (seat, zoneIndex) => set((state) => {
		if (seat !== state.turnPlayer || (state.phase !== 'MAIN1' && state.phase !== 'MAIN2')) return state
		const player = state.players[seat]
		const zone = player.monsterZone[zoneIndex]
		if (!zone || zone.position !== 'SET') return state
		player.monsterZone[zoneIndex] = { ...zone, position: 'ATK', hasPositionChangedThisTurn: true }
		logPush(state, `${player.name} Flip Summoned ${zone.card.name}`)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	changePosition: (seat, zoneIndex, to) => set((state) => {
		if (seat !== state.turnPlayer || !canChangePositionNow(state.phase)) return state
		const player = state.players[seat]
		const zone = player.monsterZone[zoneIndex]
		if (!zone || zone.position === 'SET' || zone.hasPositionChangedThisTurn) return state
		player.monsterZone[zoneIndex] = { ...zone, position: to, hasPositionChangedThisTurn: true }
		logPush(state, `${player.name} changed ${zone.card.name} to ${to}`)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	endPhase: () => set((state) => {
		if (state.winner !== undefined) return state
		if (state.phase === 'DRAW' && !state.turnDrawn) return state
		const settings = useSettingsStore.getState()
		let next: Phase
		let turnPlayer = state.turnPlayer
		let turnNumber = state.turnNumber
		let turnDrawn = state.turnDrawn

		switch (state.phase) {
			case 'DRAW': next = 'STANDBY'; break
			case 'STANDBY': next = 'MAIN1'; break
			case 'MAIN1': next = state.turnNumber === 1 ? 'END' : 'BATTLE'; break
			case 'BATTLE': next = 'MAIN2'; break
			case 'MAIN2': next = 'END'; break
			case 'END':
				next = 'DRAW'
				turnPlayer = state.turnPlayer === 0 ? 1 : 0
				turnNumber += 1
				turnDrawn = false
				state.players[turnPlayer].monsterZone = state.players[turnPlayer].monsterZone.map((zone) => zone ? { ...zone, hasAttackedThisTurn: false, hasPositionChangedThisTurn: false } : zone)
				state.players[turnPlayer].normalSummonUsedThisTurn = false
				break
		}

		logPush(state, `Phase → ${next}${next === 'DRAW' ? ` · Turn ${turnNumber} (${turnPlayer === 0 ? 'P1' : 'P2'})` : ''}`)
		playSound('phase', settings.soundsEnabled)
		return { ...state, phase: next, turnPlayer, turnNumber, turnDrawn }
	}),

	declareAttack: (attackerIndex, targetIndex) => set((state) => {
		if (state.phase !== 'BATTLE' || state.winner !== undefined) return state
		const settings = useSettingsStore.getState()
		const attackerPlayer = state.players[state.turnPlayer]
		const defenderPlayer = state.players[state.turnPlayer === 0 ? 1 : 0]
		const attacker = attackerPlayer.monsterZone[attackerIndex]
		if (!attacker || attacker.position !== 'ATK' || attacker.hasAttackedThisTurn) return state

		const target = typeof targetIndex === 'number' ? defenderPlayer.monsterZone[targetIndex] : null
		if (!target && defenderPlayer.monsterZone.some(Boolean)) return state

		if (target && typeof targetIndex === 'number') {
			const atk = attacker.card.attack ?? 0
			const defendingPosition = target.position === 'ATK' ? 'ATK' : 'DEF'
			const targetValue = defendingPosition === 'ATK' ? (target.card.attack ?? 0) : (target.card.defense ?? 0)
			if (target.position === 'SET') defenderPlayer.monsterZone[targetIndex] = { ...target, position: 'DEF' }

			if (defendingPosition === 'ATK') {
				if (atk > targetValue) {
					const damage = atk - targetValue
					defenderPlayer.lifePoints -= damage
					defenderPlayer.graveyard = [...defenderPlayer.graveyard, target.card]
					defenderPlayer.monsterZone[targetIndex] = null
					if (damage) playSound('damage', settings.soundsEnabled)
				} else if (atk < targetValue) {
					const damage = targetValue - atk
					attackerPlayer.lifePoints -= damage
					attackerPlayer.graveyard = [...attackerPlayer.graveyard, attacker.card]
					attackerPlayer.monsterZone[attackerIndex] = null
					if (damage) playSound('damage', settings.soundsEnabled)
				} else {
					defenderPlayer.graveyard = [...defenderPlayer.graveyard, target.card]
					defenderPlayer.monsterZone[targetIndex] = null
					attackerPlayer.graveyard = [...attackerPlayer.graveyard, attacker.card]
					attackerPlayer.monsterZone[attackerIndex] = null
				}
			} else {
				if (atk > targetValue) {
					defenderPlayer.graveyard = [...defenderPlayer.graveyard, target.card]
					defenderPlayer.monsterZone[targetIndex] = null
				} else if (atk < targetValue) {
					const damage = targetValue - atk
					attackerPlayer.lifePoints -= damage
					if (damage) playSound('damage', settings.soundsEnabled)
				}
			}
			logPush(state, `${attackerPlayer.name}'s ${attacker.card.name} attacked ${target.card.name}`)
		} else {
			const damage = attacker.card.attack ?? 0
			defenderPlayer.lifePoints -= damage
			logPush(state, `${attackerPlayer.name}'s ${attacker.card.name} attacked directly for ${damage}`)
			playSound('direct', settings.soundsEnabled)
			if (damage) playSound('damage', settings.soundsEnabled)
		}

		const attackerStillThere = attackerPlayer.monsterZone[attackerIndex]
		if (attackerStillThere) attackerPlayer.monsterZone[attackerIndex] = { ...attackerStillThere, hasAttackedThisTurn: true }
		playSound('attack', settings.soundsEnabled)

		if (defenderPlayer.lifePoints <= 0) state.winner = state.turnPlayer
		if (attackerPlayer.lifePoints <= 0) state.winner = state.turnPlayer === 0 ? 1 : 0
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	queueEffect: (effect) => set((state) => {
		const chain = [...(state.chain ?? [])]
		chain.push(() => {
			if (effect.type === 'DRAW') get().draw(effect.seat, effect.params?.count ?? 1)
			if (effect.type === 'LP_CHANGE') {
				set((current) => {
					current.players[effect.seat].lifePoints += effect.params?.delta ?? 0
					return { ...current, players: [...current.players] as [PlayerState, PlayerState] }
				})
			}
		})
		logPush(state, `Effect queued: ${effect.type}`)
		return { ...state, chain }
	}),

	resolveChain: () => {
		const chain = [...(get().chain ?? [])]
		set({ chain: [] })
		while (chain.length) chain.pop()?.()
		set((state) => {
			logPush(state, 'Chain resolved')
			const [p0, p1] = state.players
			if (p0.lifePoints <= 0 && p1.lifePoints <= 0) state.winner = 'draw'
			else if (p0.lifePoints <= 0) state.winner = 1
			else if (p1.lifePoints <= 0) state.winner = 0
			return { ...state }
		})
	},

	surrender: (seat) => set((state) => ({ ...state, winner: seat === 0 ? 1 : 0, log: [...state.log, `${state.players[seat].name} surrendered`] })),

	openChainWindow: () => set({ chainWindowOpen: true, prioritySeat: get().turnPlayer, passesInChainWindow: 0 }),

	passPriority: () => set((state) => {
		if (!state.chainWindowOpen) return state
		const nextSeat = state.prioritySeat === 0 ? 1 : 0
		const passes = (state.passesInChainWindow ?? 0) + 1
		if (passes >= 2) return { ...state, chainWindowOpen: false, passesInChainWindow: 0, prioritySeat: nextSeat }
		return { ...state, prioritySeat: nextSeat, passesInChainWindow: passes }
	}),

	destroyMonster: (seat, index) => set((state) => {
		const player = state.players[seat]
		const zone = player.monsterZone[index]
		if (!zone) return state
		player.monsterZone[index] = null
		player.graveyard = [...player.graveyard, zone.card]
		logPush(state, `${player.name}'s ${zone.card.name} was destroyed`)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	destroyAllMonsters: (which) => set((state) => {
		const seats: (0|1)[] = which === 'both' ? [0, 1] : [which]
		for (const seat of seats) {
			const player = state.players[seat]
			player.monsterZone.forEach((zone, index) => {
				if (zone) {
					player.graveyard = [...player.graveyard, zone.card]
					player.monsterZone[index] = null
				}
			})
		}
		logPush(state, `All monsters on ${which === 'both' ? 'both sides' : which === 0 ? 'P1' : 'P2'} were destroyed`)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	destroyAllSpellsTraps: (which) => set((state) => {
		const seats: (0|1)[] = which === 'both' ? [0, 1] : [which]
		for (const seat of seats) {
			const player = state.players[seat]
			player.spellTrapZone.forEach((card, index) => {
				if (card) {
					player.graveyard = [...player.graveyard, card]
					player.spellTrapZone[index] = null
				}
			})
		}
		logPush(state, `All Spells/Traps on ${which === 'both' ? 'both sides' : which === 0 ? 'P1' : 'P2'} were destroyed`)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),

	setMonsterToSet: (seat, index) => set((state) => {
		const player = state.players[seat]
		const zone = player.monsterZone[index]
		if (!zone) return state
		player.monsterZone[index] = { ...zone, position: 'SET' }
		logPush(state, `${player.name}'s ${zone.card.name} was set face-down`)
		return { ...state, players: [...state.players] as [PlayerState, PlayerState] }
	}),
}))
