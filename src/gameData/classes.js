import { SYMBOLS } from './symbols';

export const classes = [
  {
    id: 'gardener',
    name: 'Gardener of Yiis',
    side: 'A',
    level1: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: '+2 0/1 plant units to the play field',
      onSymbol: [{ type: 'spawnToken', count: 2, attack: 0, defense: 1, kind: 'gardener', tokenType: 'unit' }],
      effect: 'Each plant unit starts with a counter of 2. At the start of each turn, reduce each plant unit\'s counter by 1 (min 0). Harvest units with a counter of 0 for 2 💎 each.'
    },
    level2: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: '+1 unit',
      onSymbol: [{ type: 'spawnToken', count: 1, kind: 'gardener', tokenType: 'unit' }],
      effect: 'All gardener units are 1/2.',
      replaceLevel1: false
    }
  },
  {
    id: 'vampiera',
    name: 'Vampiera noir',
    side: 'A',
    level1: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: '+1 energy',
      onSymbol: [{ type: 'spawnToken', count: 1, kind: 'vampiera', tokenType: 'energy' }],
      effect: 'You may discard 3 energy at any time to heal 3 HP. Max energy: 6.'
    },
    level2: {
      additionalEffect: '🔺 +1 energy. Max energy: 12.',
      extraTriggers: [
        {
          symbol: SYMBOLS.ATTACK,
          symbolEffect: '+1 energy',
          onSymbol: [{ type: 'spawnToken', count: 1, kind: 'vampiera', tokenType: 'energy' }]
        }
      ]
    }
  },
  {
    id: 'shield-warden',
    name: 'Shield warden',
    side: 'A',
    level1: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: 'Deal damage equal to your current block value',
      onSymbol: [{ type: 'damageEqualBlock' }]
    },
    level2: {
      additionalEffect: '🔹 +1 block',
      extraTriggers: [
        {
          symbol: SYMBOLS.BLOCK,
          symbolEffect: '+1 block',
          onSymbol: [{ type: 'block', amount: 1 }]
        }
      ]
    }
  }
];
