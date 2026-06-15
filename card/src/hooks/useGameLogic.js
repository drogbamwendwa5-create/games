import { useState, useCallback, useRef, useEffect } from 'react';
import { CARD_SYMBOLS, DIFFICULTY } from '../utils/cardImages';
import { playFlipSound, playMatchSound, playMismatchSound, playWinSound } from '../utils/sounds';
import { saveScore } from '../utils/leaderboard';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(difficulty) {
  const config = DIFFICULTY[difficulty];
  const symbols = shuffleArray(CARD_SYMBOLS).slice(0, config.pairs);
  const cardPairs = [...symbols, ...symbols];
  const shuffled = shuffleArray(cardPairs);

  return shuffled.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));
}

export function useGameLogic() {
  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState(() => createCards('easy'));
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);
  const matchedCountRef = useRef(0);
  const totalPairsRef = useRef(DIFFICULTY.easy.pairs);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameWon) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameWon]);

  const startGame = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
  }, [gameStarted]);

  const flipCard = useCallback(
    (id) => {
      if (isChecking || gameWon) return;

      const card = cards.find((c) => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return;

      startGame();
      if (soundEnabled) playFlipSound();

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c
      );
      const newFlippedIds = [...flippedIds, id];

      setCards(newCards);
      setFlippedIds(newFlippedIds);

      if (newFlippedIds.length === 2) {
        setMoves((prev) => prev + 1);
        setIsChecking(true);

        const [firstId, secondId] = newFlippedIds;
        const firstCard = newCards.find((c) => c.id === firstId);
        const secondCard = newCards.find((c) => c.id === secondId);

        if (firstCard.symbol === secondCard.symbol) {
          // Match found
          if (soundEnabled) setTimeout(() => playMatchSound(), 300);

          setTimeout(() => {
            setCards((prev) => {
              const updated = prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c
              );
              return updated;
            });
            setFlippedIds([]);
            setIsChecking(false);

            matchedCountRef.current += 1;
            if (matchedCountRef.current >= totalPairsRef.current) {
              // Game won!
              setGameWon(true);
              if (soundEnabled) setTimeout(() => playWinSound(), 400);
              // Save score with current stats after state settles
              setTimeout(() => {
                saveScore(difficulty, moves + 1, timer);
              }, 500);
            }
          }, 400);
        } else {
          // No match
          if (soundEnabled) setTimeout(() => playMismatchSound(), 300);

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIds, isChecking, gameWon, gameStarted, soundEnabled, startGame, difficulty]
  );

  const resetGame = useCallback(
    (newDifficulty) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const diff = newDifficulty || difficulty;
      if (newDifficulty) {
        setDifficulty(newDifficulty);
      }
      totalPairsRef.current = DIFFICULTY[diff].pairs;
      matchedCountRef.current = 0;
      setCards(createCards(diff));
      setFlippedIds([]);
      setMoves(0);
      setTimer(0);
      setGameStarted(false);
      setGameWon(false);
      setIsChecking(false);
    },
    [difficulty]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    cards,
    moves,
    timer,
    gameWon,
    difficulty,
    soundEnabled,
    flipCard,
    resetGame,
    toggleSound,
  };
}