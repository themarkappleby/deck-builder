import Card from '../Card';
import { SYMBOLS } from '../../gameData';
import { formatBossCardEffectLabels, getBossAbility, WITCH_BREW_THRESHOLD } from '../../abilityActions';

function BrewPips({ tokens }) {
  return (
    <div className="boss-brew-pips" aria-hidden="true">
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
  bossBlockMax,
  bossTokens,
  bossCards,
  marketSlotCount,
  bossAttack,
  playerBlock,
}) {
  const bossAbilities = Object.entries(currentBoss?.abilities || {});

  return (
    <div className="boss-stage">
      <div className="boss-cluster">
        <div className="boss-identity">
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
            <div className="hp-bar boss-hp-bar">
              <div className="hp-fill" style={{ width: `${(bossHP / bossMaxHP) * 100}%` }}></div>
              <span className="hp-text">{bossHP} / {bossMaxHP} HP</span>
            </div>
            <div className="block-bar boss-block-bar">
              <div
                className="block-fill"
                style={{
                  width: `${bossBlockMax > 0 ? (bossBlock / bossBlockMax) * 100 : 0}%`
                }}
              ></div>
              <span className="block-text">
                {bossBlockMax > 0 ? `${bossBlock} / ${bossBlockMax} Block` : '0 Block'}
              </span>
            </div>
            {getBossAbility(currentBoss, SYMBOLS.GREEN)?.type === 'brew' && (
              <div className="boss-brew">
                <span className="boss-brew-label">🧪 Brew {bossTokens}/{WITCH_BREW_THRESHOLD}</span>
              </div>
            )}
          </div>
          <div className="boss-placeholder">{currentBoss?.id === 'witch' ? '🧙' : '🐉'}</div>
        </div>
        <div className="intent-card-row boss-cards-row" style={{ '--slot-count': bossCards.length || marketSlotCount }}>
          {bossCards.map(card => (
            <Card
              key={card.id}
              card={card}
              className="intent-card"
              effectLabels={formatBossCardEffectLabels(currentBoss, card.symbols)}
            />
          ))}
        </div>
        {bossAttack > 0 && (
          <div className="enemy-attack-slot">
            <div className="attack-bar boss-attack-bar">
              <div
                className="attack-fill"
                style={{
                  width: `${(Math.max(0, bossAttack - playerBlock) / bossAttack) * 100}%`
                }}
              ></div>
              <span className="attack-text">
                {Math.max(0, bossAttack - playerBlock)} attack
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BossStage;
