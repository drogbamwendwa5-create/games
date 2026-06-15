import { useState, useCallback, useRef } from 'react';

// Piece types
const PIECE_TYPES = {
  KING: 'k',
  QUEEN: 'q',
  ROOK: 'r',
  BISHOP: 'b',
  KNIGHT: 'n',
  PAWN: 'p',
};

const COLORS = { WHITE: 'white', BLACK: 'black' };

function createInitialBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  // Black pieces (rank 7)
  for (let file = 0; file < 8; file++) {
    board[7][file] = { type: backRank[file], color: COLORS.BLACK };
    board[6][file] = { type: PIECE_TYPES.PAWN, color: COLORS.BLACK };
  }

  // White pieces (rank 0)
  for (let file = 0; file < 8; file++) {
    board[0][file] = { type: backRank[file], color: COLORS.WHITE };
    board[1][file] = { type: PIECE_TYPES.PAWN, color: COLORS.WHITE };
  }

  return board;
}

function isInBounds(rank, file) {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8;
}

function getPawnMoves(board, rank, file, piece) {
  const moves = [];
  const direction = piece.color === COLORS.WHITE ? 1 : -1;
  const startRank = piece.color === COLORS.WHITE ? 1 : 6;

  // Forward one
  const nextRank = rank + direction;
  if (isInBounds(nextRank, file) && !board[nextRank][file]) {
    moves.push({ rank: nextRank, file });

    // Forward two from start
    const twoRank = rank + 2 * direction;
    if (rank === startRank && !board[twoRank][file]) {
      moves.push({ rank: twoRank, file });
    }
  }

  // Captures
  for (const df of [-1, 1]) {
    const captureFile = file + df;
    if (isInBounds(nextRank, captureFile)) {
      const target = board[nextRank][captureFile];
      if (target && target.color !== piece.color) {
        moves.push({ rank: nextRank, file: captureFile });
      }
    }
  }

  return moves;
}

function getKnightMoves(board, rank, file, piece) {
  const moves = [];
  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  for (const [dr, df] of knightOffsets) {
    const newRank = rank + dr;
    const newFile = file + df;
    if (isInBounds(newRank, newFile)) {
      const target = board[newRank][newFile];
      if (!target || target.color !== piece.color) {
        moves.push({ rank: newRank, file: newFile });
      }
    }
  }

  return moves;
}

function getSlidingMoves(board, rank, file, piece, directions) {
  const moves = [];

  for (const [dr, df] of directions) {
    let newRank = rank + dr;
    let newFile = file + df;

    while (isInBounds(newRank, newFile)) {
      const target = board[newRank][newFile];
      if (!target) {
        moves.push({ rank: newRank, file: newFile });
      } else {
        if (target.color !== piece.color) {
          moves.push({ rank: newRank, file: newFile });
        }
        break;
      }
      newRank += dr;
      newFile += df;
    }
  }

  return moves;
}

function getRookMoves(board, rank, file, piece) {
  return getSlidingMoves(board, rank, file, piece, [
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ]);
}

function getBishopMoves(board, rank, file, piece) {
  return getSlidingMoves(board, rank, file, piece, [
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ]);
}

function getQueenMoves(board, rank, file, piece) {
  return [
    ...getRookMoves(board, rank, file, piece),
    ...getBishopMoves(board, rank, file, piece),
  ];
}

function getKingMoves(board, rank, file, piece) {
  const moves = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      if (dr === 0 && df === 0) continue;
      const newRank = rank + dr;
      const newFile = file + df;
      if (isInBounds(newRank, newFile)) {
        const target = board[newRank][newFile];
        if (!target || target.color !== piece.color) {
          moves.push({ rank: newRank, file: newFile });
        }
      }
    }
  }
  return moves;
}

function getPieceMoves(board, rank, file) {
  const piece = board[rank][file];
  if (!piece) return [];

  switch (piece.type) {
    case PIECE_TYPES.PAWN: return getPawnMoves(board, rank, file, piece);
    case PIECE_TYPES.KNIGHT: return getKnightMoves(board, rank, file, piece);
    case PIECE_TYPES.BISHOP: return getBishopMoves(board, rank, file, piece);
    case PIECE_TYPES.ROOK: return getRookMoves(board, rank, file, piece);
    case PIECE_TYPES.QUEEN: return getQueenMoves(board, rank, file, piece);
    case PIECE_TYPES.KING: return getKingMoves(board, rank, file, piece);
    default: return [];
  }
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function findKing(board, color) {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
        return { rank, file };
      }
    }
  }
  return null;
}

function isSquareUnderAttack(board, rank, file, byColor) {
  // Check all opponent pieces for attacks on this square
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.color === byColor) {
        const moves = getPieceMoves(board, r, f);
        if (moves.some(m => m.rank === rank && m.file === file)) {
          return true;
        }
      }
    }
  }
  return false;
}

function isKingInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  return isSquareUnderAttack(board, king.rank, king.file, opponentColor);
}

function isMoveLegal(board, fromRank, fromFile, toRank, toFile) {
  const newBoard = cloneBoard(board);
  newBoard[toRank][toFile] = newBoard[fromRank][fromFile];
  newBoard[fromRank][fromFile] = null;

  const piece = board[fromRank][fromFile];
  return !isKingInCheck(newBoard, piece.color);
}

