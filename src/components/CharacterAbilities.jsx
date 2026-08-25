import AbilityLines from './AbilityLines';

function AbilityBox({ title, children, active, interactive, onClick }) {
  const className = `ability-box${active ? ' active' : ''}${interactive ? ' selectable' : ''}`;

  if (interactive) {
    return (
      <button type="button" className={className} onClick={onClick}>
        <strong>{title}</strong>
        {children}
      </button>
    );
  }

  return (
    <div className={className}>
      <strong>{title}</strong>
      {children}
    </div>
  );
}

function CharacterSection({
  title,
  type,
  piece,
  ownedLevel,
  previewLevel,
  pickLimit,
  pendingCount,
  onToggleLevel,
}) {
  const interactive = typeof onToggleLevel === 'function';

  const isBoxInteractive = (targetLevel) => {
    if (!interactive || targetLevel <= ownedLevel) {
      return false;
    }
    if (targetLevel <= previewLevel) {
      return true;
    }
    return targetLevel === previewLevel + 1 && pendingCount < pickLimit;
  };

  return (
    <div className="character-section">
      <h4>
        {title} - Level {previewLevel}
        {previewLevel > ownedLevel ? ` (from ${ownedLevel})` : ''}
      </h4>
      <AbilityBox
        title="Level 1:"
        active={previewLevel >= 1}
        interactive={isBoxInteractive(1)}
        onClick={() => onToggleLevel(type, 1)}
      >
        <AbilityLines level={piece.level1} />
      </AbilityBox>
      <AbilityBox
        title="Level 2:"
        active={previewLevel >= 2}
        interactive={isBoxInteractive(2)}
        onClick={() => onToggleLevel(type, 2)}
      >
        <AbilityLines level={piece.level2} />
      </AbilityBox>
    </div>
  );
}

function CharacterAbilities({
  playerCharacter,
  raceLevel,
  classLevel,
  godLevel,
  previewLevels,
  pickLimit = 0,
  pendingCount = 0,
  onToggleLevel,
}) {
  const preview = previewLevels || {
    race: raceLevel,
    class: classLevel,
    god: godLevel,
  };

  return (
    <div className="character-info">
      <CharacterSection
        title={playerCharacter.race.name}
        type="race"
        piece={playerCharacter.race}
        ownedLevel={raceLevel}
        previewLevel={preview.race}
        pickLimit={pickLimit}
        pendingCount={pendingCount}
        onToggleLevel={onToggleLevel}
      />
      <CharacterSection
        title={playerCharacter.class.name}
        type="class"
        piece={playerCharacter.class}
        ownedLevel={classLevel}
        previewLevel={preview.class}
        pickLimit={pickLimit}
        pendingCount={pendingCount}
        onToggleLevel={onToggleLevel}
      />
      <CharacterSection
        title={playerCharacter.god.name}
        type="god"
        piece={playerCharacter.god}
        ownedLevel={godLevel}
        previewLevel={preview.god}
        pickLimit={pickLimit}
        pendingCount={pendingCount}
        onToggleLevel={onToggleLevel}
      />
    </div>
  );
}

export default CharacterAbilities;
