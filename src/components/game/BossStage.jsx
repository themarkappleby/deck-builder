import { WITCH_BREW_THRESHOLD, tokenCanAttack } from '../../abilityActions';
import { MAX_BLOCK } from '../../game/constants';
import { SYMBOLS } from '../../gameData/symbols';

export function AttackPips({ remaining }) {
  if (remaining <= 0) return null;

  return (
    <div
      className="boss-attack-pips"
      role="img"
      aria-label={`${remaining} incoming attack${remaining === 1 ? '' : 's'}`}
    >
      {Array.from({ length: remaining }, (_, index) => (
        <span key={index} className="boss-attack-pip">{SYMBOLS.ATTACK}</span>
      ))}
    </div>
  );
}

function BrewPips({ tokens }) {
  return (
    <div
      className="boss-brew-pips"
      role="img"
      aria-label={`Brew ${tokens} of ${WITCH_BREW_THRESHOLD}`}
    >
      {Array.from({ length: WITCH_BREW_THRESHOLD }, (_, index) => (
        <span
          key={index}
          className={`boss-brew-pip${index < tokens ? ' filled' : ''}`}
        />
      ))}
    </div>
  );
}

function BossStage({
  currentBoss,
  bossNumber,
  roundNumber,
  bossHP,
  bossMaxHP,
  bossBlock,
  bossTokens,
  gameState,
  playTokens,
}) {
  const bossAbilities = Object.entries(currentBoss?.abilities || {});

  const pendingOutgoingDamage = (() => {
    if (gameState !== 'playerTurn') return 0;
    const totalAttack = (playTokens || [])
      .filter(tokenCanAttack)
      .reduce((sum, token) => sum + token.attack, 0);
    return Math.max(0, totalAttack - bossBlock);
  })();

  const pendingHpLoss = Math.min(pendingOutgoingDamage, bossHP);
  const pendingSegmentLeft = ((bossHP - pendingHpLoss) / bossMaxHP) * 100;
  const pendingSegmentWidth = (pendingHpLoss / bossMaxHP) * 100;

  return (
    <div className="boss-stage">
      <div className="boss-cluster">
        <div className="boss-identity">
          <div className="boss-placeholder">{currentBoss?.id === 'witch' ? '🧙' : '🐉'}</div>
          <div className="boss-status">
            <div className="boss-name">{currentBoss?.name} (Level {bossNumber}) - Round {roundNumber}</div>
            {bossAbilities.length > 0 && (
              <div className="boss-abilities">
                {bossAbilities.map(([symbol, ability]) => (
                  <div key={symbol} className="boss-ability-row">
                    <p>{`${symbol} ${ability.name}: ${ability.symbolEffect}`}</p>
                    {ability.type === 'brew' && <BrewPips tokens={bossTokens} />}
                  </div>
                ))}
              </div>
            )}
            <div className="vitals-row">
              <div
                className="hp-bar boss-hp-bar"
                title={
                  pendingHpLoss > 0
                    ? `${pendingHpLoss} HP at risk from attackable units`
                    : undefined
                }
              >
                <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
                {pendingHpLoss > 0 && (
                  <div
                    className="hp-pending-damage"
                    style={{
                      left: `${pendingSegmentLeft}%`,
                      width: `${pendingSegmentWidth}%`,
                    }}
                    aria-hidden="true"
                  />
                )}
                <span className="hp-text">{bossHP} / {bossMaxHP} HP</span>
              </div>
              <div className="block-bar boss-block-bar">
                <div
                  className="block-fill"
                  style={{ width: `${(bossBlock / MAX_BLOCK) * 100}%` }}
                ></div>
                <span className="block-text">{bossBlock} / {MAX_BLOCK} Block</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BossStage;
