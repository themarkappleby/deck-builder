import AbilityLines from './AbilityLines';

function CharacterAbilities({ playerCharacter, raceLevel, classLevel, godLevel }) {
  return (
    <div className="character-info">
      <div className="character-section">
        <h4>{playerCharacter.race.name} - Level {raceLevel}</h4>
        <div className={`ability-box ${raceLevel >= 1 ? 'active' : ''}`}>
          <strong>Level 1:</strong>
          <AbilityLines level={playerCharacter.race.level1} />
        </div>
        <div className={`ability-box ${raceLevel >= 2 ? 'active' : ''}`}>
          <strong>Level 2:</strong>
          <AbilityLines level={playerCharacter.race.level2} />
        </div>
      </div>

      <div className="character-section">
        <h4>{playerCharacter.class.name} - Level {classLevel}</h4>
        <div className={`ability-box ${classLevel >= 1 ? 'active' : ''}`}>
          <strong>Level 1:</strong>
          <AbilityLines level={playerCharacter.class.level1} />
        </div>
        <div className={`ability-box ${classLevel >= 2 ? 'active' : ''}`}>
          <strong>Level 2:</strong>
          <AbilityLines level={playerCharacter.class.level2} />
        </div>
      </div>

      <div className="character-section">
        <h4>{playerCharacter.god.name} - Level {godLevel}</h4>
        <div className={`ability-box ${godLevel >= 1 ? 'active' : ''}`}>
          <strong>Level 1:</strong>
          <AbilityLines level={playerCharacter.god.level1} />
        </div>
        <div className={`ability-box ${godLevel >= 2 ? 'active' : ''}`}>
          <strong>Level 2:</strong>
          <AbilityLines level={playerCharacter.god.level2} />
        </div>
      </div>
    </div>
  );
}

export default CharacterAbilities;
