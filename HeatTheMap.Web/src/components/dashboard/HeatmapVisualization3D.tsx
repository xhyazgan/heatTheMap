import React, { Suspense, useMemo, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HeatmapBars } from './HeatmapBars';
import { StoreFloor } from './StoreFloor';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface HeatmapVisualization3DProps {
  data?: number[][];
  width?: number;
  height?: number;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const DEFAULT_CAMERA_POSITION = (w: number, h: number): [number, number, number] => [
  w * 0.5,
  Math.max(w, h) * 0.9,
  h * 1.1,
];

const SceneContent: React.FC<{
  data: number[][];
  width: number;
  height: number;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}> = ({ data, width, height, onResetRef }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleReset = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const [px, py, pz] = DEFAULT_CAMERA_POSITION(width, height);
    controls.object.position.set(px, py, pz);
    controls.target.set(width / 2, 0, height / 2);
    controls.update();
  }, [width, height]);

  // Expose reset function to parent
  if (onResetRef) {
    onResetRef.current = handleReset;
  }

  return (
    <>
      {/* Ambient base light */}
      <ambientLight intensity={0.35} />
      {/* Primary directional light with shadows */}
      <directionalLight
        position={[width * 0.7, 20, height * 0.3]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Secondary fill light from opposite side */}
      <directionalLight
        position={[-width * 0.3, 12, height * 0.8]}
        intensity={0.3}
      />
      {/* Overhead soft light for ambient occlusion feel */}
      <pointLight position={[width / 2, 15, height / 2]} intensity={0.25} decay={2} />
      {/* Rim light for depth */}
      <pointLight position={[0, 8, 0]} intensity={0.15} color="#4488ff" decay={2} />
      <pointLight position={[width, 8, height]} intensity={0.15} color="#ff8844" decay={2} />

      <StoreFloor gridWidth={width} gridHeight={height} />
      <HeatmapBars data={data} gridWidth={width} gridHeight={height} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        target={[width / 2, 0, height / 2]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={60}
        rotateSpeed={0.7}
        zoomSpeed={0.9}
      />
    </>
  );
};

export const HeatmapVisualization3D: React.FC<HeatmapVisualization3DProps> = ({
  data,
  width = 20,
  height = 15,
  onResetRef,
}) => {
  const displayData = useMemo(() => {
    if (data) return data;
    // Generate mock data
    const mock: number[][] = [];
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const distFromCenter = Math.sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2);
        const distFromEntrance = Math.sqrt((x - width / 2) ** 2 + (y - height + 2) ** 2);
        const minDist = Math.min(distFromCenter, distFromEntrance);
        row.push(Math.max(0, Math.floor(100 - minDist * 5 + Math.random() * 20)));
      }
      mock.push(row);
    }
    return mock;
  }, [data, width, height]);

  const [cx, cy, cz] = DEFAULT_CAMERA_POSITION(width, height);

  return (
    <div className="bg-gray-900 rounded-lg relative" style={{ height: 450 }}>
      <Canvas
        camera={{
          position: [cx, cy, cz],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContent
            data={displayData}
            width={width}
            height={height}
            onResetRef={onResetRef}
          />
        </Suspense>
      </Canvas>

      {/* Color legend overlay */}
      <div
        className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg pointer-events-none"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)' }}
      >
        <span className="text-[10px] text-gray-300 whitespace-nowrap">Dusuk</span>
        <div
          className="flex-1 h-2.5 rounded-full"
          style={{
            background: 'linear-gradient(to right, hsl(240,85%,45%), hsl(180,90%,45%), hsl(120,85%,45%), hsl(60,90%,50%), hsl(0,90%,50%))',
          }}
        />
        <span className="text-[10px] text-gray-300 whitespace-nowrap">Yuksek</span>
      </div>
    </div>
  );
};
