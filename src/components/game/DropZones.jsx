import { CardSymbols, CardEffectLabels } from '../Card';

function DropZones({
  draggingCard,
  draggingSource,
  dropZone,
  resources,
  cannotDiscardForResources,
  dragPosition,
  getHandCardLabels,
}) {
  return (
    <>
      {draggingCard && draggingSource === 'hand' && (
        <>
          {/* Play zone - center/middle (where the boss is) - only if player can afford */}
          {resources >= 1 && (
            <div className={`drop-zone drop-zone-center ${dropZone === 'play' ? 'active' : ''}`}>
              <div className="drop-zone-label">PLAY<br/>1 💎</div>
            </div>
          )}

          {/* Discard zone - right side - unavailable after Forest elf 🟣 */}
          {!cannotDiscardForResources && (
            <div className={`drop-zone drop-zone-right ${dropZone === 'discard' ? 'active' : ''}`}>
              <div className="drop-zone-label">DISCARD<br/>+1 💎</div>
            </div>
          )}

          {/* Trash zone - top - only if player can afford */}
          {resources >= draggingCard.symbols.length && (
            <div className={`drop-zone drop-zone-top ${dropZone === 'trash' ? 'active' : ''}`}>
              <div className="drop-zone-label">TRASH<br/>{draggingCard.symbols.length} 💎</div>
            </div>
          )}
        </>
      )}

      {draggingCard && draggingSource === 'market' && (
        <div className={`drop-zone drop-zone-bottom ${dropZone === 'purchase' ? 'active' : ''}`}>
          <div className="drop-zone-label">BUY<br/>{draggingCard.symbols.length} 💎</div>
        </div>
      )}

      {draggingCard && (
        <div
          className="floating-card"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
          }}
        >
          <CardSymbols symbols={draggingCard.symbols} />
          {draggingSource === 'hand' && (
            <CardEffectLabels labels={getHandCardLabels(draggingCard)} />
          )}
        </div>
      )}
    </>
  );
}

export default DropZones;
