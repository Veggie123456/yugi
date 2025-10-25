import { useDuelStore } from '../store/duel'

export default function HUD() {
	const lp1 = useDuelStore((s) => s.players[0].lifePoints)
	const lp2 = useDuelStore((s) => s.players[1].lifePoints)
	const phase = useDuelStore((s) => s.phase)
	const turn = useDuelStore((s) => s.turnPlayer)
	const endPhase = useDuelStore((s) => s.endPhase)
	const draw = useDuelStore((s) => s.draw)
	return (
		<div className="panel" style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
			<div>P1 LP: {lp1}</div>
			<div>Turn: {turn===0?'P1':'P2'} · Phase: {phase}</div>
			<div>P2 LP: {lp2}</div>
			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={() => draw(turn as 0|1)}>Draw</button>
				<button onClick={endPhase}>End Phase</button>
			</div>
		</div>
	)
}


