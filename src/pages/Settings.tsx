import { motion } from 'framer-motion'
import { useState } from 'react'
import { useSettingsStore } from '../store/settings'

export default function Settings() {
	const { goatRules, setGoatRules, soundsEnabled, setSoundsEnabled, animationsEnabled, setAnimationsEnabled } = useSettingsStore()
	const [cutoff, setCutoff] = useState(goatRules.cutoffDateIso)
	function save() { setGoatRules({ ...goatRules, cutoffDateIso: cutoff }) }
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Settings</h1>
			<div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
				<label>
					<span>GOAT cutoff date</span>
					<input type="date" value={cutoff} onChange={(e) => setCutoff(e.target.value)} />
				</label>
				<button onClick={save}>Save cutoff</button>
				<label>
					<input type="checkbox" checked={soundsEnabled} onChange={(e) => setSoundsEnabled(e.target.checked)} /> Sounds enabled
				</label>
				<label>
					<input type="checkbox" checked={animationsEnabled} onChange={(e) => setAnimationsEnabled(e.target.checked)} /> Animations enabled
				</label>
			</div>
		</motion.div>
	)
}


