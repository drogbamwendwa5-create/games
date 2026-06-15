import { useState } from 'react';
import { useChessGame, PIECE_TYPES, COLORS } from './hooks/useChessGame';
import { useCheckersGame } from './hooks/useCheckersGame';
import Chess3D from './components/Chess3D';
import Board2D from './components/Board2D';
import './App.css';

const PIECE_UNICODE = {
  k: { white: '♔', black: '♚' },
  q: { white: '♕', black: '♛' },
  r: { white: '♖', black: '♜' },
  b: { white: '♗', black: '♝' },
  n: { white: '♘', black: '♞' },
  p: { white: '♙', black: '♟' },
};

function formatMove(move, index, gameMode) {
  if (gameMode === 'checkers') {
    const fromFile = 'abcdefgh'[move.from.col];
    const fromRank = move.from.row + 1;
    const toFile = 'abcdefgh'[move.to.col];
    const toRank = move.to.row + 1;
    const capture = move.captured ? 'x' : '-';
    const pieceChar = move.piece.type === 'king' ? 'K' : '';
    return `${pieceChar}${fromFile}${fromRank}${capture}${toFile}${toRank}`;
  }
  const pieceChar = move.piece.type === 'p' ? '' : move.piece.type.toUpperCase();
  const fromFile = 'abcdefgh'[move.from.file];
  const fromRank = move.from.rank + 1;
  const toFile = 'abcdefgh'[move.to.file];
  const toRank = move.to.rank + 1;
  const capture = move.captured ? 'x' : '-';
  return `${pieceChar}${fromFile}${fromRank}${capture}${toFile}${toRank}`;
}

function App() {
  const chessGame = useChessGame();
  const checkersGame = useCheckersGame();

  const [mode, setMode] = useState('chess');
  const game = mode === 'chess' ? chessGame : checkersGame;

  const {
    board,
    currentTurn,
    selectedSquare,
    legalMoves,
    gameOver,
    winner,
    moveHistory,
    capturedPieces,
    isInCheck,
    moveCount,
    handleSquareClick,
    resetGame,
    undoMove,
  } = game;

  const whiteCaptured = capturedPieces.white || [];
  const blackCaptured = capturedPieces.black || [];

  const toggleMode = () => {
    const newMode = mode === 'chess' ? 'checkers' : 'chess';
    setMode(newMode);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="game-header">
        <div className="game-title">
          {mode === 'chess' ? '3D Chess' : 'Checkers'}
        </div>
        <div className="turn-indicator">
          <button className="btn btn-mode-toggle" onClick={toggleMode}>
            Switch to {mode === 'chess' ? 'Checkers' : '3D Chess'}
          </button>
          <span className={`turn-badge ${currentTurn}`}>
            <span className={`turn-dot ${currentTurn}`} />
            {currentTurn === 'white' ? 'White' : 'Black'}'s Turn
          </span>
          {mode === 'chess' && isInCheck && !gameOver && (
            <span className="check-indicator">CHECK!</span>
          )}
          {gameOver && (
            <span className={`game-status ${winner ? 'won' : ''}`}>
              {winner ? `${winner === 'white' ? 'White' : 'Black'} Wins!` : 'Draw!'}
            </span>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="game-layout">
        <div className="board-area">
          {gameOver && (
            <div className="game-over-overlay">
              <div className="game-over-modal">
                <div className={`game-over-title ${winner ? 'checkmate' : 'stalemate'}`}>
                  {winner ? `${mode === 'chess' ? 'Checkmate!' : 'Winner!'} 🏆` : 'Draw! 🤝'}
                </div>
                <div className="game-over-subtitle">
                  {winner
                    ? `${winner === 'white' ? 'White' : 'Black'} wins in ${moveHistory.length} moves!`
                    : 'The game is a draw.'}
                </div>
                <button className="btn btn-primary" onClick={resetGame}>
                  New Game
                </button>
              </div>
            </div>
          )}

          {mode === 'chess' ? (
            <Chess3D
              board={board}
              onSquareClick={handleSquareClick}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              currentTurn={currentTurn}
              isInCheck={isInCheck}
            />
          ) : (
            <Board2D
              board={board}
              onSquareClick={handleSquareClick}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              currentTurn={currentTurn}
              isInCheck={isInCheck}
              gameMode={mode}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          {/* Game controls */}
          <div className="panel-section">
            <div className="panel-section-title">Controls</div>
            <div className="controls">
              <button className="btn btn-primary" onClick={resetGame}>
                New Game
              </button>
              <button className="btn" onClick={undoMove} disabled={moveHistory.length === 0}>
                Undo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="panel-section">
            <div className="panel-section-title">Game Stats</div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Moves</div>
                <div className="stat-value">{moveCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Turn</div>
                <div className="stat-value" style={{ color: currentTurn === 'white' ? '#f0f0f0' : '#555' }}>
                  #{Math.floor(moveCount / 2) + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Captured Pieces */}
          <div className="panel-section">
            <div className="panel-section-title">Captured</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
              White captured:
            </div>
            <div className="captured-pieces">
              {whiteCaptured.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>None</span>
              ) : (
                whiteCaptured.map((p, i) => (
                  <span key={i} className="captured-icon">
                    {mode === 'checkers'
                      ? (p.type === 'king' ? '♚' : '●')
                      : (PIECE_UNICODE[p.type]?.black || '?')}
                  </span>
                ))
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 8, marginBottom: 6 }}>
              Black captured:
            </div>
            <div className="captured-pieces">
              {blackCaptured.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>None</span>
              ) : (
                blackCaptured.map((p, i) => (
                  <span key={i} className="captured-icon">
                    {mode === 'checkers'
                      ? (p.type === 'king' ? '♛' : '○')
                      : (PIECE_UNICODE[p.type]?.white || '?')}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Move History */}
          <div className="panel-section" style={{ flex: 1 }}>
            <div className="panel-section-title">Move History</div>
            <div className="move-history">
              {moveHistory.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 10 }}>
                  No moves yet
                </div>
              ) : (
                moveHistory.map((move, i) => (
                  <div key={i} className="move-entry">
                    <span className="move-number">
                      {i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''}
                    </span>
                    <span className={`move-${move.piece.color}`}>
                      {formatMove(move, i, mode)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;