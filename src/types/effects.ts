export type EffectType = 'DRAW' | 'DESTROY_MONSTER' | 'LP_CHANGE' | 'SS_FROM_HAND' | 'RETURN_TO_HAND'

export interface Effect {
	type: EffectType
	seat: 0 | 1
	params?: any
}


