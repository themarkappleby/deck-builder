import { BETWEEN_BOSS_HEAL } from './constants';

/**
 * Player combat state that resets after a boss is defeated and before
 * the next encounter begins. A fresh hand is drawn by startRound.
 */
export function nextBossPlayerState({ playerHP, playerMaxHP }) {
  return {
    resources: 0,
    playerBlock: 0,
    playerHP: Math.min(playerMaxHP, playerHP + BETWEEN_BOSS_HEAL),
    playTokens: [],
  };
}
