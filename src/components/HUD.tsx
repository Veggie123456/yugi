import { useDuelStore } from '../store/duel'

function PlayerHud({ seat, side }: { seat: 0 | 1; side: 'left' | 'right' }) {
	const player = useDuelStore((s) => s.players[seat])
	const turn = useDuelStore((s) => s.turnPlayer)
	const maxLp = 8000
	const pct = Math.max(0, Math.min(100, (player.lifePoints / maxLp) * 100))

	return (
		<div className={`player-hud player-hud-${side} ${turn === seat ? 'active-turn' : ''}`}>
			<div className="player-avatar">{seat === 0 ? 'Y' : 'K'}</div>
			<div className="player-hud-body">
				<div className="player-hud-name">
					<strong>{player.name}</strong>
					<span>{turn === seat ? 'TURN' : 'WAIT'}</span>
				</div>
				<div className="lp-track">
					<div className="lp-fill" style={{ width: `${pct}%` }} />
				</div>
				<div className="lp-readout"><b>LP</b> {player.lifePoints.toLocaleString()}</div>
			</div>
		</div>
	)
}

export default function HUD() {
	const phase = useDuelStore((s) => s.phase)
	const turnNumber = useDuelStore((s) => s.turnNumber)
	const winner = useDuelStore((s) => s.winner)
	const surrender = useDuelStore((s) => s.surrender)
	const turn = useDuelStore((s) => s.turnPlayer)

	return (
		<div className="duel-top-hud">
			<PlayerHud seat={0} side="left" />
			<div className="duel-center-status">
				<div className="turn-counter">TURN {turnNumber}</div>
				<div className="duel-timer">00:00</div>
				<div className="phase-readout">{phase}</div>
				{winner !== undefined && <div className="winner-banner">{winner === 'draw' ? 'DRAW' : `PLAYER ${winner + 1} WINS`}</div>}
			</div>
			<PlayerHud seat={1} side="right" />
			<button className="duel-menu-button" onClick={() => surrender(turn)}>⋮</button>
		</div>
	)
}
