import type { CardData } from '../types/card'
import Card from './Card'

export default function CardInspector({ card }: { card?: CardData | null }) {
	if (!card) {
		return (
			<aside className="card-inspector empty">
				<div className="inspector-brand">GOAT ONLINE</div>
				<div className="inspector-empty-card">SELECT A CARD</div>
				<div className="inspector-empty-copy">
					Tap a card in your hand or on the field to inspect it here.
				</div>
			</aside>
		)
	}

	return (
		<aside className="card-inspector">
			<div className="inspector-brand">GOAT ONLINE</div>
			<div className="inspector-card-art">
				<Card card={card} />
			</div>
			<div className="inspector-tabs">
				<span className="active">CARD</span>
				<span>EFFECT</span>
				<span>LOG</span>
			</div>
			<div className="inspector-copy">
				<h2>{card.name}</h2>
				<div className="inspector-meta">
					<span>{card.cardType}{card.subType ? ` / ${card.subType}` : ''}</span>
					{card.levelOrRank ? <span>★ {card.levelOrRank}</span> : null}
				</div>
				{card.cardType === 'Monster' && (
					<div className="inspector-stats">
						<strong>ATK {card.attack ?? '?'}</strong>
						<strong>DEF {card.defense ?? '?'}</strong>
						{card.attribute && <span>{card.attribute}</span>}
					</div>
				)}
				<p>{card.description || 'No card text available.'}</p>
			</div>
		</aside>
	)
}
