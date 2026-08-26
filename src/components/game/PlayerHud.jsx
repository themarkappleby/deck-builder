import { useEffect, useRef, useState } from 'react';
import { countTokensOfType, getMaxEnergy, PLAY_TOKEN_TYPE } from '../../abilityActions';
import { MAX_BLOCK, MAX_RESOURCES } from '../../game/constants';

function formatCap(count, max) {
  return Number.isFinite(max) ? `${count}/${max}` : `${count}`;
}

function PlayerHud({
  gameState,
  resources,
  playerBlock,
  playTokens,
  playerCharacter,
  levels,
  ignoreIncomingDamage,
  cannotDiscardForResources,
  playerHP,
  playerMaxHP,
  bossAttack,
  incomingDamage,
  onOpenCharacterSheet,
}) {
  const [resourcePulseKey, setResourcePulseKey] = useState(0);
  const prevResourcesRef = useRef(resources);

  useEffect(() => {
    if (resources > prevResourcesRef.current) {
      setResourcePulseKey((key) => key + 1);
    }
    prevResourcesRef.current = resources;
  }, [resources]);

  if (gameState === 'abilityChoice' || gameState === 'levelUp') {
    return null;
  }

  const energyCount = countTokensOfType(playTokens, PLAY_TOKEN_TYPE.ENERGY);

  const pendingIncomingDamage = (() => {
    if (ignoreIncomingDamage) return 0;
    if (gameState === 'assignDamage') return incomingDamage;
    if (gameState === 'playerTurn' || gameState === 'curseDiscard') {
      return Math.max(0, bossAttack - playerBlock);
    }
    return 0;
  })();

  const incomingHpLoss = Math.min(pendingIncomingDamage, playerHP);
  const incomingSegmentLeft = ((playerHP - incomingHpLoss) / playerMaxHP) * 100;
  const incomingSegmentWidth = (incomingHpLoss / playerMaxHP) * 100;

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
      {(energyCount > 0 || ignoreIncomingDamage || cannotDiscardForResources) && (
      <div className="player-stats-bar">
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
      )}
      <div className="player-hp-row">
        <div
          key={resourcePulseKey}
          className={`resource-circle${resources === 0 ? ' is-empty' : ''}${resourcePulseKey > 0 ? ' is-pulsing' : ''}`}
          title={`Resources (${resources}/${MAX_RESOURCES})`}
          aria-label={`${resources} of ${MAX_RESOURCES} resources`}
          onAnimationEnd={(event) => {
            if (event.animationName === 'resource-pulse') {
              event.currentTarget.classList.remove('is-pulsing');
            }
          }}
        >
          <span className="resource-circle-content">
            <span className="resource-count">{resources}</span>
            <span className="resource-cap" aria-hidden="true">/{MAX_RESOURCES}</span>
          </span>
        </div>
        <div className="vitals-row">
          <div
            className="hp-bar player-hp-bar"
            title={
              incomingHpLoss > 0
                ? `${incomingHpLoss} HP at risk from incoming damage`
                : undefined
            }
          >
            <div className="hp-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
            {incomingHpLoss > 0 && (
              <div
                className="hp-pending-damage"
                style={{
                  left: `${incomingSegmentLeft}%`,
                  width: `${incomingSegmentWidth}%`,
                }}
                aria-hidden="true"
              />
            )}
            <span className="hp-text">{playerHP} / {playerMaxHP} HP</span>
          </div>
          <div className="block-bar player-block-bar">
            <div
              className="block-fill"
              style={{ width: `${(playerBlock / MAX_BLOCK) * 100}%` }}
            ></div>
            <span className="block-text">{playerBlock} / {MAX_BLOCK} Block</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default PlayerHud;
