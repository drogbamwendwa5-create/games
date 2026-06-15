import { useEffect, useState } from 'react';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function WinScreen({ moves, timer, onRestart, leaderboard }) {
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="win-overlay">
      {showCelebration && (
        <div className="celebration">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                fontSize: `${1 + Math.random() * 1.5}rem`,
              }}
            >
              {['🎉', '✨', '🎊', '⭐', '🌟', '🏆'][Math.floor(Math.random() * 6)]}
            </span>
          ))}
        </div>
      )}

      <div className="win-modal">
        <div className="win-icon">🏆</div>
        <h2 className="win-title">Congratulations!</h2>
        <p className="win-subtitle">You matched all pairs!</p>

        <div className="win-stats">
          <div className="win-stat">
            <span className="win-stat-icon">👆</span>
            <span className="win-stat-label">Moves</span>
            <span className="win-stat-value">{moves}</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-icon">⏱️</span>
            <span className="win-stat-label">Time</span>
            <span className="win-stat-value">{formatTime(timer)}</span>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div className="leaderboard-section">
            <h3 className="leaderboard-title">🏅 Leaderboard</h3>
            <div className="leaderboard-list">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={i} className="leaderboard-entry">
                  <span className="rank">#{i + 1}</span>
                  <span className="entry-moves">{entry.moves} moves</span>
                  <span className="entry-time">{formatTime(entry.time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="play-again-btn" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}