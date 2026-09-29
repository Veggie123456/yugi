import { useDuelStore } from '../store/duel'

export default function HUD() {
	const lp1 = useDuelStore((s) => s.players[0].lifePoints)
	const lp2 = useDuelStore((s) => s.players[1].lifePoints)
	const phase = useDuelStore((s) => s.phase)
	const turn = useDuelStore((s) => s.turnPlayer)
	const turnNumber = useDuelStore((s) => s.turnNumber)
	const turnDrawn = useDuelStore((s) => s.turnDrawn)
	const winner = useDuelStore((s) => s.winner)
	const drawForTurn = useDuelStore((s) => s.drawForTurn)
	const surrender = useDuelStore((s) => s.surrender)

	return (
		<div className="panel duel-hud">
			<div className="lp-box"><span>P1</span><strong>{lp1.toLocaleString()} LP</strong></div>
			<div className="turn-box">
				<strong>Turn {turnNumber} · {turn === 0 ? 'Player 1' : 'Player 2'}</strong>
				<span>{phase}</span>
				{winner !== undefined && <b>{winner === 'draw' ? 'DRAW' : `PLAYER ${winner + 1} WINS`}</b>}
			</div>
			<div className="lp-box"><span>P2</span><strong>{lp2.toLocaleString()} LP</strong></div>
			<div className="hud-actions">
				<button disabled={phase !== 'DRAW' || turnDrawn || winner !== undefined} onClick={drawForTurn}>Draw for Turn</button>
				<button disabled={winner !== undefined} onClick={() => surrender(turn)}>Surrender</button>
			</div>
		</div>
	)
}
