function parseDebugCount(value, min = 0) {
  const next = Number.parseInt(value, 10);
  if (Number.isFinite(next) && next >= min) {
    return next;
  }
  return null;
}

function GameMenu({
  showMenu,
  showDebug,
  debugBossCardsPerTurn,
  debugPlayerCardsPerTurn,
  debugBossStartingHealth,
  onToggleMenu,
  onCloseMenu,
  onRestart,
  onOpenDebug,
  onCloseDebug,
  onDebugBossCardsChange,
  onDebugPlayerCardsChange,
  onDebugBossStartingHealthChange,
}) {
  return (
    <>
      <button className="menu-btn" onClick={onToggleMenu}>⋮</button>

      {showMenu && (
        <div className="menu-popover">
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
            <p className="debug-hint">Overrides apply until changed. Leave these as-is to use encounter stats: level 1 is 20 HP and 3 cards, level 2 is 40 HP and 4 cards, level 3 is 60 HP and 5 cards. Market size and player draws apply at the start of each turn. Boss starting health applies now and to later bosses.</p>
            <label className="debug-field">
              <span>Market cards each turn</span>
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
            <label className="debug-field">
              <span>Boss starting health</span>
              <input
                type="number"
                min="1"
                step="1"
                value={debugBossStartingHealth}
                onChange={(e) => {
                  const next = parseDebugCount(e.target.value, 1);
                  if (next !== null) {
                    onDebugBossStartingHealthChange(next);
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
