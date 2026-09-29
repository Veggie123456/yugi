import type { CardData } from '../types/card'
import type { GoatRulesConfig } from '../types/rules'
import { isCardLegalInGoat, maxCopiesForCard } from './goatFilter'

export interface GoatDeckList {
	main: CardData[]
	side: CardData[]
	fusion: CardData[]
}

export interface DeckValidationResult {
	valid: boolean
	errors: string[]
	warnings: string[]
}

export function isFusionMonster(card: CardData): boolean {
	return card.cardType === 'Monster' && card.subType === 'Fusion'
}

export function validateGoatDeck(deck: GoatDeckList, rules: GoatRulesConfig): DeckValidationResult {
	const errors: string[] = []
	const warnings: string[] = []

	if (deck.main.length < 40) errors.push(`Main Deck needs at least 40 cards (${deck.main.length}/40).`)
	if (deck.main.length > 60) errors.push(`Online Main Deck cap is 60 cards (${deck.main.length}/60).`)
	if (deck.side.length !== 0 && deck.side.length !== 15) {
		errors.push(`Side Deck must be empty or exactly 15 cards (${deck.side.length}/15).`)
	}

	for (const card of deck.main) {
		if (isFusionMonster(card)) errors.push(`${card.name} belongs in the Fusion Deck, not the Main Deck.`)
	}
	for (const card of deck.fusion) {
		if (!isFusionMonster(card)) errors.push(`${card.name} is not a Fusion Monster.`)
	}

	const allCards = [...deck.main, ...deck.side, ...deck.fusion]
	const copies = new Map<string, { card: CardData; count: number }>()

	for (const card of allCards) {
		if (!isCardLegalInGoat(card, rules)) errors.push(`${card.name} is not legal in this GOAT card pool.`)
		const entry = copies.get(card.name)
		if (entry) entry.count += 1
		else copies.set(card.name, { card, count: 1 })
	}

	for (const { card, count } of copies.values()) {
		const max = maxCopiesForCard(card, rules)
		if (count > max) errors.push(`${card.name}: ${count} copies found, maximum is ${max}.`)
	}

	if (deck.fusion.length > 15) {
		warnings.push('Historical GOAT Fusion Decks were not capped at 15; some modern online/tournament rule sets use a practical cap.')
	}

	return { valid: errors.length === 0, errors: [...new Set(errors)], warnings }
}
