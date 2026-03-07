import { GRID_WIDTH, GRID_HEIGHT } from './zoneMapper';

function createEmptyGrid(): number[][] {
  return Array.from({ length: GRID_HEIGHT }, () => new Array(GRID_WIDTH).fill(0));
}

export class HeatmapAccumulator {
  private snapshots: number[][][] = [];
  private maxSnapshots: number;

  constructor(maxSnapshots = 60) {
    this.maxSnapshots = maxSnapshots;
  }

  addSnapshot(zoneGrid: number[][]) {
    this.snapshots.push(zoneGrid);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  getTimeWeightedHeatmap(): number[][] {
    const result = createEmptyGrid();

    for (const snapshot of this.snapshots) {
      for (let y = 0; y < snapshot.length && y < GRID_HEIGHT; y++) {
        for (let x = 0; x < snapshot[y].length && x < GRID_WIDTH; x++) {
          result[y][x] += snapshot[y][x];
        }
      }
    }

    return result;
  }

  get snapshotCount(): number {
    return this.snapshots.length;
  }

  reset() {
    this.snapshots = [];
  }
}
