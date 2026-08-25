import { useState } from 'react';
import { useGameBoard } from '../hooks/useGameBoard';
import AbilityChoiceOverlay from './game/AbilityChoiceOverlay';
import EndTurnConfirmOverlay from './game/EndTurnConfirmOverlay';
import LevelUpOverlay from './game/LevelUpOverlay';
import GameOverOverlay from './game/GameOverOverlay';
import MarketColumn from './game/MarketColumn';
import BossStage from './game/BossStage';
import PlayField from './game/PlayField';
import PlayerHud from './game/PlayerHud';
import PlayerHand from './game/PlayerHand';
import DropZones from './game/DropZones';
import GameMenu from './game/GameMenu';
import PlayerStatsOverlay from './game/PlayerStatsOverlay';
import './GameBoard.css';
import './GameBoardNew.css';
import './CardActionMenu.css';

const PLAY_COST = 1;

function GameBoard({ playerCharacter, onRestart }) {
  const game = useGameBoard(playerCharacter);
  const [showEndTurnConfirm, setShowEndTurnConfirm] = useState(false);

  const hasHandCards = game.hand.length > 0;
  const canPlayHandCard = hasHandCards && game.resources >= PLAY_COST;
  const canDiscardHandCard = hasHandCards && !game.cannotDiscardForResources;

  const requestEndTurn = () => {
    if (canPlayHandCard || canDiscardHandCard) {
      setShowEndTurnConfirm(true);
      return;
    }
    game.endTurn();
  };

  const confirmEndTurn = () => {
    setShowEndTurnConfirm(false);
    game.endTurn();
  };

  const showBattlefield = game.gameState === 'playerTurn' || game.gameState === 'ready' || game.gameState === 'assignDamage' || game.gameState === 'curseDiscard';
  const marketSlots = Array.from({ length: game.marketSlotCount }, (_, index) => game.market[index] || null);

  return (
    <div
      className={`game-board${game.draggingCard ? ' is-dragging' : ''}`}
      onMouseMove={game.handleCardDragMove}
      onMouseUp={game.handleCardDragEnd}
      onTouchMove={game.handleCardDragMove}
      onTouchEnd={game.handleCardDragEnd}
    >
      <div className={`center-area${game.gameState === 'abilityChoice' || game.gameState === 'levelUp' ? ' overlay-mode' : ''}`}>
        {game.gameState === 'abilityChoice' && (
          <AbilityChoiceOverlay
            playerCharacter={playerCharacter}
            onSelect={game.selectStartingAbility}
          />
        )}

        {showBattlefield && (
          <div className="center-content player-turn-layout">
            <div className="battlefield">
              <MarketColumn
                marketSlots={marketSlots}
                marketSlotCount={game.marketSlotCount}
                resources={game.resources}
                purchaseOrTrashCost={game.purchaseOrTrashCost}
                draggingCard={game.draggingCard}
                onCardDragStart={game.handleCardDragStart}
              />
              <BossStage
                currentBoss={game.currentBoss}
                bossNumber={game.bossNumber}
                roundNumber={game.roundNumber}
                bossHP={game.bossHP}
                bossMaxHP={game.bossMaxHP}
                bossBlock={game.bossBlock}
                bossBlockMax={game.bossBlockMax}
                bossTokens={game.bossTokens}
                bossCards={game.bossCards}
                marketSlotCount={game.marketSlotCount}
                bossAttack={game.bossAttack}
                playerBlock={game.playerBlock}
              />
              <PlayField
                playTokens={game.playTokens}
                gameState={game.gameState}
                incomingDamage={game.incomingDamage}
                onTokenClick={game.handleTokenClick}
                onTakeRemainingDamage={game.takeRemainingDamage}
              />
            </div>
          </div>
        )}

        {game.gameState === 'levelUp' && (
          <LevelUpOverlay
            playerCharacter={playerCharacter}
            raceLevel={game.raceLevel}
            classLevel={game.classLevel}
            godLevel={game.godLevel}
            levelUpPicksRemaining={game.levelUpPicksRemaining}
            onConfirmLevelUp={game.confirmLevelUp}
          />
        )}

        <GameOverOverlay
          gameState={game.gameState}
          currentBoss={game.currentBoss}
          onRestart={onRestart}
        />
      </div>

      <PlayerHud
        gameState={game.gameState}
        resources={game.resources}
        purchaseOrTrashCost={game.purchaseOrTrashCost}
        playerBlock={game.playerBlock}
        playTokens={game.playTokens}
        playerCharacter={playerCharacter}
        levels={game.levels}
        ignoreIncomingDamage={game.ignoreIncomingDamage}
        cannotDiscardForResources={game.cannotDiscardForResources}
        playerHP={game.playerHP}
        playerMaxHP={game.playerMaxHP}
        onOpenCharacterSheet={() => game.setShowPlayerStats(true)}
      />

      <PlayerHand
        gameState={game.gameState}
        hand={game.hand}
        draggingCard={game.draggingCard}
        pendingCurse={game.pendingCurse}
        abilityUI={game.abilityUI}
        getHandCardLabels={game.getHandCardLabels}
        onDiscardCursedCard={game.discardCursedCard}
        onCardDragStart={game.handleCardDragStart}
        onAbilityButton={game.handleAbilityButton}
        onEndTurn={requestEndTurn}
      />

      <DropZones
        draggingCard={game.draggingCard}
        draggingSource={game.draggingSource}
        dropZone={game.dropZone}
        resources={game.resources}
        purchaseOrTrashCost={game.purchaseOrTrashCost}
        cannotDiscardForResources={game.cannotDiscardForResources}
        dragPosition={game.dragPosition}
        getHandCardLabels={game.getHandCardLabels}
      />

      <PlayerStatsOverlay
        showPlayerStats={game.showPlayerStats}
        playerCharacter={playerCharacter}
        raceLevel={game.raceLevel}
        classLevel={game.classLevel}
        godLevel={game.godLevel}
        deck={game.deck}
        hand={game.hand}
        discard={game.discard}
        getCardLabels={game.getHandCardLabels}
        onClose={() => game.setShowPlayerStats(false)}
      />

      {(game.gameState === 'playerTurn' || game.gameState === 'curseDiscard') && (
        <button
          className="undo-btn"
          onClick={game.undoLastAction}
          disabled={!game.canUndo}
          title={game.canUndo ? 'Undo last action this turn' : 'No actions to undo this turn'}
        >
          Undo
        </button>
      )}

      <EndTurnConfirmOverlay
        open={showEndTurnConfirm}
        canPlay={canPlayHandCard}
        canDiscard={canDiscardHandCard}
        onCancel={() => setShowEndTurnConfirm(false)}
        onConfirm={confirmEndTurn}
      />

      <GameMenu
        showMenu={game.showMenu}
        showDebug={game.showDebug}
        debugBossCardsPerTurn={game.debugBossCardsPerTurn}
        debugPlayerCardsPerTurn={game.debugPlayerCardsPerTurn}
        debugBossStartingHealth={game.debugBossStartingHealth}
        onToggleMenu={() => game.setShowMenu(!game.showMenu)}
        onCloseMenu={() => game.setShowMenu(false)}
        onRestart={() => {
          game.setShowMenu(false);
          onRestart();
        }}
        onOpenDebug={() => {
          game.setShowDebug(true);
          game.setShowMenu(false);
        }}
        onCloseDebug={() => game.setShowDebug(false)}
        onDebugBossCardsChange={game.setDebugBossCardsPerTurn}
        onDebugPlayerCardsChange={game.setDebugPlayerCardsPerTurn}
        onDebugBossStartingHealthChange={game.applyDebugBossStartingHealth}
      />
    </div>
  );
}

export default GameBoard;
