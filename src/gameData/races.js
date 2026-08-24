import { SYMBOLS } from './symbols';

export const races = [
  {
    id: 'mountain-dwarf',
    name: 'Mountain dwarf',
    side: 'A',
    level1: {
      symbol: SYMBOLS.PURPLE,
      symbolEffect: 'Double your block value',
      onSymbol: [{ type: 'doubleBlock' }]
    },
    level2: {
      effect: 'Your block value no longer resets to 0 at the start of your turn.'
    }
  },
  {
    id: 'forest-elf',
    name: 'Forest elf',
    side: 'A',
    level1: {
      symbol: SYMBOLS.PURPLE,
      symbolEffect: '+3 cards, however, cards can no longer be discarded for resources for the rest of the turn',
      onSymbol: [
        { type: 'draw', amount: 3 },
        { type: 'lockCardDiscardForResources' }
      ]
    },
    level2: {
      additionalEffect: '🟩 +1 card',
      extraTriggers: [
        {
          symbol: SYMBOLS.GREEN,
          symbolEffect: '+1 card',
          onSymbol: [{ type: 'draw', amount: 1 }]
        }
      ]
    }
  }
];
