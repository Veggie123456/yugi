export type CardType = 'Monster' | 'Spell' | 'Trap'
export type MonsterSubtype = 'Normal' | 'Effect' | 'Fusion' | 'Ritual' | 'Synchro' | 'Xyz' | 'Link'
export type Attribute = 'LIGHT' | 'DARK' | 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'DIVINE'
export type SpellSubtype = 'Normal' | 'Quick-Play' | 'Continuous' | 'Field' | 'Equip' | 'Ritual'
export type TrapSubtype = 'Normal' | 'Continuous' | 'Counter'

export interface CardData {
	id: string
	name: string
	cardType: CardType
	subType?: MonsterSubtype | SpellSubtype | TrapSubtype
	levelOrRank?: number
	attack?: number
	defense?: number
	attribute?: Attribute
	description?: string
	releaseDate?: string // ISO date
	imageUrl?: string
	setCode?: string // e.g., LOB, MRD, ...
	promoCode?: string // e.g., TP1, CT1, ...
	legality?: {
		forbidden?: boolean
		limited?: boolean
		semiLimited?: boolean
	}
}


