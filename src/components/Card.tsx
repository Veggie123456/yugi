import { motion } from 'framer-motion'
import { CardData } from '../types/card'
import { hoverLift } from '../lib/animation'

interface Props {
	card: CardData
	small?: boolean
	onClick?: () => void
}

export default function Card({ card, small, onClick }: Props) {
	const width = small ? 90 : 150
	const height = Math.round(width * 1.45)
	return (
		<motion.div className="card" style={{ width, height }} {...hoverLift} onClick={onClick}>
			<div className="card-frame">
				<img src={card.imageUrl ?? '/vite.svg'} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
			</div>
		</motion.div>
	)
}


