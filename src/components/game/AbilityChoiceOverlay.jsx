import AbilityLines from '../AbilityLines';

function AbilityChoiceOverlay({ playerCharacter, onSelect }) {
  return (
    <div className="center-content level-up-overlay">
      <h2>Choose Your Starting Ability</h2>
      <div className="level-up-options">
        <button onClick={() => onSelect('race')}>
          <strong>{playerCharacter.race.name} - Level 2</strong>
          <AbilityLines level={playerCharacter.race.level2} />
        </button>
        <button onClick={() => onSelect('class')}>
          <strong>{playerCharacter.class.name} - Level 1</strong>
          <AbilityLines level={playerCharacter.class.level1} />
        </button>
        <button onClick={() => onSelect('god')}>
          <strong>{playerCharacter.god.name} - Level 1</strong>
          <AbilityLines level={playerCharacter.god.level1} />
        </button>
      </div>
    </div>
  );
}

export default AbilityChoiceOverlay;
