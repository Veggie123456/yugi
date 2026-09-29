import { AnimatePresence, motion } from 'framer-motion'
import type { CardData } from '../types/card'
import Card from './Card'

interface Props {
	cards: CardData[]
	onCardClick?: (card: CardData, index: number) => void
}

export default function Hand({ cards, onCardClick }: Props) {
	return (
		<div className="duel-hand">
			<AnimatePresence>
				{cards.map((card, index) => (
					<motion.div
						key={`${card.id}-${index}`}
						initial={{ y: 28, opacity: 0, rotate: -2 }}
						animate={{ y: 0, opacity: 1, rotate: 0 }}
						exit={{ y: 28, opacity: 0, scale: 0.85 }}
						whileHover={{ y: -14, scale: 1.04, zIndex: 10 }}
						transition={{ type: 'spring', stiffness: 280, damping: 20 }}
					>
						<Card card={card} onClick={() => onCardClick?.(card, index)} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	)
}
