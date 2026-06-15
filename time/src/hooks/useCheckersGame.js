import { useState, useCallback } from 'react';

const COLORS = { WHITE: 'white', BLACK: 'black' };
const PIECE_TYPES = { MAN: 'man', KING: 'king' };

function createInitialBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  // Black pieces on top (rows 0-2), only dark squares
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: PIECE_TYPES.MAN, color: COLORS.BLACK };
      }
    }
  }
  // White pieces on bottom (rows 5-7), only dark squares
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: PIECE_TYPES.MAN, color: COLORS.WHITE };
      }
    }
  }
  return board;
}

function isInBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getJumpMoves(board, row, col, piece) {
  const moves = [];
  const directions = piece.type === PIECE_TYPES.KING
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.color === COLORS.WHITE
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dr, dc] of directions) {
    const jumpRow = row + dr * 2;
    const jumpCol = col + dc * 2;
    const midRow = row + dr;
    const midCol = col + dc;

    if (
      isInBounds(jumpRow, jumpCol) &&
      board[midRow][midCol] &&
      board[midRow][midCol].color !== piece.color &&
      !board[jumpRow][jumpCol]
    ) {
      moves.push({ row: jumpRow, col: jumpCol, capture: { row: midRow, col: midCol } });
    }
  }
  return moves;
}

function getSimpleMoves(board, row, col, piece) {
  const moves = [];
  const directions = piece.type === PIECE_TYPES.KING
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.color === COLORS.WHITE
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isInBounds(newRow, newCol) && !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol, capture: null });
    }
  }
  return moves;
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

