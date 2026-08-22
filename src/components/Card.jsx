import React from 'react';
import './Card.css';

function Card({ card, onClick, isMarket = false, canAfford = true }) {
  return (
    <div 
      className={`card ${isMarket ? 'market-card' : ''} ${!canAfford ? 'unaffordable' : ''}`}
      onClick={onClick}
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
