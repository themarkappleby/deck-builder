import React, { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, resolveBossEncounter, SYMBOLS } from '../gameData';
import { getActiveAbilityUI, getCardPlayTotals, formatCardEffectLabels, formatLevelLines, addTokensToField, doublePlayTokens, buffPlayTokens, upgradeGardenerTokens, assignDamageToToken, discardToken, tokenCanAttack, tokenCanBlock, tokenCanHarvest, harvestRightmostEligibleToken, formatTokenStats, getMaxTokens, getBossRoundAction, formatBossCardEffectLabels, formatBossAbilityLines, getBossAbility, applyBrewTokens, WITCH_BREW_THRESHOLD } from '../abilityActions';
import Card, { CardSymbols, CardEffectLabels } from './Card';
import './GameBoard.css';
import './GameBoardNew.css';
import './CardActionMenu.css';

const LEVEL_UP_PICK_LIMIT = 2;
const BOSS_CARDS_TO_DRAW = 2;

function AbilityLines({ level }) {
  return formatLevelLines(level).map((line, index) => (
    <p key={index}>{line}</p>
  ));
}

function CharacterAbilities({ playerCharacter, raceLevel, classLevel, godLevel }) {
  return (
    <div className="character-info">
      <div className="character-section">
        <h4>{playerCharacter.race.name} - Level {raceLevel}</h4>
        <div className={`ability-box ${raceLevel >= 1 ? 'active' : ''}`}>
          <strong>Level 1:</strong>
          <AbilityLines level={playerCharacter.race.level1} />
        </div>
        <div className={`ability-box ${raceLevel >= 2 ? 'active' : ''}`}>
          <strong>Level 2:</strong>
          <AbilityLines level={playerCharacter.race.level2} />
        </div>
      </div>

      <div className="character-section">
        <h4>{playerCharacter.class.name} - Level {classLevel}</h4>
        <div className={`ability-box ${classLevel >= 1 ? 'active' : ''}`}>
          <strong>Level 1:</strong>
          <AbilityLines level={playerCharacter.class.level1} />
        </div>
        <div className={`ability-box ${classLevel >= 2 ? 'active' : ''}`}>
          <strong>Level 2:</strong>
          <AbilityLines level={playerCharacter.class.level2} />
        </div>
      </div>

      <div className="character-section">
        <h4>{playerCharacter.god.name} - Level {godLevel}</h4>
        <div className={`ability-box ${godLevel >= 1 ? 'active' : ''}`}>
          <strong>Level 1:</strong>
          <AbilityLines level={playerCharacter.god.level1} />
        </div>
        <div className={`ability-box ${godLevel >= 2 ? 'active' : ''}`}>
          <strong>Level 2:</strong>
          <AbilityLines level={playerCharacter.god.level2} />
        </div>
      </div>
    </div>
  );
}

