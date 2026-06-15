const STORAGE_KEY = 'memory-game-leaderboard';

export function getLeaderboard(difficulty) {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-${difficulty}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveScore(difficulty, moves, time) {
  const leaderboard = getLeaderboard(difficulty);
  leaderboard.push({ moves, time, date: new Date().toISOString() });
  leaderboard.sort((a, b) => a.moves - b.moves || a.time - b.time);
  const top10 = leaderboard.slice(0, 10);
  localStorage.setItem(`${STORAGE_KEY}-${difficulty}`, JSON.stringify(top10));
  return top10;
}

export function clearLeaderboard(difficulty) {
  localStorage.removeItem(`${STORAGE_KEY}-${difficulty}`);
}