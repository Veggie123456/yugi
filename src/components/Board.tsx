import type { CardData } from '../types/card'
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
					<Card key={`${c.id}-${i}`} card={c} small onClick={() => onCardClick?.(c, i)} />
				))}
			</div>
		</div>
	)
}

interface BoardProps {
	monsterZone: CardData[]
	spellTrapZone: CardData[]
	graveyard: CardData[]
	opponentMonsterZone?: CardData[]
	opponentSpellTrapZone?: CardData[]
	opponentGraveyard?: CardData[]
	onMonsterClick?: (card: CardData, index: number) => void
	onSpellTrapClick?: (card: CardData, index: number) => void
	onAttack?: (attackerIndex: number, targetIndex?: number) => void
	onOpponentSpellTrapClick?: (card: CardData, index: number) => void
}

export default function Board({ monsterZone, spellTrapZone, graveyard, opponentMonsterZone, opponentSpellTrapZone, opponentGraveyard, onMonsterClick, onSpellTrapClick, onAttack, onOpponentSpellTrapClick }: BoardProps) {
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			{opponentMonsterZone && (
				<Zone label="Opponent Monsters" cards={opponentMonsterZone} onCardClick={(_, i) => onAttack?.(-1, i)} />
			)}
			{opponentSpellTrapZone && (
				<Zone label="Opponent Spells/Traps" cards={opponentSpellTrapZone} onCardClick={onOpponentSpellTrapClick} />
			)}
			{opponentGraveyard && <Zone label="Opponent Graveyard" cards={opponentGraveyard} />}
			<Zone label="Monsters" cards={monsterZone} onCardClick={(_, i) => onAttack ? onAttack(i) : onMonsterClick?.(monsterZone[i], i)} />
			<Zone label="Spells/Traps" cards={spellTrapZone} onCardClick={onSpellTrapClick} />
			<Zone label="Graveyard" cards={graveyard} />
		</div>
	)
}
