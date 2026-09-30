import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/settings'

export default function Settings() {
	const soundsEnabled = useSettingsStore((s) => s.soundsEnabled)
	const setSoundsEnabled = useSettingsStore((s) => s.setSoundsEnabled)
	const animationsEnabled = useSettingsStore((s) => s.animationsEnabled)
	const setAnimationsEnabled = useSettingsStore((s) => s.setAnimationsEnabled)

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-stack">
			<div className="page-heading">
				<div>
					<div className="eyebrow">GOAT ONLINE</div>
					<h1>Settings</h1>
					<p>The competitive ruleset is locked. Personal presentation options stay local to your browser.</p>
				</div>
			</div>
			<div className="panel" style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
				<div>
					<strong>Ruleset</strong>
					<div className="muted">GOAT card pool through August 17, 2005 · April 2005 TCG Forbidden/Limited list · first-turn draw.</div>
				</div>
				<label>
					<input type="checkbox" checked={soundsEnabled} onChange={(event) => setSoundsEnabled(event.target.checked)} /> Sounds enabled
				</label>
				<label>
					<input type="checkbox" checked={animationsEnabled} onChange={(event) => setAnimationsEnabled(event.target.checked)} /> Animations enabled
				</label>
			</div>
		</motion.div>
	)
}
