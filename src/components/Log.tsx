import { useDuelStore } from '../store/duel'

export default function Log() {
	const log = useDuelStore((s) => s.log)
	return (
		<div className="panel" style={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
			{log.map((l, i) => (
				<div key={i}>{l}</div>
			))}
		</div>
	)
}


