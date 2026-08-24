function GameMenu({ gameState, showMenu, onToggleMenu, onCloseMenu, onViewStats, onRestart }) {
  if (gameState === 'abilityChoice' || gameState === 'levelUp') {
    return null;
  }

  return (
    <>
      <button className="menu-btn" onClick={onToggleMenu}>⋮</button>

      {showMenu && (
        <div className="menu-popover">
          <button
            className="menu-item"
            onClick={onViewStats}
          >
            📊 View Stats
          </button>
          <button
            className="menu-item"
            onClick={onRestart}
          >
            🔄 New Game
          </button>
        </div>
      )}

      {showMenu && (
        <div className="menu-backdrop" onClick={onCloseMenu}></div>
      )}
    </>
  );
}

export default GameMenu;