function getLegalMoves(board, rank, file) {
  const piece = board[rank][file];
  if (!piece) return [];

  const pseudoMoves = getPieceMoves(board, rank, file);
  return pseudoMoves.filter(move => isMoveLegal(board, rank, file, move.rank, move.file));
}

export function useChessGame() {
  const [board, setBoard] = useState(() => createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState(COLORS.WHITE);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [isInCheck, setIsInCheck] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const handleSquareClick = useCallback((rank, file) => {
    if (gameOver) return;

    const piece = board[rank][file];

    // If a piece is already selected
    if (selectedSquare) {
      // Check if clicking on own piece - reselect
      if (piece && piece.color === currentTurn) {
        const moves = getLegalMoves(board, rank, file);
        setSelectedSquare({ rank, file });
        setLegalMoves(moves);
        return;
      }

      // Check if this is a legal move
      const isLegal = legalMoves.some(m => m.rank === rank && m.file === file);
      if (isLegal) {
        const captured = board[rank][file];
        const newBoard = cloneBoard(board);
        const movingPiece = newBoard[selectedSquare.rank][selectedSquare.file];

        // Special pawn promotion (auto-queen)
        if (movingPiece.type === PIECE_TYPES.PAWN && (rank === 0 || rank === 7)) {
          movingPiece.type = PIECE_TYPES.QUEEN;
        }

        newBoard[rank][file] = movingPiece;
        newBoard[selectedSquare.rank][selectedSquare.file] = null;

        // Track captured pieces
        const newCapturedPieces = { ...capturedPieces };
        if (captured) {
          newCapturedPieces[currentTurn] = [
            ...newCapturedPieces[currentTurn],
            { ...captured, capturedFrom: { rank, file } },
          ];
        }

        // Add to move history
        const newHistory = [
          ...moveHistory,
          {
            piece: movingPiece,
            from: selectedSquare,
            to: { rank, file },
            captured,
          },
        ];

        setBoard(newBoard);
        setMoveHistory(newHistory);
        setCapturedPieces(newCapturedPieces);
        setSelectedSquare(null);
        setLegalMoves([]);
        setMoveCount(prev => prev + 1);

        // Check game state
        const nextTurn = currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        const kingInCheck = isKingInCheck(newBoard, nextTurn);

        // Check if opponent has any legal moves
        let hasLegalMove = false;
        for (let r = 0; r < 8 && !hasLegalMove; r++) {
          for (let f = 0; f < 8 && !hasLegalMove; f++) {
            const p = newBoard[r][f];
            if (p && p.color === nextTurn) {
              const moves = getLegalMoves(newBoard, r, f);
              if (moves.length > 0) hasLegalMove = true;
            }
          }
        }

        if (!hasLegalMove) {
          setGameOver(true);
          if (kingInCheck) {
            setWinner(currentTurn);
          } else {
            setWinner(null); // stalemate
          }
        } else {
          setIsInCheck(kingInCheck);
          setCurrentTurn(nextTurn);
        }
        return;
      }

      // Illegal move - deselect
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // No piece selected - select one
    if (piece && piece.color === currentTurn) {
      const moves = getLegalMoves(board, rank, file);
      setSelectedSquare({ rank, file });
      setLegalMoves(moves);
    }
  }, [board, currentTurn, selectedSquare, legalMoves, gameOver, capturedPieces, moveHistory]);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentTurn(COLORS.WHITE);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setIsInCheck(false);
    setMoveCount(0);
  }, []);

  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = cloneBoard(board);

    // Restore piece to original position
    newBoard[lastMove.from.rank][lastMove.from.file] = lastMove.piece;
    newBoard[lastMove.to.rank][lastMove.to.file] = lastMove.captured || null;

    // If pawn was promoted, restore it
    if (lastMove.piece.type === PIECE_TYPES.QUEEN && lastMove.from.rank === 1 || lastMove.from.rank === 6) {
      const prevMove = moveHistory.length > 1 ? moveHistory[moveHistory.length - 2] : null;
      if (prevMove && prevMove.piece.type === PIECE_TYPES.PAWN) {
        newBoard[lastMove.from.rank][lastMove.from.file] = { type: PIECE_TYPES.PAWN, color: lastMove.piece.color };
      }
    }

    // Fix captured pieces
    const newCapturedPieces = { ...capturedPieces };
    if (lastMove.captured) {
      const turn = lastMove.piece.color;
      const idx = newCapturedPieces[turn].findLastIndex(
        c => c.type === lastMove.captured.type && c.capturedFrom?.rank === lastMove.to.rank && c.capturedFrom?.file === lastMove.to.file
      );
      if (idx !== -1) {
        newCapturedPieces[turn] = newCapturedPieces[turn].filter((_, i) => i !== idx);
      }
    }

    setBoard(newBoard);
    setCurrentTurn(lastMove.piece.color);
    setMoveHistory(moveHistory.slice(0, -1));
    setCapturedPieces(newCapturedPieces);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOver(false);
    setWinner(null);
    setIsInCheck(isKingInCheck(newBoard, lastMove.piece.color));
    setMoveCount(prev => Math.max(0, prev - 1));
  }, [board, moveHistory, capturedPieces]);

  return {
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
  };
}

export { PIECE_TYPES, COLORS };