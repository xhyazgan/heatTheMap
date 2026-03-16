import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface StoreFloorProps {
  gridWidth: number;
  gridHeight: number;
}

export const StoreFloor: React.FC<StoreFloorProps> = ({ gridWidth, gridHeight }) => {
  const gridHelper = useMemo(() => {
    const size = Math.max(gridWidth, gridHeight);
    return { size, divisions: Math.max(gridWidth, gridHeight) };
  }, [gridWidth, gridHeight]);

  // Generate zone labels at regular intervals
  const zoneLabels = useMemo(() => {
    const labels: { x: number; z: number; text: string }[] = [];
    const stepX = Math.max(1, Math.floor(gridWidth / 5));
    const stepY = Math.max(1, Math.floor(gridHeight / 4));
    for (let y = stepY; y < gridHeight; y += stepY) {
      for (let x = stepX; x < gridWidth; x += stepX) {
        labels.push({
          x: x + 0.5,
          z: y + 0.5,
          text: `${String.fromCharCode(65 + Math.floor(y / stepY) - 1)}${Math.floor(x / stepX)}`,
        });
      }
    }
    return labels;
  }, [gridWidth, gridHeight]);

  return (
    <group>
      {/* Shadow receiving plane (slightly below floor) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[gridWidth / 2, -0.05, gridHeight / 2]}
        receiveShadow
      >
        <planeGeometry args={[gridWidth + 2, gridHeight + 2]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>

      {/* Floor plane with subtle gradient feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[gridWidth / 2, -0.01, gridHeight / 2]}>
        <planeGeometry args={[gridWidth, gridHeight]} />
        <meshStandardMaterial
          color="#16162a"
          side={THREE.DoubleSide}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Outer border glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[gridWidth / 2, -0.02, gridHeight / 2]}>
        <planeGeometry args={[gridWidth + 0.4, gridHeight + 0.4]} />
        <meshStandardMaterial
          color="#2a2a4a"
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>

      {/* Grid lines with better contrast */}
      <gridHelper
        args={[gridHelper.size, gridHelper.divisions, '#4a4a7a', '#2e2e55']}
        position={[gridWidth / 2, 0.001, gridHeight / 2]}
      />

      {/* Store boundary - wireframe box */}
      <lineSegments position={[gridWidth / 2, 1.5, gridHeight / 2]}>
        <edgesGeometry args={[new THREE.BoxGeometry(gridWidth, 3, gridHeight)]} />
        <lineBasicMaterial color="#4a5580" transparent opacity={0.35} />
      </lineSegments>

      {/* Entrance marker */}
      <mesh
        position={[gridWidth / 2, 0.03, gridHeight - 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[3, 0.5]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.7} emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>

      {/* Entrance text label */}
      <Text
        position={[gridWidth / 2, 0.15, gridHeight + 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.6}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"

      >
        Giris
      </Text>

      {/* Exit marker */}
      <mesh
        position={[gridWidth / 2, 0.03, 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[3, 0.5]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.7} emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>

      {/* Exit text label */}
      <Text
        position={[gridWidth / 2, 0.15, -0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.6}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"

      >
        Cikis
      </Text>

      {/* Zone labels on the floor */}
      {zoneLabels.map((label, i) => (
        <Text
          key={i}
          position={[label.x, 0.05, label.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.4}
          color="#5a5a8a"
          anchorX="center"
          anchorY="middle"
  
        >
          {label.text}
        </Text>
      ))}

      {/* Axis labels along X */}
      {Array.from({ length: Math.ceil(gridWidth / 4) }, (_, i) => i * 4).map((x) => (
        <Text
          key={`x-${x}`}
          position={[x + 0.5, 0.05, gridHeight + 1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.35}
          color="#6a6a9a"
          anchorX="center"
          anchorY="middle"
  
        >
          {`${x}`}
        </Text>
      ))}

      {/* Axis labels along Z */}
      {Array.from({ length: Math.ceil(gridHeight / 4) }, (_, i) => i * 4).map((z) => (
        <Text
          key={`z-${z}`}
          position={[-0.8, 0.05, z + 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.35}
          color="#6a6a9a"
          anchorX="center"
          anchorY="middle"
  
        >
          {`${z}`}
        </Text>
      ))}
    </group>
  );
};
