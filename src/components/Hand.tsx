import { AnimatePresence, motion } from 'framer-motion'
import type { CardData } from '../types/card'
import Card from './Card'

interface Props {
	cards: CardData[]
	opponent?: boolean
	onCardClick?: (card: CardData, index: number) => void
}

function CardBack() {
	return <div className="hand-card-back"><span>GOAT</span></div>
}

export default function Hand({ cards, opponent, onCardClick }: Props) {
	return (
		<div className={opponent ? 'duel-hand opponent-hand' : 'duel-hand player-hand'}>
			<AnimatePresence>
				{cards.map((card, index) => (
					<motion.div
						key={`${card.id}-${index}`}
						className="hand-card-wrap"
						initial={{ y: opponent ? -28 : 28, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: opponent ? -28 : 28, opacity: 0, scale: 0.85 }}
						whileHover={opponent ? undefined : { y: -18, scale: 1.05, zIndex: 30 }}
						transition={{ type: 'spring', stiffness: 280, damping: 20 }}
					>
						{opponent ? <CardBack /> : <Card card={card} onClick={() => onCardClick?.(card, index)} />}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	)
}
