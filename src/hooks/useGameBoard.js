import { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, bosses } from '../gameData';
import {
  getActiveAbilityUI,
  getCardPlayTotals,
  formatCardEffectLabels,
  addTokensToField,
  doublePlayTokens,
  buffPlayTokens,
  upgradeGardenerTokens,
  assignDamageToToken,
  discardToken,
  tokenCanAttack,
  tokenCanBlock,
  harvestRightmostEligibleToken,
  getMaxTokens,
  getBossRoundAction,
  applyBrewTokens,
  WITCH_BREW_THRESHOLD,
} from '../abilityActions';
import { LEVEL_UP_PICK_LIMIT } from '../game/constants';
import { shuffleArray } from '../utils/shuffle';

export function useGameBoard(playerCharacter) {
  const [gameState, setGameState] = useState('setup');
  const [bossNumber, setBossNumber] = useState(1);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHP, setBossHP] = useState(0);
  const [bossMaxHP, setBossMaxHP] = useState(0);
  const [bossAction, setBossAction] = useState(null);
  const [bossCards, setBossCards] = useState([]);
  const [bossAttack, setBossAttack] = useState(0);
  const [bossBlock, setBossBlock] = useState(0);
  const [bossBlockMax, setBossBlockMax] = useState(0);
  const [bossTokens, setBossTokens] = useState(0);
  const [pendingCurse, setPendingCurse] = useState(0);

  const [playerHP, setPlayerHP] = useState(10);
  const [playerMaxHP, setPlayerMaxHP] = useState(10);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playTokens, setPlayTokens] = useState([]);
  const [incomingDamage, setIncomingDamage] = useState(0);
  const [ignoreIncomingDamage, setIgnoreIncomingDamage] = useState(false);
  const [starsThisRound, setStarsThisRound] = useState(0);
  const [harvestNextTurn, setHarvestNextTurn] = useState(false);
  const [canHarvestThisTurn, setCanHarvestThisTurn] = useState(false);
  const [cannotDiscardForResources, setCannotDiscardForResources] = useState(false);

  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [resources, setResources] = useState(0);

  const [market, setMarket] = useState([]);
  const [marketDeck, setMarketDeck] = useState([]);

  const [raceLevel, setRaceLevel] = useState(1);
  const [classLevel, setClassLevel] = useState(0);
  const [godLevel, setGodLevel] = useState(0);
  const [levelUpPicksRemaining, setLevelUpPicksRemaining] = useState(0);

  const [log, setLog] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);

  const [showMenu, setShowMenu] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
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

  const levels = { raceLevel, classLevel, godLevel };

  const abilityUI = getActiveAbilityUI(
    playerCharacter,
    levels,
    {
      tokens: playTokens,
      canHarvest: canHarvestThisTurn,
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

  const initializeGame = () => {
    const startingDeck = getStartingDeck().map((card, index) => ({
      ...card,
      id: `${card.id}_${index}_${Date.now()}`
    }));

    const shuffled = shuffleArray([...startingDeck]);
    const marketDeckShuffled = shuffleArray([...marketCards]);

    setDeck(shuffled);
    setMarketDeck(marketDeckShuffled);
    setMarket([]); // Start with empty market

    setPlayerHP(10);
    setPlayerMaxHP(10);
    setPlayTokens([]);
    setIgnoreIncomingDamage(false);
    setCannotDiscardForResources(false);
    setStarsThisRound(0);
    setBossTokens(0);
    bossTokensRef.current = 0;
    setPendingCurse(0);

    const boss = bosses[0];
    const bossLevel = bossNumber === 1 ? 'level1' : bossNumber === 2 ? 'level2' : 'level3';
    const bossData = boss[bossLevel];

    setCurrentBoss(boss);
    currentBossRef.current = boss;
    setBossHP(bossData.hp);
    setBossMaxHP(bossData.hp);

    addLog('Game started! Face the boss: ' + boss.name);
    setGameState('abilityChoice');
  };

  const startRound = () => {
    // Draw cards for boss action (2 cards), reshuffling
    // the market into a new draw pile when the market deck runs out —
    // same pattern as the player's discard reshuffle.
    const bossCardsToDraw = 2;
    let currentMarketDeck = [...marketDeck];
    let currentMarket = [...market];
    const drawnBossCards = [];

    for (let i = 0; i < bossCardsToDraw; i++) {
      if (currentMarketDeck.length === 0) {
        if (currentMarket.length === 0) break;
        currentMarketDeck = shuffleArray([...currentMarket]);
        currentMarket = [];
        addLog('Market reshuffled into boss draw pile!');
      }
      const card = currentMarketDeck.pop();
      drawnBossCards.push({
        ...card,
        id: `${card.id}_boss_${Date.now()}_${i}`
      });
    }

    setMarketDeck(currentMarketDeck);
    setMarket(currentMarket);
    setBossCards(drawnBossCards);

    const action = getBossRoundAction(currentBossRef.current, drawnBossCards);
    setBossAction(action);
    setBossAttack(action.value);
    setBossBlock(action.block || 0);
    setBossBlockMax(action.block || 0);

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
    const remainingTokens = playTokensRef.current;
    setPlayTokens(remainingTokens.map(token => ({
      ...token,
      spawnedThisTurn: false,
    })));
    if (harvestNextTurn && remainingTokens.length > 0) {
      setCanHarvestThisTurn(true);
    } else {
      setCanHarvestThisTurn(false);
    }
    setHarvestNextTurn(false);

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

  const getOpeningHandSize = () => 6;

  const drawFromPiles = (count, currentDeck, currentDiscard) => {
    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length === 0) break;
        currentDeck = shuffleArray([...currentDiscard]);
        currentDiscard = [];
        addLog('Deck reshuffled!');
      }
      drawnCards.push(currentDeck.pop());
    }
    return { drawnCards, currentDeck, currentDiscard };
  };

  const drawOpeningHand = (count, leftoverHand = []) => {
    const result = drawFromPiles(count, [...deck], [...discard, ...leftoverHand]);
    setDeck(result.currentDeck);
    setDiscard(result.currentDiscard);
    setHand(result.drawnCards);
    return result.drawnCards;
  };

  const discardForResource = (card) => {
    if (cannotDiscardForResources) {
      addLog('Forest elf: cards cannot be discarded for resources this turn');
      return;
    }

    const newHand = hand.filter(c => c.id !== card.id);
    const newDiscard = [...discard, card];

    setHand(newHand);
    setDiscard(newDiscard);
    setResources(prev => prev + 1);
    addLog(`Discarded ${card.name} (+1 resource, total: ${resources + 1})`);
  };

  const discardCursedCard = (card) => {
    if (gameState !== 'curseDiscard' || pendingCurse <= 0) {
      return;
    }

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
        addLog(`Spawned ${result.added.length} token${result.added.length > 1 ? 's' : ''} (${nextTokens.length} in play)`);
      }
      if (result.capped) {
        addLog(`Token limit reached (${getMaxTokens(playerCharacter, { raceLevel, classLevel, godLevel })})`);
      }
      if (symbolEffects.gardenerHarvest) {
        setHarvestNextTurn(true);
      }
    }
    if (symbolEffects.doubleTokens) {
      const result = doublePlayTokens(nextTokens, playerCharacter, { raceLevel, classLevel, godLevel });
      nextTokens = result.tokens;
      addLog(`Doubled tokens (${result.added.length} added, ${nextTokens.length} in play)`);
    }
    if ((symbolEffects.buffTokens?.attack || 0) > 0 || (symbolEffects.buffTokens?.defense || 0) > 0) {
      nextTokens = buffPlayTokens(nextTokens, symbolEffects.buffTokens.attack, symbolEffects.buffTokens.defense);
      addLog(`Tokens gained +${symbolEffects.buffTokens.attack}/+${symbolEffects.buffTokens.defense}`);
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
      setPlayerBlock(prev => prev + block);
      addLog(`Gained ${block} block (Total: ${playerBlock + block})`);
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
    const cost = card.symbols.length;
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    setResources(prev => prev - cost);
    const newDiscard = [...discard, { ...card, id: `${card.id}_purchased_${Date.now()}` }];
    setDiscard(newDiscard);

    const newMarket = market.filter(c => c.id !== card.id);
    refreshMarket(newMarket);

    addLog(`Purchased ${card.name} (${cost} resources spent, ${resources - cost} remaining)`);
  };

  const trashCard = (card) => {
    const cost = card.symbols.length;
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setResources(prev => prev - cost);

    addLog(`Trashed ${card.name} permanently (${cost} resources spent)`);
  };

  const refreshMarket = (currentMarket) => {
    // With the new boss card system, just update the market
    // Don't refill from market deck - that happens at the end of the boss turn
    setMarket(currentMarket);
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
    setDiscard(prev => [...prev, ...hand]);
    setHand([]);
    executeBossAction();
  };

  const finishBossTurn = () => {
    setBossAttack(0);
    setBossBlock(0);
    setBossBlockMax(0);
    setIncomingDamage(0);

    if (market.length > 0) {
      setMarketDeck(prev => [...prev, ...market]);
      addLog(`${market.length} unpurchased market card${market.length === 1 ? '' : 's'} returned to the draw pile`);
    }

    setMarket(bossCards);
    setBossCards([]);
    addLog('Boss cards moved to market!');
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
        addLog(`Boss attacks for ${bossAction.value}. Assign ${afterBlock} remaining damage to tokens or take it.`);
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

  const levelUpCharacter = (cardType) => {
    if (gameState !== 'levelUp' || levelUpPicksRemainingRef.current <= 0) {
      return;
    }

    let applied = false;
    if (cardType === 'race' && raceLevelRef.current < 2) {
      const newLevel = raceLevelRef.current + 1;
      raceLevelRef.current = newLevel;
      setRaceLevel(newLevel);
      addLog(`Race leveled up to ${newLevel}!`);
      applied = true;

    } else if (cardType === 'class' && classLevelRef.current < 2) {
      const newLevel = classLevelRef.current + 1;
      classLevelRef.current = newLevel;
      setClassLevel(newLevel);
      addLog(`Class leveled up to ${newLevel}!`);
      applied = true;
      if (playerCharacter.class.id === 'gardener' && newLevel === 2) {
        setPlayTokens(prev => upgradeGardenerTokens(prev, 2));
        addLog('Gardener tokens are now 1/2.');
      }
    } else if (cardType === 'god' && godLevelRef.current < 2) {
      const newLevel = godLevelRef.current + 1;
      godLevelRef.current = newLevel;
      setGodLevel(newLevel);
      addLog(`God leveled up to ${newLevel}!`);
      applied = true;
    }

    if (!applied) {
      return;
    }

    const remaining = levelUpPicksRemainingRef.current - 1;
    levelUpPicksRemainingRef.current = remaining;
    setLevelUpPicksRemaining(remaining);

    if (remaining <= 0) {
      startNextBoss();
    }
  };

  const startNextBoss = () => {
    setBossNumber(prev => prev + 1);
    const nextBossNumber = bossNumber + 1;
    const boss = bosses[Math.min(bossNumber, bosses.length - 1)];
    const bossLevel = nextBossNumber === 1 ? 'level1' : nextBossNumber === 2 ? 'level2' : 'level3';
    const bossData = boss[bossLevel];

    setCurrentBoss(boss);
    currentBossRef.current = boss;
    setBossHP(bossData.hp);
    setBossMaxHP(bossData.hp);
    setBossAttack(0);
    setBossBlock(0);
    setBossBlockMax(0);
    setBossTokens(0);
    bossTokensRef.current = 0;
    setPendingCurse(0);
    setRoundNumber(1);
    levelUpPicksRemainingRef.current = 0;
    setLevelUpPicksRemaining(0);
    setGameState('ready');
    addLog(`Next boss: ${boss.name} (Level ${nextBossNumber})`);
  };

  const addLog = (message) => {
    setLog(prev => [...prev, `${message}`]);
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

  const harvestRightmostToken = () => {
    if (!canHarvestThisTurn) {
      return;
    }

    const result = harvestRightmostEligibleToken(playTokens);
    if (!result.harvested) {
      return;
    }

    setPlayTokens(result.tokens);
    setResources(prev => prev + 2);
    addLog(`Harvested the rightmost leftover token (+2 resources)`);
  };

  const handleAbilityButton = (button) => {
    if (button.action === 'harvestTokens') {
      harvestRightmostToken();
    } else if (button.action === 'vampieraHeal') {
      if (playTokens.length < 3) {
        addLog('Need 3 tokens to heal');
        return;
      }
      setPlayTokens(prev => prev.slice(0, -3));
      const newHP = Math.min(playerMaxHP, playerHP + 3);
      setPlayerHP(newHP);
      addLog(`Discarded 3 tokens: Healed 3 HP (${newHP}/${playerMaxHP})`);
    }
  };

  const handleTokenClick = (token) => {
    if (gameState === 'assignDamage') {
      if (!tokenCanBlock(token)) {
        addLog('That token cannot block');
        return;
      }
      const result = assignDamageToToken(playTokensRef.current, token.id, incomingDamageRef.current);
      setPlayTokens(result.tokens);
      playTokensRef.current = result.tokens;
      setIncomingDamage(result.remaining);
      incomingDamageRef.current = result.remaining;
      addLog(`Token blocked ${result.absorbed} damage`);
      if (result.remaining <= 0) {
        addLog('All remaining damage was assigned to tokens');
        finishBossTurn();
      }
      return;
    }

    if (gameState !== 'playerTurn') return;

    if (tokenCanAttack(token)) {
      dealDamageToBoss(token.attack);
      const nextTokens = discardToken(playTokensRef.current, token.id);
      setPlayTokens(nextTokens);
      playTokensRef.current = nextTokens;
      addLog(`Token attacked for ${token.attack} and was discarded`);
    }
  };

  const drawCardsAfterDiscard = (count, discardedCard, currentHand) => {
    let currentDeck = [...deck];
    let currentDiscard = [...discard, discardedCard];
    let drawnCards = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length === 0) break;
        currentDeck = shuffleArray([...currentDiscard]);
        currentDiscard = [];
        addLog('Deck reshuffled!');
      }
      drawnCards.push(currentDeck.pop());
    }

    setDeck(currentDeck);
    setDiscard(currentDiscard);
    setHand([...currentHand, ...drawnCards]);
  };

  const handleCardDragStart = (card, e, source = 'hand') => {
    if (gameState !== 'playerTurn') return;
    if (source === 'market') {
      if (resources < card.symbols.length) return;
      e.preventDefault();
    }
    setDraggingCard(card);
    setDraggingSource(source);
    const touch = e.touches ? e.touches[0] : e;
    setDragPosition({ x: touch.clientX, y: touch.clientY });
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
    const canAffordTrash = resources >= draggingCard.symbols.length; // Trashing costs symbol count

    // Top zone for trash (highest priority)
    if (y < viewportHeight * 0.25 && canAffordTrash) {
      setDropZone('trash');
    // Right zone for discard
    } else if (x > viewportWidth * 0.75 && !cannotDiscardForResources) {
      setDropZone('discard');
    // Middle/center zone for play (where the boss is)
    } else if (x >= viewportWidth * 0.3 && x <= viewportWidth * 0.7 && y >= viewportHeight * 0.25 && y <= viewportHeight * 0.65 && canAffordPlay) {
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
    bossCards,
    bossAttack,
    bossBlock,
    bossBlockMax,
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
    market,
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
    draggingCard,
    draggingSource,
    dragPosition,
    dropZone,
    abilityUI,
    getHandCardLabels,
    selectStartingAbility,
    levelUpCharacter,
    handleCardDragStart,
    handleCardDragMove,
    handleCardDragEnd,
    handleTokenClick,
    takeRemainingDamage,
    discardCursedCard,
    handleAbilityButton,
    endTurn,
  };
}
