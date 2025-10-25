import { useDuelStore } from '../store/duel'

const order = ['DRAW','STANDBY','MAIN1','BATTLE','MAIN2','END'] as const

export default function PhaseBar() {
	const phase = useDuelStore((s) => s.phase)
	const endPhase = useDuelStore((s) => s.endPhase)
	return (
		<div className="panel" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
			{order.map((p) => (
				<div key={p} style={{ padding: '4px 8px', borderRadius: 6, background: phase===p?'#1e2b4d':'#0f1628', border: '1px solid #2a3b63' }}>{p}</div>
			))}
			<button onClick={endPhase}>Next</button>
		</div>
	)
}



