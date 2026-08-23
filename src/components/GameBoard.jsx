import React, { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, bosses, SYMBOLS } from '../gameData';
import { getActiveAbilityUI, getGodAbilityUsesPerRound, getAresStartOfRoundDamage, countAttackCards, collectPlayEffects, formatLevelLines } from '../abilityActions';
import Card from './Card';
import './GameBoard.css';
import './GameBoardNew.css';
import './CardActionMenu.css';

const LEVEL_UP_PICK_LIMIT = 2;

function AbilityLines({ level }) {
  return formatLevelLines(level).map((line, index) => (
    <p key={index}>{line}</p>
  ));
}

function CharacterAbilities({ playerCharacter, raceLevel, classLevel, godLevel }) {
  return (
    <div className="character-info">
      <div className="character-section">
        <h4>{playerCharacter.race.name} (Side {playerCharacter.race.side}) - Level {raceLevel}</h4>
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
        <h4>{playerCharacter.class.name} (Side {playerCharacter.class.side}) - Level {classLevel}</h4>
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
        <h4>{playerCharacter.god.name} (Side {playerCharacter.god.side}) - Level {godLevel}</h4>
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
  
  const [playerHP, setPlayerHP] = useState(10);
  const [playerMaxHP, setPlayerMaxHP] = useState(10);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerTokens, setPlayerTokens] = useState({});
  const [nextAttackDoubled, setNextAttackDoubled] = useState(false);
  const [godAbilityUsesThisRound, setGodAbilityUsesThisRound] = useState(0);
  const [pendingDiscardAbility, setPendingDiscardAbility] = useState(null); // 'aresDiscard' | 'athenaDiscard'
  
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

  // Derive remaining uses from the unlocked god level so unlocking Ares/Athena
  // mid-setup (or after a stale startRound closure) still enables the button.
  const godUsesRemaining = Math.max(
    0,
    getGodAbilityUsesPerRound(playerCharacter, godLevel) - godAbilityUsesThisRound
  );

  const abilityUI = getActiveAbilityUI(
    playerCharacter,
    { raceLevel, classLevel, godLevel },
    {
      tokens: playerTokens,
      godUsesRemaining,
      handSize: hand.length,
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
    
    // Apply Dwarf HP bonus
    let startingHP = 10;
    if (playerCharacter.race.id === 'dwarf') {
      if (raceLevel >= 2) {
        startingHP = 14;
      } else if (raceLevel >= 1) {
        startingHP = 12;
      }
    }
    setPlayerHP(startingHP);
    setPlayerMaxHP(startingHP);
    
    const boss = bosses[0];
    const bossLevel = bossNumber === 1 ? 'level1' : bossNumber === 2 ? 'level2' : 'level3';
    const bossData = boss[bossLevel];
    
    setCurrentBoss(boss);
    setBossHP(bossData.hp);
    setBossMaxHP(bossData.hp);
    
    addLog('Game started! Face the boss: ' + boss.name);
    setGameState('abilityChoice');
  };

  const startRound = () => {
    // Draw cards for boss action (3 for the first boss), reshuffling
    // the market into a new draw pile when the market deck runs out —
    // same pattern as the player's discard reshuffle.
    const bossCardsToDraw = 3;
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
    
    // Calculate boss action from drawn cards
    const action = calculateBossActionFromCards(drawnBossCards);
    setBossAction(action);
    setBossAttack(action.value);
    setBossBlock(action.block || 0);
    setBossBlockMax(action.block || 0);
    
    // Vampire B Level 2: Start each round with +1 blood token
    if (playerCharacter.race.id === 'vampire' && playerCharacter.race.side === 'B' && raceLevel >= 2) {
      setPlayerTokens(prev => ({
        ...prev,
        blood: (prev.blood || 0) + 1
      }));
      addLog('Gained 1 blood token (Vampire Level 2)');
    }

    // Refresh once-per-round activated god ability uses (Ares A / Athena)
    setGodAbilityUsesThisRound(0);
    setPendingDiscardAbility(null);

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

    const drawnCards = drawOpeningHand(getOpeningHandSize(), leftoverHand);
    const currentGodLevel = godLevelRef.current;
    const aresDamage = getAresStartOfRoundDamage(
      playerCharacter,
      currentGodLevel,
      drawnCards
    );
    let bossDefeatedThisRoundStart = false;
    if (aresDamage > 0) {
      const attackCards = countAttackCards(drawnCards);
      bossDefeatedThisRoundStart = dealDamageToBoss(aresDamage, { block: action.block || 0 });
      addLog(
        `Ares: ${attackCards} 🔺 in hand, dealt ${aresDamage} damage to boss`
      );
    }

    setPlayerBlock(0);
    if (!bossDefeatedThisRoundStart) {
      setGameState('playerTurn');
    }
    addLog(`Round ${roundNumber} - Boss will: ${action.description}`);
  };

  const calculateBossActionFromCards = (cards) => {
    let attackCount = 0;
    let blockCount = 0;
    
    cards.forEach(card => {
      card.symbols.forEach(symbol => {
        if (symbol === SYMBOLS.ATTACK) {
          attackCount++;
        } else if (symbol === SYMBOLS.BLOCK) {
          blockCount++;
        }
      });
    });
    
    // Boss attacks for damage equal to attack symbols.
    // Witch (and card-drawn bosses) accumulate block from 🔹 for this round only.
    const damage = attackCount;
    const parts = [`Attacks for ${damage} damage`];
    if (blockCount > 0) {
      parts.push(`gains ${blockCount} block`);
    }
    
    return {
      type: 'attack',
      value: damage,
      block: blockCount,
      description: parts.join(', ')
    };
  };

  const getOpeningHandSize = () => {
    let cardsToDraw = 6;
    if (playerCharacter.race.id === 'elf') {
      if (raceLevel >= 2) {
        cardsToDraw = 8;
      } else if (raceLevel >= 1) {
        cardsToDraw = 7;
      }
    }
    return cardsToDraw;
  };

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
    const newHand = hand.filter(c => c.id !== card.id);
    const newDiscard = [...discard, card];
    
    setHand(newHand);
    setDiscard(newDiscard);
    setResources(prev => prev + 1);
    addLog(`Discarded ${card.name} (+1 resource, total: ${resources + 1})`);
  };

  const playCard = (card) => {
    const cost = 1; // Playing a card always costs 1
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    // Cancel pending god discard selection when playing a card normally
    if (pendingDiscardAbility) {
      setPendingDiscardAbility(null);
    }

    const newHand = hand.filter(c => c.id !== card.id);
    setResources(prev => prev - cost);

    let damage = 0;
    let block = 0;
    let attackSymbols = 0;

    card.symbols.forEach(symbol => {
      if (symbol === SYMBOLS.ATTACK) {
        attackSymbols += 1;
        damage += 1;
        // Vampire Level 2: 🔺 symbols deal +1 damage
        if (playerCharacter.race.id === 'vampire' && playerCharacter.race.side === 'A' && raceLevel >= 2) {
          damage += 1;
        }
        // Warrior A Level 2: 🔺 symbols deal +2 damage
        if (playerCharacter.class.id === 'warrior' && playerCharacter.class.side === 'A' && classLevel >= 2) {
          damage += 2;
        }
      } else if (symbol === SYMBOLS.BLOCK) {
        block += 1;
        // Priest Level 2: 🔹 symbols grant +2 block
        if (playerCharacter.class.id === 'priest' && playerCharacter.class.side === 'A' && classLevel >= 2) {
          block += 2;
        }
        // Dwarf Level 2: all 🔹 symbols grant +1 block
        if (playerCharacter.race.id === 'dwarf' && raceLevel >= 2) {
          block += 1;
        }
      }
    });

    const symbolEffects = collectPlayEffects(
      playerCharacter,
      { raceLevel, classLevel, godLevel },
      card.symbols
    );
    damage += symbolEffects.damage;
    block += symbolEffects.block;
    symbolEffects.logs.forEach(message => addLog(message));

    const bloodTokensGained = symbolEffects.tokens.blood || 0;
    const rageTokensGained = symbolEffects.tokens.rage || 0;

    // Warrior B rage: next 🔺 deals double damage (consumes buff)
    if (nextAttackDoubled && attackSymbols > 0) {
      damage *= 2;
      setNextAttackDoubled(false);
      addLog('💢 Rage: attack damage doubled!');
    }

    if (bloodTokensGained > 0) {
      setPlayerTokens(prev => ({
        ...prev,
        blood: (prev.blood || 0) + bloodTokensGained
      }));
      addLog(`Gained ${bloodTokensGained} blood token${bloodTokensGained > 1 ? 's' : ''} (Total: ${(playerTokens.blood || 0) + bloodTokensGained})`);
    }

    if (rageTokensGained > 0) {
      setPlayerTokens(prev => ({
        ...prev,
        rage: (prev.rage || 0) + rageTokensGained
      }));
      addLog(`Gained ${rageTokensGained} rage token${rageTokensGained > 1 ? 's' : ''} (Total: ${(playerTokens.rage || 0) + rageTokensGained})`);
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
    setPendingDiscardAbility(null);
    setDiscard(prev => [...prev, ...hand]);
    setHand([]);

    executeBossAction();
  };

  const executeBossAction = () => {
    if (!bossAction) return;

    if (bossAction.type === 'attack') {
      const damage = Math.max(0, bossAction.value - playerBlock);
      const newHP = Math.max(0, playerHP - damage);
      setPlayerHP(newHP);
      
      if (damage === 0) {
        addLog(`Boss attacks for ${bossAction.value}, but you blocked it all!`);
      } else {
        addLog(`Boss attacks for ${bossAction.value}! You blocked ${playerBlock}, took ${damage} damage. (${newHP}/${playerMaxHP} HP)`);
      }

      if (newHP === 0) {
        setGameState('defeat');
        addLog('You have been defeated!');
        return;
      }
    } else if (bossAction.type === 'heal') {
      const newBossHP = Math.min(bossMaxHP, bossHP + bossAction.value);
      setBossHP(newBossHP);
      addLog(`Boss healed ${bossAction.value} HP! (${newBossHP}/${bossMaxHP} HP)`);
    }

    setBossAttack(0);
    setBossBlock(0);
    setBossBlockMax(0);

    // Unpurchased market cards return to the market deck so the boss
    // can reshuffle them later; boss cards become the new market.
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

      // Apply Dwarf HP bonus when leveling up
      if (playerCharacter.race.id === 'dwarf' && newLevel === 2) {
        const newMaxHP = 14;
        setPlayerMaxHP(newMaxHP);
        setPlayerHP(prev => prev + 2); // Heal 2 HP when max increases
        addLog('Max HP increased to 14!');
      }
    } else if (cardType === 'class' && classLevelRef.current < 2) {
      const newLevel = classLevelRef.current + 1;
      classLevelRef.current = newLevel;
      setClassLevel(newLevel);
      addLog(`Class leveled up to ${newLevel}!`);
      applied = true;
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
    setBossHP(bossData.hp);
    setBossMaxHP(bossData.hp);
    setBossAttack(0);
    setBossBlock(0);
    setBossBlockMax(0);
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
      
      // Apply Dwarf HP bonus if race level 2
      if (playerCharacter.race.id === 'dwarf') {
        const newMaxHP = 14;
        setPlayerMaxHP(newMaxHP);
        setPlayerHP(newMaxHP);
        addLog('Max HP increased to 14!');
      }
    } else if (abilityType === 'class') {
      setClassLevel(1);
      addLog(`Class leveled up to 1!`);
    } else if (abilityType === 'god') {
      setGodLevel(1);
      addLog(`God leveled up to 1!`);
    }
    
    setGameState('ready');
  };

  const spendBloodTokens = () => {
    if (playerCharacter.race.id !== 'vampire' || raceLevel < 1) return;
    
    const bloodTokens = playerTokens.blood || 0;
    const requiredTokens = raceLevel >= 2 ? 2 : 3;
    
    if (bloodTokens < requiredTokens) {
      addLog(`Not enough blood tokens! Need ${requiredTokens}, have ${bloodTokens}`);
      return;
    }
    
    setPlayerTokens(prev => ({
      ...prev,
      blood: (prev.blood || 0) - requiredTokens
    }));
    
    if (playerCharacter.race.side === 'A') {
      const healAmount = 1;
      const newHP = Math.min(playerMaxHP, playerHP + healAmount);
      setPlayerHP(newHP);
      addLog(`Spent ${requiredTokens} blood tokens: Healed 1 HP (${newHP}/${playerMaxHP})`);
    } else {
      const damageAmount = raceLevel >= 2 ? 3 : 2;
      dealDamageToBoss(damageAmount);
      addLog(`Spent ${requiredTokens} blood tokens: Dealt ${damageAmount} damage to boss`);
    }
  };

  const spendRageTokens = () => {
    if (
      playerCharacter.class.id !== 'warrior' ||
      playerCharacter.class.side !== 'B' ||
      classLevel < 1
    ) {
      return;
    }

    const rageTokens = playerTokens.rage || 0;
    const requiredTokens = classLevel >= 2 ? 2 : 3;

    if (rageTokens < requiredTokens) {
      addLog(`Not enough rage tokens! Need ${requiredTokens}, have ${rageTokens}`);
      return;
    }

    if (nextAttackDoubled) {
      addLog('Rage is already active for your next attack!');
      return;
    }

    setPlayerTokens(prev => ({
      ...prev,
      rage: (prev.rage || 0) - requiredTokens
    }));
    setNextAttackDoubled(true);
    addLog(`Spent ${requiredTokens} rage tokens: Next 🔺 deals double damage!`);
  };

  const handleAbilityButton = (button) => {
    if (button.action === 'spendBlood') {
      spendBloodTokens();
    } else if (button.action === 'spendRage') {
      spendRageTokens();
    } else if (button.action === 'aresDiscard' || button.action === 'athenaDiscard') {
      if (godUsesRemaining <= 0) {
        addLog('No god ability uses remaining this round');
        return;
      }
      if (hand.length === 0) {
        addLog('No cards in hand to discard');
        return;
      }
      if (pendingDiscardAbility === button.action) {
        setPendingDiscardAbility(null);
        addLog('Cancelled ability — select a card to discard cancelled');
      } else {
        setPendingDiscardAbility(button.action);
        addLog(
          button.action === 'aresDiscard'
            ? 'Select a card to discard for Ares (deal damage)'
            : 'Select a card to discard for Athena (draw 2)'
        );
      }
    }
  };

  const resolveGodDiscard = (card) => {
    if (!pendingDiscardAbility || godUsesRemaining <= 0) return;

    const ability = pendingDiscardAbility;
    const newHand = hand.filter(c => c.id !== card.id);
    setGodAbilityUsesThisRound(prev => prev + 1);
    setPendingDiscardAbility(null);

    if (ability === 'aresDiscard') {
      setHand(newHand);
      setDiscard(prev => [...prev, card]);
      dealDamageToBoss(3);
      addLog(`Discarded ${card.name} for Ares: Dealt 3 damage`);
    } else if (ability === 'athenaDiscard') {
      addLog(`Discarded ${card.name} for Athena: Draw 2 cards`);
      drawCardsAfterDiscard(2, card, newHand);
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
    } else if (pendingDiscardAbility) {
      // When selecting a card for a god discard ability, resolve on click/tap instead of drag
      resolveGodDiscard(card);
      return;
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
    } else if (x > viewportWidth * 0.75) {
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

  const showBattlefield = gameState === 'playerTurn' || gameState === 'ready';
  const marketSlots = [0, 1, 2].map(index => market[index] || null);

  return (
    <div
      className={`game-board${draggingCard ? ' is-dragging' : ''}`}
      onMouseMove={handleCardDragMove}
      onMouseUp={handleCardDragEnd}
      onTouchMove={handleCardDragMove}
      onTouchEnd={handleCardDragEnd}
    >
      {/* Top HUD - Enemy HP (topmost) then Block */}
      {gameState !== 'abilityChoice' && gameState !== 'levelUp' && (
        <div className="top-hud">
          <div className="boss-hp-container">
            <div className="boss-name">{currentBoss?.name} - Round {roundNumber}</div>
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
          </div>
        </div>
      )}

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
                <div className="intent-card-row market-row">
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
              <div className="boss-placeholder">🐉</div>
              <div className="intent-card-row boss-cards-row">
                {bossCards.map(card => (
                  <div key={card.id} className="intent-card">
                    {card.symbols.map((symbol, index) => (
                      <span key={index} className="symbol-large">{symbol}</span>
                    ))}
                  </div>
                ))}
              </div>
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
            {abilityUI.tokenDisplays.map(token => (
              <div key={token.key} className="stat-item">{token.icon} {token.value}</div>
            ))}
            {nextAttackDoubled && (
              <div className="stat-item rage-active" title="Next attack doubled">💢×2</div>
            )}
          </div>
          <div className="hp-bar player-hp-bar">
            <div className="hp-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
            <span className="hp-text">{playerHP} / {playerMaxHP} HP</span>
          </div>
        </div>
      )}

      {/* Hand - Fixed at bottom */}
      {gameState === 'playerTurn' && (
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
              
              return (
                <div
                  key={card.id}
                  className={`card ${draggingCard?.id === card.id ? 'dragging' : ''} ${pendingDiscardAbility ? 'ability-target' : ''}`}
                  style={{
                    transform: `translateX(${horizontalOffset}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`,
                    zIndex: index,
                    '--hover-x': `${horizontalOffset}px`,
                    '--hover-y': `${verticalOffset}px`,
                    '--hover-rotation': `${rotation}deg`,
                  }}
                  onMouseDown={(e) => handleCardDragStart(card, e, 'hand')}
                  onTouchStart={(e) => handleCardDragStart(card, e, 'hand')}
                >
                  <div className="card-symbols-only">
                    {card.symbols.map((symbol, symbolIndex) => (
                      <span key={symbolIndex} className="symbol-large">{symbol}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hand-actions">
            {pendingDiscardAbility && (
              <div className="ability-prompt">
                Tap a card to discard
                <button
                  className="action-btn cancel-ability-btn"
                  onClick={() => setPendingDiscardAbility(null)}
                >
                  Cancel
                </button>
              </div>
            )}
            {abilityUI.buttons.map(button => (
              <button
                key={button.id}
                className={`action-btn ${button.className}${pendingDiscardAbility === button.action ? ' ability-armed' : ''}`}
                onClick={() => handleAbilityButton(button)}
                disabled={button.disabled && pendingDiscardAbility !== button.action}
              >
                {button.label}
                {button.usesRemaining != null ? ` (${button.usesRemaining})` : ''}
              </button>
            ))}
            <button className="action-btn end-turn" onClick={endTurn}>End Turn</button>
          </div>
        </div>
      )}

      {draggingCard && draggingSource === 'hand' && (
        <>
          {/* Play zone - center/middle (where the boss is) - only if player can afford */}
          {resources >= 1 && (
            <div className={`drop-zone drop-zone-center ${dropZone === 'play' ? 'active' : ''}`}>
              <div className="drop-zone-label">PLAY<br/>1 💎</div>
            </div>
          )}
          
          {/* Discard zone - right side - always available */}
          <div className={`drop-zone drop-zone-right ${dropZone === 'discard' ? 'active' : ''}`}>
            <div className="drop-zone-label">DISCARD<br/>+1 💎</div>
          </div>
          
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
          <div className="card-symbols-only">
            {draggingCard.symbols.map((symbol, index) => (
              <span key={index} className="symbol-large">{symbol}</span>
            ))}
          </div>
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
