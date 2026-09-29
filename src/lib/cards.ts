import data from '../data/cards.sample.json'
import type { CardData } from '../types/card'

export async function loadAllCards(): Promise<CardData[]> {
	try {
		const res = await fetch('/cards.goat.json', { cache: 'no-store' })
		if (res.ok) {
			const json = await res.json()
			return json as CardData[]
		}
	} catch {}
	return data as unknown as CardData[]
}
