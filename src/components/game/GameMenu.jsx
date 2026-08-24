function parseDebugCount(value) {
  const next = Number.parseInt(value, 10);
  if (Number.isFinite(next) && next >= 0) {
    return next;
  }
  return null;
}

function GameMenu({
  showMenu,
  showDebug,
  debugBossCardsPerTurn,
  debugPlayerCardsPerTurn,
  onToggleMenu,
  onCloseMenu,
  onViewStats,
  onRestart,
  onOpenDebug,
  onCloseDebug,
  onDebugBossCardsChange,
  onDebugPlayerCardsChange,
}) {
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
          <button
            className="menu-item"
            onClick={onOpenDebug}
          >
            🛠 Debug
          </button>
        </div>
      )}

      {showDebug && (
        <div className="debug-overlay">
          <div className="debug-content">
            <h3>Debug</h3>
            <p className="debug-hint">Changes apply at the start of each turn.</p>
            <label className="debug-field">
              <span>Boss / market cards each turn</span>
              <input
                type="number"
                min="0"
                step="1"
                value={debugBossCardsPerTurn}
                onChange={(e) => {
                  const next = parseDebugCount(e.target.value);
                  if (next !== null) {
                    onDebugBossCardsChange(next);
                  }
                }}
              />
            </label>
            <label className="debug-field">
              <span>Player cards drawn each turn</span>
              <input
                type="number"
                min="0"
                step="1"
                value={debugPlayerCardsPerTurn}
                onChange={(e) => {
                  const next = parseDebugCount(e.target.value);
                  if (next !== null) {
                    onDebugPlayerCardsChange(next);
                  }
                }}
              />
            </label>
            <button className="close-stats-btn" onClick={onCloseDebug}>Close</button>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="menu-backdrop" onClick={onCloseMenu}></div>
      )}
    </>
  );
}

export default GameMenu;
