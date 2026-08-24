import { SYMBOLS } from '../gameData';
import { PLAY_TOKEN_TYPE, playTokenType } from './tokens';

function formatSymbolLine(symbol, symbolEffect, starsRequired) {
  if (!symbol || !symbolEffect) return null;
  const icons = starsRequired > 1 ? symbol.repeat(starsRequired) : symbol;
  return `${icons} = ${symbolEffect}`;
}

/**
 * Display lines for a race/class/god level (symbol trigger + extra text).
 */
export function formatLevelLines(level) {
  if (!level) return [];
  const lines = [];
  const seen = new Set();
  const push = (line) => {
    if (!line || seen.has(line)) return;
    seen.add(line);
    lines.push(line);
  };

  push(formatSymbolLine(level.symbol, level.symbolEffect, level.starsRequired));
  if (level.effect) push(level.effect);
  if (level.additionalEffect) {
    push(level.additionalEffect);
  } else if (Array.isArray(level.extraTriggers)) {
    for (const extra of level.extraTriggers) {
      push(formatSymbolLine(extra.symbol, extra.symbolEffect, extra.starsRequired));
    }
  }
  return lines;
}

function triggersFromPiece(piece, unlockedLevel, playedSymbol) {
  if (!piece || unlockedLevel < 1) return [];

  const results = [];
  const replaceLevel1 =
    unlockedLevel >= 2 &&
    piece.level2?.replaceLevel1 !== false &&
    piece.level2?.symbol === playedSymbol &&
    Array.isArray(piece.level2?.onSymbol);

  if (
    !replaceLevel1 &&
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

function emptyPlayTotals() {
  return {
    damage: 0,
    block: 0,
    heal: 0,
    draw: 0,
    tokens: {},
    spawn: [],
    doubleUnits: false,
    buffUnits: { attack: 0, defense: 0 },
    starsPlayed: 0,
    ignoreDamage: false,
    lockCardDiscardForResources: false,
    doubleBlock: false,
    damageEqualBlock: false,
    blockFromDouble: 0,
    damageFromEqualBlock: 0,
    logs: [],
  };
}

/**
 * Collect race (🟣), class (🟩), and god (⭐️) effects for the symbols on a played card.
 */
export function collectPlayEffects(playerCharacter, levels, symbols, context = {}) {
  const totals = emptyPlayTotals();
  const playerBlock = context.playerBlock || 0;

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
        } else if (effect.type === 'doubleBlock') {
          const gained = playerBlock + totals.block;
          totals.block += gained;
          totals.blockFromDouble += gained;
          totals.doubleBlock = true;
        } else if (effect.type === 'damageEqualBlock') {
          const gained = playerBlock + totals.block;
          totals.damage += gained;
          totals.damageFromEqualBlock += gained;
          totals.damageEqualBlock = true;
        } else if (effect.type === 'spawnToken') {
          totals.spawn.push({ ...effect });
        } else if (effect.type === 'doubleUnits' || effect.type === 'doubleTokens') {
          totals.doubleUnits = true;
        } else if (effect.type === 'buffUnits' || effect.type === 'buffTokens') {
          totals.buffUnits.attack += effect.attack || 0;
          totals.buffUnits.defense += effect.defense || 0;
        } else if (effect.type === 'lockCardDiscardForResources') {
          totals.lockCardDiscardForResources = true;
        } else if (effect.type === 'starComboIgnoreDamage') {
          totals.starsPlayed += 1;
          const already = context.starsThisRound || 0;
          const required = effect.starsRequired || 2;
          if (already + totals.starsPlayed >= required && already < required) {
            totals.ignoreDamage = true;
          }
        }
      }
    }
  });

  return totals;
}

export function getAttackPerSymbol() {
  return 1;
}

export function getBlockPerSymbol() {
  return 1;
}

export function countAttackCards(hand) {
  return (hand || []).filter(card =>
    Array.isArray(card.symbols) && card.symbols.includes(SYMBOLS.ATTACK)
  ).length;
}

export function getAresStartOfRoundDamage() {
  return 0;
}

/**
 * Full play totals for a card: base 🔺/🔹 plus race/class/god symbol abilities.
 */
export function getCardPlayTotals(playerCharacter, levels, symbols, context = {}) {
  const cardSymbols = symbols || [];
  const attackSymbols = cardSymbols.filter(symbol => symbol === SYMBOLS.ATTACK).length;
  const blockSymbols = cardSymbols.filter(symbol => symbol === SYMBOLS.BLOCK).length;
  const ability = collectPlayEffects(playerCharacter, levels, cardSymbols, context);

  return {
    damage: attackSymbols * getAttackPerSymbol(playerCharacter, levels) + ability.damage,
    block: blockSymbols * getBlockPerSymbol(playerCharacter, levels) + ability.block,
    heal: ability.heal,
    draw: ability.draw,
    tokens: ability.tokens,
    spawn: ability.spawn,
    doubleUnits: ability.doubleUnits,
    buffUnits: ability.buffUnits,
    starsPlayed: ability.starsPlayed,
    ignoreDamage: ability.ignoreDamage,
    lockCardDiscardForResources: ability.lockCardDiscardForResources,
    doubleBlock: ability.doubleBlock,
    damageEqualBlock: ability.damageEqualBlock,
    blockFromDouble: ability.blockFromDouble,
    damageFromEqualBlock: ability.damageFromEqualBlock,
    attackSymbols,
    logs: ability.logs,
  };
}

function spawnLabel(template) {
  const count = template.count || 1;
  const noun = playTokenType(template) === PLAY_TOKEN_TYPE.UNIT
    ? (count > 1 ? 'units' : 'unit')
    : 'energy';
  if (template.attack != null || template.defense != null) {
    return `+${count} ${template.attack ?? 0}/${template.defense ?? 0} ${noun}`;
  }
  return `+${count} ${noun}`;
}

/**
 * Concise labels for a card's play effects, e.g. ["1 ATK", "1 DEF"].
 */
export function formatCardEffectLabels(totals) {
  const labels = [];
  const damage = (totals.damage || 0) - (totals.damageFromEqualBlock || 0);
  const block = (totals.block || 0) - (totals.blockFromDouble || 0);
  if (damage > 0) labels.push(`${damage} ATK`);
  if (totals.damageEqualBlock) labels.push('ATK = DEF');
  if (block > 0) labels.push(`${block} DEF`);
  if (totals.doubleBlock) labels.push('2X DEF');
  if (totals.heal > 0) labels.push(`${totals.heal} HP`);
  if (totals.draw > 0) labels.push(`Draw ${totals.draw}`);
  if (totals.lockCardDiscardForResources) labels.push('No discard 💎');
  for (const template of totals.spawn || []) {
    labels.push(spawnLabel(template));
  }
  if (totals.doubleUnits) labels.push('Double units');
  if ((totals.buffUnits?.attack || 0) > 0 || (totals.buffUnits?.defense || 0) > 0) {
    labels.push(`+${totals.buffUnits.attack}/+${totals.buffUnits.defense} units`);
  }
  if (totals.ignoreDamage) labels.push('Ignore dmg');
  for (const [token, amount] of Object.entries(totals.tokens || {})) {
    if (amount > 0) {
      labels.push(`${amount} ${token}`);
    }
  }
  return labels;
}
