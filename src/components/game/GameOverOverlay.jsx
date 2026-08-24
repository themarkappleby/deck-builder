function GameOverOverlay({ gameState, currentBoss, onRestart }) {
  if (gameState === 'victory') {
    return (
      <div className="center-content game-over-overlay">
        <h1>🎉 Victory! 🎉</h1>
        <p>You defeated all the bosses!</p>
        <button className="big-button" onClick={onRestart}>Play Again</button>
      </div>
    );
  }

  if (gameState === 'defeat') {
    return (
      <div className="center-content game-over-overlay">
        <h1>💀 Defeat 💀</h1>
        <p>You were defeated by {currentBoss?.name}</p>
        <button className="big-button" onClick={onRestart}>Try Again</button>
      </div>
    );
  }

  return null;
}

export default GameOverOverlay;
