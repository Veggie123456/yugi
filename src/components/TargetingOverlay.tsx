export default function TargetingOverlay({ active }: { active: boolean }) {
	if (!active) return null
	return <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', border: '2px dashed #4da3ff' }} />
}



