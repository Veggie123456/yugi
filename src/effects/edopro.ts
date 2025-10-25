import { lua, lauxlib, lualib, to_jsstring } from 'fengari-web'
import { useDuelStore } from '../store/duel'

async function loadScript(cardId: string): Promise<string | null> {
	const url = `/edopro/script/c${cardId}.lua`
	const res = await fetch(url)
	if (!res.ok) return null
	return await res.text()
}

export async function runEdoproScript(cardId: string, entry: string = 'initial_effect'): Promise<boolean> {
	const code = await loadScript(cardId)
	if (!code) return false
	// Heuristic fast-paths for common GOAT staples (until full API shim exists)
	// Pot of Greed: look for Duel.Draw(tp,2
	if (code.includes('Duel.Draw(tp,2')) {
		const st = useDuelStore.getState()
		const seat = st.turnPlayer as 0|1
		st.queueEffect({ type: 'DRAW', seat, params: { count: 2 } })
		st.resolveChain()
		return true
	}
	// Mystical Space Typhoon: look for Duel.Destroy and spell/trap target hints
	if (code.toLowerCase().includes('space typhoon') || code.includes('MYSTICAL SPACE TYPHOON')) {
		// require target selection via pendingActivation/pendingTarget handled elsewhere
		return true
	}
	// Default: load into Lua VM (no-ops without full env)
	const L = lauxlib.luaL_newstate()
	lualib.luaL_openlibs(L)
	if (lauxlib.luaL_dostring(L, code) !== lua.LUA_OK) {
		console.warn('Lua load error', to_jsstring(lua.lua_tostring(L, -1)))
		return false
	}
	return false
}


