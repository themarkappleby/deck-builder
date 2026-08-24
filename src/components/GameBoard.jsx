import { formatBossAbilityLines } from '../abilityActions';
import { useGameBoard } from '../hooks/useGameBoard';
import AbilityChoiceOverlay from './game/AbilityChoiceOverlay';
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

function GameBoard({ playerCharacter, onRestart }) {
  const game = useGameBoard(playerCharacter);

  const showBattlefield = game.gameState === 'playerTurn' || game.gameState === 'ready' || game.gameState === 'assignDamage' || game.gameState === 'curseDiscard';
  const bossAbilityLines = formatBossAbilityLines(game.currentBoss);
  const marketSlots = [0, 1, 2].map(index => game.market[index] || null);

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
                resources={game.resources}
                draggingCard={game.draggingCard}
                onCardDragStart={game.handleCardDragStart}
              />
              <BossStage
                currentBoss={game.currentBoss}
                roundNumber={game.roundNumber}
                bossAbilityLines={bossAbilityLines}
                bossHP={game.bossHP}
                bossMaxHP={game.bossMaxHP}
                bossBlock={game.bossBlock}
                bossBlockMax={game.bossBlockMax}
                bossTokens={game.bossTokens}
                bossCards={game.bossCards}
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
            onLevelUp={game.levelUpCharacter}
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
        deckLength={game.deck.length}
        discardLength={game.discard.length}
        playerBlock={game.playerBlock}
        playTokens={game.playTokens}
        playerCharacter={playerCharacter}
        levels={game.levels}
        ignoreIncomingDamage={game.ignoreIncomingDamage}
        cannotDiscardForResources={game.cannotDiscardForResources}
        playerHP={game.playerHP}
        playerMaxHP={game.playerMaxHP}
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
        onEndTurn={game.endTurn}
      />

      <DropZones
        draggingCard={game.draggingCard}
        draggingSource={game.draggingSource}
        dropZone={game.dropZone}
        resources={game.resources}
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
        onClose={() => game.setShowPlayerStats(false)}
      />

      <GameMenu
        gameState={game.gameState}
        showMenu={game.showMenu}
        onToggleMenu={() => game.setShowMenu(!game.showMenu)}
        onCloseMenu={() => game.setShowMenu(false)}
        onViewStats={() => {
          game.setShowPlayerStats(true);
          game.setShowMenu(false);
        }}
        onRestart={() => {
          game.setShowMenu(false);
          onRestart();
        }}
      />
    </div>
  );
}

export default GameBoard;
