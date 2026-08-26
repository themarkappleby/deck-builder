import { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, resolveBossEncounter } from '../gameData';
import {
  getActiveAbilityUI,
  getCardPlayTotals,
  formatCardEffectLabels,
  addTokensToField,
  doublePlayUnits,
  buffPlayUnits,
  upgradeGardenerTokens,
  assignDamageToToken,
  discardToken,
  discardEnergy,
  tokenCanAttack,
  tokenCanBlock,
  harvestEligibleTokens,
  tickPlantTokenCounters,
  GARDENER_HARVEST_RESOURCES,
  getMaxUnits,
  getMaxEnergy,
  isUnit,
  isEnergy,
  PLAY_TOKEN_TYPE,
  countTokensOfType,
  getBossRoundAction,
  applyBrewTokens,
  WITCH_BREW_THRESHOLD,
} from '../abilityActions';
import { LEVEL_UP_PICK_LIMIT, BOSS_CARDS_TO_DRAW, PLAYER_CARDS_TO_DRAW, getPurchaseOrTrashCost, MAX_BLOCK, MAX_RESOURCES } from '../game/constants';
import { nextBossPlayerState } from '../game/betweenBosses';
import { shuffleArray } from '../utils/shuffle';
import { drawFromPiles as drawFromCardPiles } from '../utils/drawPiles';

/** Fallback when the stats HUD is not mounted. Keep in sync with --hand-area-height + --bottom-hud-height. */
const STATS_HUD_BOTTOM_FALLBACK_PX = 264;
/** Keep in sync with --trash-drop-zone-height / --discard-drop-zone-width in dragAndTokens.css. */
const TRASH_ZONE_HEIGHT_RATIO = 0.25;
const DISCARD_ZONE_WIDTH_RATIO = 0.25;

function syncDiscardZoneToStatsHud() {
  const statsHud = document.querySelector('.bottom-hud');
  const top = statsHud
    ? statsHud.getBoundingClientRect().top
    : window.innerHeight - STATS_HUD_BOTTOM_FALLBACK_PX;
  document.documentElement.style.setProperty(
    '--discard-zone-bottom',
    `${window.innerHeight - top}px`
  );
  return top;
}

function describeSpawned(added) {
  const units = added.filter(isUnit).length;
  const energy = added.filter(isEnergy).length;
  const parts = [];
  if (units > 0) parts.push(`${units} unit${units === 1 ? '' : 's'}`);
  if (energy > 0) parts.push(`${energy} energy`);
  return parts.join(' and ') || 'nothing';
}

function formatFieldCounts(tokens) {
  const units = countTokensOfType(tokens, PLAY_TOKEN_TYPE.UNIT);
  const energy = countTokensOfType(tokens, PLAY_TOKEN_TYPE.ENERGY);
  const parts = [];
  if (units > 0) parts.push(`${units} unit${units === 1 ? '' : 's'}`);
  if (energy > 0) parts.push(`${energy} energy`);
  return parts.join(', ') || '0';
}

