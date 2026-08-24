export const LEVEL_UP_PICK_LIMIT = 2;
export const BOSS_CARDS_TO_DRAW = 3;
export const PLAYER_CARDS_TO_DRAW = 6;
export const BETWEEN_BOSS_HEAL = 3;
export const MAX_PLAY_TOKENS = 10;

/** Next trash costs 1 more 💎 than the number of cards already trashed this game. */
export function getTrashCost(cardsTrashed) {
  return cardsTrashed + 1;
}
