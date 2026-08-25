import {
  tokenCanAttack,
  tokenCanHarvest,
  formatTokenStats,
  playTokenType,
  PLAY_TOKEN_TYPE,
} from '../../abilityActions';

function PlayField({
  playTokens,
  gameState,
  incomingDamage,
  onTokenClick,
  onTakeRemainingDamage,
}) {
  if (!(playTokens.length > 0 || gameState === 'assignDamage')) {
    return null;
  }

  return (
    <div className="play-field">
      <div className="play-field-label">
        {gameState === 'assignDamage'
          ? `Assign ${incomingDamage} damage`
          : 'Play field'}
      </div>
      <div className="play-token-row">
        {playTokens.map(token => {
          const type = playTokenType(token);
          const stats = formatTokenStats(token);
          return (
            <button
              key={token.id}
              type="button"
              className={`play-token ${type}${tokenCanAttack(token) && gameState === 'playerTurn' ? ' can-attack' : ''}${tokenCanHarvest(token) ? ' can-harvest' : ''}${type === PLAY_TOKEN_TYPE.ENERGY ? ' no-stats' : ''}${token.kind === 'gardener' && !tokenCanHarvest(token) ? ' unharvestable' : ''}`}
              onClick={() => onTokenClick(token)}
              title={type === PLAY_TOKEN_TYPE.UNIT ? 'Unit' : 'Energy'}
            >
              {token.kind === 'gardener' && (
                <span className="play-token-counter">{token.counter ?? 0}</span>
              )}
              <span className="play-token-kind">{token.kind === 'gardener' ? '🌱' : token.kind === 'vampiera' ? '🩸' : type === PLAY_TOKEN_TYPE.UNIT ? '⚔️' : '✨'}</span>
              {stats ? <span className="play-token-stats">{stats}</span> : null}
            </button>
          );
        })}
      </div>
      {gameState === 'assignDamage' && (
        <button className="action-btn" onClick={onTakeRemainingDamage}>
          Take remaining damage
        </button>
      )}
    </div>
  );
}

export default PlayField;
