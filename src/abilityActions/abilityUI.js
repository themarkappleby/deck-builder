import { tokenCanHarvest } from './tokens';

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
    tokens.some(tokenCanHarvest)
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