export function useCheckersGame() {
  const [board, setBoard] = useState(() => createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState(COLORS.WHITE);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [mustJumpChain, setMustJumpChain] = useState(null);
  const [moveCount, setMoveCount] = useState(0);

  // Get all pieces that must jump (forced captures)
  function getPiecesWithJumps(boardState, color) {
    const result = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && piece.color === color) {
          const jumps = getJumpMoves(boardState, row, col, piece);
          if (jumps.length > 0) {
            result.push({ row, col, piece, jumps });
          }
        }
      }
    }
    return result;
  }

  const handleSquareClick = useCallback((row, col) => {
    if (gameOver) return;

    const piece = board[row][col];
    const isOwnPiece = piece && piece.color === currentTurn;

    // If in a jump chain, only allow the jumping piece or further jumps
    if (mustJumpChain) {
      if (isOwnPiece && mustJumpChain.row === row && mustJumpChain.col === col) {
        // Already selected this piece - show its moves
        const jumps = getJumpMoves(board, row, col, piece);
        setSelectedSquare({ row, col });
        setLegalMoves(jumps);
        return;
      }

      // Check if clicking on a legal jump target
      const isLegal = legalMoves.some(m => m.row === row && m.col === col);
      if (isLegal) {
        const move = legalMoves.find(m => m.row === row && m.col === col);
        const newBoard = cloneBoard(board);
        const movingPiece = newBoard[mustJumpChain.row][mustJumpChain.col];

        // Capture the jumped piece
        const capturedPiece = newBoard[move.capture.row][move.capture.col];

        // Move piece
        newBoard[row][col] = movingPiece;
        newBoard[mustJumpChain.row][mustJumpChain.col] = null;
        newBoard[move.capture.row][move.capture.col] = null;

        // King promotion
        let promoted = false;
        if (movingPiece.type === PIECE_TYPES.MAN) {
          if (movingPiece.color === COLORS.WHITE && row === 0) {
            movingPiece.type = PIECE_TYPES.KING;
            promoted = true;
          } else if (movingPiece.color === COLORS.BLACK && row === 7) {
            movingPiece.type = PIECE_TYPES.KING;
            promoted = true;
          }
        }

        // Track captured
        const newCapturedPieces = { ...capturedPieces };
        if (capturedPiece) {
          newCapturedPieces[currentTurn] = [
            ...newCapturedPieces[currentTurn],
            capturedPiece,
          ];
        }

        // Check for additional jumps (chain)
        if (!promoted) {
          const additionalJumps = getJumpMoves(newBoard, row, col, movingPiece);
          if (additionalJumps.length > 0) {
            setBoard(newBoard);
            setSelectedSquare({ row, col });
            setLegalMoves(additionalJumps);
            setMustJumpChain({ row, col });
            setCapturedPieces(newCapturedPieces);
            return;
          }
        }

        // Move complete
        const nextTurn = currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        // Check if opponent has any moves
        const opponentJumps = getPiecesWithJumps(newBoard, nextTurn);
        let opponentHasMoves = opponentJumps.length > 0;

        if (!opponentHasMoves) {
          for (let r = 0; r < 8 && !opponentHasMoves; r++) {
            for (let c = 0; c < 8 && !opponentHasMoves; c++) {
              const p = newBoard[r][c];
              if (p && p.color === nextTurn) {
                const simple = getSimpleMoves(newBoard, r, c, p);
                if (simple.length > 0) opponentHasMoves = true;
              }
            }
          }
        }

        if (!opponentHasMoves) {
          setGameOver(true);
          setWinner(currentTurn);
        }

        const newHistory = [
          ...moveHistory,
          {
            piece: movingPiece,
            from: mustJumpChain,
            to: { row, col },
            captured: capturedPiece,
          },
        ];

        setBoard(newBoard);
        setMoveHistory(newHistory);
        setCapturedPieces(newCapturedPieces);
        setSelectedSquare(null);
        setLegalMoves([]);
        setMustJumpChain(null);
        setCurrentTurn(nextTurn);
        setMoveCount(prev => prev + 1);
        return;
      }

      // Clicked somewhere else - deselect if not own piece
      if (!isOwnPiece) {
        setSelectedSquare(null);
        setLegalMoves([]);
        setMustJumpChain(null);
      }
      return;
    }

    // If a piece is already selected (normal selection, not chain)
    if (selectedSquare) {
      // Click on own piece - reselect
      if (isOwnPiece) {
        const jumps = getJumpMoves(board, row, col, piece);
        const simple = getSimpleMoves(board, row, col, piece);
        const moves = jumps.length > 0 ? jumps : simple;
        setSelectedSquare({ row, col });
        setLegalMoves(moves);
        return;
      }

      // Check if legal move
      const isLegal = legalMoves.some(m => m.row === row && m.col === col);
      if (isLegal) {
        const move = legalMoves.find(m => m.row === row && m.col === col);
        const newBoard = cloneBoard(board);
        const movingPiece = newBoard[selectedSquare.row][selectedSquare.col];

        let capturedPiece = null;
        // Execute move
        if (move.capture) {
          capturedPiece = newBoard[move.capture.row][move.capture.col];
          newBoard[move.capture.row][move.capture.col] = null;
        }
        newBoard[row][col] = movingPiece;
        newBoard[selectedSquare.row][selectedSquare.col] = null;

        // King promotion
        let promoted = false;
        if (movingPiece.type === PIECE_TYPES.MAN) {
          if (movingPiece.color === COLORS.WHITE && row === 0) {
            movingPiece.type = PIECE_TYPES.KING;
            promoted = true;
          } else if (movingPiece.color === COLORS.BLACK && row === 7) {
            movingPiece.type = PIECE_TYPES.KING;
            promoted = true;
          }
        }

        // Track captured
        const newCapturedPieces = { ...capturedPieces };
        if (capturedPiece) {
          newCapturedPieces[currentTurn] = [
            ...newCapturedPieces[currentTurn],
            capturedPiece,
          ];
        }

        // Check for chain jumps after a capture
        if (move.capture && !promoted) {
          const additionalJumps = getJumpMoves(newBoard, row, col, movingPiece);
          if (additionalJumps.length > 0) {
            setBoard(newBoard);
            setSelectedSquare({ row, col });
            setLegalMoves(additionalJumps);
            setMustJumpChain({ row, col });
            setCapturedPieces(newCapturedPieces);
            return;
          }
        }

        // Move complete
        const nextTurn = currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        // Check if opponent has any moves
        const opponentJumps = getPiecesWithJumps(newBoard, nextTurn);
        let opponentHasMoves = opponentJumps.length > 0;

        if (!opponentHasMoves) {
          for (let r = 0; r < 8 && !opponentHasMoves; r++) {
            for (let c = 0; c < 8 && !opponentHasMoves; c++) {
              const p = newBoard[r][c];
              if (p && p.color === nextTurn) {
                const simple = getSimpleMoves(newBoard, r, c, p);
                if (simple.length > 0) opponentHasMoves = true;
              }
            }
          }
        }

        if (!opponentHasMoves) {
          setGameOver(true);
          setWinner(currentTurn);
        }

        const newHistory = [
          ...moveHistory,
          {
            piece: movingPiece,
            from: selectedSquare,
            to: { row, col },
            captured: capturedPiece,
          },
        ];

        setBoard(newBoard);
        setMoveHistory(newHistory);
        setCapturedPieces(newCapturedPieces);
        setSelectedSquare(null);
        setLegalMoves([]);
        setMustJumpChain(null);
        setCurrentTurn(nextTurn);
        setMoveCount(prev => prev + 1);
        return;
      }

      // Illegal move - deselect
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // No piece selected - try to select
    if (isOwnPiece) {
      // Check if any piece must jump (forced capture rule)
      const allJumps = getPiecesWithJumps(board, currentTurn);
      const canJump = allJumps.length > 0;

      if (canJump) {
        // Can only select pieces that can jump
        const pieceCanJump = allJumps.some(j => j.row === row && j.col === col);
        if (pieceCanJump) {
          const jumps = getJumpMoves(board, row, col, piece);
          setSelectedSquare({ row, col });
          setLegalMoves(jumps);
        }
      } else {
        const jumps = getJumpMoves(board, row, col, piece);
        const simple = getSimpleMoves(board, row, col, piece);
        const moves = jumps.length > 0 ? jumps : simple;
        if (moves.length > 0) {
          setSelectedSquare({ row, col });
          setLegalMoves(moves);
        }
      }
    }
  }, [board, currentTurn, selectedSquare, legalMoves, gameOver, capturedPieces, moveHistory, mustJumpChain]);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentTurn(COLORS.WHITE);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setMustJumpChain(null);
    setMoveCount(0);
  }, []);

  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = cloneBoard(board);

    // Restore piece to original position
    newBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    // If piece was promoted back to man, we need to handle that
    if (lastMove.piece.type === PIECE_TYPES.KING && lastMove.from.row !== undefined) {
      // Check if it was originally a man (simplification: always restore as-is)
    }
    newBoard[lastMove.to.row][lastMove.to.col] = null;

    // Restore captured piece
    if (lastMove.captured) {
      // Find where the capture happened - the midpoint
      const midRow = Math.floor((lastMove.from.row + lastMove.to.row) / 2);
      const midCol = Math.floor((lastMove.from.col + lastMove.to.col) / 2);
      newBoard[midRow][midCol] = lastMove.captured;
    }

    // Fix captured pieces
    const newCapturedPieces = { ...capturedPieces };
    if (lastMove.captured) {
      const turn = lastMove.piece.color;
      const idx = newCapturedPieces[turn].findLastIndex(
        c => c.type === lastMove.captured.type
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
    setMustJumpChain(null);
    setGameOver(false);
    setWinner(null);
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
    moveCount,
    mustJumpChain,
    handleSquareClick,
    resetGame,
    undoMove,
  };
}

export { PIECE_TYPES, COLORS };