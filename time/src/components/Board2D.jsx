import { useMemo, useRef, useEffect, useState } from 'react';

const LIGHT_COLOR = '#f0d9b5';
const DARK_COLOR = '#b58863';
const HIGHLIGHT_COLOR = '#7fc97f';
const CHECK_COLOR = '#e74c3c';
const SELECTED_COLOR = '#f1c40f';

const FILE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_NUMBERS = [8, 7, 6, 5, 4, 3, 2, 1];

// Tall piece profile points (mirroring the lathe geometry from ChessPiece.jsx)
// Each profile is a set of [x, y] points defining the right half of the piece silhouette
// Scaled and centered for a 64x64 canvas
const PIECE_PROFILES = {
  // Pawn profile
  p: [
    [0, 64], [14, 64], [15.2, 63.2], [14, 61.6], [10, 58.4],
    [8.8, 54], [8, 46.4], [6, 40], [7.2, 36], [8.8, 32],
    [8, 25.6], [4.8, 24], [4, 22.4], [4, 17.6], [0, 17.6],
  ],
  // Rook profile
  r: [
    [0, 64], [15.2, 64], [16.8, 63.2], [16, 61.6], [12.8, 58.4],
    [12, 40], [12.8, 36], [15.2, 27], [14, 23], [11.2, 19],
    [11.2, 14], [12.8, 12], [12.8, 8.8], [8.8, 6.4], [0, 6.4],
  ],
  // Knight profile (simplified but recognizable)
  n: [
    [0, 64], [14, 64], [15.2, 63.2], [14.4, 61.6], [11.2, 58.4],
    [10.4, 52], [9.6, 44], [8, 36], [7.2, 32.8], [6, 30.4],
    [4, 28], [3.2, 24], [4.8, 20.8], [8.8, 18.4],
    [10, 16], [8, 12.8], [6, 9.6], [2, 8], [0, 8],
  ],
  // Bishop profile
  b: [
    [0, 64], [14, 64], [15.2, 63.2], [14.4, 61.6], [11.2, 58.4],
    [10.4, 44.8], [8, 36.8], [5.6, 28.8], [4.8, 25.6],
    [6.4, 22.4], [8, 19.2], [7.2, 14.4], [3.2, 11.2],
    [2.8, 6.4], [4.8, 4.8], [3.2, 2.4], [0, 2.4],
  ],
  // Queen profile
  q: [
    [0, 64], [15.2, 64], [16.8, 63.2], [16, 61.6], [12.8, 58.4],
    [11.2, 44.8], [12.8, 38.4], [13.6, 33.6], [14, 28.8],
    [12.8, 25.6], [11.2, 22.4], [6.4, 17.6], [5.6, 14.4],
    [7.2, 11.2], [6.4, 6.4], [4, 4.8], [0, 4.8],
  ],
  // King profile
  k: [
    [0, 64], [16, 64], [17.6, 63.2], [16.8, 61.6], [12.8, 58.4],
    [12, 44.8], [13.6, 38.4], [14.4, 33.6], [15.2, 28.8],
    [15.2, 25.6], [13.6, 22.4], [11.2, 17.6], [10.4, 12.8],
    [11.2, 10.4], [8.8, 8], [4.8, 6.4], [0, 6.4],
  ],
};

// Checkers piece profiles
const CHECKERS_PROFILES = {
  man: [
    [0, 64], [16, 64], [18, 62], [17, 58], [14, 52],
    [13, 44], [14, 38], [16, 34], [16, 30], [12, 26],
    [8, 24], [4, 22], [2, 20], [1, 18], [0, 18],
  ],
  king: [
    [0, 64], [18, 64], [20, 62], [19, 58], [15, 50],
    [14, 40], [16, 34], [18, 30], [18, 26], [12, 22],
    [6, 20], [3, 18], [2, 16], [1, 14], [0, 14],
  ],
};

