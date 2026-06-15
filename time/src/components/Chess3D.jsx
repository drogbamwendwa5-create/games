import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const LIGHT_COLOR = '#f0d9b5';
const DARK_COLOR = '#b58863';
const HIGHLIGHT_COLOR = '#7fc97f';
const CHECK_COLOR = '#e74c3c';
const SELECTED_COLOR = '#f1c40f';

function Square({ position, isDark, isHighlighted, isSelected, isCheck, onClick }) {
  let color = isDark ? DARK_COLOR : LIGHT_COLOR;
  if (isCheck) color = CHECK_COLOR;
  if (isSelected) color = SELECTED_COLOR;
  if (isHighlighted) color = HIGHLIGHT_COLOR;

  return (
    <mesh position={position} onClick={onClick} receiveShadow>
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function MoveDot({ position }) {
  return (
    <mesh position={[position[0], 0.2, position[2]]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function CaptureRing({ position }) {
  return (
    <mesh position={[position[0], 0.15, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.35, 0.45, 32]} />
      <meshStandardMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function createPieceMesh(type, color) {
  const group = new THREE.Group();
  const isWhite = color === 'white';
  const pieceColor = isWhite ? 0xf0f0f0 : 0x1a1a1a;
  const metalness = isWhite ? 0.6 : 0.8;
  const roughness = isWhite ? 0.3 : 0.2;

  function addPart(geometry, yOffset, scale = 1) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: pieceColor,
        metalness,
        roughness,
      })
    );
    mesh.position.y = yOffset;
    mesh.scale.set(scale, scale, scale);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }

  const baseGeom = new THREE.CylinderGeometry(0.4, 0.45, 0.08, 24);
  addPart(baseGeom, 0.04);

  const bodyGeom = new THREE.CylinderGeometry(0.3, 0.38, 0.15, 24);
  addPart(bodyGeom, 0.16);

  const neckGeom = new THREE.CylinderGeometry(0.2, 0.28, 0.08, 24);
  addPart(neckGeom, 0.28);

  switch (type) {
    case 'p': {
      const headGeom = new THREE.SphereGeometry(0.18, 16, 16);
      addPart(headGeom, 0.42, 0.8);
      break;
    }
    case 'r': {
      const topGeom = new THREE.CylinderGeometry(0.32, 0.35, 0.06, 24);
      addPart(topGeom, 0.38);
      const rimGeom = new THREE.TorusGeometry(0.34, 0.04, 8, 24);
      const rim = addPart(rimGeom, 0.4);
      rim.rotation.x = Math.PI / 2;
      const topRim = new THREE.TorusGeometry(0.28, 0.04, 8, 24);
      const rim2 = addPart(topRim, 0.34);
      rim2.rotation.x = Math.PI / 2;
      break;
    }
    case 'n': {
      const headGeom = new THREE.SphereGeometry(0.22, 16, 16);
      addPart(headGeom, 0.42, 0.7);
      const earGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8);
      const ear = addPart(earGeom, 0.48);
      ear.position.x = 0.15;
      ear.position.z = 0.1;
      ear.rotation.z = 0.3;
      break;
    }
    case 'b': {
      const headGeom = new THREE.SphereGeometry(0.2, 16, 16);
      addPart(headGeom, 0.44, 0.6);
      const topGeom = new THREE.SphereGeometry(0.08, 12, 12);
      addPart(topGeom, 0.52);
      break;
    }
    case 'q': {
      const crownBase = new THREE.CylinderGeometry(0.28, 0.3, 0.06, 24);
      addPart(crownBase, 0.38);
      const headGeom = new THREE.SphereGeometry(0.22, 16, 16);
      addPart(headGeom, 0.48, 0.7);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const pointGeom = new THREE.SphereGeometry(0.04, 8, 8);
        const point = addPart(pointGeom, 0.44);
        point.position.x = 0.28 * Math.cos(angle);
        point.position.z = 0.28 * Math.sin(angle);
      }
      break;
    }
    case 'k': {
      const crownBase = new THREE.CylinderGeometry(0.28, 0.32, 0.06, 24);
      addPart(crownBase, 0.38);
      const headGeom = new THREE.SphereGeometry(0.24, 16, 16);
      addPart(headGeom, 0.48, 0.8);
      const crossGeom = new THREE.BoxGeometry(0.04, 0.15, 0.04);
      const cross = addPart(crossGeom, 0.6);
      const crossHoriz = new THREE.BoxGeometry(0.12, 0.04, 0.04);
      addPart(crossHoriz, 0.56);
      break;
    }
  }

  return group;
}

const pieceGeometryCache = new Map();

function Piece3D({ piece, position, isSelected, onClick }) {
  const meshGroup = useMemo(() => {
    const cacheKey = `${piece.type}-${piece.color}`;
    if (!pieceGeometryCache.has(cacheKey)) {
      pieceGeometryCache.set(cacheKey, createPieceMesh(piece.type, piece.color));
    }
    return pieceGeometryCache.get(cacheKey).clone();
  }, [piece.type, piece.color]);

  const scale = piece.type === 'p' ? 0.8 : 1;

  return (
    <group
      position={[position[0], 0.5 * scale, position[2]]}
      scale={[scale, scale, scale]}
      onClick={onClick}
    >
      <primitive object={meshGroup} />
      {isSelected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial color={SELECTED_COLOR} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function ChessScene({ boardState, onSquareClick, selectedSquare, legalMoves, currentTurn, isInCheck }) {
  // Find king in check position
  const checkSquare = useMemo(() => {
    if (!isInCheck) return null;
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const p = boardState[rank][file];
        if (p && p.type === 'k' && p.color === currentTurn) {
          return { rank, file };
        }
      }
    }
    return null;
  }, [boardState, isInCheck, currentTurn]);

  const pieces = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = boardState[rank][file];
      const isDark = (rank + file) % 2 === 1;
      const x = file - 3.5;
      const z = rank - 3.5;
      const isSelected = selectedSquare?.rank === rank && selectedSquare?.file === file;
      const isCheck = checkSquare?.rank === rank && checkSquare?.file === file;
      const isLegalTarget = legalMoves.some(m => m.rank === rank && m.file === file);

      pieces.push(
        <Square
          key={`sq-${rank}-${file}`}
          position={[x, 0, z]}
          isDark={isDark}
          isHighlighted={isLegalTarget && !piece}
          isSelected={isSelected}
          isCheck={isCheck}
          onClick={(e) => {
            e.stopPropagation();
            onSquareClick(rank, file);
          }}
        />
      );

      if (isLegalTarget && !piece) {
        pieces.push(
          <MoveDot key={`dot-${rank}-${file}`} position={[x, 0.1, z]} />
        );
      }

      if (isLegalTarget && piece) {
        pieces.push(
          <CaptureRing key={`ring-${rank}-${file}`} position={[x, 0.1, z]} />
        );
      }

      if (piece) {
        pieces.push(
          <Piece3D
            key={`piece-${rank}-${file}`}
            piece={piece}
            position={[x, 0, z]}
            isSelected={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              onSquareClick(rank, file);
            }}
          />
        );
      }
    }
  }

  // Board frame
  pieces.push(
    <mesh key="frame" position={[0, -0.15, 0]} receiveShadow>
      <boxGeometry args={[8.6, 0.1, 8.6]} />
      <meshStandardMaterial color="#4a3728" roughness={0.8} />
    </mesh>
  );

  return <>{pieces}</>;
}

export default function Chess3D({
  board,
  onSquareClick,
  selectedSquare,
  legalMoves,
  currentTurn,
  isInCheck,
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [7, 10, 7], fov: 40 }}
      style={{ background: '#1a1a2e' }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <hemisphereLight args={['#b1e1ff', '#000000', 0.3]} />

      <ChessScene
        boardState={board}
        onSquareClick={onSquareClick}
        selectedSquare={selectedSquare}
        legalMoves={legalMoves}
        currentTurn={currentTurn}
        isInCheck={isInCheck}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={4}
        maxDistance={20}
        minPolarAngle={0.3}
        maxPolarAngle={1.5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}