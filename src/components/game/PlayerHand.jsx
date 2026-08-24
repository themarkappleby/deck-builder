import Card from '../Card';

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
  if (!(gameState === 'playerTurn' || gameState === 'curseDiscard')) {
    return null;
  }

  return (
    <div className="hand-container">
      <div className="hand-row">
        {hand.map((card, index) => {
          const totalCards = hand.length;
          const middleIndex = (totalCards - 1) / 2;
          const offsetFromCenter = index - middleIndex;

          // Calculate rotation: max 5 degrees per card from center
          const rotation = offsetFromCenter * 5;

          // Calculate horizontal spacing: cards overlap by 40-60% depending on hand size
          const baseSpacing = totalCards > 7 ? 30 : totalCards > 5 ? 40 : 50;
          const horizontalOffset = offsetFromCenter * baseSpacing;

          // Calculate vertical offset for arc effect (cards at edges are slightly lower)
          const verticalOffset = Math.abs(offsetFromCenter) * 3;

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
