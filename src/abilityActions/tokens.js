let tokenSeq = 0;

export function createPlayToken({ attack, defense, kind } = {}) {
  tokenSeq += 1;
  const token = {
    id: `token_${tokenSeq}_${Date.now()}`,
    kind: kind || 'generic',
    spawnedThisTurn: true,
  };
  if (attack != null) token.attack = attack;
  if (defense != null) token.defense = defense;
  return token;
}

export function tokenCanHarvest(token) {
  return !token.spawnedThisTurn;
}

export function harvestRightmostEligibleToken(tokens) {
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (tokenCanHarvest(tokens[i])) {
      return {
        tokens: [...tokens.slice(0, i), ...tokens.slice(i + 1)],
        harvested: tokens[i],
      };
    }
  }
  return { tokens, harvested: null };
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
