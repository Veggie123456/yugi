import { motion } from 'framer-motion'

export default function Home() {
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<h1>Yu-Gi-Oh! GOAT Duel</h1>
			<p>Welcome! Build a GOAT deck and start a duel.</p>
		</motion.div>
	)
}


