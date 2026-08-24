/**
 * Draw `count` cards from a draw pile, shuffling the discard pile into a new
 * draw pile when it runs out. Callers must not place discards on the top of
 * the draw pile — that would immediately re-draw the same handful.
 */
export function drawFromPiles(count, drawPile, discardPile, shuffleFn) {
  const drawnCards = [];
  let currentDeck = [...drawPile];
  let currentDiscard = [...discardPile];
  let reshuffled = false;

  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) {
      if (currentDiscard.length === 0) break;
      currentDeck = shuffleFn([...currentDiscard]);
      currentDiscard = [];
      reshuffled = true;
    }
    drawnCards.push(currentDeck.pop());
  }

  return { drawnCards, currentDeck, currentDiscard, reshuffled };
}
