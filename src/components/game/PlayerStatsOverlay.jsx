import CharacterAbilities from '../CharacterAbilities';

function PlayerStatsOverlay({
  showPlayerStats,
  playerCharacter,
  raceLevel,
  classLevel,
  godLevel,
  onClose,
}) {
  if (!showPlayerStats) return null;

  return (
    <div className="player-stats-overlay">
      <div className="player-stats-content">
        <h3>Your Character</h3>
        <CharacterAbilities
          playerCharacter={playerCharacter}
          raceLevel={raceLevel}
          classLevel={classLevel}
          godLevel={godLevel}
        />

        <button className="close-stats-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default PlayerStatsOverlay;
