import { useDuelStore } from '../store/duel'
import { Effect } from '../types/effects'
import { runEdoproScript } from './edopro'
import { initOcgCore, getOcgCore } from '../ocgcore/loader'
import { ocgDraw, ocgDestroySpellTrap } from '../ocgcore/bridge'

type Script = {
	canActivate: (ctx: Ctx) => boolean
	resolve: (ctx: Ctx) => void
	requiresTarget?: boolean
	targetFilter?: (zone: 'monster' | 'spell', owner: 0 | 1, index: number) => boolean
}

type Ctx = {
	seat: 0 | 1
	cardName: string
	handIndex: number
}

const scripts: Record<string, Script> = {
	'Pot of Greed': {
		canActivate: ({}) => true,
		resolve: ({ seat }) => {
			const store = useDuelStore.getState()
			store.queueEffect({ type: 'DRAW', seat, params: { count: 2 } })
			store.resolveChain()
		}
	},
	'Mystical Space Typhoon': {
		requiresTarget: true,
		targetFilter: (zone, owner) => zone === 'spell' && owner === (useDuelStore.getState().turnPlayer===0?1:0),
		canActivate: ({}) => true,
		resolve: ({}) => {
			// target taken from store.pendingTarget
			const store = useDuelStore.getState()
			const st = useDuelStore.getState()
			const t = (st as any).pendingTarget as { owner: 0|1, zone: 'spell', index: number } | undefined
			if (!t) return
			const players = [...st.players] as any
			players[t.owner].spellTrapZone[t.index] = null
			useDuelStore.setState({ players, log: [...st.log, `Mystical Space Typhoon destroyed a Spell/Trap`] })
		}
	}
}

export function tryActivateFromHand(seat: 0|1, handIndex: number) {
	const st = useDuelStore.getState()
	const p = st.players[seat]
	const card = p.hand[handIndex]
	if (!card) return
	// Try ocgcore first if available
	initOcgCore().then((ok) => {
		if (ok) {
			const core = getOcgCore()
			// Placeholder: call into core when API mapping is ready
		}
	})
	const script = scripts[card.name]
	if (!script || !script.canActivate({ seat, cardName: card.name, handIndex })) {
		// try EDOPro fallback by id
		runEdoproScript(String(card.id)).then((ok) => {
			if (ok) return
		})
		return
	}
	// remove from hand to GY for simple spells
	p.hand = p.hand.filter((_, i) => i !== handIndex)
	p.graveyard = [...p.graveyard, card]
	useDuelStore.setState({ players: [...st.players] as any, log: [...st.log, `${p.name} activated ${card.name}`] })
	if (script.requiresTarget) {
		(useDuelStore as any).setState({ prompt: `Select a target for ${card.name}`, pendingActivation: { seat, cardName: card.name }, pendingTarget: null })
		return
	}
	script.resolve({ seat, cardName: card.name, handIndex })
}

export function selectTarget(owner: 0|1, zone: 'spell' | 'monster', index: number) {
	const st = useDuelStore.getState() as any
	const pending = st.pendingActivation
	if (!pending) return
	const script = scripts[pending.cardName]
	if (!script) return
	if (script.targetFilter && !script.targetFilter(zone, owner, index)) return
	useDuelStore.setState({ pendingTarget: { owner, zone, index }, prompt: undefined, pendingActivation: undefined })
	script.resolve({ seat: pending.seat, cardName: pending.cardName, handIndex: -1 })
}


