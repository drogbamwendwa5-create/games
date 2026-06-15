import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PIECE_GEOMETRIES = {
  k: { height: 1.4, headRadius: 0.35, topRadius: 0.2, hasCross: true },
  q: { height: 1.3, headRadius: 0.35, topRadius: 0.25, hasCrown: true },
  r: { height: 1.1, headRadius: 0.3, topRadius: 0.25, isRook: true },
  b: { height: 1.05, headRadius: 0.25, topRadius: 0.15, isBishop: true },
  n: { height: 1.0, headRadius: 0.25, topRadius: 0.1, isKnight: true },
  p: { height: 0.8, headRadius: 0.2, topRadius: 0.15 },
};

function createPieceGeometry(type) {
  const config = PIECE_GEOMETRIES[type];
  if (!config) return createPawnGeometry();

  switch (type) {
    case 'k': return createKingGeometry(config);
    case 'q': return createQueenGeometry(config);
    case 'r': return createRookGeometry(config);
    case 'b': return createBishopGeometry(config);
    case 'n': return createKnightGeometry();
    case 'p': return createPawnGeometry();
    default: return createPawnGeometry();
  }
}

function createBaseGeometry(height) {
  const shape = new THREE.Shape();
  const segments = 24;
  const baseRadius = 0.4;
  const topRadius = 0.3;

  // Base profile
  shape.moveTo(0, 0);
  shape.lineTo(baseRadius, 0);
  shape.quadraticCurveTo(baseRadius + 0.05, height * 0.1, baseRadius - 0.02, height * 0.15);
  shape.quadraticCurveTo(topRadius + 0.03, height * 0.2, topRadius, height * 0.25);

  return shape;
}

function createLatheGeometry(points, segments = 24) {
  return new THREE.LatheGeometry(points, segments);
}

function createPawnGeometry() {
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.35, 0));
  points.push(new THREE.Vector2(0.38, 0.02));
  points.push(new THREE.Vector2(0.35, 0.08));
  points.push(new THREE.Vector2(0.25, 0.15));
  points.push(new THREE.Vector2(0.22, 0.25));
  points.push(new THREE.Vector2(0.20, 0.40));
  points.push(new THREE.Vector2(0.15, 0.50));
  points.push(new THREE.Vector2(0.18, 0.55));
  points.push(new THREE.Vector2(0.22, 0.60));
  points.push(new THREE.Vector2(0.20, 0.68));
  points.push(new THREE.Vector2(0.12, 0.70));
  points.push(new THREE.Vector2(0.10, 0.72));
  points.push(new THREE.Vector2(0.10, 0.78));
  points.push(new THREE.Vector2(0, 0.78));
  return createLatheGeometry(points);
}

function createRookGeometry(config) {
  const h = config.height;
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.38, 0));
  points.push(new THREE.Vector2(0.42, 0.02));
  points.push(new THREE.Vector2(0.40, 0.05));
  points.push(new THREE.Vector2(0.32, 0.10));
  points.push(new THREE.Vector2(0.30, h * 0.5));
  points.push(new THREE.Vector2(0.32, h * 0.55));
  points.push(new THREE.Vector2(0.38, h * 0.65));
  points.push(new THREE.Vector2(0.35, h * 0.70));
  points.push(new THREE.Vector2(0.28, h * 0.75));
  points.push(new THREE.Vector2(0.28, h * 0.85));
  points.push(new THREE.Vector2(0.32, h * 0.88));
  points.push(new THREE.Vector2(0.32, h * 0.92));
  points.push(new THREE.Vector2(0.22, h * 0.95));
  points.push(new THREE.Vector2(0, h * 0.95));
  return createLatheGeometry(points);
}

function createBishopGeometry(config) {
  const h = config.height;
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.35, 0));
  points.push(new THREE.Vector2(0.38, 0.02));
  points.push(new THREE.Vector2(0.36, 0.06));
  points.push(new THREE.Vector2(0.28, 0.12));
  points.push(new THREE.Vector2(0.26, h * 0.3));
  points.push(new THREE.Vector2(0.20, h * 0.4));
  points.push(new THREE.Vector2(0.14, h * 0.55));
  points.push(new THREE.Vector2(0.12, h * 0.60));
  points.push(new THREE.Vector2(0.16, h * 0.65));
  points.push(new THREE.Vector2(0.20, h * 0.70));
  points.push(new THREE.Vector2(0.18, h * 0.78));
  points.push(new THREE.Vector2(0.08, h * 0.82));
  points.push(new THREE.Vector2(0.07, h * 0.88));
  points.push(new THREE.Vector2(0.12, h * 0.92));
  points.push(new THREE.Vector2(0.08, h * 0.96));
  points.push(new THREE.Vector2(0, h * 0.96));
  return createLatheGeometry(points);
}

