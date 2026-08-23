import React, { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, bosses, SYMBOLS } from '../gameData';
import Card from './Card';
import './GameBoard.css';
import './GameBoardNew.css';
import './CardActionMenu.css';

function GameBoard({ playerCharacter, onRestart }) {
  const [gameState, setGameState] = useState('setup');
  const [bossNumber, setBossNumber] = useState(1);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHP, setBossHP] = useState(0);
  const [bossMaxHP, setBossMaxHP] = useState(0);
  const [bossAction, setBossAction] = useState(null);
  const [bossCards, setBossCards] = useState([]);
  
  const [playerHP, setPlayerHP] = useState(10);
  const [playerMaxHP, setPlayerMaxHP] = useState(10);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerTokens, setPlayerTokens] = useState({});
  
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [resources, setResources] = useState(0);
  
  const [market, setMarket] = useState([]);
  const [marketDeck, setMarketDeck] = useState([]);
  
  const [raceLevel, setRaceLevel] = useState(1);
  const [classLevel, setClassLevel] = useState(0);
  const [godLevel, setGodLevel] = useState(0);
  
  const [log, setLog] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardIsMarket, setSelectedCardIsMarket] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropZone, setDropZone] = useState(null); // 'play', 'discard', 'trash', or null
  
  const logContentRef = useRef(null);

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
    // Draw 3 cards for boss action
    let currentMarketDeck = [...marketDeck];
    const drawnBossCards = [];
    
    for (let i = 0; i < 3 && currentMarketDeck.length > 0; i++) {
      const card = currentMarketDeck.pop();
      drawnBossCards.push({
        ...card,
        id: `${card.id}_boss_${Date.now()}_${i}`
      });
    }
    
    setMarketDeck(currentMarketDeck);
    setBossCards(drawnBossCards);
    
    // Calculate boss action from drawn cards
    const action = calculateBossActionFromCards(drawnBossCards);
    setBossAction(action);
    
    // Determine how many cards to draw based on race
    let cardsToDraw = 5;
    if (playerCharacter.race.id === 'elf') {
      if (raceLevel >= 2) {
        cardsToDraw = 7;
      } else if (raceLevel >= 1) {
        cardsToDraw = 6;
      }
    }
    
    // Vampire B Level 2: Start each round with +1 blood token
    if (playerCharacter.race.id === 'vampire' && playerCharacter.race.side === 'B' && raceLevel >= 2) {
      setPlayerTokens(prev => ({
        ...prev,
        blood: (prev.blood || 0) + 1
      }));
      addLog('Gained 1 blood token (Vampire Level 2)');
    }
    
    drawCards(cardsToDraw);
    setPlayerBlock(0);
    setGameState('playerTurn');
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
    
    // Boss attacks for damage equal to attack symbols
    const damage = attackCount;
    
    return {
      type: 'attack',
      value: damage,
      description: `Attacks for ${damage} damage`
    };
  };

  const drawCards = (count) => {
    let currentDeck = [...deck];
    let currentDiscard = [...discard];
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
    setHand(prev => [...prev, ...drawnCards]);
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

    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setDiscard(prev => [...prev, card]);
    setResources(prev => prev - cost);

    let damage = 0;
    let block = 0;

    let bloodTokensGained = 0;
    
    card.symbols.forEach(symbol => {
      if (symbol === SYMBOLS.ATTACK) {
        damage += 1;
        // Apply Vampire blood token gain
        if (playerCharacter.race.id === 'vampire' && raceLevel >= 1) {
          bloodTokensGained++;
        }
        // Apply Warrior class bonus
        if (playerCharacter.class.id === 'warrior' && playerCharacter.class.side === 'A') {
          if (classLevel >= 2) {
            damage += 2;
          } else if (classLevel >= 1) {
            damage += 1;
          }
        }
      } else if (symbol === SYMBOLS.BLOCK) {
        block += 1;
        // Apply Priest class bonus
        if (playerCharacter.class.id === 'priest' && playerCharacter.class.side === 'A') {
          if (classLevel >= 2) {
            block += 2;
          } else if (classLevel >= 1) {
            block += 1;
          }
        }
        // Apply Dwarf race bonus
        if (playerCharacter.race.id === 'dwarf' && raceLevel >= 2) {
          block += 1;
        }
      } else if (symbol === SYMBOLS.PURPLE && raceLevel >= 1) {
        const effect = playerCharacter.race.level1.symbolEffect;
        addLog(`🟣 effect: ${effect}`);
      }
    });

    if (bloodTokensGained > 0) {
      setPlayerTokens(prev => ({
        ...prev,
        blood: (prev.blood || 0) + bloodTokensGained
      }));
      addLog(`Gained ${bloodTokensGained} blood token${bloodTokensGained > 1 ? 's' : ''} (Total: ${(playerTokens.blood || 0) + bloodTokensGained})`);
    }

    if (damage > 0) {
      dealDamageToBoss(damage);
    }

    if (block > 0) {
      setPlayerBlock(prev => prev + block);
      addLog(`Gained ${block} block (Total: ${playerBlock + block})`);
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

  const dealDamageToBoss = (damage) => {
    const newHP = Math.max(0, bossHP - damage);
    setBossHP(newHP);
    addLog(`Dealt ${damage} damage to boss! (${newHP}/${bossMaxHP} HP)`);

    if (newHP === 0) {
      handleBossDefeated();
    }
  };

  const handleBossDefeated = () => {
    addLog(`Boss defeated!`);
    
    if (bossNumber === 3) {
      setGameState('victory');
      addLog('Victory! You won the game!');
    } else {
      setGameState('levelUp');
      addLog('Choose 2 cards to level up!');
    }
  };

  const endTurn = () => {
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

    // Boss cards become the new market
    setMarket(bossCards);
    setBossCards([]);
    addLog('Boss cards moved to market!');

    setRoundNumber(prev => prev + 1);
    setGameState('ready');
  };

  const levelUpCharacter = (cardType) => {
    if (cardType === 'race' && raceLevel < 2) {
      const newLevel = raceLevel + 1;
      setRaceLevel(newLevel);
      addLog(`Race leveled up to ${newLevel}!`);
      
      // Apply Dwarf HP bonus when leveling up
      if (playerCharacter.race.id === 'dwarf') {
        if (newLevel === 2) {
          const newMaxHP = 14;
          setPlayerMaxHP(newMaxHP);
          setPlayerHP(prev => prev + 2); // Heal 2 HP when max increases
          addLog('Max HP increased to 14!');
        }
      }
    } else if (cardType === 'class' && classLevel < 2) {
      const newLevel = classLevel + 1;
      setClassLevel(newLevel);
      addLog(`Class leveled up to ${newLevel}!`);
    } else if (cardType === 'god' && godLevel < 2) {
      const newLevel = godLevel + 1;
      setGodLevel(newLevel);
      addLog(`God leveled up to ${newLevel}!`);
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
    setRoundNumber(1);
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
    if (playerCharacter.race.id !== 'vampire') return;
    
    const bloodTokens = playerTokens.blood || 0;
    const requiredTokens = raceLevel >= 2 ? 2 : 3;
    
    if (bloodTokens < requiredTokens) {
      addLog(`Not enough blood tokens! Need ${requiredTokens}, have ${bloodTokens}`);
      return;
    }
    
    // Spend tokens
    setPlayerTokens(prev => ({
      ...prev,
      blood: (prev.blood || 0) - requiredTokens
    }));
    
    // Apply effect based on vampire side
    if (playerCharacter.race.side === 'A') {
      // Vampire A: Heal
      const healAmount = 1;
      const newHP = Math.min(playerMaxHP, playerHP + healAmount);
      setPlayerHP(newHP);
      addLog(`Spent ${requiredTokens} blood tokens: Healed 1 HP (${newHP}/${playerMaxHP})`);
    } else {
      // Vampire B: Deal damage
      const damageAmount = raceLevel >= 2 ? 3 : 2;
      dealDamageToBoss(damageAmount);
      addLog(`Spent ${requiredTokens} blood tokens: Dealt ${damageAmount} damage to boss`);
    }
  };

  const handleCardDragStart = (card, e) => {
    if (selectedCardIsMarket) return; // Don't allow dragging market cards
    setDraggingCard(card);
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

    // Detect drop zones
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const canAffordPlay = resources >= 1; // Playing costs 1
    const canAffordTrash = resources >= draggingCard.symbols.length; // Trashing costs symbol count
    
    if (x < viewportWidth * 0.25) {
      setDropZone('discard');
    } else if (x > viewportWidth * 0.75 && canAffordPlay) {
      setDropZone('play');
    } else if (y < viewportHeight * 0.25 && canAffordTrash) {
      setDropZone('trash');
    } else {
      setDropZone(null);
    }
  };

  const handleCardDragEnd = () => {
    if (!draggingCard) return;
    
    const card = draggingCard;
    
    if (dropZone === 'play') {
      playCard(card);
    } else if (dropZone === 'discard') {
      discardForResource(card);
    } else if (dropZone === 'trash') {
      trashCard(card);
    }
    
    setDraggingCard(null);
    setDropZone(null);
  };

  return (
    <div className="game-board">
      {/* Top HUD - Boss HP */}
      {gameState !== 'abilityChoice' && gameState !== 'levelUp' && (
        <div className="top-hud">
          <div className="boss-hp-container">
            <div className="boss-name">{currentBoss?.name} - Round {roundNumber}</div>
            <div className="hp-bar boss-hp-bar">
              <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
              <span className="hp-text">{bossHP} / {bossMaxHP}</span>
            </div>
          </div>
        </div>
      )}

      {/* Center Area - Boss Display */}
      <div className="center-area">
        {gameState === 'abilityChoice' && (
          <div className="center-content level-up-overlay">
            <h2>Choose Your Starting Ability</h2>
            <div className="level-up-options">
              <button onClick={() => selectStartingAbility('race')}>
                <strong>{playerCharacter.race.name} - Level 2</strong>
                <p>{playerCharacter.race.level2.effect}</p>
                {playerCharacter.race.level2.additionalEffect && (
                  <p>{playerCharacter.race.level2.additionalEffect}</p>
                )}
              </button>
              <button onClick={() => selectStartingAbility('class')}>
                <strong>{playerCharacter.class.name} - Level 1</strong>
                <p>{playerCharacter.class.level1.effect}</p>
              </button>
              <button onClick={() => selectStartingAbility('god')}>
                <strong>{playerCharacter.god.name} - Level 1</strong>
                <p>{playerCharacter.god.level1.effect}</p>
              </button>
            </div>
          </div>
        )}

        {gameState === 'playerTurn' && (
          <div className="center-content">
            <div className="boss-display">
              <div className="boss-placeholder">🐉</div>
              {bossAction && (
                <div className="boss-intent">
                  <div className="boss-intent-text">{bossAction.description}</div>
                  {bossCards.length > 0 && (
                    <div className="boss-cards">
                      {bossCards.map(card => (
                        <div key={card.id} className="boss-card">
                          {card.symbols.map((symbol, index) => (
                            <span key={index} className="boss-card-symbol">{symbol}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="center-content level-up-overlay">
            <h2>Level Up! Choose 2 cards:</h2>
            <div className="level-up-options">
              {raceLevel < 2 && (
                <button onClick={() => levelUpCharacter('race')}>
                  <strong>{playerCharacter.race.name} - Level {raceLevel} → {raceLevel + 1}</strong>
                  <p>{playerCharacter.race.level2.effect}</p>
                  {playerCharacter.race.level2.additionalEffect && (
                    <p>{playerCharacter.race.level2.additionalEffect}</p>
                  )}
                </button>
              )}
              {raceLevel >= 2 && (
                <button disabled>
                  <strong>{playerCharacter.race.name} - Max Level</strong>
                  <p>Already at maximum level</p>
                </button>
              )}
              
              {classLevel < 2 && (
                <button onClick={() => levelUpCharacter('class')}>
                  <strong>{playerCharacter.class.name} - Level {classLevel} → {classLevel + 1}</strong>
                  {classLevel === 0 && (
                    <p>{playerCharacter.class.level1.effect}</p>
                  )}
                  {classLevel === 1 && (
                    <>
                      <p>{playerCharacter.class.level2.effect}</p>
                      {playerCharacter.class.level2.additionalEffect && (
                        <p>{playerCharacter.class.level2.additionalEffect}</p>
                      )}
                    </>
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
                <button onClick={() => levelUpCharacter('god')}>
                  <strong>{playerCharacter.god.name} - Level {godLevel} → {godLevel + 1}</strong>
                  {godLevel === 0 && (
                    <p>{playerCharacter.god.level1.effect}</p>
                  )}
                  {godLevel === 1 && (
                    <>
                      <p>{playerCharacter.god.level2.effect}</p>
                      {playerCharacter.god.level2.additionalEffect && (
                        <p>{playerCharacter.god.level2.additionalEffect}</p>
                      )}
                    </>
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
            <button className="big-button" onClick={startNextBoss}>Continue to Next Boss</button>
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

      {/* Bottom HUD - Player Stats & HP */}
      {gameState !== 'abilityChoice' && gameState !== 'levelUp' && (
        <div className="bottom-hud">
          <div className="player-stats-bar">
            <div className="stat-item">💎 {resources}</div>
            <div className="stat-item">🛡️ {playerBlock}</div>
            <div className="stat-item">🎴 {deck.length}</div>
            <div className="stat-item">🗑️ {discard.length}</div>
            {playerCharacter.race.id === 'vampire' && raceLevel >= 1 && (
              <div className="stat-item">🩸 {playerTokens.blood || 0}</div>
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
        <div 
          className="hand-container"
          onMouseMove={handleCardDragMove}
          onMouseUp={handleCardDragEnd}
          onTouchMove={handleCardDragMove}
          onTouchEnd={handleCardDragEnd}
        >
          <div className="hand-row">
            {hand.map(card => (
              <div
                key={card.id}
                className={`card ${draggingCard?.id === card.id ? 'dragging' : ''} ${resources < 1 ? 'unaffordable' : ''}`}
                onMouseDown={(e) => handleCardDragStart(card, e)}
                onTouchStart={(e) => handleCardDragStart(card, e)}
              >
                <div className="card-symbols-only">
                  {card.symbols.map((symbol, index) => (
                    <span key={index} className="symbol-large">{symbol}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hand-actions">
            {playerCharacter.race.id === 'vampire' && raceLevel >= 1 && (
              <button 
                className="action-btn blood-btn" 
                onClick={spendBloodTokens}
                disabled={(playerTokens.blood || 0) < (raceLevel >= 2 ? 2 : 3)}
              >
                🩸 Spend ({raceLevel >= 2 ? 2 : 3})
              </button>
            )}
            <button className="action-btn end-turn" onClick={endTurn}>End Turn</button>
          </div>
        </div>
      )}

      {/* Drop Zones - Show when dragging */}
      {draggingCard && (
        <>
          {/* Discard zone - always available */}
          <div className={`drop-zone drop-zone-left ${dropZone === 'discard' ? 'active' : ''}`}>
            <div className="drop-zone-label">DISCARD<br/>+1 💎</div>
          </div>
          
          {/* Play zone - only if player can afford */}
          {resources >= 1 && (
            <div className={`drop-zone drop-zone-right ${dropZone === 'play' ? 'active' : ''}`}>
              <div className="drop-zone-label">PLAY<br/>1 💎</div>
            </div>
          )}
          
          {/* Trash zone - only if player can afford */}
          {resources >= draggingCard.symbols.length && (
            <div className={`drop-zone drop-zone-top ${dropZone === 'trash' ? 'active' : ''}`}>
              <div className="drop-zone-label">TRASH<br/>{draggingCard.symbols.length} 💎</div>
            </div>
          )}
          
          {/* Floating card that follows cursor/finger */}
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
        </>
      )}

      {/* Market Overlay */}
      {showMarket && gameState === 'playerTurn' && (
        <div className="market-overlay">
          <div className="market-content">
            <h3>Market</h3>
            <div className="market-grid">
              {market.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => {
                    setSelectedCard(card);
                    setSelectedCardIsMarket(true);
                  }}
                  isMarket={true}
                  canAfford={resources >= card.symbols.length}
                />
              ))}
            </div>
            <button className="close-market-btn" onClick={() => setShowMarket(false)}>Close Market</button>
          </div>
        </div>
      )}

      {/* Player Stats Overlay */}
      {showPlayerStats && (
        <div className="player-stats-overlay">
          <div className="player-stats-content">
            <h3>Your Character</h3>
            
            <div className="character-info">
              <div className="character-section">
                <h4>{playerCharacter.race.name} (Side {playerCharacter.race.side}) - Level {raceLevel}</h4>
                <div className={`ability-box ${raceLevel >= 1 ? 'active' : ''}`}>
                  <strong>Level 1:</strong>
                  <p>{playerCharacter.race.level1.effect}</p>
                  <p>🟣 = {playerCharacter.race.level1.symbolEffect}</p>
                </div>
                <div className={`ability-box ${raceLevel >= 2 ? 'active' : ''}`}>
                  <strong>Level 2:</strong>
                  <p>{playerCharacter.race.level2.effect}</p>
                  {playerCharacter.race.level2.additionalEffect && (
                    <p>{playerCharacter.race.level2.additionalEffect}</p>
                  )}
                </div>
              </div>

              <div className="character-section">
                <h4>{playerCharacter.class.name} (Side {playerCharacter.class.side}) - Level {classLevel}</h4>
                <div className={`ability-box ${classLevel >= 1 ? 'active' : ''}`}>
                  <strong>Level 1:</strong>
                  <p>{playerCharacter.class.level1.effect}</p>
                </div>
                <div className={`ability-box ${classLevel >= 2 ? 'active' : ''}`}>
                  <strong>Level 2:</strong>
                  <p>{playerCharacter.class.level2.effect}</p>
                  {playerCharacter.class.level2.additionalEffect && (
                    <p>{playerCharacter.class.level2.additionalEffect}</p>
                  )}
                </div>
              </div>

              <div className="character-section">
                <h4>{playerCharacter.god.name} (Side {playerCharacter.god.side}) - Level {godLevel}</h4>
                <div className={`ability-box ${godLevel >= 1 ? 'active' : ''}`}>
                  <strong>Level 1:</strong>
                  <p>{playerCharacter.god.level1.effect}</p>
                </div>
                <div className={`ability-box ${godLevel >= 2 ? 'active' : ''}`}>
                  <strong>Level 2:</strong>
                  <p>{playerCharacter.god.level2.effect}</p>
                  {playerCharacter.god.level2.additionalEffect && (
                    <p>{playerCharacter.god.level2.additionalEffect}</p>
                  )}
                </div>
              </div>
            </div>

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
              setShowMarket(true);
              setShowMenu(false);
            }}
          >
            🛒 Market
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

      {/* Market Card Purchase Menu */}
      {selectedCard && selectedCardIsMarket && (
        <>
          <div className="action-menu-overlay" onClick={() => setSelectedCard(null)} />
          <div className="action-menu">
            <div className="action-menu-header">
              <div className="action-menu-card-preview">
                {selectedCard.symbols.map((symbol, index) => (
                  <span key={index} className="preview-symbol">{symbol}</span>
                ))}
              </div>
              <div className="action-menu-cost">Cost: {selectedCard.symbols.length} 💎</div>
            </div>
            <div className="action-menu-buttons">
              <button
                className="action-button buy-button"
                onClick={() => {
                  purchaseCard(selectedCard);
                  setSelectedCard(null);
                }}
                disabled={resources < selectedCard.symbols.length}
              >
                💰 Buy Card ({selectedCard.symbols.length} 💎)
              </button>
              <button className="action-button cancel-button" onClick={() => setSelectedCard(null)}>
                ✖️ Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GameBoard;
