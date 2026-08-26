export const LEVEL_UP_PICK_LIMIT = 2;

/** Encounter-wide boss stats by fight number (not per boss identity). */
export const BOSS_LEVEL_STATS = {
  1: { hp: 20, cards: 3 },
  2: { hp: 40, cards: 4 },
  3: { hp: 60, cards: 5 },
};

export function getBossLevelStats(encounterNumber) {
  const level = Math.min(3, Math.max(1, Number(encounterNumber) || 1));
  return BOSS_LEVEL_STATS[level];
}

export const BOSS_CARDS_TO_DRAW = BOSS_LEVEL_STATS[1].cards;
export const PLAYER_CARDS_TO_DRAW = 5;
export const STARTING_RESOURCES_PER_BOSS = 4;
export const BETWEEN_BOSS_HEAL = 3;
export const MAX_PLAY_TOKENS = 10;
export const MAX_BLOCK = 10;
export const MAX_RESOURCES = 10;
export const MAX_PURCHASE_OR_TRASH_COST = 10;

/** Next purchase or trash costs 1 more 💎 than the number already done this game (capped at 10). */
export function getPurchaseOrTrashCost(purchaseOrTrashCount) {
  return Math.min(purchaseOrTrashCount + 1, MAX_PURCHASE_OR_TRASH_COST);
}