export function useGameBoard(playerCharacter) {
  const [gameState, setGameState] = useState('setup');
  const [bossNumber, setBossNumber] = useState(1);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHP, setBossHP] = useState(0);
  const [bossMaxHP, setBossMaxHP] = useState(0);
  const [bossAction, setBossAction] = useState(null);
  const [bossAttack, setBossAttack] = useState(0);
  const [bossBlock, setBossBlock] = useState(0);
  const [bossTokens, setBossTokens] = useState(0);
  const [pendingCurse, setPendingCurse] = useState(0);

  const [playerHP, setPlayerHP] = useState(10);
  const [playerMaxHP, setPlayerMaxHP] = useState(10);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playTokens, setPlayTokens] = useState([]);
  const [incomingDamage, setIncomingDamage] = useState(0);
  const [ignoreIncomingDamage, setIgnoreIncomingDamage] = useState(false);
  const [starsThisRound, setStarsThisRound] = useState(0);
  const [cannotDiscardForResources, setCannotDiscardForResources] = useState(false);

  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [resources, setResources] = useState(0);
  const [purchaseOrTrashCount, setPurchaseOrTrashCount] = useState(0);

  const [market, setMarket] = useState([]);
  const [marketDeck, setMarketDeck] = useState([]);
  const [marketDiscard, setMarketDiscard] = useState([]);
  const [marketSlotCount, setMarketSlotCount] = useState(BOSS_CARDS_TO_DRAW);

  const [raceLevel, setRaceLevel] = useState(1);
  const [classLevel, setClassLevel] = useState(0);
  const [godLevel, setGodLevel] = useState(0);
  const [levelUpPicksRemaining, setLevelUpPicksRemaining] = useState(0);

  const [log, setLog] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);

  const [showMenu, setShowMenu] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugBossCardsPerTurn, setDebugBossCardsPerTurn] = useState(null);
  const [debugPlayerCardsPerTurn, setDebugPlayerCardsPerTurn] = useState(PLAYER_CARDS_TO_DRAW);
  const [debugBossStartingHealth, setDebugBossStartingHealth] = useState(null);
  const [draggingCard, setDraggingCard] = useState(null);
  const [draggingSource, setDraggingSource] = useState(null); // 'hand' | 'market'
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropZone, setDropZone] = useState(null); // 'play', 'discard', 'trash', 'purchase', or null

  const logContentRef = useRef(null);
  const raceLevelRef = useRef(raceLevel);
  raceLevelRef.current = raceLevel;
  const classLevelRef = useRef(classLevel);
  classLevelRef.current = classLevel;
  const godLevelRef = useRef(godLevel);
  godLevelRef.current = godLevel;
  const levelUpPicksRemainingRef = useRef(levelUpPicksRemaining);
  levelUpPicksRemainingRef.current = levelUpPicksRemaining;
  const playTokensRef = useRef(playTokens);
  playTokensRef.current = playTokens;
  const incomingDamageRef = useRef(incomingDamage);
  incomingDamageRef.current = incomingDamage;
  const currentBossRef = useRef(currentBoss);
  currentBossRef.current = currentBoss;
  const bossTokensRef = useRef(bossTokens);
  bossTokensRef.current = bossTokens;
  const marketDeckRef = useRef(marketDeck);
  marketDeckRef.current = marketDeck;
  const marketDiscardRef = useRef(marketDiscard);
  marketDiscardRef.current = marketDiscard;
  const marketRef = useRef(market);
  marketRef.current = market;
  const debugBossCardsPerTurnRef = useRef(debugBossCardsPerTurn);
  debugBossCardsPerTurnRef.current = debugBossCardsPerTurn;
  const debugPlayerCardsPerTurnRef = useRef(debugPlayerCardsPerTurn);
  debugPlayerCardsPerTurnRef.current = debugPlayerCardsPerTurn;
  const debugBossStartingHealthRef = useRef(debugBossStartingHealth);
  debugBossStartingHealthRef.current = debugBossStartingHealth;

  const getBossStartingHealth = (encounterHp) => {
    const override = debugBossStartingHealthRef.current;
    return Number.isFinite(override) && override > 0 ? override : encounterHp;
  };

  const getBossCardsToDraw = (encounterCards) => {
    const override = debugBossCardsPerTurnRef.current;
    return Number.isFinite(override) && override >= 0 ? override : encounterCards;
  };

  const levels = { raceLevel, classLevel, godLevel };

  const abilityUI = getActiveAbilityUI(
    playerCharacter,
    levels,
    {
      tokens: playTokens,
    }
  );

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [log]);

  useEffect(() => {
    if (gameState === 'ready') {
      startRound();
    }
  }, [gameState]);

  useEffect(() => {
    const updateDiscardZone = () => syncDiscardZoneToStatsHud();
    updateDiscardZone();
    window.addEventListener('resize', updateDiscardZone);
    return () => window.removeEventListener('resize', updateDiscardZone);
  }, [gameState]);

  const initializeGame = () => {
    const startingDeck = getStartingDeck().map((card, index) => ({
      ...card,
      id: `${card.id}_${index}_${Date.now()}`
    }));

    const shuffled = shuffleArray([...startingDeck]);
    const marketDeckShuffled = shuffleArray([...marketCards]);

    setDeck(shuffled);
    setMarketDeck(marketDeckShuffled);
    marketDeckRef.current = marketDeckShuffled;
    setMarket([]); // Start with empty market
    setMarketDiscard([]);
    marketDiscardRef.current = [];
    setPlayerHP(10);
    setPlayerMaxHP(10);
    setPlayTokens([]);
    setIgnoreIncomingDamage(false);
    setCannotDiscardForResources(false);
    setStarsThisRound(0);
    setBossTokens(0);
    bossTokensRef.current = 0;
    setPendingCurse(0);

    const encounter = resolveBossEncounter(bossNumber);
    const boss = encounter.boss;

    setCurrentBoss(boss);
    currentBossRef.current = boss;
    const startingHp = getBossStartingHealth(encounter.hp);
    setBossHP(startingHp);
    setBossMaxHP(startingHp);
    setMarketSlotCount(getBossCardsToDraw(encounter.cards));

    addLog('Game started! Face the boss: ' + boss.name);
    setUndoStack([]);
    setGameState('abilityChoice');
  };

  const startRound = () => {
    setUndoStack([]);
    // Draw a fresh market each round. Those revealed cards lock in the
    // boss's attack and block for the round; purchasing them later does
    // not change the intent. Unpurchased cards go to a discard pile and
    // are shuffled into a new draw pile only when the market deck runs out.
    const encounter = resolveBossEncounter(bossNumber);
    const marketCardsToDraw = getBossCardsToDraw(encounter.cards);
    let drawPile = marketDeckRef.current;
    let discardPile = marketDiscardRef.current;
    if (marketRef.current.length > 0) {
      discardPile = [...discardPile, ...marketRef.current];
      setMarket([]);
      marketRef.current = [];
    }
    const drawn = drawFromCardPiles(
      marketCardsToDraw,
      drawPile,
      discardPile,
      shuffleArray
    );
    if (drawn.reshuffled) {
      addLog('Market reshuffled!');
    }

    const drawnMarket = drawn.drawnCards.map((card, i) => ({
      ...card,
      id: `${card.id}_market_${Date.now()}_${i}`
    }));

    marketDeckRef.current = drawn.currentDeck;
    marketDiscardRef.current = drawn.currentDiscard;
    marketRef.current = drawnMarket;
    setMarketDeck(drawn.currentDeck);
    setMarketDiscard(drawn.currentDiscard);
    setMarket(drawnMarket);
    setMarketSlotCount(drawnMarket.length);

    const action = getBossRoundAction(currentBossRef.current, drawnMarket);
    setBossAction(action);
    setBossAttack(action.value);
    setBossBlock(Math.min(MAX_BLOCK, action.block || 0));

    if (action.brew > 0) {
      const brew = applyBrewTokens(bossTokensRef.current, action.brew);
      bossTokensRef.current = brew.tokens;
      setBossTokens(brew.tokens);
      addLog(`Witch Brew: +${action.brew} token${action.brew === 1 ? '' : 's'} (${brew.tokens}/${WITCH_BREW_THRESHOLD})`);
      if (brew.heal > 0) {
        setBossHP(prev => {
          const healed = Math.min(bossMaxHP, prev + brew.heal);
          addLog(`Witch discarded ${WITCH_BREW_THRESHOLD} tokens and healed ${brew.heal} HP (${healed}/${bossMaxHP} HP)`);
          return healed;
        });
      }
    }

    if (action.curse > 0) {
      addLog(`Witch Curse: discard ${action.curse} card${action.curse === 1 ? '' : 's'}`);
    }

    setIgnoreIncomingDamage(false);
    setCannotDiscardForResources(false);
    setStarsThisRound(0);
    setIncomingDamage(0);
    let remainingTokens = tickPlantTokenCounters(playTokensRef.current).map(token => ({
      ...token,
      spawnedThisTurn: false,
    }));
    setPlayTokens(remainingTokens);
    playTokensRef.current = remainingTokens;

    // Leftover cards from a previous encounter (e.g. defeating a boss mid-turn)
    // must be discarded before drawing a fresh opening hand. Otherwise the
    // new draw would sit on top of the old hand.
    const leftoverHand = [...hand];
    if (leftoverHand.length > 0) {
      addLog(
        leftoverHand.length === 1
          ? 'Discarded leftover card from previous encounter'
          : `Discarded ${leftoverHand.length} leftover cards from previous encounter`
      );
    }

    const openingHand = drawOpeningHand(getOpeningHandSize(), leftoverHand);

    const keepBlock = playerCharacter.race.id === 'mountain-dwarf' && raceLevelRef.current >= 2;
    if (!keepBlock) {
      setPlayerBlock(0);
    }

    const curseCount = Math.min(action.curse || 0, openingHand.length);
    if (curseCount > 0) {
      setPendingCurse(curseCount);
      setGameState('curseDiscard');
    } else {
      setPendingCurse(0);
      setGameState('playerTurn');
    }
    addLog(`Round ${roundNumber} - Boss will: ${action.description}`);
  };

  const getOpeningHandSize = () => debugPlayerCardsPerTurnRef.current;

  const drawFromPiles = (count, currentDeck, currentDiscard) => {
    const result = drawFromCardPiles(count, currentDeck, currentDiscard, shuffleArray);
    if (result.reshuffled) {
      addLog('Deck reshuffled!');
    }
    return result;
  };

  const drawOpeningHand = (count, leftoverHand = []) => {
    const result = drawFromPiles(count, [...deck], [...discard, ...leftoverHand]);
    setDeck(result.currentDeck);
    setDiscard(result.currentDiscard);
    setHand(result.drawnCards);
    return result.drawnCards;
  };

  const cloneValue = (value) => structuredClone(value);

  const captureTurnSnapshot = () => ({
    gameState,
    pendingCurse,
    playerHP,
    playerBlock,
    playTokens: cloneValue(playTokens),
    ignoreIncomingDamage,
    starsThisRound,
    cannotDiscardForResources,
    deck: cloneValue(deck),
    hand: cloneValue(hand),
    discard: cloneValue(discard),
    resources,
    purchaseOrTrashCount,
    market: cloneValue(market),
    marketDeck: cloneValue(marketDeck),
    marketDiscard: cloneValue(marketDiscard),
    marketSlotCount,
    bossHP,
    bossBlock,
    log: cloneValue(log),
  });

  const restoreTurnSnapshot = (snapshot) => {
    setGameState(snapshot.gameState);
    setPendingCurse(snapshot.pendingCurse);
    setPlayerHP(snapshot.playerHP);
    setPlayerBlock(snapshot.playerBlock);
    setPlayTokens(snapshot.playTokens);
    playTokensRef.current = snapshot.playTokens;
    setIgnoreIncomingDamage(snapshot.ignoreIncomingDamage);
    setStarsThisRound(snapshot.starsThisRound);
    setCannotDiscardForResources(snapshot.cannotDiscardForResources);
    setDeck(snapshot.deck);
    setHand(snapshot.hand);
    setDiscard(snapshot.discard);
    setResources(snapshot.resources);
    setPurchaseOrTrashCount(snapshot.purchaseOrTrashCount ?? snapshot.cardsTrashed ?? 0);
    setMarket(snapshot.market);
    marketRef.current = snapshot.market;
    setMarketDeck(snapshot.marketDeck);
    marketDeckRef.current = snapshot.marketDeck;
    setMarketDiscard(snapshot.marketDiscard);
    marketDiscardRef.current = snapshot.marketDiscard;
    setMarketSlotCount(snapshot.marketSlotCount);
    setBossHP(snapshot.bossHP);
    setBossBlock(snapshot.bossBlock);
    setLog(snapshot.log);
  };

  const pushUndoSnapshot = () => {
    const snapshot = captureTurnSnapshot();
    setUndoStack((prev) => [...prev, snapshot]);
  };

  const undoLastAction = () => {
    if (undoStack.length === 0) {
      return;
    }
    restoreTurnSnapshot(undoStack[undoStack.length - 1]);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const discardForResource = (card) => {
    if (cannotDiscardForResources) {
      addLog('Forest elf: cards cannot be discarded for resources this turn');
      return;
    }
    if (resources >= MAX_RESOURCES) {
      return;
    }

    pushUndoSnapshot();
    const newHand = hand.filter(c => c.id !== card.id);
    const newDiscard = [...discard, card];

    setHand(newHand);
    setDiscard(newDiscard);
    setResources(prev => Math.min(MAX_RESOURCES, prev + 1));
    addLog(`Discarded ${card.name} (+1 resource, total: ${Math.min(MAX_RESOURCES, resources + 1)})`);
  };

  const discardCursedCard = (card) => {
    if (gameState !== 'curseDiscard' || pendingCurse <= 0) {
      return;
    }

    pushUndoSnapshot();
    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setDiscard(prev => [...prev, card]);
    const remaining = pendingCurse - 1;
    addLog(`Cursed: discarded ${card.name}${remaining > 0 ? ` (${remaining} left)` : ''}`);

    if (remaining <= 0 || newHand.length === 0) {
      setPendingCurse(0);
      setGameState('playerTurn');
    } else {
      setPendingCurse(remaining);
    }
  };

  const playContext = () => ({
    playerBlock,
    starsThisRound,
    fieldTokenCount: playTokens.length,
  });

  const playCard = (card) => {
    const cost = 1;
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    pushUndoSnapshot();
    const newHand = hand.filter(c => c.id !== card.id);
    setResources(prev => prev - cost);

    const symbolEffects = getCardPlayTotals(
      playerCharacter,
      { raceLevel, classLevel, godLevel },
      card.symbols,
      playContext()
    );
    const damage = symbolEffects.damage;
    const block = symbolEffects.block;
    symbolEffects.logs.forEach(message => addLog(message));

    let nextTokens = playTokens;
    if (symbolEffects.spawn.length > 0) {
      const result = addTokensToField(nextTokens, symbolEffects.spawn, playerCharacter, { raceLevel, classLevel, godLevel });
      nextTokens = result.tokens;
      if (result.added.length > 0) {
        addLog(`Spawned ${describeSpawned(result.added)} (${formatFieldCounts(nextTokens)} in play)`);
      }
      for (const type of result.cappedTypes || []) {
        const max = type === PLAY_TOKEN_TYPE.UNIT
          ? getMaxUnits(playerCharacter, { raceLevel, classLevel, godLevel })
          : getMaxEnergy(playerCharacter, { raceLevel, classLevel, godLevel });
        addLog(`${type === PLAY_TOKEN_TYPE.UNIT ? 'Unit' : 'Energy'} limit reached (${max})`);
      }
    }
    if (symbolEffects.doubleUnits) {
      const result = doublePlayUnits(nextTokens, playerCharacter, { raceLevel, classLevel, godLevel });
      nextTokens = result.tokens;
      addLog(`Doubled units (${result.added.length} added, ${countTokensOfType(nextTokens, PLAY_TOKEN_TYPE.UNIT)} units in play)`);
    }
    if ((symbolEffects.buffUnits?.attack || 0) > 0 || (symbolEffects.buffUnits?.defense || 0) > 0) {
      nextTokens = buffPlayUnits(nextTokens, symbolEffects.buffUnits.attack, symbolEffects.buffUnits.defense);
      addLog(`Units gained +${symbolEffects.buffUnits.attack}/+${symbolEffects.buffUnits.defense}`);
    }
    if (nextTokens !== playTokens) {
      setPlayTokens(nextTokens);
    }

    if (symbolEffects.starsPlayed > 0) {
      setStarsThisRound(prev => prev + symbolEffects.starsPlayed);
    }
    if (symbolEffects.ignoreDamage) {
      setIgnoreIncomingDamage(true);
      addLog('Angels of Elandor: ignore all incoming damage this round');
    }

    if (symbolEffects.lockCardDiscardForResources) {
      setCannotDiscardForResources(true);
      addLog('Forest elf: cards can no longer be discarded for resources this turn');
    }

    if (damage > 0) {
      dealDamageToBoss(damage);
    }

    if (block > 0) {
      setPlayerBlock(prev => Math.min(MAX_BLOCK, prev + block));
      addLog(`Gained ${block} block (Total: ${Math.min(MAX_BLOCK, playerBlock + block)})`);
    }

    if (symbolEffects.heal > 0) {
      const newHP = Math.min(playerMaxHP, playerHP + symbolEffects.heal);
      setPlayerHP(newHP);
      addLog(`Healed ${symbolEffects.heal} HP (${newHP}/${playerMaxHP})`);
    }

    if (symbolEffects.draw > 0) {
      drawCardsAfterDiscard(symbolEffects.draw, card, newHand);
    } else {
      setHand(newHand);
      setDiscard(prev => [...prev, card]);
    }

    addLog(`Played ${card.name} (${cost} resources spent, ${resources - cost} remaining)`);
  };

  const getHandCardLabels = (card) => formatCardEffectLabels(
    getCardPlayTotals(
      playerCharacter,
      { raceLevel, classLevel, godLevel },
      card.symbols,
      playContext()
    )
  );

  const purchaseCard = (card) => {
    const cost = getPurchaseOrTrashCost(purchaseOrTrashCount);
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    pushUndoSnapshot();
    setResources(prev => prev - cost);
    setPurchaseOrTrashCount(prev => prev + 1);
    const newDiscard = [...discard, { ...card, id: `${card.id}_purchased_${Date.now()}` }];
    setDiscard(newDiscard);

    const newMarket = market.filter(c => c.id !== card.id);
    refreshMarket(newMarket);

    addLog(`Purchased ${card.name} (${cost} resources spent, next purchase/trash costs ${cost + 1})`);
  };

  const trashCard = (card) => {
    const cost = getPurchaseOrTrashCost(purchaseOrTrashCount);
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    pushUndoSnapshot();
    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setResources(prev => prev - cost);
    setPurchaseOrTrashCount(prev => prev + 1);

    addLog(`Trashed ${card.name} permanently (${cost} resources spent, next purchase/trash costs ${cost + 1})`);
  };

  const refreshMarket = (currentMarket) => {
    // Purchased cards leave empty slots. The round's market is not refilled
    // until the next round, and buying a card does not change boss intent.
    setMarket(currentMarket);
    marketRef.current = currentMarket;
  };

  const dealDamageToBoss = (damage, options = {}) => {
    const currentBlock = options.block ?? bossBlock;
    const absorbed = Math.min(damage, currentBlock);
    const remainingDamage = damage - absorbed;
    const newBlock = currentBlock - absorbed;

    if (absorbed > 0) {
      setBossBlock(newBlock);
    }

    if (remainingDamage > 0) {
      const newHP = Math.max(0, bossHP - remainingDamage);
      setBossHP(newHP);

      if (absorbed > 0) {
        addLog(`Boss blocked ${absorbed}, dealt ${remainingDamage} damage! (${newHP}/${bossMaxHP} HP, ${newBlock} block left)`);
      } else {
        addLog(`Dealt ${remainingDamage} damage to boss! (${newHP}/${bossMaxHP} HP)`);
      }

      if (newHP === 0) {
        handleBossDefeated();
        return true;
      }
    } else if (absorbed > 0) {
      addLog(`Boss blocked all ${damage} damage (${newBlock} block remaining)`);
    }
    return false;
  };

  const handleBossDefeated = () => {
    addLog(`Boss defeated!`);

    if (bossNumber === 3) {
      setGameState('victory');
      addLog('Victory! You won the game!');
    } else {
      levelUpPicksRemainingRef.current = LEVEL_UP_PICK_LIMIT;
      setLevelUpPicksRemaining(LEVEL_UP_PICK_LIMIT);
      setGameState('levelUp');
      addLog('Choose 2 level up options!');
    }
  };

  const endTurn = () => {
    setUndoStack([]);
    setDiscard(prev => [...prev, ...hand]);
    setHand([]);
    executeBossAction();
  };

  const finishBossTurn = () => {
    setBossAttack(0);
    setBossBlock(0);
    setIncomingDamage(0);

    if (market.length > 0) {
      const nextDiscard = [...marketDiscardRef.current, ...market];
      marketDiscardRef.current = nextDiscard;
      setMarketDiscard(nextDiscard);
      addLog(`${market.length} unpurchased market card${market.length === 1 ? '' : 's'} returned to the discard pile`);
    }

    setMarket([]);
    marketRef.current = [];
    setRoundNumber(prev => prev + 1);
    setGameState('ready');
  };

  const applyRemainingPlayerDamage = (damage) => {
    const newHP = Math.max(0, playerHP - damage);
    setPlayerHP(newHP);
    if (damage <= 0) {
      addLog('You took no damage.');
    } else {
      addLog(`Took ${damage} damage (${newHP}/${playerMaxHP} HP)`);
    }
    if (newHP === 0) {
      setGameState('defeat');
      addLog('You have been defeated!');
      return true;
    }
    return false;
  };

  const executeBossAction = () => {
    if (!bossAction) return;

    if (bossAction.type === 'attack') {
      if (ignoreIncomingDamage) {
        addLog(`Boss attacks for ${bossAction.value}, but incoming damage is ignored!`);
        finishBossTurn();
        return;
      }
      const afterBlock = Math.max(0, bossAction.value - playerBlock);
      if (afterBlock === 0) {
        addLog(`Boss attacks for ${bossAction.value}, but you blocked it all!`);
        finishBossTurn();
        return;
      }
      const blockable = playTokens.some(tokenCanBlock);
      if (blockable) {
        setIncomingDamage(afterBlock);
        setGameState('assignDamage');
        addLog(`Boss attacks for ${bossAction.value}. Assign ${afterBlock} remaining damage to units or take it.`);
        return;
      }
      if (applyRemainingPlayerDamage(afterBlock)) {
        return;
      }
    } else if (bossAction.type === 'heal') {
      const newBossHP = Math.min(bossMaxHP, bossHP + bossAction.value);
      setBossHP(newBossHP);
      addLog(`Boss healed ${bossAction.value} HP! (${newBossHP}/${bossMaxHP} HP)`);
    }

    finishBossTurn();
  };

  const applyLevelUpPick = (cardType) => {
    if (cardType === 'race' && raceLevelRef.current < 2) {
      const newLevel = raceLevelRef.current + 1;
      raceLevelRef.current = newLevel;
      setRaceLevel(newLevel);
      addLog(`Race leveled up to ${newLevel}!`);
      return true;
    }

    if (cardType === 'class' && classLevelRef.current < 2) {
      const newLevel = classLevelRef.current + 1;
      classLevelRef.current = newLevel;
      setClassLevel(newLevel);
      addLog(`Class leveled up to ${newLevel}!`);
      if (playerCharacter.class.id === 'gardener' && newLevel === 2) {
        setPlayTokens(prev => upgradeGardenerTokens(prev, 2));
        addLog('Gardener units are now 1/2.');
      }
      return true;
    }

    if (cardType === 'god' && godLevelRef.current < 2) {
      const newLevel = godLevelRef.current + 1;
      godLevelRef.current = newLevel;
      setGodLevel(newLevel);
      addLog(`God leveled up to ${newLevel}!`);
      return true;
    }

    return false;
  };

  const confirmLevelUp = (picks) => {
    if (gameState !== 'levelUp') {
      return;
    }

    const requiredPicks = levelUpPicksRemainingRef.current;
    if (!Array.isArray(picks) || picks.length !== requiredPicks || requiredPicks <= 0) {
      return;
    }

    const simulated = {
      race: raceLevelRef.current,
      class: classLevelRef.current,
      god: godLevelRef.current,
    };
    for (const cardType of picks) {
      if (!Object.prototype.hasOwnProperty.call(simulated, cardType) || simulated[cardType] >= 2) {
        return;
      }
      simulated[cardType] += 1;
    }

    for (const cardType of picks) {
      if (!applyLevelUpPick(cardType)) {
        return;
      }
    }

    levelUpPicksRemainingRef.current = 0;
    setLevelUpPicksRemaining(0);
    startNextBoss();
  };

  const startNextBoss = () => {
    setBossNumber(prev => prev + 1);
    const nextBossNumber = bossNumber + 1;
    const encounter = resolveBossEncounter(nextBossNumber);
    const boss = encounter.boss;

    setCurrentBoss(boss);
    currentBossRef.current = boss;
    const startingHp = getBossStartingHealth(encounter.hp);
    setBossHP(startingHp);
    setBossMaxHP(startingHp);
    setBossAttack(0);
    setBossBlock(0);
    setBossTokens(0);
    bossTokensRef.current = 0;
    setPendingCurse(0);
    setRoundNumber(1);
    levelUpPicksRemainingRef.current = 0;
    setLevelUpPicksRemaining(0);

    const reset = nextBossPlayerState({ playerHP, playerMaxHP });
    setResources(reset.resources);
    setPlayerBlock(reset.playerBlock);
    setPlayerHP(reset.playerHP);
    setPlayTokens(reset.playTokens);
    playTokensRef.current = reset.playTokens;

    const healed = reset.playerHP - playerHP;
    if (healed > 0) {
      addLog(`Recovered ${healed} HP between bosses (${reset.playerHP}/${playerMaxHP} HP)`);
    } else {
      addLog(`Health is already at max (${reset.playerHP}/${playerMaxHP} HP)`);
    }
    addLog('Resources, block, units, and energy do not carry over to the next boss');

    setGameState('ready');
    addLog(`Next boss: ${boss.name} (Level ${nextBossNumber})`);
  };

  const addLog = (message) => {
    setLog(prev => [...prev, `${message}`]);
  };

  const applyDebugBossStartingHealth = (next) => {
    setDebugBossStartingHealth(next);
    debugBossStartingHealthRef.current = next;
    setBossHP(next);
    setBossMaxHP(next);
    addLog(`Debug: boss starting health set to ${next}`);
  };

  const selectStartingAbility = (abilityType) => {
    if (abilityType === 'race') {
      setRaceLevel(2);
      addLog(`Race leveled up to 2!`);

    } else if (abilityType === 'class') {
      setClassLevel(1);
      addLog(`Class leveled up to 1!`);
    } else if (abilityType === 'god') {
      setGodLevel(1);
      addLog(`God leveled up to 1!`);
    }

    setGameState('ready');
  };

  const harvestLeftoverTokens = () => {
    const result = harvestEligibleTokens(playTokens);
    if (result.harvested.length === 0) {
      return;
    }

    const gained = result.harvested.length * GARDENER_HARVEST_RESOURCES;
    pushUndoSnapshot();
    setPlayTokens(result.tokens);
    playTokensRef.current = result.tokens;
    setResources(prev => Math.min(MAX_RESOURCES, prev + gained));
    const newTotal = Math.min(MAX_RESOURCES, resources + gained);
    addLog(`Harvested ${result.harvested.length} plant unit${result.harvested.length === 1 ? '' : 's'} (+${newTotal - resources} resource${newTotal - resources === 1 ? '' : 's'})`);
  };

  const handleAbilityButton = (button) => {
    if (button.action === 'harvestTokens') {
      harvestLeftoverTokens();
    } else if (button.action === 'vampieraHeal') {
      const energyCount = countTokensOfType(playTokens, PLAY_TOKEN_TYPE.ENERGY);
      if (energyCount < 3) {
        addLog('Need 3 energy to heal');
        return;
      }
      pushUndoSnapshot();
      const result = discardEnergy(playTokens, 3);
      setPlayTokens(result.tokens);
      playTokensRef.current = result.tokens;
      const newHP = Math.min(playerMaxHP, playerHP + 3);
      setPlayerHP(newHP);
      addLog(`Discarded 3 energy: Healed 3 HP (${newHP}/${playerMaxHP})`);
    }
  };

  const handleTokenClick = (token) => {
    if (gameState === 'assignDamage') {
      if (!tokenCanBlock(token)) {
        addLog('That unit cannot block');
        return;
      }
      const result = assignDamageToToken(playTokensRef.current, token.id, incomingDamageRef.current);
      setPlayTokens(result.tokens);
      playTokensRef.current = result.tokens;
      setIncomingDamage(result.remaining);
      incomingDamageRef.current = result.remaining;
      addLog(`Unit blocked ${result.absorbed} damage`);
      if (result.remaining <= 0) {
        addLog('All remaining damage was assigned to units');
        finishBossTurn();
      }
      return;
    }

    if (gameState !== 'playerTurn') return;

    if (tokenCanAttack(token)) {
      pushUndoSnapshot();
      dealDamageToBoss(token.attack);
      const nextTokens = discardToken(playTokensRef.current, token.id);
      setPlayTokens(nextTokens);
      playTokensRef.current = nextTokens;
      addLog(`Unit attacked for ${token.attack} and was discarded`);
    }
  };

  const drawCardsAfterDiscard = (count, discardedCard, currentHand) => {
    const result = drawFromCardPiles(count, deck, [...discard, discardedCard], shuffleArray);
    if (result.reshuffled) {
      addLog('Deck reshuffled!');
    }
    setDeck(result.currentDeck);
    setDiscard(result.currentDiscard);
    setHand([...currentHand, ...result.drawnCards]);
  };

  const handleCardDragStart = (card, e, source = 'hand') => {
    if (gameState !== 'playerTurn') return;
    if (source === 'market') {
      if (resources < getPurchaseOrTrashCost(purchaseOrTrashCount)) return;
      e.preventDefault();
    }
    setDraggingCard(card);
    setDraggingSource(source);
    const touch = e.touches ? e.touches[0] : e;
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    syncDiscardZoneToStatsHud();
  };

  const handleCardDragMove = (e) => {
    if (!draggingCard) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX;
    const y = touch.clientY;
    setDragPosition({ x, y });

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (draggingSource === 'market') {
      setDropZone(y > viewportHeight * 0.68 ? 'purchase' : null);
      return;
    }

    const canAffordPlay = resources >= 1; // Playing costs 1
    const canAffordTrash = resources >= getPurchaseOrTrashCost(purchaseOrTrashCount);

    const discardZoneBottomY = syncDiscardZoneToStatsHud();
    const trashZoneBottomY = viewportHeight * TRASH_ZONE_HEIGHT_RATIO;
    const discardZoneLeftX = viewportWidth * (1 - DISCARD_ZONE_WIDTH_RATIO);

    // Top zone for trash (highest priority)
    if (y < trashZoneBottomY && canAffordTrash) {
      setDropZone('trash');
    // Right zone for discard — below trash, stop at the top of the player stats HUD
    } else if (
      x > discardZoneLeftX &&
      y >= trashZoneBottomY &&
      y <= discardZoneBottomY &&
      !cannotDiscardForResources &&
      resources < MAX_RESOURCES
    ) {
      setDropZone('discard');
    // Play zone — left of discard, below trash, down to the player stats HUD
    } else if (
      x <= discardZoneLeftX &&
      y >= trashZoneBottomY &&
      y <= discardZoneBottomY &&
      canAffordPlay
    ) {
      setDropZone('play');
    } else {
      setDropZone(null);
    }
  };

  const handleCardDragEnd = () => {
    if (!draggingCard) return;

    const card = draggingCard;

    if (draggingSource === 'market') {
      if (dropZone === 'purchase') {
        purchaseCard(card);
      }
    } else if (dropZone === 'play') {
      playCard(card);
    } else if (dropZone === 'discard') {
      discardForResource(card);
    } else if (dropZone === 'trash') {
      trashCard(card);
    }

    setDraggingCard(null);
    setDraggingSource(null);
    setDropZone(null);
  };

  const takeRemainingDamage = () => {
    if (!applyRemainingPlayerDamage(incomingDamage)) finishBossTurn();
  };

  return {
    gameState,
    currentBoss,
    bossHP,
    bossMaxHP,
    bossAttack,
    bossBlock,
    bossTokens,
    pendingCurse,
    playerHP,
    playerMaxHP,
    playerBlock,
    playTokens,
    incomingDamage,
    ignoreIncomingDamage,
    cannotDiscardForResources,
    deck,
    hand,
    discard,
    resources,
    purchaseOrTrashCount,
    purchaseOrTrashCost: getPurchaseOrTrashCost(purchaseOrTrashCount),
    market,
    marketSlotCount,
    bossNumber,
    raceLevel,
    classLevel,
    godLevel,
    levels,
    levelUpPicksRemaining,
    roundNumber,
    showMenu,
    setShowMenu,
    showPlayerStats,
    setShowPlayerStats,
    showDebug,
    setShowDebug,
    debugBossCardsPerTurn: getBossCardsToDraw(resolveBossEncounter(bossNumber).cards),
    setDebugBossCardsPerTurn,
    debugPlayerCardsPerTurn,
    setDebugPlayerCardsPerTurn,
    debugBossStartingHealth: getBossStartingHealth(resolveBossEncounter(bossNumber).hp),
    applyDebugBossStartingHealth,
    draggingCard,
    draggingSource,
    dragPosition,
    dropZone,
    abilityUI,
    getHandCardLabels,
    selectStartingAbility,
    confirmLevelUp,
    handleCardDragStart,
    handleCardDragMove,
    handleCardDragEnd,
    handleTokenClick,
    takeRemainingDamage,
    discardCursedCard,
    handleAbilityButton,
    endTurn,
    undoLastAction,
    canUndo: undoStack.length > 0 && (gameState === 'playerTurn' || gameState === 'curseDiscard'),
  };
}
