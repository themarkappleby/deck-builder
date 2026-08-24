import { SYMBOLS } from './symbols';

function makeMarketCopies(id, name, symbols, count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${id}_${index + 1}`,
    name,
    symbols: [...symbols]
  }));
}

// Shared market / boss draw pile
export const marketCards = [
  ...makeMarketCopies('m-atk', 'Strike', [SYMBOLS.ATTACK], 4),
  ...makeMarketCopies('m-blk', 'Block', [SYMBOLS.BLOCK], 4),
  ...makeMarketCopies('m-atk2', 'Swift Strike', [SYMBOLS.ATTACK, SYMBOLS.ATTACK], 6),
  ...makeMarketCopies('m-blk2', 'Shield Wall', [SYMBOLS.BLOCK, SYMBOLS.BLOCK], 6),
  ...makeMarketCopies('m-mix', 'Balanced Strike', [SYMBOLS.BLOCK, SYMBOLS.ATTACK], 6),
  ...makeMarketCopies('m-grn', 'Nature', [SYMBOLS.GREEN], 6),
  ...makeMarketCopies('m-prp', 'Focus', [SYMBOLS.PURPLE], 6),
  ...makeMarketCopies('m-str', 'Blessing', [SYMBOLS.STAR], 6)
];

export const getStartingDeck = () => [
  { id: 's1', name: 'Strike', symbols: [SYMBOLS.ATTACK] },
  { id: 's2', name: 'Strike', symbols: [SYMBOLS.ATTACK] },
  { id: 's3', name: 'Strike', symbols: [SYMBOLS.ATTACK] },
  { id: 's4', name: 'Strike', symbols: [SYMBOLS.ATTACK] },
  { id: 's5', name: 'Strike', symbols: [SYMBOLS.ATTACK] },
  { id: 's6', name: 'Block', symbols: [SYMBOLS.BLOCK] },
  { id: 's7', name: 'Block', symbols: [SYMBOLS.BLOCK] },
  { id: 's8', name: 'Block', symbols: [SYMBOLS.BLOCK] },
  { id: 's9', name: 'Block', symbols: [SYMBOLS.BLOCK] },
  { id: 's10', name: 'Focus', symbols: [SYMBOLS.PURPLE] }
];
