/**
 * Derives active UI ability actions from the player's race, class, and god
 * based on which levels are currently unlocked.
 */

import { SYMBOLS } from './gameData';

let tokenSeq = 0;

export function createPlayToken({ attack, defense, kind } = {}) {
  tokenSeq += 1;
  const token = {
    id: `token_${tokenSeq}_${Date.now()}`,
    kind: kind || 'generic',
    hasAttacked: false,
  };
  if (attack != null) token.attack = attack;
  if (defense != null) token.defense = defense;
  return token;
}

export function tokenHasCombatStats(token) {
  return token.attack != null || token.defense != null;
}

export function tokenCanAttack(token) {
  return token.attack != null && token.attack > 0 && !token.hasAttacked;
}

export function tokenCanBlock(token) {
  return token.defense != null && token.defense > 0;
}

export function formatTokenStats(token) {
  if (!tokenHasCombatStats(token)) return '—';
  return `${token.attack ?? 0}/${token.defense ?? 0}`;
}

export function getGardenerTokenStats(classLevel) {
  return classLevel >= 2 ? { attack: 1, defense: 2 } : { attack: 0, defense: 1 };
}

export function getMaxTokens(playerCharacter, levels) {
  const caps = [];
  if (playerCharacter.class?.id === 'vampiera' && levels.classLevel >= 1) {
    caps.push(levels.classLevel >= 2 ? 12 : 6);
  }
  if (playerCharacter.god?.id === 'brood-mother' && levels.godLevel >= 1) {
    caps.push(12);
  }
  return caps.length ? Math.max(...caps) : Infinity;
}

export function resolveSpawnTemplate(template, playerCharacter, levels) {
  const next = { ...template };
  if (next.kind === 'gardener') {
    const stats = getGardenerTokenStats(levels.classLevel);
    next.attack = next.attack != null ? Math.max(next.attack, stats.attack) : stats.attack;
    next.defense = next.defense != null ? Math.max(next.defense, stats.defense) : stats.defense;
  }
  return next;
}

export function addTokensToField(existing, templates, playerCharacter, levels) {
  const max = getMaxTokens(playerCharacter, levels);
  const next = [...existing];
  const added = [];
  const requested = templates.reduce((sum, t) => sum + (t.count || 1), 0);
  for (const template of templates) {
    const resolved = resolveSpawnTemplate(template, playerCharacter, levels);
    const count = resolved.count || 1;
    for (let i = 0; i < count; i += 1) {
      if (next.length >= max) break;
      const token = createPlayToken(resolved);
      next.push(token);
      added.push(token);
    }
  }
  return { tokens: next, added, capped: added.length < requested };
}

export function doublePlayTokens(existing, playerCharacter, levels) {
  const max = getMaxTokens(playerCharacter, levels);
  const copies = [];
  for (const token of existing) {
    if (existing.length + copies.length >= max) break;
    copies.push(createPlayToken({
      attack: token.attack,
      defense: token.defense,
      kind: token.kind,
    }));
  }
  return { tokens: [...existing, ...copies], added: copies };
}

export function buffPlayTokens(existing, attack = 0, defense = 0) {
  return existing.map(token => ({
    ...token,
    attack: (token.attack ?? 0) + attack,
    defense: (token.defense ?? 0) + defense,
  }));
}

export function upgradeGardenerTokens(existing, classLevel) {
  if (classLevel < 2) return existing;
  const stats = getGardenerTokenStats(classLevel);
  return existing.map(token => {
    if (token.kind !== 'gardener') return token;
    return {
      ...token,
      attack: Math.max(token.attack ?? 0, stats.attack),
      defense: Math.max(token.defense ?? 0, stats.defense),
    };
  });
}

export function assignDamageToToken(tokens, tokenId, incoming) {
  const token = tokens.find(t => t.id === tokenId);
  if (!token || !tokenCanBlock(token) || incoming <= 0) {
    return { tokens, absorbed: 0, remaining: incoming };
  }
  const absorbed = Math.min(token.defense, incoming);
  return {
    tokens: tokens.filter(t => t.id !== tokenId),
    absorbed,
    remaining: incoming - absorbed,
  };
}

