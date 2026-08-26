import { useEffect, useRef, useState } from 'react';
import Card from '../Card';
import { formatBossCardEffectLabels } from '../../abilityActions';

function MarketColumn({
  marketSlots,
  marketSlotCount,
  currentBoss,
  resources,
  purchaseOrTrashCost,
  draggingCard,
  onCardDragStart,
}) {
  const [costPulseKey, setCostPulseKey] = useState(0);
  const prevCostRef = useRef(purchaseOrTrashCost);
  const canAfford = resources >= purchaseOrTrashCost;

  useEffect(() => {
    if (purchaseOrTrashCost > prevCostRef.current) {
      setCostPulseKey((key) => key + 1);
    }
    prevCostRef.current = purchaseOrTrashCost;
  }, [purchaseOrTrashCost]);

  return (
    <div className="market-column">
      <div className="market-label">Market</div>
      <div className="market-row-with-cost">
        <div className="market-cards-wrap">
          <div
            key={costPulseKey}
            className={`resource-circle cost-circle market-cost${costPulseKey > 0 ? ' is-pulsing' : ''}`}
            title="Cost to purchase or trash a card"
            aria-label={`Purchase or trash cost: ${purchaseOrTrashCost}`}
            onAnimationEnd={(event) => {
              if (event.animationName === 'resource-pulse') {
                event.currentTarget.classList.remove('is-pulsing');
              }
            }}
          >
            {purchaseOrTrashCost}
          </div>
          <div className="intent-card-row market-row" style={{ '--slot-count': marketSlotCount }}>
          {marketSlots.map((card, index) => (
            card ? (
              <Card
                key={card.id}
                card={card}
                isMarket={true}
                canAfford={canAfford}
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
      </div>
    </div>
  );
}

export default MarketColumn;
