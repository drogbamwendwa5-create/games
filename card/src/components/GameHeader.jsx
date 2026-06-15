import { DIFFICULTY } from '../utils/cardImages';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GameHeader({
  moves,
  timer,
  difficulty,
  soundEnabled,
  onReset,
  onDifficultyChange,
  onToggleSound,
}) {
  return (
    <div className="game-header">
      <h1 className="game-title">Memory Match</h1>

      <div className="difficulty-selector">
        {Object.entries(DIFFICULTY).map(([key, config]) => (
          <button
            key={key}
            className={`difficulty-btn ${difficulty === key ? 'active' : ''}`}
            onClick={() => onDifficultyChange(key)}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">{formatTime(timer)}</span>
        </div>
      </div>

      <div className="controls-row">
        <button className="control-btn" onClick={onToggleSound} title="Toggle Sound">
          {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
        </button>
        <button className="control-btn restart-btn" onClick={() => onReset()}>
          ↻ Restart
        </button>
      </div>
    </div>
  );
}