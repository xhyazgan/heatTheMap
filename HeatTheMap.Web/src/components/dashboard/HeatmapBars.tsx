import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeatmapBarsProps {
  data: number[][];
  gridWidth: number;
  gridHeight: number;
  maxBarHeight?: number;
}

function getHeatColor(intensity: number): THREE.Color {
  // Smooth HSL-based gradient: blue (240°) → cyan (180°) → green (120°) → yellow (60°) → red (0°)
  const hue = (1 - intensity) * 0.67; // 0.67 (blue) → 0 (red)
  const saturation = 0.85 + intensity * 0.15; // slightly more saturated at high values
  const lightness = 0.4 + intensity * 0.15; // slightly brighter at high values
  return new THREE.Color().setHSL(hue, saturation, lightness);
}

export const HeatmapBars: React.FC<HeatmapBarsProps> = ({
  data,
  gridWidth: _gridWidth,
  gridHeight: _gridHeight,
  maxBarHeight = 5,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentHeightsRef = useRef<Float32Array | null>(null);
  const targetHeightsRef = useRef<Float32Array | null>(null);
  const targetColorsRef = useRef<Float32Array | null>(null);
  const currentColorsRef = useRef<Float32Array | null>(null);

  const { count, maxValue } = useMemo(() => {
    const flat = data.flat();
    return {
      count: flat.length,
      maxValue: Math.max(...flat, 1),
    };
  }, [data]);

  // Compute target heights and colors when data changes
  useEffect(() => {
    const totalCells = data.reduce((sum, row) => sum + row.length, 0);

    if (!targetHeightsRef.current || targetHeightsRef.current.length !== totalCells) {
      targetHeightsRef.current = new Float32Array(totalCells);
      currentHeightsRef.current = new Float32Array(totalCells);
      targetColorsRef.current = new Float32Array(totalCells * 3);
      currentColorsRef.current = new Float32Array(totalCells * 3);
    }

    let idx = 0;
    const tempColor = new THREE.Color();
    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < (data[y]?.length ?? 0); x++) {
        const value = data[y][x];
        const intensity = maxValue > 0 ? value / maxValue : 0;
        const barHeight = Math.max(0.05, intensity * maxBarHeight);

        targetHeightsRef.current[idx] = barHeight;

        getHeatColor(intensity).copy(tempColor);
        targetColorsRef.current[idx * 3] = tempColor.r;
        targetColorsRef.current[idx * 3 + 1] = tempColor.g;
        targetColorsRef.current[idx * 3 + 2] = tempColor.b;

        idx++;
      }
    }
  }, [data, maxValue, maxBarHeight]);

  // Reusable objects for animation loop (avoid GC pressure)
  const tempMatrixRef = useRef(new THREE.Matrix4());
  const tempColorRef = useRef(new THREE.Color());

  // Animate bar heights each frame
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !currentHeightsRef.current || !targetHeightsRef.current) return;
    if (!currentColorsRef.current || !targetColorsRef.current) return;

    const lerpFactor = 0.08;
    const tempMatrix = tempMatrixRef.current;
    const tempColor = tempColorRef.current;
    let idx = 0;
    const barScale = 0.78; // gap between bars for visual clarity

    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < (data[y]?.length ?? 0); x++) {
        const target = targetHeightsRef.current[idx];
        const current = currentHeightsRef.current[idx];

        // Lerp height
        const newHeight = current + (target - current) * lerpFactor;
        currentHeightsRef.current[idx] = newHeight;

        // Lerp color
        for (let c = 0; c < 3; c++) {
          const ci = idx * 3 + c;
          currentColorsRef.current[ci] += (targetColorsRef.current[ci] - currentColorsRef.current[ci]) * lerpFactor;
        }

        tempMatrix.makeScale(barScale, newHeight, barScale);
        tempMatrix.setPosition(x + 0.5, newHeight / 2, y + 0.5);
        mesh.setMatrixAt(idx, tempMatrix);

        tempColor.setRGB(
          currentColorsRef.current[idx * 3],
          currentColorsRef.current[idx * 3 + 1],
          currentColorsRef.current[idx * 3 + 2]
        );
        mesh.setColorAt(idx, tempColor);

        idx++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial transparent opacity={0.88} roughness={0.4} metalness={0.1} />
    </instancedMesh>
  );
};
