import { MAX_PLAY_TOKENS } from '../game/constants';

let tokenSeq = 0;

export const GARDENER_START_COUNTER = 2;
export const GARDENER_HARVEST_RESOURCES = 2;

export function createPlayToken({ attack, defense, kind, counter } = {}) {
  tokenSeq += 1;
  const token = {
    id: `token_${tokenSeq}_${Date.now()}`,
    kind: kind || 'generic',
    spawnedThisTurn: true,
  };
  if (attack != null) token.attack = attack;
  if (defense != null) token.defense = defense;
  if (kind === 'gardener') {
    token.counter = counter ?? GARDENER_START_COUNTER;
  } else if (counter != null) {
    token.counter = counter;
  }
  return token;
}

export function tokenCanHarvest(token) {
  return token.kind === 'gardener' && (token.counter ?? 0) === 0;
}

export function harvestEligibleTokens(tokens) {
  const harvested = [];
  const remaining = [];
  for (const token of tokens) {
    if (tokenCanHarvest(token)) harvested.push(token);
    else remaining.push(token);
  }
  return { tokens: remaining, harvested };
}

export function tickPlantTokenCounters(tokens) {
  return tokens.map(token => {
    if (token.kind !== 'gardener') return token;
    const current = token.counter ?? GARDENER_START_COUNTER;
    return { ...token, counter: Math.max(0, current - 1) };
  });
}

export function tokenHasCombatStats(token) {
  return token.attack != null || token.defense != null;
}

export function tokenCanAttack(token) {
  return token.attack != null && token.attack > 0;
}

/** Remove a token from the play field after it attacks. */
export function discardToken(tokens, tokenId) {
  return tokens.filter(token => token.id !== tokenId);
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
  if (playerCharacter.class?.id === 'vampiera' && (levels.classLevel ?? 0) < 2) {
    return 6;
  }
  return MAX_PLAY_TOKENS;
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
