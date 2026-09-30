import type { CardData } from './card'

export type Phase = 'DRAW' | 'STANDBY' | 'MAIN1' | 'BATTLE' | 'MAIN2' | 'END'

export interface ZoneCard {
	card: CardData
	position: 'ATK' | 'DEF' | 'SET'
	hasAttackedThisTurn?: boolean
	hasPositionChangedThisTurn?: boolean
}

export interface PlayerState {
	name: string
	lifePoints: number
	deck: CardData[]
	hand: CardData[]
	graveyard: CardData[]
	banished: CardData[]
	extra: CardData[]
	fieldSpell?: CardData
	monsterZone: (ZoneCard | null)[]
	spellTrapZone: (CardData | null)[]
	normalSummonUsedThisTurn?: boolean
}

export interface DuelState {
	turnPlayer: 0 | 1
	turnNumber: number
	turnDrawn: boolean
	phase: Phase
	players: [PlayerState, PlayerState]
	log: string[]
	chain?: Array<() => void>
	winner?: 0 | 1 | 'draw'
	prompt?: string
	pendingActivation?: { seat: 0|1, cardName: string }
	pendingTarget?: { owner: 0|1, zone: 'spell' | 'monster', index: number } | null
	chainWindowOpen?: boolean
	prioritySeat?: 0 | 1
	chainLinks?: Array<{ seat: 0|1, name: string }>
	passesInChainWindow?: number
}
