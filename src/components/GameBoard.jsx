import React, { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, bosses, SYMBOLS } from '../gameData';
import Card from './Card';
import CardActionMenu from './CardActionMenu';
import './GameBoard.css';
import './GameBoardNew.css';

function GameBoard({ playerCharacter, onRestart }) {
  const [gameState, setGameState] = useState('setup');
  const [bossNumber, setBossNumber] = useState(1);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHP, setBossHP] = useState(0);
  const [bossMaxHP, setBossMaxHP] = useState(0);
  const [bossAction, setBossAction] = useState(null);
  
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
    const initialMarket = marketDeckShuffled.slice(0, 5).map((card, index) => ({
      ...card,
      id: `${card.id}_market_${index}_${Date.now()}`
    }));
    
    setDeck(shuffled);
    setMarketDeck(marketDeckShuffled.slice(5));
    setMarket(initialMarket);
    
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
    setGameState('ready');
  };

  const startRound = () => {
    const action = rollBossAction();
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
    
    drawCards(cardsToDraw);
    setPlayerBlock(0);
    setGameState('playerTurn');
    addLog(`Round ${roundNumber} - Boss will: ${action.description}`);
  };

  const rollBossAction = () => {
    const bossLevel = bossNumber === 1 ? 'level1' : bossNumber === 2 ? 'level2' : 'level3';
    const actions = currentBoss[bossLevel].actions;
    const randomIndex = Math.floor(Math.random() * actions.length);
    return actions[randomIndex];
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
    const cost = card.symbols.length;
    if (resources < cost) {
      addLog(`Not enough resources! Need ${cost}, have ${resources}`);
      return;
    }

    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setResources(prev => prev - cost);

    let damage = 0;
    let block = 0;

    card.symbols.forEach(symbol => {
      if (symbol === SYMBOLS.ATTACK) {
        damage += 1;
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
    if (currentMarket.length < 5 && marketDeck.length > 0) {
      const newCards = marketDeck.slice(0, 2).map((card, index) => ({
        ...card,
        id: `${card.id}_market_${Date.now()}_${index}`
      }));
      setMarket([...newCards, ...currentMarket.slice(0, -1)]);
      setMarketDeck(marketDeck.slice(2));
    } else {
      setMarket(currentMarket);
    }
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

  return (
    <div className="game-board">
      {/* Top HUD - Boss HP */}
      <div className="top-hud">
        <div className="boss-hp-container">
          <div className="boss-name">{currentBoss?.name} - Round {roundNumber}</div>
          <div className="hp-bar boss-hp-bar">
            <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
            <span className="hp-text">{bossHP} / {bossMaxHP}</span>
          </div>
        </div>
      </div>

      {/* Center Area - Boss Display */}
      <div className="center-area">
        {gameState === 'playerTurn' && (
          <div className="center-content">
            <div className="boss-display">
              <div className="boss-placeholder">🐉</div>
              {bossAction && (
                <div className="boss-intent">
                  {bossAction.description}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="center-content level-up-overlay">
            <h2>Level Up! Choose 2 cards:</h2>
            <div className="level-up-options">
              <button onClick={() => levelUpCharacter('race')}>
                Level Up Race {raceLevel < 2 ? `(${raceLevel} → ${raceLevel + 1})` : '(Max)'}
              </button>
              <button onClick={() => levelUpCharacter('class')}>
                Level Up Class {classLevel < 2 ? `(${classLevel} → ${classLevel + 1})` : '(Max)'}
              </button>
              <button onClick={() => levelUpCharacter('god')}>
                Level Up God {godLevel < 2 ? `(${godLevel} → ${godLevel + 1})` : '(Max)'}
              </button>
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
      <div className="bottom-hud">
        <div className="player-stats-bar">
          <div className="stat-item">💎 {resources}</div>
          <div className="stat-item">🛡️ {playerBlock}</div>
          <div className="stat-item">🎴 {deck.length}</div>
          <div className="stat-item">🗑️ {discard.length}</div>
        </div>
        <div className="hp-bar player-hp-bar">
          <div className="hp-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
          <span className="hp-text">{playerHP} / {playerMaxHP} HP</span>
        </div>
      </div>

      {/* Hand - Fixed at bottom */}
      {gameState === 'playerTurn' && (
        <div className="hand-container">
          <div className="hand-row">
            {hand.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={() => {
                  setSelectedCard(card);
                  setSelectedCardIsMarket(false);
                }}
                canAfford={resources >= card.symbols.length}
              />
            ))}
          </div>
          <div className="hand-actions">
            <button className="action-btn end-turn" onClick={endTurn}>End Turn</button>
          </div>
        </div>
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
                <div className="ability-box">
                  <strong>Level 1:</strong>
                  <p>{playerCharacter.race.level1.effect}</p>
                  <p>🟣 = {playerCharacter.race.level1.symbolEffect}</p>
                </div>
                {raceLevel >= 2 && (
                  <div className="ability-box active">
                    <strong>Level 2:</strong>
                    <p>{playerCharacter.race.level2.effect}</p>
                    {playerCharacter.race.level2.additionalEffect && (
                      <p>{playerCharacter.race.level2.additionalEffect}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="character-section">
                <h4>{playerCharacter.class.name} (Side {playerCharacter.class.side}) - Level {classLevel}</h4>
                {classLevel >= 1 && (
                  <div className="ability-box active">
                    <strong>Level 1:</strong>
                    <p>{playerCharacter.class.level1.effect}</p>
                  </div>
                )}
                {classLevel >= 2 && (
                  <div className="ability-box active">
                    <strong>Level 2:</strong>
                    <p>{playerCharacter.class.level2.effect}</p>
                    {playerCharacter.class.level2.additionalEffect && (
                      <p>{playerCharacter.class.level2.additionalEffect}</p>
                    )}
                  </div>
                )}
                {classLevel === 0 && (
                  <div className="ability-box">
                    <strong>Level 1:</strong>
                    <p>{playerCharacter.class.level1.effect}</p>
                  </div>
                )}
              </div>

              <div className="character-section">
                <h4>{playerCharacter.god.name} (Side {playerCharacter.god.side}) - Level {godLevel}</h4>
                {godLevel >= 1 && (
                  <div className="ability-box active">
                    <strong>Level 1:</strong>
                    <p>{playerCharacter.god.level1.effect}</p>
                  </div>
                )}
                {godLevel >= 2 && (
                  <div className="ability-box active">
                    <strong>Level 2:</strong>
                    <p>{playerCharacter.god.level2.effect}</p>
                    {playerCharacter.god.level2.additionalEffect && (
                      <p>{playerCharacter.god.level2.additionalEffect}</p>
                    )}
                  </div>
                )}
                {godLevel === 0 && (
                  <div className="ability-box">
                    <strong>Level 1:</strong>
                    <p>{playerCharacter.god.level1.effect}</p>
                  </div>
                )}
              </div>
            </div>

            <button className="close-stats-btn" onClick={() => setShowPlayerStats(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Menu button */}
      <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
      
      {/* Menu popover */}
      {showMenu && (
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

      {/* Card Action Menu */}
      {selectedCard && (
        <CardActionMenu
          card={selectedCard}
          isMarket={selectedCardIsMarket}
          canAfford={resources >= selectedCard.symbols.length}
          onPlay={() => {
            playCard(selectedCard);
            setSelectedCard(null);
          }}
          onDiscard={() => {
            discardForResource(selectedCard);
            setSelectedCard(null);
          }}
          onTrash={() => {
            trashCard(selectedCard);
            setSelectedCard(null);
          }}
          onBuy={() => {
            purchaseCard(selectedCard);
            setSelectedCard(null);
          }}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

export default GameBoard;
