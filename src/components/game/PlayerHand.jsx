import { useLayoutEffect, useRef, useState } from 'react';
import Card from '../Card';

const HAND_CARD_WIDTH = 80;
const HAND_EDGE_INSET = 12;
// Cap how far apart card centers can sit so a 2-card hand stays clustered
// near the middle. Larger hands still use the full width when they need it.
const HAND_MAX_SPACING = 100;

function PlayerHand({
  gameState,
  hand,
  draggingCard,
  pendingCurse,
  abilityUI,
  getHandCardLabels,
  onDiscardCursedCard,
  onCardDragStart,
  onAbilityButton,
  onEndTurn,
}) {
  const rowRef = useRef(null);
  const [rowWidth, setRowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return undefined;

    const updateWidth = () => setRowWidth(el.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gameState]);

  if (!(gameState === 'playerTurn' || gameState === 'curseDiscard')) {
    return null;
  }

  const totalCards = hand.length;
  const usableWidth = Math.max(0, rowWidth - HAND_EDGE_INSET * 2);
  const fullSpreadSpacing = totalCards > 1
    ? (usableWidth - HAND_CARD_WIDTH) / (totalCards - 1)
    : 0;
  const spacing = Math.min(HAND_MAX_SPACING, Math.max(0, fullSpreadSpacing));

  return (
    <div className="hand-container">
      <div className="hand-row" ref={rowRef}>
        {hand.map((card, index) => {
          const middleIndex = (totalCards - 1) / 2;
          const offsetFromCenter = index - middleIndex;

          // Calculate rotation: max 5 degrees per card from center
          const rotation = offsetFromCenter * 5;

          const horizontalOffset = offsetFromCenter * spacing;

          // Gentle arc so outer cards sit slightly lower across the wider fan
          const verticalOffset = Math.abs(horizontalOffset) * 0.06;

          const effectLabels = getHandCardLabels(card);
          const cursing = gameState === 'curseDiscard';
          return (
            <Card
              key={card.id}
              card={card}
              className={`${draggingCard?.id === card.id ? 'dragging' : ''}${cursing ? ' curse-target' : ''}`}
              style={{
                transform: `translateX(${horizontalOffset}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`,
                zIndex: index,
                '--hover-x': `${horizontalOffset}px`,
                '--hover-y': `${verticalOffset}px`,
                '--hover-rotation': `${rotation}deg`,
              }}
              onClick={cursing ? () => onDiscardCursedCard(card) : undefined}
              onMouseDown={cursing ? undefined : (e) => onCardDragStart(card, e, 'hand')}
              onTouchStart={cursing ? undefined : (e) => onCardDragStart(card, e, 'hand')}
              effectLabels={effectLabels}
            />
          );
        })}
      </div>
      <div className="hand-actions">
        {gameState === 'curseDiscard' ? (
          <div className="curse-banner">
            ⭐️ Curse: discard {pendingCurse} card{pendingCurse === 1 ? '' : 's'}
          </div>
        ) : (
          <>
            {abilityUI.buttons.map(button => (
              <button
                key={button.id}
                className={`action-btn ${button.className}`}
                onClick={() => onAbilityButton(button)}
                disabled={button.disabled}
              >
                {button.label}
                {button.usesRemaining != null ? ` (${button.usesRemaining})` : ''}
              </button>
            ))}
            <button className="action-btn end-turn" onClick={onEndTurn}>End Turn</button>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayerHand;
