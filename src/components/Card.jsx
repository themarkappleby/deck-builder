import React from 'react';
import './Card.css';

function Card({ card, onClick, onTrash, isMarket = false }) {
  const cost = card.symbols.length;

  return (
    <div className={`card ${isMarket ? 'market-card' : ''}`}>
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
        <button 
          className="card-button primary"
          onClick={onClick}
        >
          {isMarket ? 'Buy' : 'Play'}
        </button>
        {!isMarket && onTrash && (
          <button 
            className="card-button secondary"
            onClick={onTrash}
          >
            Trash
          </button>
        )}
      </div>
    </div>
  );
}

export default Card;
