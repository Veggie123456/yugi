// Loader for EDOPro/YGOPro ocgcore compiled with Emscripten.
// Expects ocgcore.js and ocgcore.wasm in /ocgcore/.

let coreModule: any | null = null

export async function initOcgCore(): Promise<boolean> {
	if (coreModule) return true
	try {
		// Dynamically import the Emscripten JS glue emitted as ocgcore.js
		// The glue should call ModuleFactory and accept locateFile.
		// @ts-ignore
		const ModuleFactory = (await import(/* @vite-ignore */ '/ocgcore/ocgcore.js')).default || (await import(/* @vite-ignore */ '/ocgcore/ocgcore.js'))
		coreModule = await ModuleFactory({
			locateFile: (path: string) => {
				if (path.endsWith('.wasm')) return '/ocgcore/ocgcore.wasm'
				return `/ocgcore/${path}`
			},
		})
		return true
	} catch (e) {
		console.warn('ocgcore not available:', e)
		coreModule = null
		return false
	}
}

export function getOcgCore(): any | null { return coreModule }



