import { CardData } from '../types/card'
import { GoatRulesConfig } from '../types/rules'

function hasDisallowedMechanic(card: CardData, rules: GoatRulesConfig): boolean {
	const mech = card.subType
	if (!mech) return false
	return rules.disallowedMechanics?.includes(String(mech)) ?? false
}

export function isCardLegalInGoat(card: CardData, rules: GoatRulesConfig): boolean {
	const name = card.name
	if (rules.banlist.forbidden.includes(name)) return false
	if (hasDisallowedMechanic(card, rules)) return false
	// Set/Promo checks
	if (card.setCode && !rules.allowedSetCodes.includes(card.setCode)) return false
	if (card.promoCode) {
		const ok = rules.allowedPromoPrefixes.some((p) => card.promoCode?.startsWith(p))
		if (!ok) return false
	}
	// Date cutoff as fallback
	if (card.releaseDate && new Date(card.releaseDate) > new Date(rules.cutoffDateIso)) {
		return rules.allowListOverrides?.includes(card.name) ?? false
	}
	// Disallowed set prefixes
	if (rules.disallowedSetPrefixes && card.setCode) {
		if (rules.disallowedSetPrefixes.some((p) => card.setCode?.startsWith(p))) return false
	}
	return true
}

export function maxCopiesForCard(card: CardData, rules: GoatRulesConfig): number {
	if (rules.banlist.forbidden.includes(card.name)) return 0
	if (rules.banlist.limited.includes(card.name)) return 1
	if (rules.banlist.semiLimited.includes(card.name)) return 2
	return 3
}


