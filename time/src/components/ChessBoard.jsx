import { useMemo } from 'react';
import { ChessPiece } from './ChessPiece';

const BOARD_COLORS = ['#f0d9b5', '#b58863'];
const FILE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

function getInitialPieces() {
  const pieces = [
    // Black back rank
    ...['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map((type, i) => ({
      id: `b${type}${i}`, type, color: 'black', file: i, rank: 7,
    })),
    // Black pawns
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `bp${i}`, type: 'p', color: 'black', file: i, rank: 6,
    })),
    // White pawns
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `wp${i}`, type: 'p', color: 'white', file: i, rank: 1,
    })),
    // White back rank
    ...['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map((type, i) => ({
      id: `w${type}${i}`, type, color: 'white', file: i, rank: 0,
    })),
  ];
  return pieces;
}

export default function ChessBoard() {
  const initialPieces = useMemo(() => getInitialPieces(), []);

  return (
    <group>
      {/* Board squares */}
      {Array.from({ length: 8 }, (_, rank) =>
        Array.from({ length: 8 }, (_, file) => {
          const isDark = (rank + file) % 2 === 1;
          return (
            <mesh
              key={`${rank}-${file}`}
              position={[file - 3.5, 0, rank - 3.5]}
              receiveShadow
            >
              <boxGeometry args={[1, 0.2, 1]} />
              <meshStandardMaterial
                color={isDark ? BOARD_COLORS[1] : BOARD_COLORS[0]}
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>
          );
        })
      )}

      {/* Board border/frame */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[8.6, 0.1, 8.6]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>

      {/* File labels (a-h) */}
      {FILE_LETTERS.map((letter, i) => (
        <mesh key={`file-${letter}`} position={[i - 3.5, -0.3, 4.2]}>
          <textGeometry />
          <sprite position={[i - 3.5, -0.4, 4.5]} scale={[0.5, 0.5, 1]}>
            <spriteMaterial />
          </sprite>
        </mesh>
      ))}

      {/* Pieces */}
      {initialPieces.map((piece) => (
        <ChessPiece key={piece.id} piece={piece} />
      ))}
    </group>
  );
}