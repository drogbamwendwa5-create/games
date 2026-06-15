import { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { getLeaderboard } from './utils/leaderboard';
import GameHeader from './components/GameHeader';
import GameBoard from './components/GameBoard';
import WinScreen from './components/WinScreen';
import './App.css';

function App() {
  const {
    cards,
    moves,
    timer,
    gameWon,
    difficulty,
    soundEnabled,
    flipCard,
    resetGame,
    toggleSound,
  } = useGameLogic();

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard(difficulty));
  }, [difficulty, gameWon]);

  const handleDifficultyChange = (newDifficulty) => {
    if (newDifficulty !== difficulty) {
      resetGame(newDifficulty);
    }
  };

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div className="app">
      <GameHeader
        moves={moves}
        timer={timer}
        difficulty={difficulty}
        soundEnabled={soundEnabled}
        onReset={handleRestart}
        onDifficultyChange={handleDifficultyChange}
        onToggleSound={toggleSound}
      />
      <GameBoard
        cards={cards}
        onCardClick={flipCard}
        difficulty={difficulty}
      />
      {gameWon && (
        <WinScreen
          moves={moves}
          timer={timer}
          onRestart={handleRestart}
          leaderboard={leaderboard}
        />
      )}
    </div>
  );
}

export default App;