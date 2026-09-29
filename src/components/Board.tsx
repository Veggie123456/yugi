import type { CardData } from '../types/card'
import type { PlayerState, ZoneCard } from '../types/duel'
import Card from './Card'

function CardBack({ label = 'Set card' }: { label?: string }) {
	return <div className="duel-card-back" title={label}><span>GOAT</span></div>
}

function MonsterRow({ zones, opponent, selected, onClick }: {
	zones: (ZoneCard | null)[]
	opponent?: boolean
	selected?: number | null
	onClick?: (index: number) => void
}) {
	return (
		<div className="duel-zone-row">
			{zones.map((zone, index) => (
				<button
					className={`duel-zone ${selected === index ? 'selected' : ''}`}
					key={index}
					onClick={() => zone && onClick?.(index)}
					disabled={!zone}
				>
					{zone ? (
						<div className={zone.position === 'DEF' ? 'defense-position' : ''}>
							{zone.position === 'SET' ? <CardBack label={opponent ? 'Face-down monster' : `Set ${zone.card.name}`} /> : <Card card={zone.card} small />}
						</div>
					) : <span className="zone-label">M{index + 1}</span>}
				</button>
			))}
		</div>
	)
}

function SpellTrapRow({ zones, opponent }: { zones: (CardData | null)[]; opponent?: boolean }) {
	return (
		<div className="duel-zone-row">
			{zones.map((card, index) => (
				<div className="duel-zone" key={index}>
					{card ? (opponent ? <CardBack label="Opponent Spell/Trap" /> : <Card card={card} small />) : <span className="zone-label">S/T {index + 1}</span>}
				</div>
			))}
		</div>
	)
}

function Pile({ title, cards, hidden }: { title: string; cards: CardData[]; hidden?: boolean }) {
	const top = cards[cards.length - 1]
	return (
		<div className="duel-pile">
			<div className="muted">{title} · {cards.length}</div>
			{top ? (hidden ? <CardBack label={title} /> : <Card card={top} small />) : <div className="empty-pile" />}
		</div>
	)
}

export default function Board({ player, opponent, selectedAttacker, onOwnMonsterClick, onOpponentMonsterClick }: {
	player: PlayerState
	opponent: PlayerState
	selectedAttacker?: number | null
	onOwnMonsterClick?: (index: number) => void
	onOpponentMonsterClick?: (index: number) => void
}) {
	return (
		<div className="duel-board panel">
			<div className="duel-side opponent-side">
				<div className="duel-piles">
					<Pile title="Deck" cards={opponent.deck} hidden />
					<Pile title="GY" cards={opponent.graveyard} />
				</div>
				<SpellTrapRow zones={opponent.spellTrapZone} opponent />
				<MonsterRow zones={opponent.monsterZone} opponent onClick={onOpponentMonsterClick} />
			</div>
			<div className="field-divider"><span>GOAT FORMAT</span></div>
			<div className="duel-side player-side">
				<MonsterRow zones={player.monsterZone} selected={selectedAttacker} onClick={onOwnMonsterClick} />
				<SpellTrapRow zones={player.spellTrapZone} />
				<div className="duel-piles">
					<Pile title="Deck" cards={player.deck} hidden />
					<Pile title="GY" cards={player.graveyard} />
				</div>
			</div>
		</div>
	)
}
