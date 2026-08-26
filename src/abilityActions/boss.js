import { SYMBOLS } from '../gameData';

export const WITCH_BREW_THRESHOLD = 5;
export const WITCH_BREW_HEAL = 5;

export function countCardSymbols(cards) {
  const counts = {
    attack: 0,
    block: 0,
    green: 0,
    star: 0,
    purple: 0,
  };
  (cards || []).forEach(card => {
    (card.symbols || []).forEach(symbol => {
      if (symbol === SYMBOLS.ATTACK) counts.attack += 1;
      else if (symbol === SYMBOLS.BLOCK) counts.block += 1;
      else if (symbol === SYMBOLS.GREEN) counts.green += 1;
      else if (symbol === SYMBOLS.STAR) counts.star += 1;
      else if (symbol === SYMBOLS.PURPLE) counts.purple += 1;
    });
  });
  return counts;
}

export function getBossAbility(boss, symbol) {
  return boss?.abilities?.[symbol] || null;
}

export function formatBossAbilityLines(boss) {
  if (!boss?.abilities) return [];
  return Object.entries(boss.abilities).map(([symbol, ability]) => (
    `${symbol} ${ability.name}: ${ability.symbolEffect}`
  ));
}

export function applyBrewTokens(
  currentTokens,
  gained,
  bossHP,
  bossMaxHP,
  threshold = WITCH_BREW_THRESHOLD,
  brewAmount = WITCH_BREW_HEAL
) {
  let tokens = (currentTokens || 0) + (gained || 0);
  let heal = 0;
  let bonusAttack = 0;
  let hp = bossHP ?? 0;
  const maxHP = bossMaxHP ?? hp;

  while (tokens >= threshold) {
    tokens -= threshold;
    const missingHP = maxHP - hp;
    if (missingHP >= brewAmount) {
      const healed = Math.min(brewAmount, missingHP);
      heal += healed;
      hp += healed;
    } else {
      bonusAttack += brewAmount;
    }
  }

  return { tokens, heal, bonusAttack, gained: gained || 0 };
}

/**
 * Boss round intent from the current market draw: universal 🔺/🔹 plus that boss's symbol abilities.
 * Attack and block are locked in from the cards as drawn, even if they are later purchased.
 */
export function getBossRoundAction(boss, cards) {
  const counts = countCardSymbols(cards);
  const brewAbility = getBossAbility(boss, SYMBOLS.GREEN);
  const curseAbility = getBossAbility(boss, SYMBOLS.STAR);
  const brew = brewAbility?.type === 'brew' ? counts.green : 0;
  const curse = curseAbility?.type === 'curse' ? counts.star : 0;

  const parts = [`Attacks for ${counts.attack} damage`];
  if (counts.block > 0) {
    parts.push(`gains ${counts.block} block`);
  }
  if (brew > 0) {
    parts.push(`Brew +${brew}`);
  }
  if (curse > 0) {
    parts.push(`Curse ${curse}`);
  }

  return {
    type: 'attack',
    value: counts.attack,
    block: counts.block,
    brew,
    curse,
    description: parts.join(', '),
  };
}

export function formatBossCardEffectLabels(boss, symbols) {
  const labels = [];
  const attack = (symbols || []).filter(symbol => symbol === SYMBOLS.ATTACK).length;
  const block = (symbols || []).filter(symbol => symbol === SYMBOLS.BLOCK).length;
  if (attack > 0) labels.push(`${attack} ATK`);
  if (block > 0) labels.push(`${block} DEF`);

  let brew = 0;
  let curse = 0;
  (symbols || []).forEach(symbol => {
    const ability = getBossAbility(boss, symbol);
    if (ability?.type === 'brew') brew += 1;
    if (ability?.type === 'curse') curse += 1;
  });
  if (brew > 0) labels.push(`Brew +${brew}`);
  if (curse > 0) labels.push(`Curse ${curse}`);
  return labels;
}
