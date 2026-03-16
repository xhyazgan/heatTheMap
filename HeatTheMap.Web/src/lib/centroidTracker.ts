import { solve as hungarianSolve } from './hungarian';

export interface TrackedObject {
  id: number;
  centroid: [number, number];
  previousCentroid: [number, number] | null;
  bbox: [number, number, number, number];
  disappeared: number;
  crossingState: 'none' | 'entered' | 'exited';
  lastCrossingTime: number | null;
  trackAge: number;
  entryTime: number | null;
  velocity: [number, number] | null;
}

export class CentroidTracker {
  private nextId = 0;
  private objects: Map<number, TrackedObject> = new Map();
  private maxDisappeared: number;
  private maxDistance: number;
  private confirmedIds = new Set<number>();
  private minTrackAge = 3;
  public totalUnique = 0;

  constructor(maxDisappeared = 30, maxDistance = 200) {
    this.maxDisappeared = maxDisappeared;
    this.maxDistance = maxDistance;
  }

  update(bboxes: [number, number, number, number][]): Map<number, TrackedObject> {
    if (bboxes.length === 0) {
      for (const [id, obj] of this.objects) {
        obj.disappeared++;
        if (obj.disappeared > this.maxDisappeared) {
          this.objects.delete(id);
        }
      }
      return this.objects;
    }

    const inputCentroids = bboxes.map((bbox) => this.computeCentroid(bbox));

    if (this.objects.size === 0) {
      for (let i = 0; i < inputCentroids.length; i++) {
        this.register(inputCentroids[i], bboxes[i]);
      }
      return this.objects;
    }

    const objectIds = Array.from(this.objects.keys());
    const objectEntries = objectIds.map((id) => this.objects.get(id)!);

    // Build cost matrix using centroid distance + IoU (with velocity prediction)
    const costMatrix: number[][] = [];
    for (let o = 0; o < objectEntries.length; o++) {
      const row: number[] = [];
      const obj = objectEntries[o];
      // Predict position based on velocity (scale by disappeared frames for catch-up)
      const steps = 1 + obj.disappeared; // predict further ahead if object was missing
      const predicted: [number, number] = obj.velocity
        ? [obj.centroid[0] + obj.velocity[0] * steps,
           obj.centroid[1] + obj.velocity[1] * steps]
        : obj.centroid;
      // Velocity magnitude for adaptive search radius
      const speed = obj.velocity
        ? Math.sqrt(obj.velocity[0] ** 2 + obj.velocity[1] ** 2)
        : 0;
      for (let i = 0; i < inputCentroids.length; i++) {
        const centroidDist = this.euclidean(predicted, inputCentroids[i]);
        const iou = this.computeIoU(obj.bbox, bboxes[i]);
        // IoU reduces effective distance
        const score = centroidDist * (1 - iou * 0.5);

        // Adaptive max distance: bbox diagonal + velocity-based expansion
        const [, , w, h] = obj.bbox;
        const diagonal = Math.sqrt(w * w + h * h);
        const velocityBonus = speed * 3 * steps; // fast movers get much larger search radius
        const adaptiveMax = Math.max(this.maxDistance, diagonal * 1.5 + velocityBonus);

        // If too far, set very high cost
        row.push(score > adaptiveMax ? 1e6 : score);
      }
      costMatrix.push(row);
    }

    // Use Hungarian algorithm for optimal assignment
    const assignments = hungarianSolve(costMatrix);

    const usedObjects = new Set<number>();
    const usedInputs = new Set<number>();

    for (const [objectIdx, inputIdx] of assignments) {
      if (costMatrix[objectIdx][inputIdx] >= 1e6) continue;

      const id = objectIds[objectIdx];
      const obj = this.objects.get(id)!;
      obj.previousCentroid = obj.centroid;
      obj.centroid = inputCentroids[inputIdx];
      obj.bbox = bboxes[inputIdx];
      obj.disappeared = 0;
      obj.trackAge++;

      // Compute smoothed velocity (exponential moving average)
      if (obj.previousCentroid) {
        const rawVx = obj.centroid[0] - obj.previousCentroid[0];
        const rawVy = obj.centroid[1] - obj.previousCentroid[1];
        if (obj.velocity) {
          const alpha = 0.6; // weight for new measurement
          obj.velocity = [
            obj.velocity[0] * (1 - alpha) + rawVx * alpha,
            obj.velocity[1] * (1 - alpha) + rawVy * alpha,
          ];
        } else {
          obj.velocity = [rawVx, rawVy];
        }
      }

      // Confirm track after minTrackAge frames (fallback unique counting)
      if (obj.trackAge === this.minTrackAge && !this.confirmedIds.has(id)) {
        this.confirmedIds.add(id);
        this.totalUnique++;
      }

      usedObjects.add(objectIdx);
      usedInputs.add(inputIdx);
    }

    // Handle unmatched existing objects
    for (let o = 0; o < objectIds.length; o++) {
      if (!usedObjects.has(o)) {
        const id = objectIds[o];
        const obj = this.objects.get(id)!;
        obj.disappeared++;
        if (obj.disappeared > this.maxDisappeared) {
          this.objects.delete(id);
        }
      }
    }

    // Register unmatched new detections
    for (let i = 0; i < inputCentroids.length; i++) {
      if (!usedInputs.has(i)) {
        this.register(inputCentroids[i], bboxes[i]);
      }
    }

    return this.objects;
  }

  private register(centroid: [number, number], bbox: [number, number, number, number]) {
    this.objects.set(this.nextId, {
      id: this.nextId,
      centroid,
      previousCentroid: null,
      bbox,
      disappeared: 0,
      crossingState: 'none',
      lastCrossingTime: null,
      trackAge: 0,
      entryTime: null,
      velocity: null,
    });
    this.nextId++;
  }

  private computeCentroid(bbox: [number, number, number, number]): [number, number] {
    const [x, y, w, h] = bbox;
    return [x + w / 2, y + h / 2];
  }

  private euclidean(a: [number, number], b: [number, number]): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
  }

  private computeIoU(
    bboxA: [number, number, number, number],
    bboxB: [number, number, number, number],
  ): number {
    const [ax, ay, aw, ah] = bboxA;
    const [bx, by, bw, bh] = bboxB;

    const x1 = Math.max(ax, bx);
    const y1 = Math.max(ay, by);
    const x2 = Math.min(ax + aw, bx + bw);
    const y2 = Math.min(ay + ah, by + bh);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    if (intersection === 0) return 0;

    const areaA = aw * ah;
    const areaB = bw * bh;
    return intersection / (areaA + areaB - intersection);
  }

  get currentCount(): number {
    return this.objects.size;
  }

  reset() {
    this.objects.clear();
    this.nextId = 0;
    this.totalUnique = 0;
    this.confirmedIds.clear();
  }

  getObjects(): TrackedObject[] {
    return Array.from(this.objects.values());
  }
}
