import { useState } from 'react';
import CharacterAbilities from '../CharacterAbilities';

function LevelUpOverlay({
  playerCharacter,
  raceLevel,
  classLevel,
  godLevel,
  levelUpPicksRemaining,
  onConfirmLevelUp,
}) {
  const [pending, setPending] = useState({ race: 0, class: 0, god: 0 });
  const pendingCount = pending.race + pending.class + pending.god;
  const canConfirm = pendingCount === levelUpPicksRemaining && levelUpPicksRemaining > 0;

  const previewLevels = {
    race: raceLevel + pending.race,
    class: classLevel + pending.class,
    god: godLevel + pending.god,
  };

  const owned = { race: raceLevel, class: classLevel, god: godLevel };

  const handleToggleLevel = (type, targetLevel) => {
    const ownedLevel = owned[type];
    const extra = pending[type];
    const displayed = ownedLevel + extra;

    if (targetLevel <= ownedLevel) {
      return;
    }

    if (targetLevel <= displayed) {
      setPending(current => ({
        ...current,
        [type]: targetLevel - 1 - ownedLevel,
      }));
      return;
    }

    if (targetLevel === displayed + 1 && pendingCount < levelUpPicksRemaining) {
      setPending(current => ({
        ...current,
        [type]: extra + 1,
      }));
    }
  };

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }
    const picks = [];
    ['race', 'class', 'god'].forEach(type => {
      for (let i = 0; i < pending[type]; i += 1) {
        picks.push(type);
      }
    });
    onConfirmLevelUp(picks);
  };

  const remaining = levelUpPicksRemaining - pendingCount;

  return (
    <div className="center-content level-up-overlay">
      <h2>
        Level Up! Choose {remaining} more{' '}
        {remaining === 1 ? 'upgrade' : 'upgrades'}
      </h2>
      <p className="level-up-hint">
        Tap a grayed-out ability to select it. Confirm when you have chosen {levelUpPicksRemaining}.
      </p>
      <div className="level-up-current">
        <CharacterAbilities
          playerCharacter={playerCharacter}
          raceLevel={raceLevel}
          classLevel={classLevel}
          godLevel={godLevel}
          previewLevels={previewLevels}
          pickLimit={levelUpPicksRemaining}
          pendingCount={pendingCount}
          onToggleLevel={handleToggleLevel}
        />
      </div>
      <button
        className="big-button level-up-confirm"
        onClick={handleConfirm}
        disabled={!canConfirm}
      >
        Confirm upgrades
      </button>
    </div>
  );
}

export default LevelUpOverlay;
