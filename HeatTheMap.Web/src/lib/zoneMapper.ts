import type { TrackedObject } from './centroidTracker';

export function mapDetectionsToZones(
  objects: TrackedObject[],
  videoWidth: number,
  videoHeight: number,
  gridWidth = 20,
  gridHeight = 15,
): number[][] {
  const matrix: number[][] = Array.from({ length: gridHeight }, () =>
    new Array(gridWidth).fill(0),
  );

  for (const obj of objects) {
    const [cx, cy] = obj.centroid;
    const gridX = Math.min(gridWidth - 1, Math.max(0, Math.floor((cx / videoWidth) * gridWidth)));
    const gridY = Math.min(gridHeight - 1, Math.max(0, Math.floor((cy / videoHeight) * gridHeight)));
    matrix[gridY][gridX]++;
  }

  return matrix;
}

export function accumulateZones(
  existing: number[][],
  incoming: number[][],
): number[][] {
  return existing.map((row, y) =>
    row.map((val, x) => val + (incoming[y]?.[x] ?? 0)),
  );
}
