import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HeatmapBars } from './HeatmapBars';
import { StoreFloor } from './StoreFloor';

interface HeatmapVisualization3DProps {
  data?: number[][];
  width?: number;
  height?: number;
}

export const HeatmapVisualization3D: React.FC<HeatmapVisualization3DProps> = ({
  data,
  width = 20,
  height = 15,
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

  return (
    <div className="bg-gray-900 rounded-lg" style={{ height: 450 }}>
      <Canvas
        camera={{
          position: [width * 0.8, width * 0.6, height * 0.8],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
          <pointLight position={[width / 2, 10, height / 2]} intensity={0.3} />

          <StoreFloor gridWidth={width} gridHeight={height} />
          <HeatmapBars data={displayData} gridWidth={width} gridHeight={height} />

          <OrbitControls
            enableDamping
            dampingFactor={0.1}
            target={[width / 2, 0, height / 2]}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
