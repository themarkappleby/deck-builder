// Game data: races, classes, gods, bosses, and market cards

export const SYMBOLS = {
  ATTACK: '🔺',
  BLOCK: '🔹',
  PURPLE: '🟣',
  GREEN: '🟩',
  STAR: '⭐️'
};

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
      symbolEffect: '+3 cards',
      onSymbol: [{ type: 'draw', amount: 3 }]
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

export const bosses = [
  {
    id: 'witch',
    name: 'The Witch',
    level1: {
      hp: 20,
      actions: [
        { type: 'attack', value: 2, description: 'Attacks for 2 damage' },
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' },
        { type: 'curse', value: 0, description: 'Curses: Player discards 2 cards next turn' },
        { type: 'heal', value: 3, description: 'Heals 3 HP' },
        { type: 'attack', value: 3, description: 'Attacks for 3 damage' },
        { type: 'attack', value: 2, description: 'Attacks for 2 damage' }
      ]
    },
    level2: {
      hp: 20,
      actions: [
        { type: 'attack', value: 3, description: 'Attacks for 3 damage' },
        { type: 'attack', value: 5, description: 'Attacks for 5 damage' },
        { type: 'curse', value: 0, description: 'Curses: Player discards 3 cards next turn' },
        { type: 'heal', value: 4, description: 'Heals 4 HP' },
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' },
        { type: 'attack', value: 3, description: 'Attacks for 3 damage' }
      ]
    },
    level3: {
      hp: 25,
      actions: [
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' },
        { type: 'attack', value: 6, description: 'Attacks for 6 damage' },
        { type: 'curse', value: 0, description: 'Curses: Player discards 4 cards next turn' },
        { type: 'heal', value: 5, description: 'Heals 5 HP' },
        { type: 'attack', value: 5, description: 'Attacks for 5 damage' },
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' }
      ]
    }
  },
  {
    id: 'dragon',
    name: 'The Dragon',
    level1: {
      hp: 20,
      actions: [
        { type: 'attack', value: 3, description: 'Attacks for 3 damage' },
        { type: 'attack', value: 5, description: 'Attacks for 5 damage' },
        { type: 'attack', value: 2, description: 'Attacks for 2 damage' },
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' },
        { type: 'breath', value: 6, description: 'Dragon Breath: 6 damage (ignores 2 block)' },
        { type: 'attack', value: 3, description: 'Attacks for 3 damage' }
      ]
    },
    level2: {
      hp: 20,
      actions: [
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' },
        { type: 'attack', value: 6, description: 'Attacks for 6 damage' },
        { type: 'attack', value: 3, description: 'Attacks for 3 damage' },
        { type: 'attack', value: 5, description: 'Attacks for 5 damage' },
        { type: 'breath', value: 8, description: 'Dragon Breath: 8 damage (ignores 3 block)' },
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' }
      ]
    },
    level3: {
      hp: 25,
      actions: [
        { type: 'attack', value: 5, description: 'Attacks for 5 damage' },
        { type: 'attack', value: 7, description: 'Attacks for 7 damage' },
        { type: 'attack', value: 4, description: 'Attacks for 4 damage' },
        { type: 'attack', value: 6, description: 'Attacks for 6 damage' },
        { type: 'breath', value: 10, description: 'Dragon Breath: 10 damage (ignores 4 block)' },
        { type: 'attack', value: 5, description: 'Attacks for 5 damage' }
      ]
    }
  }
];

// Market cards that can be purchased
export const marketCards = [
  { id: 'm1', name: 'Swift Strike', symbols: [SYMBOLS.ATTACK, SYMBOLS.ATTACK] },
  { id: 'm2', name: 'Power Slash', symbols: [SYMBOLS.ATTACK, SYMBOLS.ATTACK, SYMBOLS.ATTACK] },
  { id: 'm3', name: 'Shield Wall', symbols: [SYMBOLS.BLOCK, SYMBOLS.BLOCK] },
  { id: 'm4', name: 'Iron Defense', symbols: [SYMBOLS.BLOCK, SYMBOLS.BLOCK, SYMBOLS.BLOCK] },
  { id: 'm5', name: 'Mystical Energy', symbols: [SYMBOLS.PURPLE, SYMBOLS.PURPLE] },
  { id: 'm6', name: 'Balanced Strike', symbols: [SYMBOLS.ATTACK, SYMBOLS.BLOCK] },
  { id: 'm7', name: 'Versatile', symbols: [SYMBOLS.ATTACK, SYMBOLS.PURPLE] },
  { id: 'm8', name: 'Nature\'s Gift', symbols: [SYMBOLS.GREEN, SYMBOLS.GREEN] },
  { id: 'm9', name: 'Stellar Power', symbols: [SYMBOLS.STAR, SYMBOLS.STAR] },
  { id: 'm10', name: 'Divine Strike', symbols: [SYMBOLS.STAR, SYMBOLS.ATTACK] },
  { id: 'm11', name: 'Combo Attack', symbols: [SYMBOLS.ATTACK, SYMBOLS.ATTACK, SYMBOLS.STAR] },
  { id: 'm12', name: 'Healing Block', symbols: [SYMBOLS.BLOCK, SYMBOLS.GREEN] },
  { id: 'm13', name: 'Wild Magic', symbols: [SYMBOLS.PURPLE, SYMBOLS.GREEN] },
  { id: 'm14', name: 'Quick Draw', symbols: [SYMBOLS.GREEN] },
  { id: 'm15', name: 'Simple Strike', symbols: [SYMBOLS.ATTACK] },
];

// Starting deck for each player
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

