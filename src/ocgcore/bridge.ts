import { getOcgCore } from './loader'

function cwrapOrNull(name: string, returnType: string | null, argTypes: string[]) {
	const mod: any = getOcgCore()
	if (!mod || typeof mod.cwrap !== 'function') return null
	try { return mod.cwrap(name, returnType, argTypes) } catch { return null }
}

export function ocgDraw(seat: 0|1, count: number): boolean {
	const fn = cwrapOrNull('Duel_Draw', 'number', ['number','number'])
	if (!fn) return false
	try { fn(seat, count); return true } catch { return false }
}

export function ocgDestroySpellTrap(owner: 0|1, index: number): boolean {
	// Placeholder: API varies; try a generic destroy with location/sequence if exposed
	const fn = cwrapOrNull('Duel_DestroyAt', 'number', ['number','number','number'])
	if (!fn) return false
	// location 0x08 = SZONE in EDOPro (bitmask); sequence = index
	try { fn(owner, 0x08, index); return true } catch { return false }
}



