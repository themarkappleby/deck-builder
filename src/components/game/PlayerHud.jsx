import { countTokensOfType, getMaxEnergy, PLAY_TOKEN_TYPE } from '../../abilityActions';

function formatCap(count, max) {
  return Number.isFinite(max) ? `${count}/${max}` : `${count}`;
}

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

  const energyCount = countTokensOfType(playTokens, PLAY_TOKEN_TYPE.ENERGY);

  return (
    <div className="bottom-hud">
      <div className="player-stats-bar">
        <div className="stat-item">💎 {resources}</div>
        <div className="stat-item">🎴 {deckLength}</div>
        <div className="stat-item">🗑️ {discardLength}</div>
        <div className="stat-item">🔹 {playerBlock}</div>
        {energyCount > 0 && (
          <div className="stat-item" title="Energy">🩸 {formatCap(energyCount, getMaxEnergy(playerCharacter, levels))}</div>
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
