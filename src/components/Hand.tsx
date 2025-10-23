import { AnimatePresence, motion } from 'framer-motion'
import { CardData } from '../types/card'
import Card from './Card'

interface Props {
	cards: CardData[]
	onCardClick?: (card: CardData, index: number) => void
}

export default function Hand({ cards, onCardClick }: Props) {
	return (
		<div style={{ display: 'flex', gap: 8, padding: 8, justifyContent: 'center' }}>
			<AnimatePresence>
				{cards.map((c, i) => (
					<motion.div key={c.id}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 280, damping: 20 }}>
						<Card card={c} onClick={() => onCardClick?.(c, i)} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	)
}


