let tokenSeq = 0;

export const GARDENER_START_COUNTER = 2;
export const GARDENER_HARVEST_RESOURCES = 2;

export const PLAY_TOKEN_TYPE = {
  UNIT: 'unit',
  ENERGY: 'energy',
};

export function playTokenType(tokenOrTemplate = {}) {
  const declared = [tokenOrTemplate.type, tokenOrTemplate.tokenType].find(
    value => value === PLAY_TOKEN_TYPE.UNIT || value === PLAY_TOKEN_TYPE.ENERGY
  );
  if (declared) return declared;
  if (
    tokenOrTemplate.kind === 'gardener' ||
    tokenOrTemplate.attack != null ||
    tokenOrTemplate.defense != null
  ) {
    return PLAY_TOKEN_TYPE.UNIT;
  }
  return PLAY_TOKEN_TYPE.ENERGY;
}

export function isUnit(token) {
  return playTokenType(token) === PLAY_TOKEN_TYPE.UNIT;
}

export function isEnergy(token) {
  return playTokenType(token) === PLAY_TOKEN_TYPE.ENERGY;
}

export function countTokensOfType(tokens, type) {
  return (tokens || []).filter(token => playTokenType(token) === type).length;
}

export function createPlayToken({ attack, defense, kind, counter, type } = {}) {
  tokenSeq += 1;
  const token = {
    id: `token_${tokenSeq}_${Date.now()}`,
    kind: kind || 'generic',
    type: playTokenType({ attack, defense, kind, type }),
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
  return isUnit(token) && token.kind === 'gardener' && (token.counter ?? 0) === 0;
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
  return isUnit(token) && (token.attack != null || token.defense != null);
}

export function tokenCanAttack(token) {
  return isUnit(token) && token.attack != null && token.attack > 0;
}

/** Remove a token from the play field after it attacks. */
export function discardToken(tokens, tokenId) {
  return tokens.filter(token => token.id !== tokenId);
}

export function discardEnergy(tokens, count) {
  let remaining = count;
  const next = [];
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    const token = tokens[i];
    if (remaining > 0 && isEnergy(token)) {
      remaining -= 1;
      continue;
    }
    next.push(token);
  }
  next.reverse();
  return { tokens: next, discarded: count - remaining };
}

export function tokenCanBlock(token) {
  return isUnit(token) && token.defense != null && token.defense > 0;
}

export function formatTokenStats(token) {
  if (!tokenHasCombatStats(token)) return '';
  return `${token.attack ?? 0}/${token.defense ?? 0}`;
}

export function getGardenerTokenStats(classLevel) {
  return classLevel >= 2 ? { attack: 1, defense: 2 } : { attack: 0, defense: 1 };
}

export function getMaxUnits(playerCharacter, levels) {
  if (playerCharacter.god?.id === 'brood-mother' && levels.godLevel >= 1) {
    return 12;
  }
  return Infinity;
}

export function getMaxEnergy(playerCharacter, levels) {
  if (playerCharacter.class?.id === 'vampiera' && levels.classLevel >= 1) {
    return levels.classLevel >= 2 ? 12 : 6;
  }
  return Infinity;
}

export function getMaxForType(type, playerCharacter, levels) {
  return type === PLAY_TOKEN_TYPE.UNIT
    ? getMaxUnits(playerCharacter, levels)
    : getMaxEnergy(playerCharacter, levels);
}

export function resolveSpawnTemplate(template, playerCharacter, levels) {
  const next = { ...template };
  if (next.kind === 'gardener') {
    const stats = getGardenerTokenStats(levels.classLevel);
    next.attack = next.attack != null ? Math.max(next.attack, stats.attack) : stats.attack;
    next.defense = next.defense != null ? Math.max(next.defense, stats.defense) : stats.defense;
  }
  next.type = playTokenType(next);
  return next;
}

export function addTokensToField(existing, templates, playerCharacter, levels) {
  const next = [...existing];
  const added = [];
  const cappedTypes = new Set();
  const requested = templates.reduce((sum, t) => sum + (t.count || 1), 0);
  for (const template of templates) {
    const resolved = resolveSpawnTemplate(template, playerCharacter, levels);
    const type = playTokenType(resolved);
    const max = getMaxForType(type, playerCharacter, levels);
    const count = resolved.count || 1;
    for (let i = 0; i < count; i += 1) {
      if (countTokensOfType(next, type) >= max) {
        cappedTypes.add(type);
        break;
      }
      const token = createPlayToken(resolved);
      next.push(token);
      added.push(token);
    }
  }
  return {
    tokens: next,
    added,
    capped: added.length < requested,
    cappedTypes: [...cappedTypes],
  };
}

export function doublePlayUnits(existing, playerCharacter, levels) {
  const max = getMaxUnits(playerCharacter, levels);
  const copies = [];
  for (const token of existing) {
    if (!isUnit(token)) continue;
    if (countTokensOfType(existing, PLAY_TOKEN_TYPE.UNIT) + copies.length >= max) {
      break;
    }
    copies.push(createPlayToken({
      attack: token.attack,
      defense: token.defense,
      kind: token.kind,
      type: PLAY_TOKEN_TYPE.UNIT,
    }));
  }
  return { tokens: [...existing, ...copies], added: copies };
}

export function buffPlayUnits(existing, attack = 0, defense = 0) {
  return existing.map(token => {
    if (!isUnit(token)) return token;
    return {
      ...token,
      attack: (token.attack ?? 0) + attack,
      defense: (token.defense ?? 0) + defense,
    };
  });
}

export function upgradeGardenerTokens(existing, classLevel) {
  if (classLevel < 2) return existing;
  const stats = getGardenerTokenStats(classLevel);
  return existing.map(token => {
    if (token.kind !== 'gardener') return token;
    return {
      ...token,
      type: PLAY_TOKEN_TYPE.UNIT,
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
