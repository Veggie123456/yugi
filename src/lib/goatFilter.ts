import type { CardData } from '../types/card'
import type { GoatRulesConfig } from '../types/rules'

function hasDisallowedMechanic(card: CardData, rules: GoatRulesConfig): boolean {
	const mech = card.subType
	if (!mech) return false
	return rules.disallowedMechanics?.includes(String(mech)) ?? false
}

function isKnownLegalPrinting(card: CardData, rules: GoatRulesConfig): boolean {
	if (card.setCode && rules.allowedSetCodes.includes(card.setCode)) return true
	const promo = card.promoCode ?? card.setCode
	return !!promo && rules.allowedPromoPrefixes.some((prefix) => promo.startsWith(prefix))
}

export function isCardLegalInGoat(card: CardData, rules: GoatRulesConfig): boolean {
	if (rules.banlist.forbidden.includes(card.name)) return false
	if (hasDisallowedMechanic(card, rules)) return false

	if (rules.disallowedSetPrefixes?.some((prefix) => card.setCode?.startsWith(prefix))) {
		return rules.allowListOverrides?.includes(card.name) ?? false
	}

	if (isKnownLegalPrinting(card, rules)) return true

	if (card.setCode || card.promoCode) {
		return rules.allowListOverrides?.includes(card.name) ?? false
	}

	if (card.releaseDate && new Date(card.releaseDate) > new Date(rules.cutoffDateIso)) {
		return rules.allowListOverrides?.includes(card.name) ?? false
	}

	return true
}

export function maxCopiesForCard(card: CardData, rules: GoatRulesConfig): number {
	if (rules.banlist.forbidden.includes(card.name)) return 0
	if (rules.banlist.limited.includes(card.name)) return 1
	if (rules.banlist.semiLimited.includes(card.name)) return 2
	return 3
}