function renderPieceToCanvas(piece, size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const isWhite = piece.color === 'white';
  const isCheckers = piece.type === 'man' || piece.type === 'king';

  // Get profile points
  let profile;
  if (isCheckers) {
    profile = CHECKERS_PROFILES[piece.type];
  } else {
    profile = PIECE_PROFILES[piece.type];
  }

  if (!profile) {
    // Fallback: draw a circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = isWhite ? '#f0f0f0' : '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.stroke();
    return canvas;
  }

  // Scale profile to fit canvas with padding
  const padding = 2;
  const maxX = Math.max(...profile.map(p => p[0]));
  const maxY = Math.max(...profile.map(p => p[1]));
  const scaleX = (size - padding * 2) / maxX;
  const scaleY = (size - padding * 2) / maxY;
  const scale = Math.min(scaleX, scaleY);

  // Draw the piece profile (right half mirrored to left half)
  ctx.beginPath();
  ctx.moveTo(size / 2, padding);

  // Right side: go down along profile points
  for (let i = 0; i < profile.length; i++) {
    const [x, y] = profile[i];
    const cx = size / 2 + x * scale;
    const cy = padding + y * scale;
    ctx.lineTo(cx, cy);
  }

  // Bottom center
  ctx.lineTo(size / 2, padding + profile[profile.length - 1][1] * scale);

  ctx.closePath();

  // Fill
  if (isCheckers) {
    // Checkers pieces get a solid fill with a subtle gradient
    const grad = ctx.createRadialGradient(size / 2, size * 0.3, 0, size / 2, size / 2, size / 2);
    if (isWhite) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#f0f0f0');
      grad.addColorStop(1, '#d0d0d0');
    } else {
      grad.addColorStop(0, '#444444');
      grad.addColorStop(0.5, '#222222');
      grad.addColorStop(1, '#000000');
    }
    ctx.fillStyle = grad;
  } else {
    // Chess pieces get a metallic gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    if (isWhite) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#f5f5f5');
      grad.addColorStop(0.7, '#e8e8e8');
      grad.addColorStop(1, '#d0d0d0');
    } else {
      grad.addColorStop(0, '#444444');
      grad.addColorStop(0.3, '#333333');
      grad.addColorStop(0.7, '#1a1a1a');
      grad.addColorStop(1, '#000000');
    }
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // Stroke for definition
  ctx.strokeStyle = isWhite ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Add highlight/shine effect
  ctx.beginPath();
  const shineX = size / 2 - size * 0.12;
  ctx.ellipse(shineX, size * 0.25, size * 0.08, size * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = isWhite ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)';
  ctx.fill();

  // Crown indicator for checkers king
  if (piece.type === 'king' && isCheckers) {
    ctx.beginPath();
    ctx.font = `${size * 0.35}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isWhite ? '#d4a017' : '#ffd700';
    ctx.fillText('♛', size / 2, size * 0.35);
  }

  return canvas;
}

// Cache rendered piece canvases
const pieceCanvasCache = new Map();

function getPieceCanvas(piece) {
  const key = `${piece.type}-${piece.color}-${piece.type === 'man' ? 'man' : piece.type}`;
  if (!pieceCanvasCache.has(key)) {
    pieceCanvasCache.set(key, renderPieceToCanvas(piece));
  }
  return pieceCanvasCache.get(key);
}

function PieceImage({ piece, legalTarget }) {
  const canvas = getPieceCanvas(piece);
  const dataUrl = canvas.toDataURL();

  return (
    <img
      src={dataUrl}
      alt={`${piece.color} ${piece.type}`}
      className={`board2d-piece ${piece.color} ${legalTarget ? 'capturable' : ''}`}
      style={{
        width: '85%',
        height: '85%',
        objectFit: 'contain',
        pointerEvents: 'none',
        userSelect: 'none',
        imageRendering: 'auto',
      }}
      draggable={false}
    />
  );
}

export default function Board2D({
  board,
  onSquareClick,
  selectedSquare,
  legalMoves,
  currentTurn,
  isInCheck,
  gameMode,
}) {
  // Find king in check for chess mode
  const checkSquare = useMemo(() => {
    if (!isInCheck || gameMode === 'checkers') return null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = board[row][col];
        if (p && p.type === 'k' && p.color === currentTurn) {
          return { row, col };
        }
      }
    }
    return null;
  }, [board, isInCheck, currentTurn, gameMode]);

  const isLegalTarget = (row, col) => {
    return legalMoves.some(m => m.row === row && m.col === col);
  };

  const isSelected = (row, col) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isCheck = (row, col) => {
    return checkSquare?.row === row && checkSquare?.col === col;
  };

  return (
    <div className="board2d-container">
      <div className="board2d">
        {board.map((rank, row) =>
          rank.map((piece, col) => {
            const isDark = (row + col) % 2 === 1;
            let bgColor = isDark ? DARK_COLOR : LIGHT_COLOR;
            if (isSelected(row, col)) bgColor = SELECTED_COLOR;
            if (isCheck(row, col)) bgColor = CHECK_COLOR;
            const legalTarget = isLegalTarget(row, col);

            return (
              <div
                key={`${row}-${col}`}
                className={`board2d-square ${isDark ? 'dark' : 'light'} ${legalTarget && !piece ? 'highlight' : ''} ${legalTarget && piece ? 'capture-target' : ''}`}
                style={{ backgroundColor: bgColor }}
                onClick={() => onSquareClick(row, col)}
              >
                {/* Rank labels on the left edge */}
                {col === 0 && (
                  <span className="board2d-label rank-label">
                    {RANK_NUMBERS[row]}
                  </span>
                )}

                {/* Piece rendered as tall 3D-style icon */}
                {piece && (
                  <PieceImage piece={piece} legalTarget={legalTarget} />
                )}

                {/* Move indicator dot */}
                {legalTarget && !piece && (
                  <div className="move-indicator" />
                )}

                {/* Capture ring indicator */}
                {legalTarget && piece && (
                  <div className="capture-ring" />
                )}

                {/* File labels on the bottom edge */}
                {row === 7 && (
                  <span className="board2d-label file-label">
                    {FILE_LETTERS[col]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}