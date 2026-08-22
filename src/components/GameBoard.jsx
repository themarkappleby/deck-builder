import React, { useState, useEffect, useRef } from 'react';
import { getStartingDeck, marketCards, bosses, SYMBOLS } from '../gameData';
import Card from './Card';
import './GameBoard.css';

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
  
  const logContentRef = useRef(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [log]);

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
    drawCards(5);
    setPlayerBlock(0);
    setResources(0);
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
      } else if (symbol === SYMBOLS.BLOCK) {
        block += 1;
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
      setRaceLevel(2);
      addLog('Race leveled up to 2!');
    } else if (cardType === 'class' && classLevel < 2) {
      setClassLevel(2);
      addLog('Class leveled up to 2!');
    } else if (cardType === 'god' && godLevel < 2) {
      setGodLevel(2);
      addLog('God leveled up to 2!');
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
      <div className="game-header">
        <button className="restart-button" onClick={onRestart}>New Game</button>
        <h1>Boss Battle - Round {roundNumber}</h1>
      </div>

      <div className="game-layout">
        <div className="left-panel">
          <div className="boss-section">
            <h2>{currentBoss?.name} (Boss {bossNumber})</h2>
            <div className="hp-bar">
              <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
              <span className="hp-text">{bossHP} / {bossMaxHP} HP</span>
            </div>
            {bossAction && gameState === 'playerTurn' && (
              <div className="boss-intent">
                <strong>Next Action:</strong> {bossAction.description}
              </div>
            )}
          </div>

          <div className="player-section">
            <h2>Your Character</h2>
            <div className="hp-bar player-hp">
              <div className="hp-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
              <span className="hp-text">{playerHP} / {playerMaxHP} HP</span>
            </div>
            <div className="player-stats">
              <div>🛡️ Block: {playerBlock}</div>
              <div>💎 Resources: {resources}</div>
              <div>🎴 Deck: {deck.length}</div>
              <div>🗑️ Discard: {discard.length}</div>
            </div>

            <div className="character-cards">
              <div className="character-card">
                <strong>{playerCharacter.race.name}</strong>
                <div className={`level-display ${raceLevel >= 1 ? 'active' : ''}`}>
                  <small>L1: {playerCharacter.race.level1.effect}</small>
                </div>
                {raceLevel >= 2 && (
                  <div className="level-display active">
                    <small>L2: {playerCharacter.race.level2.effect}</small>
                  </div>
                )}
              </div>
              
              {classLevel > 0 && (
                <div className="character-card">
                  <strong>{playerCharacter.class.name}</strong>
                  <div className={`level-display ${classLevel >= 1 ? 'active' : ''}`}>
                    <small>L1: {playerCharacter.class.level1.effect}</small>
                  </div>
                  {classLevel >= 2 && (
                    <div className="level-display active">
                      <small>L2: {playerCharacter.class.level2.effect}</small>
                    </div>
                  )}
                </div>
              )}

              {godLevel > 0 && (
                <div className="character-card">
                  <strong>{playerCharacter.god.name}</strong>
                  <div className={`level-display ${godLevel >= 1 ? 'active' : ''}`}>
                    <small>L1: {playerCharacter.god.level1.effect}</small>
                  </div>
                  {godLevel >= 2 && (
                    <div className="level-display active">
                      <small>L2: {playerCharacter.god.level2.effect}</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="center-panel">
          {gameState === 'ready' && (
            <div className="action-area">
              <button className="big-button" onClick={startRound}>Start Round {roundNumber}</button>
            </div>
          )}

          {gameState === 'playerTurn' && (
            <>
              <div className="hand-section">
                <h3>Your Hand ({hand.length} cards) - Resources: {resources} 💎</h3>
                <div className="card-row">
                  {hand.map(card => (
                    <Card
                      key={card.id}
                      card={card}
                      onClick={() => playCard(card)}
                      onDiscard={() => discardForResource(card)}
                      onTrash={() => trashCard(card)}
                      canAfford={resources >= card.symbols.length}
                    />
                  ))}
                </div>
              </div>

              <div className="action-area">
                <button className="end-turn-button" onClick={endTurn}>End Turn</button>
              </div>

              <div className="market-section">
                <h3>Market</h3>
                <div className="card-row">
                  {market.map(card => (
                    <Card
                      key={card.id}
                      card={card}
                      onClick={() => purchaseCard(card)}
                      isMarket={true}
                      canAfford={resources >= card.symbols.length}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {gameState === 'levelUp' && (
            <div className="level-up-section">
              <h2>Level Up! Choose 2 cards to upgrade:</h2>
              <div className="level-up-options">
                <button onClick={() => levelUpCharacter('race')}>
                  Level Up Race {raceLevel < 2 ? `(${raceLevel} → 2)` : '(Max)'}
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
            <div className="game-over">
              <h1>🎉 Victory! 🎉</h1>
              <p>You defeated all the bosses!</p>
              <button className="big-button" onClick={onRestart}>Play Again</button>
            </div>
          )}

          {gameState === 'defeat' && (
            <div className="game-over">
              <h1>💀 Defeat 💀</h1>
              <p>You were defeated by {currentBoss?.name}</p>
              <button className="big-button" onClick={onRestart}>Try Again</button>
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="log-section">
            <h3>Game Log</h3>
            <div className="log-content" ref={logContentRef}>
              {log.map((entry, index) => (
                <div key={index} className="log-entry">{entry}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
