import { SYMBOLS } from './symbols';

export const classes = [
  {
    id: 'gardener',
    name: 'Gardener of Yiis',
    side: 'A',
    level1: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: '+2 0/1 tokens to the play field',
      onSymbol: [{ type: 'spawnToken', count: 2, attack: 0, defense: 1, kind: 'gardener' }],
      effect: 'If any tokens remain at the start of your next turn, you may discard any tokens to gain 2 resources per token discarded.'
    },
    level2: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: '+1 token',
      onSymbol: [{ type: 'spawnToken', count: 1, kind: 'gardener' }],
      effect: 'All gardener tokens are 1/2.',
      replaceLevel1: false
    }
  },
  {
    id: 'vampiera',
    name: 'Vampiera noir',
    side: 'A',
    level1: {
      symbol: SYMBOLS.GREEN,
      symbolEffect: '+1 token',
      onSymbol: [{ type: 'spawnToken', count: 1, kind: 'vampiera' }],
      effect: 'You may discard 3 tokens at any time to heal 3 HP. Max tokens: 6.'
    },
    level2: {
      additionalEffect: '🔺 +1 token. Max tokens: 12.',
      extraTriggers: [
        {
          symbol: SYMBOLS.ATTACK,
          symbolEffect: '+1 token',
          onSymbol: [{ type: 'spawnToken', count: 1, kind: 'vampiera' }]
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
