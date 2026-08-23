/**
 * Derives active UI ability actions from the player's race, class, and god
 * based on which sides/levels are currently unlocked.
 */

import { SYMBOLS } from './gameData';

/**
 * @param {object} playerCharacter
 * @param {{ raceLevel: number, classLevel: number, godLevel: number }} levels
 * @param {{ tokens?: object, godUsesRemaining?: number, handSize?: number }} context
 * @returns {{ tokens: Array, buttons: Array }}
 */
export function getActiveAbilityUI(playerCharacter, levels, context = {}) {
  const { raceLevel, classLevel, godLevel } = levels;
  const tokens = context.tokens || {};
  const handSize = context.handSize ?? 0;
  const godUsesRemaining = context.godUsesRemaining ?? 0;

  const tokenDisplays = [];
  const buttons = [];

  // --- Race abilities ---
  if (playerCharacter.race.id === 'vampire' && raceLevel >= 1) {
    const cost = raceLevel >= 2 ? 2 : 3;
    const blood = tokens.blood || 0;
    tokenDisplays.push({
      key: 'blood',
      icon: '🩸',
      value: blood,
    });
    buttons.push({
      id: 'spend-blood',
      source: 'race',
      label: `🩸 Spend (${cost})`,
      className: 'blood-btn',
      disabled: blood < cost,
      action: 'spendBlood',
      cost,
    });
  }

  // --- Class abilities ---
  if (
    playerCharacter.class.id === 'warrior' &&
    playerCharacter.class.side === 'B' &&
    classLevel >= 1
  ) {
    const cost = classLevel >= 2 ? 2 : 3;
    const rage = tokens.rage || 0;
    tokenDisplays.push({
      key: 'rage',
      icon: '💢',
      value: rage,
    });
    buttons.push({
      id: 'spend-rage',
      source: 'class',
      label: `💢 Rage (${cost})`,
      className: 'rage-btn',
      disabled: rage < cost,
      action: 'spendRage',
      cost,
    });
  }

  // --- God abilities (activated, discard a card) — level 2 ---
  if (
    playerCharacter.god.id === 'ares' &&
    playerCharacter.god.side === 'A' &&
    godLevel >= 2
  ) {
    buttons.push({
      id: 'ares-discard',
      source: 'god',
      label: '⚔️ Strike (3)',
      className: 'god-btn',
      disabled: godUsesRemaining <= 0 || handSize === 0,
      action: 'aresDiscard',
      damage: 3,
      usesRemaining: godUsesRemaining,
    });
  }

  if (
    playerCharacter.god.id === 'athena' &&
    playerCharacter.god.side === 'A' &&
    godLevel >= 2
  ) {
    buttons.push({
      id: 'athena-discard',
      source: 'god',
      label: '📖 Wisdom',
      className: 'god-btn',
      disabled: godUsesRemaining <= 0 || handSize === 0,
      action: 'athenaDiscard',
      usesRemaining: godUsesRemaining,
    });
  }

  return { tokenDisplays, buttons };
}

/** Max god ability uses this round for the active god level. */
export function getGodAbilityUsesPerRound(playerCharacter, godLevel) {
  if (godLevel < 2) return 0;
  if (playerCharacter.god.id === 'ares' && playerCharacter.god.side === 'A') {
    return 1;
  }
  if (playerCharacter.god.id === 'athena' && playerCharacter.god.side === 'A') {
    return 2;
  }
  return 0;
}

export function countAttackCards(hand) {
  return (hand || []).filter(card =>
    Array.isArray(card.symbols) && card.symbols.includes(SYMBOLS.ATTACK)
  ).length;
}

/**
 * Ares Side B: at start of round (level 2), deal 2 damage for each 🔺 card in hand.
 */
export function getAresStartOfRoundDamage(playerCharacter, godLevel, hand) {
  if (
    !playerCharacter?.god ||
    playerCharacter.god.id !== 'ares' ||
    playerCharacter.god.side !== 'B' ||
    godLevel < 2
  ) {
    return 0;
  }
  return countAttackCards(hand) * 2;
}

/**
 * Display lines for a race/class/god level (symbol trigger + extra text).
 */
export function formatLevelLines(level) {
  if (!level) return [];
  const lines = [];
  if (level.symbol && level.symbolEffect) {
    lines.push(`${level.symbol} = ${level.symbolEffect}`);
  }
  if (level.effect) lines.push(level.effect);
  if (level.additionalEffect) lines.push(level.additionalEffect);
  return lines;
}

function triggersFromPiece(piece, unlockedLevel, playedSymbol) {
  if (!piece || unlockedLevel < 1) return [];

  const results = [];
  const level2ReplacesLevel1 =
    unlockedLevel >= 2 &&
    piece.level2?.symbol === playedSymbol &&
    Array.isArray(piece.level2?.onSymbol);

  if (
    !level2ReplacesLevel1 &&
    piece.level1?.symbol === playedSymbol &&
    Array.isArray(piece.level1?.onSymbol)
  ) {
    results.push({
      label: piece.level1.symbolEffect,
      effects: piece.level1.onSymbol,
    });
  }

  if (
    unlockedLevel >= 2 &&
    piece.level2?.symbol === playedSymbol &&
    Array.isArray(piece.level2?.onSymbol)
  ) {
    results.push({
      label: piece.level2.symbolEffect,
      effects: piece.level2.onSymbol,
    });
  }

  if (unlockedLevel >= 2 && Array.isArray(piece.level2?.extraTriggers)) {
    for (const extra of piece.level2.extraTriggers) {
      if (extra.symbol === playedSymbol && Array.isArray(extra.onSymbol)) {
        results.push({
          label: extra.symbolEffect,
          effects: extra.onSymbol,
        });
      }
    }
  }

  return results;
}

/**
 * Collect race (🟣), class (🟩), and god (⭐️) effects for the symbols on a played card.
 */
export function collectPlayEffects(playerCharacter, levels, symbols) {
  const totals = {
    damage: 0,
    block: 0,
    heal: 0,
    draw: 0,
    tokens: {},
    logs: [],
  };

  (symbols || []).forEach(symbol => {
    const triggers = [
      ...triggersFromPiece(playerCharacter.race, levels.raceLevel, symbol),
      ...triggersFromPiece(playerCharacter.class, levels.classLevel, symbol),
      ...triggersFromPiece(playerCharacter.god, levels.godLevel, symbol),
    ];

    for (const trigger of triggers) {
      totals.logs.push(`${symbol} effect: ${trigger.label}`);
      for (const effect of trigger.effects) {
        if (effect.type === 'damage') {
          totals.damage += effect.amount;
        } else if (effect.type === 'block') {
          totals.block += effect.amount;
        } else if (effect.type === 'heal') {
          totals.heal += effect.amount;
        } else if (effect.type === 'draw') {
          totals.draw += effect.amount;
        } else if (effect.type === 'token') {
          totals.tokens[effect.token] = (totals.tokens[effect.token] || 0) + effect.amount;
        }
      }
    }
  });

  return totals;
}
