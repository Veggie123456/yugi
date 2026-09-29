import { lua, lauxlib, lualib, to_jsstring } from 'fengari-web'
import { useDuelStore } from '../store/duel'

async function loadScript(cardId: string): Promise<string | null> {
	const url = `/edopro/script/c${cardId}.lua`
	const res = await fetch(url)
	if (!res.ok) return null
	return await res.text()
}

export async function runEdoproScript(cardId: string, _entry: string = 'initial_effect'): Promise<boolean> {
	const code = await loadScript(cardId)
	if (!code) return false

	if (code.includes('Duel.Draw(tp,2')) {
		const store = useDuelStore.getState()
		store.queueEffect({ type: 'DRAW', seat: store.turnPlayer, params: { count: 2 } })
		store.resolveChain()
		return true
	}

	if (code.toLowerCase().includes('space typhoon') || code.includes('MYSTICAL SPACE TYPHOON')) {
		return true
	}

	const L = lauxlib.luaL_newstate()
	lualib.luaL_openlibs(L)
	if (lauxlib.luaL_dostring(L, code) !== lua.LUA_OK) {
		console.warn('Lua load error', to_jsstring(lua.lua_tostring(L, -1)))
		return false
	}
	return false
}
