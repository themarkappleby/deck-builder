import React from 'react';
import './Card.css';

export function CardSymbols({ symbols = [] }) {
  const count = symbols.length;

  return (
    <div
      className={`card-symbols-only symbol-count-${count}`}
      data-symbol-count={count}
    >
      {symbols.map((symbol, index) => (
        <span key={index} className="symbol-large">{symbol}</span>
      ))}
    </div>
  );
}

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

function Card({ card, onClick, isMarket = false, canAfford = true, className = '', style, effectLabels, ...handlers }) {
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
      style={style}
      onClick={onClick}
      {...handlers}
    >
      <CardSymbols symbols={card.symbols} />
      <CardEffectLabels labels={effectLabels} />
    </div>
  );
}

export default Card;
