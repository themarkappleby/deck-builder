function EndTurnConfirmOverlay({
  open,
  canPlay,
  canDiscard,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  let actionText = 'play or discard';
  if (canPlay && !canDiscard) {
    actionText = 'play';
  } else if (!canPlay && canDiscard) {
    actionText = 'discard';
  }

  return (
    <div className="end-turn-confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="end-turn-confirm-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-turn-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="end-turn-confirm-title">End your turn?</h3>
        <p>
          You still have a card you could {actionText}.
        </p>
        <div className="end-turn-confirm-actions">
          <button className="close-stats-btn" type="button" onClick={onCancel}>
            Keep Playing
          </button>
          <button className="end-turn-confirm-btn" type="button" onClick={onConfirm}>
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndTurnConfirmOverlay;
