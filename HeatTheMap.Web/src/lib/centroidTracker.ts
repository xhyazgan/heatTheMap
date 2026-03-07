export interface TrackedObject {
  id: number;
  centroid: [number, number];
  bbox: [number, number, number, number];
  disappeared: number;
  counted: boolean;
}

export class CentroidTracker {
  private nextId = 0;
  private objects: Map<number, TrackedObject> = new Map();
  private maxDisappeared: number;
  private maxDistance: number;
  public totalUnique = 0;

  constructor(maxDisappeared = 30, maxDistance = 80) {
    this.maxDisappeared = maxDisappeared;
    this.maxDistance = maxDistance;
  }

  update(bboxes: [number, number, number, number][]): Map<number, TrackedObject> {
    if (bboxes.length === 0) {
      // Mark all existing objects as disappeared
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
      // Register all new detections
      for (let i = 0; i < inputCentroids.length; i++) {
        this.register(inputCentroids[i], bboxes[i]);
      }
      return this.objects;
    }

    const objectIds = Array.from(this.objects.keys());
    const objectCentroids = objectIds.map((id) => this.objects.get(id)!.centroid);

    // Compute distance matrix
    const distances: { objectIdx: number; inputIdx: number; dist: number }[] = [];
    for (let o = 0; o < objectCentroids.length; o++) {
      for (let i = 0; i < inputCentroids.length; i++) {
        const dist = this.euclidean(objectCentroids[o], inputCentroids[i]);
        distances.push({ objectIdx: o, inputIdx: i, dist });
      }
    }

    // Sort by distance (greedy matching)
    distances.sort((a, b) => a.dist - b.dist);

    const usedObjects = new Set<number>();
    const usedInputs = new Set<number>();

    for (const { objectIdx, inputIdx, dist } of distances) {
      if (usedObjects.has(objectIdx) || usedInputs.has(inputIdx)) continue;
      if (dist > this.maxDistance) continue;

      const id = objectIds[objectIdx];
      const obj = this.objects.get(id)!;
      obj.centroid = inputCentroids[inputIdx];
      obj.bbox = bboxes[inputIdx];
      obj.disappeared = 0;

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
      bbox,
      disappeared: 0,
      counted: true,
    });
    this.nextId++;
    this.totalUnique++;
  }

  private computeCentroid(bbox: [number, number, number, number]): [number, number] {
    const [x, y, w, h] = bbox;
    return [x + w / 2, y + h / 2];
  }

  private euclidean(a: [number, number], b: [number, number]): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
  }

  get currentCount(): number {
    return this.objects.size;
  }

  reset() {
    this.objects.clear();
    this.nextId = 0;
    this.totalUnique = 0;
  }

  getObjects(): TrackedObject[] {
    return Array.from(this.objects.values());
  }
}
