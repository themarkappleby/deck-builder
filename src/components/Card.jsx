import React from 'react';
import './Card.css';

function Card({ card, onClick, isMarket = false, canAfford = true, className = '', ...handlers }) {
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
    </div>
  );
}

export default Card;
