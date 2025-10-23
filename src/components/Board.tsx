import { CardData } from '../types/card'
import Card from './Card'

interface ZoneProps {
	cards: CardData[]
	label: string
	onCardClick?: (card: CardData, index: number) => void
}

function Zone({ cards, label, onCardClick }: ZoneProps) {
	return (
		<div style={{ display: 'flex', gap: 8, padding: 8, alignItems: 'center' }}>
			<span style={{ opacity: 0.7, width: 120 }}>{label}</span>
			<div style={{ display: 'flex', gap: 8 }}>
				{cards.map((c, i) => (
					<Card key={c.id} card={c} small onClick={() => onCardClick?.(c, i)} />
				))}
			</div>
		</div>
	)
}

interface BoardProps {
	monsterZone: CardData[]
	spellTrapZone: CardData[]
	graveyard: CardData[]
	onMonsterClick?: (card: CardData, index: number) => void
	onSpellTrapClick?: (card: CardData, index: number) => void
}

export default function Board({ monsterZone, spellTrapZone, graveyard, onMonsterClick, onSpellTrapClick }: BoardProps) {
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<Zone label="Monsters" cards={monsterZone} onCardClick={onMonsterClick} />
			<Zone label="Spells/Traps" cards={spellTrapZone} onCardClick={onSpellTrapClick} />
			<Zone label="Graveyard" cards={graveyard} />
		</div>
	)
}


