/**
 * Derives active UI ability actions from the player's race, class, and god
 * based on which sides/levels are currently unlocked.
 */

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

  // --- God abilities (activated, discard a card) ---
  if (
    playerCharacter.god.id === 'ares' &&
    playerCharacter.god.side === 'A' &&
    godLevel >= 1
  ) {
    const damage = godLevel >= 2 ? 3 : 2;
    buttons.push({
      id: 'ares-discard',
      source: 'god',
      label: `⚔️ Strike (${damage})`,
      className: 'god-btn',
      disabled: godUsesRemaining <= 0 || handSize === 0,
      action: 'aresDiscard',
      damage,
      usesRemaining: godUsesRemaining,
    });
  }

  if (
    playerCharacter.god.id === 'athena' &&
    playerCharacter.god.side === 'A' &&
    godLevel >= 1
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
  if (godLevel < 1) return 0;
  if (playerCharacter.god.id === 'ares' && playerCharacter.god.side === 'A') {
    return 1;
  }
  if (playerCharacter.god.id === 'athena' && playerCharacter.god.side === 'A') {
    return godLevel >= 2 ? 2 : 1;
  }
  return 0;
}
