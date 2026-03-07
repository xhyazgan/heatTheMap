import React, { useMemo } from 'react';
import * as THREE from 'three';

interface StoreFloorProps {
  gridWidth: number;
  gridHeight: number;
}

export const StoreFloor: React.FC<StoreFloorProps> = ({ gridWidth, gridHeight }) => {
  const gridHelper = useMemo(() => {
    const size = Math.max(gridWidth, gridHeight);
    return { size, divisions: Math.max(gridWidth, gridHeight) };
  }, [gridWidth, gridHeight]);

  return (
    <group>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[gridWidth / 2, -0.01, gridHeight / 2]}>
        <planeGeometry args={[gridWidth, gridHeight]} />
        <meshStandardMaterial color="#1a1a2e" side={THREE.DoubleSide} />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[gridHelper.size, gridHelper.divisions, '#333355', '#222244']}
        position={[gridWidth / 2, 0, gridHeight / 2]}
      />

      {/* Store boundary - wireframe box */}
      <lineSegments position={[gridWidth / 2, 1.5, gridHeight / 2]}>
        <edgesGeometry
          args={[new THREE.BoxGeometry(gridWidth, 3, gridHeight)]}
        />
        <lineBasicMaterial color="#334466" transparent opacity={0.3} />
      </lineSegments>

      {/* Entrance marker */}
      <mesh position={[gridWidth / 2, 0.02, gridHeight - 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 0.5]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
