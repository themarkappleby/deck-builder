import { countTokensOfType, PLAY_TOKEN_TYPE, tokenCanHarvest } from './tokens';

/**
 * @param {object} playerCharacter
 * @param {{ raceLevel: number, classLevel: number, godLevel: number }} levels
 * @param {{ tokens?: Array }} context
 * @returns {{ tokenDisplays: Array, buttons: Array }}
 */
export function getActiveAbilityUI(playerCharacter, levels, context = {}) {
  const tokens = context.tokens || [];
  const buttons = [];
  const ripeCount = tokens.filter(tokenCanHarvest).length;
  const energyCount = countTokensOfType(tokens, PLAY_TOKEN_TYPE.ENERGY);

  if (
    playerCharacter.class.id === 'gardener' &&
    levels.classLevel >= 1 &&
    ripeCount > 0
  ) {
    buttons.push({
      id: 'harvest-tokens',
      source: 'class',
      label: `Harvest ${ripeCount}`,
      className: 'harvest-btn',
      disabled: false,
      action: 'harvestTokens',
    });
  }

  if (playerCharacter.class.id === 'vampiera' && levels.classLevel >= 1) {
    buttons.push({
      id: 'vampiera-heal',
      source: 'class',
      label: 'Discard 3 energy: heal 3 HP',
      className: 'blood-btn',
      disabled: energyCount < 3,
      action: 'vampieraHeal',
    });
  }

  return { tokenDisplays: [], buttons };
}

/** Max god ability uses this round for the active god level. */
export function getGodAbilityUsesPerRound() {
  return 0;
}
