import React, { useState } from 'react';
import CharacterSelect from './components/CharacterSelect';
import GameBoard from './components/GameBoard';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCharacter, setPlayerCharacter] = useState(null);

  const handleCharacterSelect = (character) => {
    setPlayerCharacter(character);
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setPlayerCharacter(null);
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <CharacterSelect onCharacterSelect={handleCharacterSelect} />
      ) : (
        <GameBoard 
          playerCharacter={playerCharacter} 
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
