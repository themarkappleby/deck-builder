import { WITCH_BREW_THRESHOLD } from '../../abilityActions';
import { MAX_BLOCK } from '../../game/constants';

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
  bossAttack,
  playerBlock,
}) {
  const bossAbilities = Object.entries(currentBoss?.abilities || {});

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
              <div className="hp-bar boss-hp-bar">
                <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
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
            <div className="attack-bar boss-attack-bar">
              <div
                className="attack-fill"
                style={{
                  width: `${bossAttack > 0 ? (Math.max(0, bossAttack - playerBlock) / bossAttack) * 100 : 0}%`
                }}
              ></div>
              <span className="attack-text">
                {Math.max(0, bossAttack - playerBlock)} attack
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BossStage;
