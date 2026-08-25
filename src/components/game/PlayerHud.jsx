import { countTokensOfType, getMaxEnergy, PLAY_TOKEN_TYPE } from '../../abilityActions';

function formatCap(count, max) {
  return Number.isFinite(max) ? `${count}/${max}` : `${count}`;
}

function PlayerHud({
  gameState,
  resources,
  purchaseOrTrashCost,
  playerBlock,
  playTokens,
  playerCharacter,
  levels,
  ignoreIncomingDamage,
  cannotDiscardForResources,
  playerHP,
  playerMaxHP,
  onOpenCharacterSheet,
}) {
  if (gameState === 'abilityChoice' || gameState === 'levelUp') {
    return null;
  }

  const energyCount = countTokensOfType(playTokens, PLAY_TOKEN_TYPE.ENERGY);

  return (
    <button
      type="button"
      className="bottom-hud"
      onClick={onOpenCharacterSheet}
      aria-label="View race, class, god abilities, and your cards"
    >
      {playerCharacter && (
        <div className="player-character-bar" title="Race, class, and god">
          <span className="character-identity-item">{playerCharacter.race.name}</span>
          <span className="character-identity-sep" aria-hidden="true">·</span>
          <span className="character-identity-item">{playerCharacter.class.name}</span>
          <span className="character-identity-sep" aria-hidden="true">·</span>
          <span className="character-identity-item">{playerCharacter.god.name}</span>
        </div>
      )}
      <div className="player-stats-bar">
        <div className="stat-item">💎 {resources}</div>
        <div className="stat-item" title="Cost to purchase or trash a card">💰 {purchaseOrTrashCost}</div>
        {playerBlock > 0 && (
          <div className="stat-item">🔹 {playerBlock}</div>
        )}
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
    </button>
  );
}

export default PlayerHud;
