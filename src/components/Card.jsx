import React from 'react';
import './Card.css';

function Card({ card, onClick, onDiscard, onTrash, isMarket = false, canAfford = true }) {
  const cost = card.symbols.length;

  return (
    <div className={`card ${isMarket ? 'market-card' : ''} ${!canAfford ? 'unaffordable' : ''}`}>
      <div className="card-header">
        <div className="card-name">{card.name}</div>
        <div className="card-cost">Cost: {cost}</div>
      </div>
      
      <div className="card-symbols">
        {card.symbols.map((symbol, index) => (
          <span key={index} className="symbol">{symbol}</span>
        ))}
      </div>
      
      <div className="card-actions">
        {!isMarket && onDiscard && (
          <button 
            className="card-button discard"
            onClick={onDiscard}
          >
            Discard (+1 💎)
          </button>
        )}
        <button 
          className="card-button primary"
          onClick={onClick}
          disabled={!canAfford}
        >
          {isMarket ? 'Buy' : 'Play'}
        </button>
        {!isMarket && onTrash && (
          <button 
            className="card-button secondary"
            onClick={onTrash}
            disabled={!canAfford}
          >
            Trash
          </button>
        )}
      </div>
    </div>
  );
}

export default Card;
