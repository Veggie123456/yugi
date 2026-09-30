# GOAT Online architecture

## Product target

GOAT Online is a browser-first, automatic Yu-Gi-Oh! simulator locked to the commonly played GOAT Format card pool and the April 2005 TCG Forbidden/Limited list.

The client owns presentation: deck building, card search, duel field, prompts, animation, sound, logs, rooms, replays and spectator UX. The authoritative rules implementation should not be duplicated in React.

## Rules authority

Use Project Ignis' **ocgcore** through the browser-capable **@n1xx1/ocgcore-wasm** wrapper.

The wrapper exposes `OcgDuelMode.MODE_GOAT`, including the first-turn draw and GOAT-specific battle / trigger / field-spell behaviors. EDOPro Lua card scripts already stored under `public/edopro/script` provide card behavior.

The current Zustand duel store is a temporary interaction shell. It is useful for building and testing the board UX, but it must not become the source of truth for complex rulings.

### Engine adapter responsibilities

1. Build the card database expected by ocgcore's `cardReader`.
2. Resolve requested Lua scripts through `scriptReader`.
3. Create duels with `OcgDuelMode.MODE_GOAT`, 8000 LP, five-card opening hands and one draw per turn.
4. Convert ocgcore messages into view events such as draw, move, summon, set, flip, chain, attack, damage and win.
5. Convert UI decisions back into typed ocgcore responses.
6. Never let the React board invent a legal action. The engine tells the UI which actions and targets are currently valid.

## Card pool

The April 2005 Forbidden/Limited list and the card-pool cutoff are separate concepts. GOAT Online uses the common card pool legal by August 17, 2005 while continuing to enforce the April 2005 list.

Known legal set / promo metadata is authoritative. Release dates are only a fallback for card records without printing metadata.

## Multiplayer

For real online play the server is authoritative.

- Vercel: React/Vite frontend and static card/media assets.
- Persistent realtime service: WebSocket rooms, matchmaking queue, reconnect tokens, spectator streams and server-side ocgcore state.
- The client sends intentions/responses, never direct state mutations.
- The server emits sanitized player-specific snapshots so hidden hands/decks cannot leak.
- Replays are the deterministic duel seed plus accepted engine responses/events.

A persistent WebSocket process is preferable to trying to hold duel rooms inside short-lived serverless functions.

## Animation and sound

Animations and sound are event-driven. Every engine message can map to a generic presentation event, so all cards automatically receive consistent movement / flip / summon / chain / attack / damage feedback without hand-authoring an animation for every card.

Card-specific cinematic effects can be optional metadata layered on top later.

## Build milestones

1. GOAT card pool, legal deck builder and local duel field.
2. ocgcore-wasm adapter + complete automatic card interactions.
3. Authoritative WebSocket room server + private rooms.
4. Quick-match queue, match flow and reconnects.
5. Best-of-three siding, replays and spectating.
6. Ranked profiles / history and optional cosmetics.

## Licensing note

The wasm wrapper is MIT-licensed, while Project Ignis' current ocgcore is AGPL-3.0-or-later. Keep source and attribution/licensing obligations visible as the core is integrated and deployed.
