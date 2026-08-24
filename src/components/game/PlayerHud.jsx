import { getMaxTokens } from '../../abilityActions';

function PlayerHud({
  gameState,
  resources,
  deckLength,
  discardLength,
  playerBlock,
  playTokens,
  playerCharacter,
  levels,
  ignoreIncomingDamage,
  cannotDiscardForResources,
  playerHP,
  playerMaxHP,
}) {
  if (gameState === 'abilityChoice' || gameState === 'levelUp') {
    return null;
  }

  return (
    <div className="bottom-hud">
      <div className="player-stats-bar">
        <div className="stat-item">💎 {resources}</div>
        <div className="stat-item">🎴 {deckLength}</div>
        <div className="stat-item">🗑️ {discardLength}</div>
        <div className="stat-item">🔹 {playerBlock}</div>
        {playTokens.length > 0 && (
          <div className="stat-item">🪙 {playTokens.length}/{getMaxTokens(playerCharacter, levels)}</div>
        )}
        {ignoreIncomingDamage && (
          <div className="stat-item" title="Ignore incoming damage">✨ Guard</div>
        )}
        {cannotDiscardForResources && (
          <div className="stat-item" title="Cannot discard cards for resources this turn">🚫 Discard</div>
        )}
      </div>
      <div className="hp-bar player-hp-bar">
        <div className="hp-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
        <span className="hp-text">{playerHP} / {playerMaxHP} HP</span>
      </div>
    </div>
  );
}

export default PlayerHud;
