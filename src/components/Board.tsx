import type { CardData } from '../types/card'
import type { PlayerState, ZoneCard } from '../types/duel'
import Card from './Card'

function CardBack({ label = 'Set card' }: { label?: string }) {
	return <div className="duel-card-back" title={label}><span>GOAT</span></div>
}

function MonsterRow({ zones, opponent, selected, onClick, onInspect }: {
	zones: (ZoneCard | null)[]
	opponent?: boolean
	selected?: number | null
	onClick?: (index: number) => void
	onInspect?: (card: CardData) => void
}) {
	return (
		<div className="arena-zone-row monster-row">
			{zones.map((zone, index) => (
				<button
					className={`arena-zone monster-zone ${selected === index ? 'selected' : ''}`}
					key={index}
					onClick={() => {
						if (!zone) return
						onInspect?.(zone.card)
						onClick?.(index)
					}}
					disabled={!zone}
				>
					{zone ? (
						<div className={zone.position === 'DEF' ? 'defense-position' : ''}>
							{zone.position === 'SET' ? <CardBack label={opponent ? 'Face-down monster' : `Set ${zone.card.name}`} /> : <Card card={zone.card} small />}
						</div>
					) : <span className="zone-etch">MONSTER</span>}
				</button>
			))}
		</div>
	)
}

function SpellTrapRow({ zones, opponent, onInspect }: {
	zones: (CardData | null)[]
	opponent?: boolean
	onInspect?: (card: CardData) => void
}) {
	return (
		<div className="arena-zone-row spell-row">
			{zones.map((card, index) => (
				<button
					className="arena-zone spell-zone"
					key={index}
					onClick={() => card && onInspect?.(card)}
					disabled={!card}
				>
					{card ? (opponent ? <CardBack label="Opponent Spell/Trap" /> : <Card card={card} small />) : <span className="zone-etch">S / T</span>}
				</button>
			))}
		</div>
	)
}

function Pile({ title, cards, hidden, onInspect }: { title: string; cards: CardData[]; hidden?: boolean; onInspect?: (card: CardData) => void }) {
	const top = cards[cards.length - 1]
	return (
		<button className="arena-pile" onClick={() => top && onInspect?.(top)} disabled={!top}>
			{top ? (hidden ? <CardBack label={title} /> : <Card card={top} small />) : <div className="empty-pile" />}
			<span>{title}</span>
			<b>{cards.length}</b>
		</button>
	)
}

export default function Board({ player, opponent, selectedAttacker, onOwnMonsterClick, onOpponentMonsterClick, onInspect }: {
	player: PlayerState
	opponent: PlayerState
	selectedAttacker?: number | null
	onOwnMonsterClick?: (index: number) => void
	onOpponentMonsterClick?: (index: number) => void
	onInspect?: (card: CardData) => void
}) {
	return (
		<div className="duel-arena">
			<div className="field-half opponent-field">
				<div className="side-piles left-piles">
					<Pile title="GY" cards={opponent.graveyard} onInspect={onInspect} />
				</div>
				<div className="field-zones">
					<SpellTrapRow zones={opponent.spellTrapZone} opponent onInspect={onInspect} />
					<MonsterRow zones={opponent.monsterZone} opponent onClick={onOpponentMonsterClick} onInspect={onInspect} />
				</div>
				<div className="side-piles right-piles">
					<Pile title="DECK" cards={opponent.deck} hidden />
				</div>
			</div>

			<div className="field-midline" />

			<div className="field-half player-field">
				<div className="side-piles left-piles">
					<Pile title="GY" cards={player.graveyard} onInspect={onInspect} />
				</div>
				<div className="field-zones">
					<MonsterRow zones={player.monsterZone} selected={selectedAttacker} onClick={onOwnMonsterClick} onInspect={onInspect} />
					<SpellTrapRow zones={player.spellTrapZone} onInspect={onInspect} />
				</div>
				<div className="side-piles right-piles">
					<Pile title="DECK" cards={player.deck} hidden />
				</div>
			</div>
		</div>
	)
}
