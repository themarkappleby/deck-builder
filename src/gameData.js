// Game data: races, classes, gods, bosses, and market cards

export const SYMBOLS = {
  ATTACK: '🔺',
  BLOCK: '🔹',
  PURPLE: '🟣',
  GREEN: '🟩',
  STAR: '⭐️',
  ORANGE: '🧡'
};

export const races = [
  {
    id: 'vampire',
    name: 'Vampire',
    side: 'A',
    level1: {
      effect: 'When you play 🔺, gain 1 blood token. Spend 3 blood tokens: Heal 1 HP.',
      symbol: SYMBOLS.PURPLE,
      symbolEffect: 'Draw 1 card'
    },
    level2: {
      effect: 'When you play 🔺, gain 1 blood token. Spend 2 blood tokens: Heal 1 HP.',
      additionalEffect: '🔺 symbols deal +1 damage'
    }
  },
  {
    id: 'vampire',
    name: 'Vampire',
    side: 'B',
    level1: {
      effect: 'When you play 🔺, gain 1 blood token. Spend 3 blood tokens: Deal 2 damage.',
      symbol: SYMBOLS.PURPLE,
      symbolEffect: 'Gain 1 block'
    },
    level2: {
      effect: 'When you play 🔺, gain 1 blood token. Spend 2 blood tokens: Deal 3 damage.',
      additionalEffect: 'Start each round with +1 blood token'
    }
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    side: 'A',
    level1: {
      effect: 'Start with +2 max HP (12 HP total)',
      symbol: SYMBOLS.PURPLE,
      symbolEffect: 'Gain 2 block'
    },
    level2: {
      effect: 'Start with +4 max HP (14 HP total)',
      additionalEffect: 'All 🔹 symbols grant +1 block'
    }
  },
  {
    id: 'elf',
    name: 'Elf',
    side: 'A',
    level1: {
      effect: 'Draw 6 cards at start of round instead of 5',
      symbol: SYMBOLS.PURPLE,
      symbolEffect: 'Draw 2 cards'
    },
    level2: {
      effect: 'Draw 7 cards at start of round',
      additionalEffect: '🟩 symbols: Draw 1 card'
    }
  }
];

export const classes = [
  {
    id: 'warrior',
    name: 'Warrior',
    side: 'A',
    level1: {
      effect: '🔺 symbols deal +1 damage'
    },
    level2: {
      effect: '🔺 symbols deal +2 damage',
      additionalEffect: '⭐️ symbols: Deal 3 damage'
    }
  },
  {
    id: 'warrior',
    name: 'Warrior',
    side: 'B',
    level1: {
      effect: 'When you deal damage with 🔺, gain 1 rage token. Spend 3 rage: Your next 🔺 deals double damage.'
    },
    level2: {
      effect: 'When you deal damage with 🔺, gain 1 rage token. Spend 2 rage: Your next 🔺 deals double damage.',
      additionalEffect: '⭐️ symbols: Gain 2 rage tokens'
    }
  },
  {
    id: 'priest',
    name: 'Priest',
    side: 'A',
    level1: {
      effect: '🔹 symbols grant +1 block'
    },
    level2: {
      effect: '🔹 symbols grant +2 block',
      additionalEffect: '🧡 symbols: Heal 2 HP'
    }
  },
  {
    id: 'mage',
    name: 'Mage',
    side: 'A',
    level1: {
      effect: '⭐️ symbols: Deal 2 damage to boss'
    },
    level2: {
      effect: '⭐️ symbols: Deal 3 damage to boss',
      additionalEffect: '🟩 symbols: Deal 2 damage to boss'
    }
  }
];

export const gods = [
  {
    id: 'ares',
    name: 'Ares (God of War)',
    side: 'A',
    level1: {
      effect: 'Once per round: Discard a card to deal 2 damage'
    },
    level2: {
      effect: 'Once per round: Discard a card to deal 3 damage',
      additionalEffect: '🧡 symbols: Deal 2 damage'
    }
  },
  {
    id: 'ares',
    name: 'Ares (God of War)',
    side: 'B',
    level1: {
      effect: 'At start of round: Deal 1 damage to boss for each 🔺 card in hand'
    },
    level2: {
      effect: 'At start of round: Deal 2 damage to boss for each 🔺 card in hand',
      additionalEffect: 'Cards with 🔺 cost 1 less to play'
    }
  },
  {
    id: 'athena',
    name: 'Athena (Goddess of Wisdom)',
    side: 'A',
    level1: {
      effect: 'Once per round: Discard a card to draw 2 cards'
    },
    level2: {
      effect: 'Twice per round: Discard a card to draw 2 cards',
      additionalEffect: '🟩 symbols: Draw 1 card'
    }
  },
  {
    id: 'apollo',
    name: 'Apollo (God of Healing)',
    side: 'A',
    level1: {
      effect: 'At end of round: If you blocked all damage, heal 1 HP'
    },
    level2: {
      effect: 'At end of round: If you blocked all damage, heal 2 HP',
      additionalEffect: '🧡 symbols: Heal 1 HP'
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
  { id: 'm10', name: 'Flame Strike', symbols: [SYMBOLS.ORANGE, SYMBOLS.ATTACK] },
  { id: 'm11', name: 'Combo Attack', symbols: [SYMBOLS.ATTACK, SYMBOLS.ATTACK, SYMBOLS.STAR] },
  { id: 'm12', name: 'Healing Block', symbols: [SYMBOLS.BLOCK, SYMBOLS.ORANGE] },
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
