import { CardSymbols, CardEffectLabels } from '../Card';
import { MAX_RESOURCES } from '../../game/constants';
import { getCardSymbolGradientStyle } from '../../gameData/symbols';

function DropZones({
  draggingCard,
  draggingSource,
  dropZone,
  resources,
  purchaseOrTrashCost,
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
          {!cannotDiscardForResources && resources < MAX_RESOURCES && (
            <div className={`drop-zone drop-zone-right ${dropZone === 'discard' ? 'active' : ''}`}>
              <div className="drop-zone-label">DISCARD<br/>+1 💎</div>
            </div>
          )}

          {/* Trash zone - top - only if player can afford */}
          {resources >= purchaseOrTrashCost && (
            <div className={`drop-zone drop-zone-top ${dropZone === 'trash' ? 'active' : ''}`}>
              <div className="drop-zone-label">TRASH<br/>{purchaseOrTrashCost} 💎</div>
            </div>
          )}
        </>
      )}

      {draggingCard && draggingSource === 'market' && (
        <div className={`drop-zone drop-zone-bottom ${dropZone === 'purchase' ? 'active' : ''}`}>
          <div className="drop-zone-label">BUY<br/>{purchaseOrTrashCost} 💎</div>
        </div>
      )}

      {draggingCard && (
        <div
          className="floating-card"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            ...getCardSymbolGradientStyle(draggingCard.symbols),
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
