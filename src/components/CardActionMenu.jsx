import React from 'react';
import { CardSymbols } from './Card';
import { getCardSymbolGradientStyle } from '../gameData/symbols';
import './CardActionMenu.css';

function CardActionMenu({ card, isMarket, canAfford, onPlay, onDiscard, onTrash, onBuy, onClose }) {
  if (!card) return null;

  const cost = card.symbols.length;

  return (
    <>
      <div className="action-menu-overlay" onClick={onClose} />
      <div className="action-menu">
        <div className="action-menu-header">
          <div className="action-menu-card-preview" style={getCardSymbolGradientStyle(card.symbols)}>
            <CardSymbols symbols={card.symbols} />
          </div>
          <div className="action-menu-cost">Cost: {cost} 💎</div>
        </div>

        <div className="action-menu-buttons">
          {isMarket ? (
            <button
              className="action-button buy-button"
              onClick={onBuy}
              disabled={!canAfford}
            >
              💰 Buy Card ({cost} 💎)
            </button>
          ) : (
            <>
              <button
                className="action-button play-button"
                onClick={onPlay}
                disabled={!canAfford}
              >
                ▶️ Play Card ({cost} 💎)
              </button>
              <button
                className="action-button discard-button"
                onClick={onDiscard}
              >
                🗂️ Discard (+1 💎)
              </button>
              <button
                className="action-button trash-button"
                onClick={onTrash}
                disabled={!canAfford}
              >
                🗑️ Trash Card ({cost} 💎)
              </button>
            </>
          )}
          <button className="action-button cancel-button" onClick={onClose}>
            ✖️ Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default CardActionMenu;
