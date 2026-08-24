import Card from '../Card';

function MarketColumn({ marketSlots, marketSlotCount, resources, draggingCard, onCardDragStart }) {
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
              canAfford={resources >= card.symbols.length}
              className={draggingCard?.id === card.id ? 'dragging' : ''}
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
