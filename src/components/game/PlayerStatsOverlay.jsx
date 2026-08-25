import { useRef } from 'react';
import CharacterAbilities from '../CharacterAbilities';
import Card from '../Card';
import { shuffleArray } from '../../utils/shuffle';

function PlayerStatsOverlay({
  showPlayerStats,
  playerCharacter,
  raceLevel,
  classLevel,
  godLevel,
  deck,
  hand,
  discard,
  getCardLabels,
  onClose,
}) {
  const snapshotRef = useRef([]);
  const wasShownRef = useRef(false);

  if (showPlayerStats && !wasShownRef.current) {
    // Shuffle once when the sheet opens so pile order cannot be inferred.
    snapshotRef.current = shuffleArray([...deck, ...hand, ...discard]);
  }
  wasShownRef.current = showPlayerStats;

  if (!showPlayerStats) return null;

  const displayCards = snapshotRef.current;

  return (
    <div className="player-stats-overlay" onClick={onClose} role="presentation">
      <div
        className="player-stats-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-stats-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="player-stats-sheet-handle" aria-hidden="true" />
        <div className="player-stats-sheet-header">
          <h3 id="player-stats-sheet-title">Your Character</h3>
          <button type="button" className="player-stats-sheet-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="player-stats-sheet-body">
          <CharacterAbilities
            playerCharacter={playerCharacter}
            raceLevel={raceLevel}
            classLevel={classLevel}
            godLevel={godLevel}
          />

          <h3 className="player-stats-sheet-section-title">Your cards</h3>
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
        </div>
      </div>
    </div>
  );
}

export default PlayerStatsOverlay;
