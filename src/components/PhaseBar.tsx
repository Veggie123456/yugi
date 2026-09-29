import { useDuelStore } from '../store/duel'

const order = [
	['DRAW', 'DP'],
	['STANDBY', 'SP'],
	['MAIN1', 'M1'],
	['BATTLE', 'BP'],
	['MAIN2', 'M2'],
	['END', 'EP'],
] as const

export default function PhaseBar() {
	const phase = useDuelStore((s) => s.phase)
	const endPhase = useDuelStore((s) => s.endPhase)
	const drawForTurn = useDuelStore((s) => s.drawForTurn)
	const turnDrawn = useDuelStore((s) => s.turnDrawn)
	const winner = useDuelStore((s) => s.winner)

	function advance() {
		if (phase === 'DRAW' && !turnDrawn) {
			drawForTurn()
			return
		}
		endPhase()
	}

	return (
		<div className="phase-dock">
			<div className="phase-row">
				{order.map(([value, label]) => (
					<div key={value} className={`phase-chip ${phase === value ? 'active' : ''}`}>
						{label}
					</div>
				))}
			</div>
			<button className="phase-next" disabled={winner !== undefined} onClick={advance}>▶▶</button>
		</div>
	)
}
