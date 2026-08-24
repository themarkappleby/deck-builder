import { SYMBOLS } from './symbols';

export const gods = [
  {
    id: 'brood-mother',
    name: 'Brood mother',
    side: 'A',
    level1: {
      symbol: SYMBOLS.STAR,
      symbolEffect: 'Double the number of tokens in your play area',
      onSymbol: [{ type: 'doubleTokens' }],
      effect: 'Max tokens: 12.'
    },
    level2: {
      symbol: SYMBOLS.STAR,
      symbolEffect: '+1/+1 to all tokens in your play area',
      onSymbol: [{ type: 'buffTokens', attack: 1, defense: 1 }],
      replaceLevel1: false
    }
  },
  {
    id: 'angels-of-elandor',
    name: 'Angels of Elandor',
    side: 'A',
    level1: {
      symbol: SYMBOLS.STAR,
      symbolEffect: 'Heal +1 HP',
      onSymbol: [{ type: 'heal', amount: 1 }]
    },
    level2: {
      symbol: SYMBOLS.STAR,
      starsRequired: 2,
      symbolEffect: 'Ignore all incoming damage this round',
      onSymbol: [{ type: 'starComboIgnoreDamage', starsRequired: 2 }],
      effect: 'Both ⭐️ must be played in the same round.',
      replaceLevel1: false
    }
  }
];