function createKnightGeometry() {
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.35, 0));
  points.push(new THREE.Vector2(0.38, 0.02));
  points.push(new THREE.Vector2(0.36, 0.06));
  points.push(new THREE.Vector2(0.28, 0.12));
  points.push(new THREE.Vector2(0.26, 0.20));
  points.push(new THREE.Vector2(0.24, 0.40));
  points.push(new THREE.Vector2(0.20, 0.50));
  points.push(new THREE.Vector2(0.18, 0.55));
  points.push(new THREE.Vector2(0.15, 0.62));
  points.push(new THREE.Vector2(0.10, 0.68));
  points.push(new THREE.Vector2(0.08, 0.75));
  // Horse head shape made simpler as lathe
  points.push(new THREE.Vector2(0.12, 0.80));
  points.push(new THREE.Vector2(0.22, 0.82));
  points.push(new THREE.Vector2(0.25, 0.85));
  points.push(new THREE.Vector2(0.20, 0.90));
  points.push(new THREE.Vector2(0.15, 0.92));
  points.push(new THREE.Vector2(0.05, 0.95));
  points.push(new THREE.Vector2(0, 0.95));
  return createLatheGeometry(points);
}

function createKingGeometry(config) {
  const h = config.height;
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.40, 0));
  points.push(new THREE.Vector2(0.44, 0.02));
  points.push(new THREE.Vector2(0.42, 0.05));
  points.push(new THREE.Vector2(0.32, 0.10));
  points.push(new THREE.Vector2(0.30, h * 0.4));
  points.push(new THREE.Vector2(0.34, h * 0.5));
  points.push(new THREE.Vector2(0.36, h * 0.55));
  points.push(new THREE.Vector2(0.38, h * 0.62));
  points.push(new THREE.Vector2(0.38, h * 0.68));
  points.push(new THREE.Vector2(0.34, h * 0.72));
  points.push(new THREE.Vector2(0.28, h * 0.78));
  points.push(new THREE.Vector2(0.26, h * 0.85));
  points.push(new THREE.Vector2(0.28, h * 0.88));
  points.push(new THREE.Vector2(0.22, h * 0.92));
  points.push(new THREE.Vector2(0.12, h * 0.94));
  points.push(new THREE.Vector2(0, h * 0.94));
  return createLatheGeometry(points);
}

function createQueenGeometry(config) {
  const h = config.height;
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.38, 0));
  points.push(new THREE.Vector2(0.42, 0.02));
  points.push(new THREE.Vector2(0.40, 0.05));
  points.push(new THREE.Vector2(0.32, 0.10));
  points.push(new THREE.Vector2(0.28, h * 0.35));
  points.push(new THREE.Vector2(0.32, h * 0.45));
  points.push(new THREE.Vector2(0.34, h * 0.50));
  points.push(new THREE.Vector2(0.35, h * 0.58));
  points.push(new THREE.Vector2(0.32, h * 0.62));
  points.push(new THREE.Vector2(0.28, h * 0.66));
  points.push(new THREE.Vector2(0.16, h * 0.72));
  points.push(new THREE.Vector2(0.14, h * 0.78));
  points.push(new THREE.Vector2(0.18, h * 0.82));
  points.push(new THREE.Vector2(0.16, h * 0.88));
  points.push(new THREE.Vector2(0.10, h * 0.92));
  points.push(new THREE.Vector2(0, h * 0.92));
  return createLatheGeometry(points);
}

export default function ChessPiece({ piece, position, isSelected, onClick }) {
  const meshRef = useRef(null);
  const color = piece.color === 'white' ? '#f0f0f0' : '#1a1a1a';
  const geometry = useRef(createPieceGeometry(piece.type));

  return (
    <mesh
      ref={meshRef}
      position={position || [piece.file - 3.5, 0.5, piece.rank - 3.5]}
      onClick={onClick}
      castShadow
      userData={{ pieceId: piece.id }}
    >
      <primitive object={geometry.current} attach="geometry" />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.7}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}