/**
 * @param {object} playerCharacter
 * @param {{ raceLevel: number, classLevel: number, godLevel: number }} levels
 * @param {{ tokens?: Array, canHarvest?: boolean }} context
 * @returns {{ tokenDisplays: Array, buttons: Array }}
 */
export function getActiveAbilityUI(playerCharacter, levels, context = {}) {
  const tokens = context.tokens || [];
  const buttons = [];

  if (
    playerCharacter.class.id === 'gardener' &&
    levels.classLevel >= 1 &&
    context.canHarvest &&
    tokens.length > 0
  ) {
    buttons.push({
      id: 'harvest-tokens',
      source: 'class',
      label: 'Harvest (2💎)',
      className: 'harvest-btn',
      disabled: false,
      action: 'harvestTokens',
    });
  }

  if (playerCharacter.class.id === 'vampiera' && levels.classLevel >= 1) {
    buttons.push({
      id: 'vampiera-heal',
      source: 'class',
      label: 'Discard 3 tokens: heal 3 HP',
      className: 'blood-btn',
      disabled: tokens.length < 3,
      action: 'vampieraHeal',
    });
  }

  return { tokenDisplays: [], tokenDisplays: [], buttons };
}

/** Max god ability uses this round for the active god level. */
export function getGodAbilityUsesPerRound() {
  return 0;
}

export function countAttackCards(hand) {
  return (hand || []).filter(card =>
    Array.isArray(card.symbols) && card.symbols.includes(SYMBOLS.ATTACK)
  ).length;
}

export function getAresStartOfRoundDamage() {
  return 0;
}

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
    doubleTokens: false,
    buffTokens: { attack: 0, defense: 0 },
    starsPlayed: 0,
    ignoreDamage: false,
    gardenerHarvest: false,
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
          totals.block += playerBlock + totals.block;
        } else if (effect.type === 'damageEqualBlock') {
          totals.damage += playerBlock + totals.block;
        } else if (effect.type === 'spawnToken') {
          totals.spawn.push({ ...effect });
          if (effect.kind === 'gardener') {
            totals.gardenerHarvest = true;
          }
        } else if (effect.type === 'doubleTokens') {
          totals.doubleTokens = true;
        } else if (effect.type === 'buffTokens') {
          totals.buffTokens.attack += effect.attack || 0;
          totals.buffTokens.defense += effect.defense || 0;
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
    doubleTokens: ability.doubleTokens,
    buffTokens: ability.buffTokens,
    starsPlayed: ability.starsPlayed,
    ignoreDamage: ability.ignoreDamage,
    gardenerHarvest: ability.gardenerHarvest,
    attackSymbols,
    logs: ability.logs,
  };
}

function spawnLabel(template) {
  const count = template.count || 1;
  if (template.attack != null || template.defense != null) {
    return `+${count} ${template.attack ?? 0}/${template.defense ?? 0}`;
  }
  return `+${count} token${count > 1 ? 's' : ''}`;
}

/**
 * Concise labels for a card's play effects, e.g. ["1 ATK", "1 DEF"].
 */
export function formatCardEffectLabels(totals) {
  const labels = [];
  if (totals.damage > 0) labels.push(`${totals.damage} ATK`);
  if (totals.block > 0) labels.push(`${totals.block} DEF`);
  if (totals.heal > 0) labels.push(`${totals.heal} HP`);
  if (totals.draw > 0) labels.push(`Draw ${totals.draw}`);
  for (const template of totals.spawn || []) {
    labels.push(spawnLabel(template));
  }
  if (totals.doubleTokens) labels.push('Double tokens');
  if ((totals.buffTokens?.attack || 0) > 0 || (totals.buffTokens?.defense || 0) > 0) {
    labels.push(`+${totals.buffTokens.attack}/+${totals.buffTokens.defense}`);
  }
  if (totals.ignoreDamage) labels.push('Ignore dmg');
  for (const [token, amount] of Object.entries(totals.tokens || {})) {
    if (amount > 0) {
      labels.push(`${amount} ${token}`);
    }
  }
  return labels;
}




