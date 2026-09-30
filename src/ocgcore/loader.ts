// Loader for EDOPro/YGOPro ocgcore compiled with Emscripten.
// Expects ocgcore.js and ocgcore.wasm in /public/ocgcore/ when available.

let coreModule: any | null = null

export async function initOcgCore(): Promise<boolean> {
  if (coreModule) return true

  try {
    // Keep the URL dynamic so Vite does not try to bundle an optional runtime asset.
    const base = import.meta.env.BASE_URL
    const coreUrl = `${base}ocgcore/ocgcore.js`
    const imported = await import(/* @vite-ignore */ coreUrl)
    const ModuleFactory = imported.default ?? imported

    if (typeof ModuleFactory !== 'function') {
      throw new Error('ocgcore module factory was not exported')
    }

    coreModule = await ModuleFactory({
      locateFile: (path: string) => path.endsWith('.wasm') ? `${base}ocgcore/ocgcore.wasm` : `${base}ocgcore/${path}`,
    })
    return true
  } catch (error) {
    // The alpha deliberately works without WASM while the full rules core is being integrated.
    console.info('ocgcore runtime not installed yet', error)
    coreModule = null
    return false
  }
}

export function getOcgCore(): any | null {
  return coreModule
}
