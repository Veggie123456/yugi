import { useDuelStore } from '../store/duel'
import { runEdoproScript } from './edopro'
import { initOcgCore } from '../ocgcore/loader'

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
    canActivate: () => true,
    resolve: ({ seat }) => {
      const store = useDuelStore.getState()
      store.queueEffect({ type: 'DRAW', seat, params: { count: 2 } })
      store.resolveChain()
    }
  },
  'Mystical Space Typhoon': {
    requiresTarget: true,
    targetFilter: (zone, owner) => zone === 'spell' && owner === (useDuelStore.getState().turnPlayer === 0 ? 1 : 0),
    canActivate: () => true,
    resolve: () => {
      const state = useDuelStore.getState()
      const target = state.pendingTarget
      if (!target || target.zone !== 'spell') return
      const players = [...state.players] as typeof state.players
      const card = players[target.owner].spellTrapZone[target.index]
      if (card) {
        players[target.owner].graveyard = [...players[target.owner].graveyard, card]
        players[target.owner].spellTrapZone[target.index] = null
      }
      useDuelStore.setState({
        players,
        log: [...state.log, 'Mystical Space Typhoon destroyed a Spell/Trap'],
        pendingTarget: null
      })
    }
  }
}

export function tryActivateFromHand(seat: 0 | 1, handIndex: number) {
  const state = useDuelStore.getState()
  const player = state.players[seat]
  const card = player.hand[handIndex]
  if (!card) return

  void initOcgCore()

  const script = scripts[card.name]
  if (!script || !script.canActivate({ seat, cardName: card.name, handIndex })) {
    void runEdoproScript(String(card.id))
    return
  }

  player.hand = player.hand.filter((_, index) => index !== handIndex)
  player.graveyard = [...player.graveyard, card]
  useDuelStore.setState({
    players: [...state.players] as typeof state.players,
    log: [...state.log, `${player.name} activated ${card.name}`]
  })

  if (script.requiresTarget) {
    useDuelStore.setState({
      prompt: `Select a target for ${card.name}`,
      pendingActivation: { seat, cardName: card.name },
      pendingTarget: null
    })
    return
  }

  script.resolve({ seat, cardName: card.name, handIndex })
}

export function selectTarget(owner: 0 | 1, zone: 'spell' | 'monster', index: number) {
  const state = useDuelStore.getState()
  const pending = state.pendingActivation
  if (!pending) return
  const script = scripts[pending.cardName]
  if (!script) return
  if (script.targetFilter && !script.targetFilter(zone, owner, index)) return

  useDuelStore.setState({
    pendingTarget: { owner, zone, index },
    prompt: undefined,
    pendingActivation: undefined
  })

  script.resolve({ seat: pending.seat, cardName: pending.cardName, handIndex: -1 })
}
