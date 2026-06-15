import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'reaction-game-best';

// Game phases
const PHASE = {
  IDLE: 'idle',
  WAITING: 'waiting',   // Red screen, random delay before green
  READY: 'ready',       // Green screen, player should click
  RESULT: 'result',     // Showing reaction time
  EARLY: 'early',       // Clicked too early
};

// Performance thresholds
const FAST = 250;
const SLOW = 500;

function getRandomDelay() {
  return Math.floor(Math.random() * 4000) + 2000; // 2-6 seconds
}

function getPerformanceMessage(ms) {
  if (ms < FAST) return { label: 'Lightning Fast! ⚡', color: '#38ef7d' };
  if (ms < SLOW) return { label: 'Good Reaction 👍', color: '#ffd200' };
  return { label: 'Slow... 🐢', color: '#ff6b6b' };
}

function loadBestScore() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveBestScore(time) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(time));
  } catch {}
}

export function useReactionGame() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(() => loadBestScore());
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerScores, setPlayerScores] = useState({ 1: [], 2: [] });
  const [multiplayer, setMultiplayer] = useState(false);

  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  const phaseRef = useRef(PHASE.IDLE);

  // Keep ref in sync for cleanup
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = useCallback((isMultiplayer = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMultiplayer(isMultiplayer);
    setPhase(PHASE.WAITING);
    setReactionTime(null);

    const delay = getRandomDelay();

    timeoutRef.current = setTimeout(() => {
      // Only go to ready if still in waiting phase
      if (phaseRef.current === PHASE.WAITING) {
        startTimeRef.current = performance.now();
        setPhase(PHASE.READY);
      }
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    // Use ref to avoid stale closure - phase state may not have updated yet
    const currentPhase = phaseRef.current;

    if (currentPhase === PHASE.WAITING) {
      // Clicked too early - false start!
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setPhase(PHASE.EARLY);
      return;
    }

    if (currentPhase === PHASE.READY) {
      // Guard against missing startTime
      if (startTimeRef.current === null) return;
      // Calculate reaction time
      const now = performance.now();
      const elapsed = Math.round(now - startTimeRef.current);
      setReactionTime(elapsed);

      // Track rounds
      const newRoundsPlayed = roundsPlayed + 1;
      const newTotalTime = totalTime + elapsed;
      setRoundsPlayed(newRoundsPlayed);
      setTotalTime(newTotalTime);

      // Track player scores in multiplayer
      if (multiplayer) {
        setPlayerScores((prev) => ({
          ...prev,
          [currentPlayer]: [...prev[currentPlayer], elapsed],
        }));
        setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
      }

      // Best score tracking
      if (bestTime === null || elapsed < bestTime) {
        setBestTime(elapsed);
        saveBestScore(elapsed);
      }

      setPhase(PHASE.RESULT);
      return;
    }

    if (currentPhase === PHASE.IDLE) {
      startGame(false);
      return;
    }

    // RESULT or EARLY - restart
    if (currentPhase === PHASE.RESULT || currentPhase === PHASE.EARLY) {
      if (multiplayer) {
        startGame(true);
      } else {
        startGame(false);
      }
    }
  }, [roundsPlayed, totalTime, bestTime, currentPlayer, multiplayer, startGame]);

  const restart = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPhase(PHASE.IDLE);
    setReactionTime(null);
  }, []);

  const resetStats = useCallback(() => {
    setRoundsPlayed(0);
    setTotalTime(0);
    setBestTime(null);
    setPlayerScores({ 1: [], 2: [] });
    setCurrentPlayer(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getAverageTime = useCallback(() => {
    if (roundsPlayed === 0) return null;
    return Math.round(totalTime / roundsPlayed);
  }, [roundsPlayed, totalTime]);

  const getPlayerAverage = useCallback((player) => {
    const scores = playerScores[player];
    if (!scores || scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [playerScores]);

  const getPlayerBest = useCallback((player) => {
    const scores = playerScores[player];
    if (!scores || scores.length === 0) return null;
    return Math.min(...scores);
  }, [playerScores]);

  const performanceRating = reactionTime !== null ? getPerformanceMessage(reactionTime) : null;

  return {
    phase,
    reactionTime,
    performance: performanceRating,
    bestTime,
    roundsPlayed,
    averageTime: getAverageTime(),
    multiplayer,
    currentPlayer,
    playerScores,
    player1Average: getPlayerAverage(1),
    player2Average: getPlayerAverage(2),
    player1Best: getPlayerBest(1),
    player2Best: getPlayerBest(2),
    handleClick,
    startGame,
    restart,
    resetStats,
  };
}

export { PHASE };