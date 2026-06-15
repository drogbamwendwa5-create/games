import { PHASE, useReactionGame } from '../hooks/useReactionGame';
import '../styles/GameScreen.css';

export default function GameScreen() {
  const {
    phase,
    reactionTime,
    performance,
    bestTime,
    roundsPlayed,
    averageTime,
    multiplayer,
    currentPlayer,
    player1Average,
    player2Average,
    player1Best,
    player2Best,
    handleClick,
    startGame,
    resetStats,
  } = useReactionGame();

  const getPhaseClass = () => {
    switch (phase) {
      case PHASE.IDLE: return 'phase-idle';
      case PHASE.WAITING: return 'phase-waiting';
      case PHASE.READY: return 'phase-ready';
      case PHASE.RESULT: return 'phase-result';
      case PHASE.EARLY: return 'phase-early';
      default: return 'phase-idle';
    }
  };

  const getWinner = () => {
    if (player1Best === null && player2Best === null) return null;
    if (player1Best === null) return 2;
    if (player2Best === null) return 1;
    if (player1Best < player2Best) return 1;
    if (player2Best < player1Best) return 2;
    return null;
  };

  const winner = getWinner();
  const showMPResults = multiplayer && phase === PHASE.RESULT && player1Best !== null && player2Best !== null;

  return (
    <div className={`reaction-game ${getPhaseClass()}`} onClick={handleClick}>
      {/* Player indicator for multiplayer */}
      {multiplayer && (phase === PHASE.WAITING || phase === PHASE.READY) && (
        <div className={`player-indicator ${currentPlayer === 1 ? 'player1-indicator' : 'player2-indicator'}`}>
          Player {currentPlayer}'s Turn
        </div>
      )}

      {/* ---- IDLE / START SCREEN ---- */}
      {phase === PHASE.IDLE && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="game-title">Reaction Time</h1>
          <p className="game-subtitle">Test your reflexes</p>

          <div className="mode-selector">
            <button
              className={`mode-btn ${!multiplayer ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); startGame(false); }}
            >
              Single Player
            </button>
            <button
              className={`mode-btn ${multiplayer ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); startGame(true); }}
            >
              Two Players
            </button>
          </div>

          <button className="start-btn" onClick={(e) => { e.stopPropagation(); startGame(false); }}>
            Start Game
          </button>

          {bestTime !== null && (
            <div className="stats-panel">
              <div className="stat-item">
                <div className="stat-label">Personal Best</div>
                <div className="stat-value best">{bestTime} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>ms</span></div>
              </div>
              {roundsPlayed > 0 && (
                <>
                  <div className="stat-item">
                    <div className="stat-label">Rounds</div>
                    <div className="stat-value">{roundsPlayed}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Average</div>
                    <div className="stat-value">{averageTime} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>ms</span></div>
                  </div>
                </>
              )}
            </div>
          )}

          {roundsPlayed > 0 && (
            <button className="reset-btn" onClick={(e) => { e.stopPropagation(); resetStats(); }}>
              Reset Stats
            </button>
          )}
        </div>
      )}

      {/* ---- WAITING (RED) SCREEN ---- */}
      {phase === PHASE.WAITING && (
        <>
          <span className="big-text waiting-text">Wait for green...</span>
          <span className="hint-text">Don't click too early</span>
        </>
      )}

      {/* ---- READY (GREEN) SCREEN ---- */}
      {phase === PHASE.READY && (
        <span className="big-text ready-text">CLICK NOW!</span>
      )}

      {/* ---- RESULT SCREEN ---- */}
      {phase === PHASE.RESULT && !showMPResults && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="result-container">
            <div className="result-time">
              {reactionTime}<span className="result-unit"> ms</span>
            </div>
            {performance && (
              <div className="result-label" style={{ color: performance.color }}>
                {performance.label}
              </div>
            )}
          </div>

          <div className="stats-panel">
            {bestTime !== null && (
              <div className="stat-item">
                <div className="stat-label">Best</div>
                <div className="stat-value best">{bestTime} ms</div>
              </div>
            )}
            <div className="stat-item">
              <div className="stat-label">Rounds</div>
              <div className="stat-value">{roundsPlayed}</div>
            </div>
            {averageTime !== null && (
              <div className="stat-item">
                <div className="stat-label">Average</div>
                <div className="stat-value">{averageTime} ms</div>
              </div>
            )}
          </div>

          <span className="hint-text">Click anywhere to play again</span>
        </div>
      )}

      {/* ---- EARLY CLICK (ORANGE) SCREEN ---- */}
      {phase === PHASE.EARLY && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="early-icon">⛔</div>
          <div className="early-text">Too Soon!</div>
          <div className="early-sub">Wait for the green screen</div>
          <span className="hint-text">Click anywhere to try again</span>
        </div>
      )}

      {/* ---- MULTIPLAYER RESULTS ---- */}
      {showMPResults && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="results-title">🏆 Results</div>
          <div className="results-subtitle">Best times comparison</div>

          <div className="multiplayer-result">
            <div className={`player-result ${winner === 1 ? 'winner' : ''}`}>
              <div className="player-result-name" style={{ color: '#667eea' }}>Player 1</div>
              <div className="player-result-best">
                {player1Best !== null ? `${player1Best} ms` : '-'}
              </div>
              <div className="player-result-avg">
                Avg: {player1Average !== null ? `${player1Average} ms` : '-'}
              </div>
              {winner === 1 && <div className="winner-badge">Winner</div>}
            </div>
            <div className={`player-result ${winner === 2 ? 'winner' : ''}`}>
              <div className="player-result-name" style={{ color: '#f7971e' }}>Player 2</div>
              <div className="player-result-best">
                {player2Best !== null ? `${player2Best} ms` : '-'}
              </div>
              <div className="player-result-avg">
                Avg: {player2Average !== null ? `${player2Average} ms` : '-'}
              </div>
              {winner === 2 && <div className="winner-badge">Winner</div>}
            </div>
          </div>

          <span className="hint-text">Click anywhere for another round</span>
        </div>
      )}
    </div>
  );
}