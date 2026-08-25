import Card from '../Card';
import { formatBossCardEffectLabels } from '../../abilityActions';

function MarketColumn({ marketSlots, marketSlotCount, currentBoss, resources, purchaseOrTrashCost, draggingCard, onCardDragStart }) {
  return (
    <div className="market-column">
      <div className="market-label">Market</div>
      <div className="intent-card-row market-row" style={{ '--slot-count': marketSlotCount }}>
        {marketSlots.map((card, index) => (
          card ? (
            <Card
              key={card.id}
              card={card}
              isMarket={true}
              canAfford={resources >= purchaseOrTrashCost}
              className={draggingCard?.id === card.id ? 'dragging' : ''}
              effectLabels={formatBossCardEffectLabels(currentBoss, card.symbols)}
              onMouseDown={(e) => onCardDragStart(card, e, 'market')}
              onTouchStart={(e) => onCardDragStart(card, e, 'market')}
            />
          ) : (
            <div key={`market-slot-${index}`} className="market-slot-empty" />
          )
        ))}
      </div>
    </div>
  );
}

export default MarketColumn;
