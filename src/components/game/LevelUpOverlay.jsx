import AbilityLines from '../AbilityLines';
import CharacterAbilities from '../CharacterAbilities';

function LevelUpOverlay({
  playerCharacter,
  raceLevel,
  classLevel,
  godLevel,
  levelUpPicksRemaining,
  onLevelUp,
}) {
  return (
    <div className="center-content level-up-overlay">
      <h2>
        Level Up! Choose {levelUpPicksRemaining} more{' '}
        {levelUpPicksRemaining === 1 ? 'option' : 'options'}
      </h2>
      <div className="level-up-current">
        <h3>Your current abilities</h3>
        <CharacterAbilities
          playerCharacter={playerCharacter}
          raceLevel={raceLevel}
          classLevel={classLevel}
          godLevel={godLevel}
        />
      </div>
      <div className="level-up-options">
        {raceLevel < 2 && (
          <button
            onClick={() => onLevelUp('race')}
            disabled={levelUpPicksRemaining <= 0}
          >
            <strong>{playerCharacter.race.name} - Level {raceLevel} → {raceLevel + 1}</strong>
            <AbilityLines level={playerCharacter.race.level2} />
          </button>
        )}
        {raceLevel >= 2 && (
          <button disabled>
            <strong>{playerCharacter.race.name} - Max Level</strong>
            <p>Already at maximum level</p>
          </button>
        )}

        {classLevel < 2 && (
          <button
            onClick={() => onLevelUp('class')}
            disabled={levelUpPicksRemaining <= 0}
          >
            <strong>{playerCharacter.class.name} - Level {classLevel} → {classLevel + 1}</strong>
            {classLevel === 0 && (
              <AbilityLines level={playerCharacter.class.level1} />
            )}
            {classLevel === 1 && (
              <AbilityLines level={playerCharacter.class.level2} />
            )}
          </button>
        )}
        {classLevel >= 2 && (
          <button disabled>
            <strong>{playerCharacter.class.name} - Max Level</strong>
            <p>Already at maximum level</p>
          </button>
        )}

        {godLevel < 2 && (
          <button
            onClick={() => onLevelUp('god')}
            disabled={levelUpPicksRemaining <= 0}
          >
            <strong>{playerCharacter.god.name} - Level {godLevel} → {godLevel + 1}</strong>
            {godLevel === 0 && (
              <AbilityLines level={playerCharacter.god.level1} />
            )}
            {godLevel === 1 && (
              <AbilityLines level={playerCharacter.god.level2} />
            )}
          </button>
        )}
        {godLevel >= 2 && (
          <button disabled>
            <strong>{playerCharacter.god.name} - Max Level</strong>
            <p>Already at maximum level</p>
          </button>
        )}
      </div>
    </div>
  );
}

export default LevelUpOverlay;
