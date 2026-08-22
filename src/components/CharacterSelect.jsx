import React, { useState } from 'react';
import { races, classes, gods } from '../gameData';
import './CharacterSelect.css';

function CharacterSelect({ onCharacterSelect }) {
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGod, setSelectedGod] = useState(null);

  const handleStart = () => {
    if (selectedRace && selectedClass && selectedGod) {
      onCharacterSelect({
        race: selectedRace,
        class: selectedClass,
        god: selectedGod
      });
    }
  };

  const isComplete = selectedRace && selectedClass && selectedGod;

  return (
    <div className="character-select">
      <h1>Choose Your Character</h1>
      
      <div className="selection-section">
        <h2>Select Race</h2>
        <div className="card-grid">
          {races.map((race, index) => (
            <div
              key={index}
              className={`selection-card ${selectedRace === race ? 'selected' : ''}`}
              onClick={() => setSelectedRace(race)}
            >
              <h3>{race.name} (Side {race.side})</h3>
              <div className="card-level">
                <strong>Level 1:</strong>
                <p>{race.level1.effect}</p>
                <p>🟣 = {race.level1.symbolEffect}</p>
              </div>
              <div className="card-level">
                <strong>Level 2:</strong>
                <p>{race.level2.effect}</p>
                {race.level2.additionalEffect && <p>{race.level2.additionalEffect}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="selection-section">
        <h2>Select Class</h2>
        <div className="card-grid">
          {classes.map((cls, index) => (
            <div
              key={index}
              className={`selection-card ${selectedClass === cls ? 'selected' : ''}`}
              onClick={() => setSelectedClass(cls)}
            >
              <h3>{cls.name} (Side {cls.side})</h3>
              <div className="card-level">
                <strong>Level 1:</strong>
                <p>{cls.level1.effect}</p>
              </div>
              <div className="card-level">
                <strong>Level 2:</strong>
                <p>{cls.level2.effect}</p>
                {cls.level2.additionalEffect && <p>{cls.level2.additionalEffect}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="selection-section">
        <h2>Select God</h2>
        <div className="card-grid">
          {gods.map((god, index) => (
            <div
              key={index}
              className={`selection-card ${selectedGod === god ? 'selected' : ''}`}
              onClick={() => setSelectedGod(god)}
            >
              <h3>{god.name} (Side {god.side})</h3>
              <div className="card-level">
                <strong>Level 1:</strong>
                <p>{god.level1.effect}</p>
              </div>
              <div className="card-level">
                <strong>Level 2:</strong>
                <p>{god.level2.effect}</p>
                {god.level2.additionalEffect && <p>{god.level2.additionalEffect}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="start-button"
        onClick={handleStart}
        disabled={!isComplete}
      >
        {isComplete ? 'Start Game' : 'Select Race, Class, and God'}
      </button>
    </div>
  );
}

export default CharacterSelect;
