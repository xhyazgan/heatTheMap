import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface HeatmapBarsProps {
  data: number[][];
  gridWidth: number;
  gridHeight: number;
  maxBarHeight?: number;
}

function getHeatColor(intensity: number): THREE.Color {
  if (intensity < 0.25) {
    return new THREE.Color(0, intensity * 4, 1);
  } else if (intensity < 0.5) {
    return new THREE.Color(0, 1, (0.5 - intensity) * 4);
  } else if (intensity < 0.75) {
    return new THREE.Color((intensity - 0.5) * 4, 1, 0);
  } else {
    return new THREE.Color(1, (1 - intensity) * 4, 0);
  }
}

export const HeatmapBars: React.FC<HeatmapBarsProps> = ({
  data,
  gridWidth: _gridWidth,
  gridHeight: _gridHeight,
  maxBarHeight = 5,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { count, maxValue } = useMemo(() => {
    const flat = data.flat();
    return {
      count: flat.length,
      maxValue: Math.max(...flat, 1),
    };
  }, [data]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const tempMatrix = new THREE.Matrix4();
    const tempColor = new THREE.Color();
    let idx = 0;

    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < (data[y]?.length ?? 0); x++) {
        const value = data[y][x];
        const intensity = maxValue > 0 ? value / maxValue : 0;
        const barHeight = Math.max(0.05, intensity * maxBarHeight);

        tempMatrix.makeScale(0.85, barHeight, 0.85);
        tempMatrix.setPosition(x + 0.5, barHeight / 2, y + 0.5);

        mesh.setMatrixAt(idx, tempMatrix);
        mesh.setColorAt(idx, getHeatColor(intensity).copy(tempColor));
        idx++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data, maxValue, maxBarHeight]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial transparent opacity={0.85} />
    </instancedMesh>
  );
};
