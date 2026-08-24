import { tokenCanAttack, tokenCanBlock, formatTokenStats } from '../../abilityActions';

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
        {playTokens.map(token => (
          <button
            key={token.id}
            type="button"
            className={`play-token${tokenCanAttack(token) && gameState === 'playerTurn' ? ' can-attack' : ''}${!tokenCanBlock(token) && !tokenCanAttack(token) ? ' no-stats' : ''}`}
            onClick={() => onTokenClick(token)}
          >
            <span className="play-token-kind">{token.kind === 'gardener' ? '🌱' : token.kind === 'vampiera' ? '🩸' : '🪙'}</span>
            <span className="play-token-stats">{formatTokenStats(token)}</span>
          </button>
        ))}
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