function GameBoard({ playerCharacter, onRestart }) {
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
  const [marketSlotCount, setMarketSlotCount] = useState(BOSS_CARDS_TO_DRAW);
  
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
    setMarketSlotCount(BOSS_CARDS_TO_DRAW);
    
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
    setBossHP(encounter.hp);
    setBossMaxHP(encounter.hp);
    
    addLog('Game started! Face the boss: ' + boss.name);
    setGameState('abilityChoice');
  };

  const startRound = () => {
    // Draw cards for boss action. The market always has the same number
    // of slots as the number of boss cards drawn this round. Reshuffle
    // leftover market cards into a new draw pile when the market deck
    // runs out — same pattern as the player's discard reshuffle.
    const bossCardsToDraw = BOSS_CARDS_TO_DRAW;
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
    setMarketSlotCount(drawnBossCards.length);
    
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

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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
    setMarketSlotCount(bossCards.length);
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
    const encounter = resolveBossEncounter(nextBossNumber);
    const boss = encounter.boss;
    
    setCurrentBoss(boss);
    currentBossRef.current = boss;
    setBossHP(encounter.hp);
    setBossMaxHP(encounter.hp);
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

  const showBattlefield = gameState === 'playerTurn' || gameState === 'ready' || gameState === 'assignDamage' || gameState === 'curseDiscard';
  const bossAbilityLines = formatBossAbilityLines(currentBoss);
  const marketSlots = Array.from({ length: marketSlotCount }, (_, index) => market[index] || null);

  return (
    <div
      className={`game-board${draggingCard ? ' is-dragging' : ''}`}
      onMouseMove={handleCardDragMove}
      onMouseUp={handleCardDragEnd}
      onTouchMove={handleCardDragMove}
      onTouchEnd={handleCardDragEnd}
    >
      {/* Center Area - Boss Display */}
      <div className={`center-area${gameState === 'abilityChoice' || gameState === 'levelUp' ? ' overlay-mode' : ''}`}>
        {gameState === 'abilityChoice' && (
          <div className="center-content level-up-overlay">
            <h2>Choose Your Starting Ability</h2>
            <div className="level-up-options">
              <button onClick={() => selectStartingAbility('race')}>
                <strong>{playerCharacter.race.name} - Level 2</strong>
                <AbilityLines level={playerCharacter.race.level2} />
              </button>
              <button onClick={() => selectStartingAbility('class')}>
                <strong>{playerCharacter.class.name} - Level 1</strong>
                <AbilityLines level={playerCharacter.class.level1} />
              </button>
              <button onClick={() => selectStartingAbility('god')}>
                <strong>{playerCharacter.god.name} - Level 1</strong>
                <AbilityLines level={playerCharacter.god.level1} />
              </button>
            </div>
          </div>
        )}

        {showBattlefield && (
          <div className="center-content player-turn-layout">
            <div className="battlefield">
              <div className="market-column">
                <div className="market-label">Market</div>
                <div className="intent-card-row market-row" style={{ '--slot-count': marketSlotCount }}>
                  {marketSlots.map((card, index) => (
                    card ? (
                      <Card
                        key={card.id}
                        card={card}
                        isMarket={true}
                        canAfford={resources >= card.symbols.length}
                        className={draggingCard?.id === card.id ? 'dragging' : ''}
                        onMouseDown={(e) => handleCardDragStart(card, e, 'market')}
                        onTouchStart={(e) => handleCardDragStart(card, e, 'market')}
                      />
                    ) : (
                      <div key={`market-slot-${index}`} className="market-slot-empty" />
                    )
                  ))}
                </div>
              </div>
              <div className="boss-stage">
                <div className="boss-cluster">
                  <div className="boss-identity">
                    <div className="boss-status">
                      <div className="boss-name">{currentBoss?.name} (Level {bossNumber}) - Round {roundNumber}</div>
                      {bossAbilityLines.length > 0 && (
                        <div className="boss-abilities">
                          {bossAbilityLines.map(line => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      )}
                      <div className="hp-bar boss-hp-bar">
                        <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
                        <span className="hp-text">{bossHP} / {bossMaxHP} HP</span>
                      </div>
                      <div className="block-bar boss-block-bar">
                        <div
                          className="block-fill"
                          style={{
                            width: `${bossBlockMax > 0 ? (bossBlock / bossBlockMax) * 100 : 0}%`
                          }}
                        ></div>
                        <span className="block-text">
                          {bossBlockMax > 0 ? `${bossBlock} / ${bossBlockMax} Block` : '0 Block'}
                        </span>
                      </div>
                      {getBossAbility(currentBoss, SYMBOLS.GREEN)?.type === 'brew' && (
                        <div className="boss-brew">
                          <span className="boss-brew-label">🧪 Brew {bossTokens}/{WITCH_BREW_THRESHOLD}</span>
                          <div className="boss-brew-pips" aria-hidden="true">
                            {Array.from({ length: WITCH_BREW_THRESHOLD }, (_, index) => (
                              <span
                                key={index}
                                className={`boss-brew-pip${index < bossTokens ? ' filled' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="boss-placeholder">{currentBoss?.id === 'witch' ? '🧙' : '🐉'}</div>
                  </div>
                  <div className="intent-card-row boss-cards-row" style={{ '--slot-count': bossCards.length || marketSlotCount }}>
                    {bossCards.map(card => (
                      <Card
                        key={card.id}
                        card={card}
                        className="intent-card"
                        effectLabels={formatBossCardEffectLabels(currentBoss, card.symbols)}
                      />
                    ))}
                  </div>
                  {bossAttack > 0 && (
                    <div className="enemy-attack-slot">
                      <div className="attack-bar boss-attack-bar">
                        <div
                          className="attack-fill"
                          style={{
                            width: `${(Math.max(0, bossAttack - playerBlock) / bossAttack) * 100}%`
                          }}
                        ></div>
                        <span className="attack-text">
                          {Math.max(0, bossAttack - playerBlock)} attack
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {(playTokens.length > 0 || gameState === 'assignDamage') && (
                <div className="play-field">
                  <div className="play-field-label">
                    {gameState === 'assignDamage'
                      ? `Assign ${incomingDamage} damage`
                      : 'Play field'}
                  </div>
                  <div className="play-token-row">
                    {playTokens.map(token => (
                      <button
                        key={token.id}
                        type="button"
                        className={`play-token${tokenCanAttack(token) && gameState === 'playerTurn' ? ' can-attack' : ''}${!tokenCanBlock(token) && !tokenCanAttack(token) ? ' no-stats' : ''}`}
                        onClick={() => handleTokenClick(token)}
                      >
                        <span className="play-token-kind">{token.kind === 'gardener' ? '🌱' : token.kind === 'vampiera' ? '🩸' : '🪙'}</span>
                        <span className="play-token-stats">{formatTokenStats(token)}</span>
                      </button>
                    ))}
                  </div>
                  {gameState === 'assignDamage' && (
                    <button className="action-btn" onClick={() => { if (!applyRemainingPlayerDamage(incomingDamage)) finishBossTurn(); }}>
                      Take remaining damage
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="center-content level-up-overlay">
            <h2>
              Level Up! Choose {levelUpPicksRemaining} more{' '}
              {levelUpPicksRemaining === 1 ? 'option' : 'options'}
            </h2>
            <div className="level-up-current">
              <h3>Your current abilities</h3>
              <CharacterAbilities
                playerCharacter={playerCharacter}
                raceLevel={raceLevel}
                classLevel={classLevel}
                godLevel={godLevel}
              />
            </div>
            <div className="level-up-options">
              {raceLevel < 2 && (
                <button
                  onClick={() => levelUpCharacter('race')}
                  disabled={levelUpPicksRemaining <= 0}
                >
                  <strong>{playerCharacter.race.name} - Level {raceLevel} → {raceLevel + 1}</strong>
                  <AbilityLines level={playerCharacter.race.level2} />
                </button>
              )}
              {raceLevel >= 2 && (
                <button disabled>
                  <strong>{playerCharacter.race.name} - Max Level</strong>
                  <p>Already at maximum level</p>
                </button>
              )}
              
              {classLevel < 2 && (
                <button
                  onClick={() => levelUpCharacter('class')}
                  disabled={levelUpPicksRemaining <= 0}
                >
                  <strong>{playerCharacter.class.name} - Level {classLevel} → {classLevel + 1}</strong>
                  {classLevel === 0 && (
                    <AbilityLines level={playerCharacter.class.level1} />
                  )}
                  {classLevel === 1 && (
                    <AbilityLines level={playerCharacter.class.level2} />
                  )}
                </button>
              )}
              {classLevel >= 2 && (
                <button disabled>
                  <strong>{playerCharacter.class.name} - Max Level</strong>
                  <p>Already at maximum level</p>
                </button>
              )}
              
              {godLevel < 2 && (
                <button
                  onClick={() => levelUpCharacter('god')}
                  disabled={levelUpPicksRemaining <= 0}
                >
                  <strong>{playerCharacter.god.name} - Level {godLevel} → {godLevel + 1}</strong>
                  {godLevel === 0 && (
                    <AbilityLines level={playerCharacter.god.level1} />
                  )}
                  {godLevel === 1 && (
                    <AbilityLines level={playerCharacter.god.level2} />
                  )}
                </button>
              )}
              {godLevel >= 2 && (
                <button disabled>
                  <strong>{playerCharacter.god.name} - Max Level</strong>
                  <p>Already at maximum level</p>
                </button>
              )}
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="center-content game-over-overlay">
            <h1>🎉 Victory! 🎉</h1>
            <p>You defeated all the bosses!</p>
            <button className="big-button" onClick={onRestart}>Play Again</button>
          </div>
        )}

        {gameState === 'defeat' && (
          <div className="center-content game-over-overlay">
            <h1>💀 Defeat 💀</h1>
            <p>You were defeated by {currentBoss?.name}</p>
            <button className="big-button" onClick={onRestart}>Try Again</button>
          </div>
        )}
      </div>

      {/* Bottom HUD - Player stats then HP */}
      {gameState !== 'abilityChoice' && gameState !== 'levelUp' && (
        <div className="bottom-hud">
          <div className="player-stats-bar">
            <div className="stat-item">💎 {resources}</div>
            <div className="stat-item">🎴 {deck.length}</div>
            <div className="stat-item">🗑️ {discard.length}</div>
            <div className="stat-item">🔹 {playerBlock}</div>
            {playTokens.length > 0 && (
              <div className="stat-item">🪙 {playTokens.length}{Number.isFinite(getMaxTokens(playerCharacter, levels)) ? `/${getMaxTokens(playerCharacter, levels)}` : ''}</div>
            )}
            {ignoreIncomingDamage && (
              <div className="stat-item" title="Ignore incoming damage">✨ Guard</div>
            )}
            {cannotDiscardForResources && (
              <div className="stat-item" title="Cannot discard cards for resources this turn">🚫 Discard</div>
            )}
          </div>
          <div className="hp-bar player-hp-bar">
            <div className="hp-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
            <span className="hp-text">{playerHP} / {playerMaxHP} HP</span>
          </div>
        </div>
      )}

      {/* Hand - Fixed at bottom */}
      {gameState === 'playerTurn' || gameState === 'curseDiscard' ? (
        <div className="hand-container">
          <div className="hand-row">
            {hand.map((card, index) => {
              const totalCards = hand.length;
              const middleIndex = (totalCards - 1) / 2;
              const offsetFromCenter = index - middleIndex;
              
              // Calculate rotation: max 5 degrees per card from center
              const rotation = offsetFromCenter * 5;
              
              // Calculate horizontal spacing: cards overlap by 40-60% depending on hand size
              const baseSpacing = totalCards > 7 ? 30 : totalCards > 5 ? 40 : 50;
              const horizontalOffset = offsetFromCenter * baseSpacing;
              
              // Calculate vertical offset for arc effect (cards at edges are slightly lower)
              const verticalOffset = Math.abs(offsetFromCenter) * 3;
              
              const effectLabels = getHandCardLabels(card);
              const cursing = gameState === 'curseDiscard';
              return (
                <Card
                  key={card.id}
                  card={card}
                  className={`${draggingCard?.id === card.id ? 'dragging' : ''}${cursing ? ' curse-target' : ''}`}
                  style={{
                    transform: `translateX(${horizontalOffset}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`,
                    zIndex: index,
                    '--hover-x': `${horizontalOffset}px`,
                    '--hover-y': `${verticalOffset}px`,
                    '--hover-rotation': `${rotation}deg`,
                  }}
                  onClick={cursing ? () => discardCursedCard(card) : undefined}
                  onMouseDown={cursing ? undefined : (e) => handleCardDragStart(card, e, 'hand')}
                  onTouchStart={cursing ? undefined : (e) => handleCardDragStart(card, e, 'hand')}
                  effectLabels={effectLabels}
                />
              );
            })}
          </div>
          <div className="hand-actions">
            {gameState === 'curseDiscard' ? (
              <div className="curse-banner">
                ⭐️ Curse: discard {pendingCurse} card{pendingCurse === 1 ? '' : 's'}
              </div>
            ) : (
              <>
                {abilityUI.buttons.map(button => (
                  <button
                    key={button.id}
                    className={`action-btn ${button.className}`}
                    onClick={() => handleAbilityButton(button)}
                    disabled={button.disabled}
                  >
                    {button.label}
                    {button.usesRemaining != null ? ` (${button.usesRemaining})` : ''}
                  </button>
                ))}
                <button className="action-btn end-turn" onClick={endTurn}>End Turn</button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {draggingCard && draggingSource === 'hand' && (
        <>
          {/* Play zone - center/middle (where the boss is) - only if player can afford */}
          {resources >= 1 && (
            <div className={`drop-zone drop-zone-center ${dropZone === 'play' ? 'active' : ''}`}>
              <div className="drop-zone-label">PLAY<br/>1 💎</div>
            </div>
          )}
          
          {/* Discard zone - right side - unavailable after Forest elf 🟣 */}
          {!cannotDiscardForResources && (
            <div className={`drop-zone drop-zone-right ${dropZone === 'discard' ? 'active' : ''}`}>
              <div className="drop-zone-label">DISCARD<br/>+1 💎</div>
            </div>
          )}
          
          {/* Trash zone - top - only if player can afford */}
          {resources >= draggingCard.symbols.length && (
            <div className={`drop-zone drop-zone-top ${dropZone === 'trash' ? 'active' : ''}`}>
              <div className="drop-zone-label">TRASH<br/>{draggingCard.symbols.length} 💎</div>
            </div>
          )}
        </>
      )}

      {draggingCard && draggingSource === 'market' && (
        <div className={`drop-zone drop-zone-bottom ${dropZone === 'purchase' ? 'active' : ''}`}>
          <div className="drop-zone-label">BUY<br/>{draggingCard.symbols.length} 💎</div>
        </div>
      )}

      {draggingCard && (
        <div 
          className="floating-card"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
          }}
        >
          <CardSymbols symbols={draggingCard.symbols} />
          {draggingSource === 'hand' && (
            <CardEffectLabels labels={getHandCardLabels(draggingCard)} />
          )}
        </div>
      )}

      {/* Player Stats Overlay */}
      {showPlayerStats && (
        <div className="player-stats-overlay">
          <div className="player-stats-content">
            <h3>Your Character</h3>
            <CharacterAbilities
              playerCharacter={playerCharacter}
              raceLevel={raceLevel}
              classLevel={classLevel}
              godLevel={godLevel}
            />

            <button className="close-stats-btn" onClick={() => setShowPlayerStats(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Menu button */}
      {gameState !== 'abilityChoice' && gameState !== 'levelUp' && (
        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
      )}
      
      {/* Menu popover */}
      {showMenu && gameState !== 'abilityChoice' && gameState !== 'levelUp' && (
        <div className="menu-popover">
          <button 
            className="menu-item" 
            onClick={() => {
              setShowPlayerStats(true);
              setShowMenu(false);
            }}
          >
            📊 View Stats
          </button>
          <button 
            className="menu-item" 
            onClick={() => {
              setShowMenu(false);
              onRestart();
            }}
          >
            🔄 New Game
          </button>
        </div>
      )}
      
      {/* Backdrop to close menu */}
      {showMenu && (
        <div className="menu-backdrop" onClick={() => setShowMenu(false)}></div>
      )}
    </div>
  );
}

export default GameBoard;
