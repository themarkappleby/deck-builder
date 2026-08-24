import { SYMBOLS } from './symbols';

export const bosses = [
  {
    id: 'witch',
    name: 'The Witch',
    abilities: {
      [SYMBOLS.GREEN]: {
        type: 'brew',
        name: 'Brew',
        symbolEffect: '+1 token. If the witch has 5 tokens, discard the 5 tokens and the witch heals 5 HP.'
      },
      [SYMBOLS.STAR]: {
        type: 'curse',
        name: 'Curse',
        symbolEffect: 'The player must discard 1 card.'
      }
    },
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
