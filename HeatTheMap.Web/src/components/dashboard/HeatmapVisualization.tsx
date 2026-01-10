import React, { useRef, useEffect } from 'react';

interface HeatmapVisualizationProps {
  data?: number[][];
  width?: number;
  height?: number;
  loading?: boolean;
}

export const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({
  data,
  width = 20,
  height = 15,
  loading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = canvas.width / width;
    const cellHeight = canvas.height / height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find max value for normalization
    const maxValue = Math.max(...data.flat());

    // Draw heatmap
    data.forEach((row, y) => {
      row.forEach((value, x) => {
        const intensity = maxValue > 0 ? value / maxValue : 0;

        // Color gradient: blue (low) -> green -> yellow -> red (high)
        let r, g, b;
        if (intensity < 0.25) {
          // Blue to cyan
          r = 0;
          g = Math.floor(intensity * 4 * 255);
          b = 255;
        } else if (intensity < 0.5) {
          // Cyan to green
          r = 0;
          g = 255;
          b = Math.floor((0.5 - intensity) * 4 * 255);
        } else if (intensity < 0.75) {
          // Green to yellow
          r = Math.floor((intensity - 0.5) * 4 * 255);
          g = 255;
          b = 0;
        } else {
          // Yellow to red
          r = 255;
          g = Math.floor((1 - intensity) * 4 * 255);
          b = 0;
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      });
    });
  }, [data, width, height]);

  // Generate mock data for demo
  const generateMockData = () => {
    const mockData: number[][] = [];
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        // Create hotspots
        const distFromCenter = Math.sqrt(
          Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
        );
        const value = Math.max(0, 100 - distFromCenter * 5 + Math.random() * 20);
        row.push(Math.floor(value));
      }
      mockData.push(row);
    }
    return mockData;
  };

  const displayData = data || generateMockData();

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="aspect-[4/3] bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Store Heatmap</h3>
      <div className="bg-gray-900 rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto rounded"
        />
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>Low Traffic</span>
        <div className="flex-1 mx-4 h-2 rounded"
          style={{
            background: 'linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000)'
          }}
        />
        <span>High Traffic</span>
      </div>
    </div>
  );
};
