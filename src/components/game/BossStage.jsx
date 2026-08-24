import Card from '../Card';
import { SYMBOLS } from '../../gameData';
import { formatBossCardEffectLabels, getBossAbility, WITCH_BREW_THRESHOLD } from '../../abilityActions';

function BossStage({
  currentBoss,
  bossNumber,
  roundNumber,
  bossAbilityLines,
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
  return (
    <div className="boss-stage">
      <div className="boss-cluster">
        <div className="boss-identity">
          <div className="boss-placeholder">{currentBoss?.id === 'witch' ? '🧙' : '🐉'}</div>
          <div className="boss-status">
            <div className="boss-name">{currentBoss?.name} (Level {bossNumber}) - Round {roundNumber}</div>
            {bossAbilityLines.length > 0 && (
              <div className="boss-abilities">
                {bossAbilityLines.map(line => (
                  <p key={line}>{line}</p>
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
            {bossAttack > 0 && (
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
            )}
            {getBossAbility(currentBoss, SYMBOLS.GREEN)?.type === 'brew' && (
              <div className="boss-brew">
                <span className="boss-brew-label">🧪 Brew {bossTokens}/{WITCH_BREW_THRESHOLD}</span>
                <div className="boss-brew-pips" aria-hidden="true">
                  {Array.from({ length: WITCH_BREW_THRESHOLD }, (_, index) => (
                    <span
                      key={index}
                      className={`boss-brew-pip${index < bossTokens ? ' filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
}

export default BossStage;
