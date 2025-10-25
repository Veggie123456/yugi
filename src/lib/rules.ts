import { CardData } from '../types/card'

export function tributeRequirementFor(card: CardData): number {
	const level = card.levelOrRank ?? 0
	if (level <= 4) return 0
	if (level <= 6) return 1
	return 2
}

export function canNormalSummonNow(phase: string): boolean {
	return phase === 'MAIN1' || phase === 'MAIN2'
}

export function canActivateSpellFromHandNow(phase: string, isYourTurn: boolean): boolean {
	// Simplified: Normal Spells in Main Phases; Quick-Play from hand only your turn.
	return phase === 'MAIN1' || phase === 'MAIN2'
}

export function canChangePositionNow(phase: string): boolean {
	return phase === 'MAIN1' || phase === 'MAIN2'
}

export function canSpecialSummonBLS(gy: CardData[]): boolean {
	let hasLight = false, hasDark = false
	for (const c of gy) {
		if (c.attribute === 'LIGHT') hasLight = true
		if (c.attribute === 'DARK') hasDark = true
	}
	return hasLight && hasDark
}



