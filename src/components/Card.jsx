import React from 'react';
import './Card.css';

export function CardEffectLabels({ labels }) {
  if (!labels?.length) return null;
  return (
    <div className="card-effect-labels">
      {labels.map((label, index) => (
        <span key={index} className="card-effect-label">{label}</span>
      ))}
    </div>
  );
}

function Card({ card, onClick, isMarket = false, canAfford = true, className = '', effectLabels, ...handlers }) {
  const classes = [
    'card',
    isMarket ? 'market-card' : '',
    !canAfford ? 'unaffordable' : '',
    isMarket && canAfford ? 'purchasable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      {...handlers}
    >
      <div className="card-symbols-only">
        {card.symbols.map((symbol, index) => (
          <span key={index} className="symbol-large">{symbol}</span>
        ))}
      </div>
      <CardEffectLabels labels={effectLabels} />
    </div>
  );
}

export default Card;
