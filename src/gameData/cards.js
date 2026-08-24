import { SYMBOLS } from './symbols';

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
