// Fetch GOAT-legal cards from YGOPRODeck and write to public/cards.goat.json
// This script filters by allowed set codes/promo prefixes and excludes post-GOAT mechanics
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outFile = path.join(projectRoot, 'public', 'cards.goat.json')

// Keep aligned with src/config/goat.ts
const allowedSetCodes = [
	'LOB','SDY','SDK','MRD','MRL','SRL','PSV','SDJ','SDP','LON','LOD','PGD','MFC','DCR','SYE','SKE','IOC','AST','SOD','DB1','RDS','FET','DR1','TLM','SD1','SD2','SD3','SD4','DB2'
]
const allowedPromoPrefixes = [
	'BPT','CMC','CT1','DBT','DDS','DMG','DL1','DL2','DL3','DL4','DL5','DL6','DL7','DL8','DOD','DOR','EDS','EP1','FMR','JMP','MC1','MOV','MP1','PCJ','PCK','PCY','ROD','SDD','SP1','TFK','TP1','TP2','TP3','TP4','TP5','TP6','TSC','WC4','WC5'
]
const disallowedMechanics = ['Synchro','Xyz','Pendulum','Link']

function pickSubtype(type) {
	if (!type) return undefined
	if (type.includes('Synchro')) return 'Synchro'
	if (type.includes('Xyz')) return 'Xyz'
	if (type.includes('Link')) return 'Link'
	if (type.includes('Fusion')) return 'Fusion'
	if (type.includes('Ritual')) return 'Ritual'
	if (type.includes('Effect')) return 'Effect'
	return 'Normal'
}

function firstAllowedSetCode(card_sets) {
	if (!Array.isArray(card_sets)) return undefined
	for (const s of card_sets) {
		const code = (s.set_code || '').toUpperCase()
		const prefix = code.split('-')[0]
		if (allowedSetCodes.includes(prefix)) return prefix
		if (allowedPromoPrefixes.some((p) => prefix.startsWith(p))) return prefix
	}
	return undefined
}

function earliestReleaseDate(card_sets) {
	if (!Array.isArray(card_sets)) return undefined
	let min = undefined
	for (const s of card_sets) {
		const d = s.set_release_date
		if (!d) continue
		if (!min || new Date(d) < new Date(min)) min = d
	}
	return min
}

async function main() {
	console.log('Fetching GOAT cards from YGOPRODeck...')
	const res = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?format=goat')
	if (!res.ok) throw new Error('Failed to fetch API: ' + res.status)
	const json = await res.json()
	const cards = json.data || []
	const mapped = []
	for (const c of cards) {
		const subtype = pickSubtype(c.type)
		if (disallowedMechanics.includes(subtype)) continue
		const setPrefix = firstAllowedSetCode(c.card_sets)
		if (!setPrefix) continue
		const img = Array.isArray(c.card_images) && c.card_images.length ? c.card_images[0] : undefined
		mapped.push({
			id: String(c.id),
			name: c.name,
			cardType: c.type?.includes('Monster') ? 'Monster' : c.type?.includes('Spell') ? 'Spell' : 'Trap',
			subType: subtype,
			levelOrRank: c.level ?? c.rank,
			attack: c.atk,
			defense: c.def,
			attribute: c.attribute,
			description: c.desc,
			releaseDate: earliestReleaseDate(c.card_sets),
			imageUrl: img?.image_url_small || img?.image_url,
			setCode: setPrefix,
			promoCode: allowedPromoPrefixes.some((p) => setPrefix.startsWith(p)) ? setPrefix : undefined
		})
	}
	fs.mkdirSync(path.dirname(outFile), { recursive: true })
	fs.writeFileSync(outFile, JSON.stringify(mapped, null, 2))
	console.log(`Wrote ${mapped.length} cards → ${outFile}`)
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})


