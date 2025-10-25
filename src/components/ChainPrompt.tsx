import { useDuelStore } from '../store/duel'

export default function ChainPrompt() {
	const open = useDuelStore((s) => s.chainWindowOpen)
	const prioritySeat = useDuelStore((s) => s.prioritySeat)
	const passPriority = useDuelStore((s) => s.passPriority)
	if (!open) return null
	return (
		<div className="panel" style={{ position: 'fixed', bottom: 16, right: 16 }}>
			<div>Chain Window: Priority → {prioritySeat===0?'P1':'P2'}</div>
			<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
				<button onClick={() => passPriority()}>Pass</button>
			</div>
		</div>
	)
}



