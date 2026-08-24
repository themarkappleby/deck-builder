import { useState } from 'react';
import { races, classes, gods } from '../gameData';
import SelectionStep from './SelectionStep';
import './CharacterSelect.css';

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

      {currentStep === 'race' && (
        <SelectionStep
          title="Select Your Race"
          options={races}
          selected={selectedRace}
          onSelect={handleRaceSelect}
        />
      )}

      {currentStep === 'class' && (
        <SelectionStep
          title="Select Your Class"
          options={classes}
          selected={selectedClass}
          onSelect={handleClassSelect}
        />
      )}

      {currentStep === 'god' && (
        <SelectionStep
          title="Select Your God"
          options={gods}
          selected={selectedGod}
          onSelect={handleGodSelect}
        />
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
