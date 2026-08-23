import React, { useState } from 'react';
import { races, classes, gods } from '../gameData';
import { formatLevelLines } from '../abilityActions';
import './CharacterSelect.css';

function AbilityLines({ level }) {
  return formatLevelLines(level).map((line, index) => (
    <p key={index}>{line}</p>
  ));
}

function CharacterSelect({ onCharacterSelect }) {
  const [currentStep, setCurrentStep] = useState('race'); // 'race', 'class', 'god'
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGod, setSelectedGod] = useState(null);

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setCurrentStep('class');
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setCurrentStep('god');
  };

  const handleGodSelect = (god) => {
    setSelectedGod(god);
    // Start the game immediately
    onCharacterSelect({
      race: selectedRace,
      class: selectedClass,
      god: god
    });
  };

  const handleBack = () => {
    if (currentStep === 'class') {
      setCurrentStep('race');
    } else if (currentStep === 'god') {
      setCurrentStep('class');
    }
  };

  return (
    <div className="character-select">
      <h1>Choose Your Character</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab ${currentStep === 'race' ? 'active' : ''} ${selectedRace ? 'completed' : ''}`}
          onClick={() => setCurrentStep('race')}
        >
          1. Race {selectedRace && '✓'}
        </button>
        <button 
          className={`tab ${currentStep === 'class' ? 'active' : ''} ${selectedClass ? 'completed' : ''}`}
          onClick={() => selectedRace && setCurrentStep('class')}
          disabled={!selectedRace}
        >
          2. Class {selectedClass && '✓'}
        </button>
        <button 
          className={`tab ${currentStep === 'god' ? 'active' : ''} ${selectedGod ? 'completed' : ''}`}
          onClick={() => selectedClass && setCurrentStep('god')}
          disabled={!selectedClass}
        >
          3. God {selectedGod && '✓'}
        </button>
      </div>

      {/* Race Selection */}
      {currentStep === 'race' && (
        <div className="selection-section">
          <h2>Select Your Race</h2>
          <div className="card-grid">
            {races.map((race, index) => (
              <div
                key={index}
                className={`selection-card ${selectedRace === race ? 'selected' : ''}`}
                onClick={() => handleRaceSelect(race)}
              >
                <h3>{race.name}</h3>
                <div className="card-level">
                  <strong>Level 1:</strong>
                  <AbilityLines level={race.level1} />
                </div>
                <div className="card-level">
                  <strong>Level 2:</strong>
                  <AbilityLines level={race.level2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Selection */}
      {currentStep === 'class' && (
        <div className="selection-section">
          <h2>Select Your Class</h2>
          <div className="card-grid">
            {classes.map((cls, index) => (
              <div
                key={index}
                className={`selection-card ${selectedClass === cls ? 'selected' : ''}`}
                onClick={() => handleClassSelect(cls)}
              >
                <h3>{cls.name}</h3>
                <div className="card-level">
                  <strong>Level 1:</strong>
                  <AbilityLines level={cls.level1} />
                </div>
                <div className="card-level">
                  <strong>Level 2:</strong>
                  <AbilityLines level={cls.level2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* God Selection */}
      {currentStep === 'god' && (
        <div className="selection-section">
          <h2>Select Your God</h2>
          <div className="card-grid">
            {gods.map((god, index) => (
              <div
                key={index}
                className={`selection-card ${selectedGod === god ? 'selected' : ''}`}
                onClick={() => handleGodSelect(god)}
              >
                <h3>{god.name}</h3>
                <div className="card-level">
                  <strong>Level 1:</strong>
                  <AbilityLines level={god.level1} />
                </div>
                <div className="card-level">
                  <strong>Level 2:</strong>
                  <AbilityLines level={god.level2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        {currentStep !== 'race' && (
          <button className="nav-button back-button" onClick={handleBack}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export default CharacterSelect;
