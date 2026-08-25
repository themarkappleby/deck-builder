import { useRef } from 'react';
import Card from '../Card';
import { shuffleArray } from '../../utils/shuffle';

function CurrentDeckOverlay({
  showCurrentDeck,
  deck,
  hand,
  discard,
  getCardLabels,
  onClose,
}) {
  const snapshotRef = useRef([]);
  const wasShownRef = useRef(false);

  if (showCurrentDeck && !wasShownRef.current) {
    // Shuffle once when the modal opens so pile order cannot be inferred.
    snapshotRef.current = shuffleArray([...deck, ...hand, ...discard]);
  }
  wasShownRef.current = showCurrentDeck;

  if (!showCurrentDeck) return null;

  const displayCards = snapshotRef.current;

  return (
    <div className="current-deck-overlay">
      <div className="current-deck-content">
        <h3>Current deck</h3>
        <p className="current-deck-hint">
          Cards in your draw pile, hand, and discard — shown in no particular order.
        </p>
        {displayCards.length === 0 ? (
          <p className="current-deck-empty">No cards</p>
        ) : (
          <div className="current-deck-grid">
            {displayCards.map((card) => (
              <Card
                key={card.id}
                card={card}
                className="current-deck-card"
                effectLabels={getCardLabels?.(card)}
              />
            ))}
          </div>
        )}
        <button className="close-stats-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default CurrentDeckOverlay;
