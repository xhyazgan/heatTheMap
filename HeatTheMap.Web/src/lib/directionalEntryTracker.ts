import { CentroidTracker, type TrackedObject } from './centroidTracker';

export interface EntryLineConfig {
  start: { x: number; y: number }; // normalized 0-1
  end: { x: number; y: number }; // normalized 0-1
  inDirection: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
}

export interface TrackingResult {
  currentCount: number;
  uniqueVisitors: number;
  exitCount: number;
  trackedObjects: TrackedObject[];
}

interface Point {
  x: number;
  y: number;
}

export class DirectionalEntryTracker {
  private tracker = new CentroidTracker(30, 80);
  private entryLine: EntryLineConfig | null = null;
  private videoWidth = 640;
  private videoHeight = 480;
  private _uniqueVisitors = 0;
  private _exitCount = 0;

  setEntryLine(config: EntryLineConfig | null) {
    this.entryLine = config;
  }

  setVideoDimensions(w: number, h: number) {
    this.videoWidth = w;
    this.videoHeight = h;
  }

  update(bboxes: [number, number, number, number][]): TrackingResult {
    const objects = this.tracker.update(bboxes);

    if (this.entryLine) {
      this.checkEntryCrossings(objects);
    }

    const trackedObjects = Array.from(objects.values());

    return {
      currentCount: this.tracker.currentCount,
      uniqueVisitors: this.entryLine ? this._uniqueVisitors : this.tracker.totalUnique,
      exitCount: this._exitCount,
      trackedObjects,
    };
  }

  private checkEntryCrossings(objects: Map<number, TrackedObject>) {
    if (!this.entryLine) return;

    const lineStart: Point = {
      x: this.entryLine.start.x * this.videoWidth,
      y: this.entryLine.start.y * this.videoHeight,
    };
    const lineEnd: Point = {
      x: this.entryLine.end.x * this.videoWidth,
      y: this.entryLine.end.y * this.videoHeight,
    };

    for (const obj of objects.values()) {
      if (!obj.previousCentroid || obj.hasCrossedLine) continue;

      const prev: Point = { x: obj.previousCentroid[0], y: obj.previousCentroid[1] };
      const curr: Point = { x: obj.centroid[0], y: obj.centroid[1] };

      if (this.lineSegmentsIntersect(prev, curr, lineStart, lineEnd)) {
        const direction = this.getCrossingDirection(prev, curr, lineStart, lineEnd);
        obj.hasCrossedLine = true;

        if (direction === this.entryLine.inDirection) {
          this._uniqueVisitors++;
          obj.entryTime = Date.now();
        } else {
          this._exitCount++;
        }
      }
    }
  }

  private lineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const d1 = this.crossProduct(p3, p4, p1);
    const d2 = this.crossProduct(p3, p4, p2);
    const d3 = this.crossProduct(p1, p2, p3);
    const d4 = this.crossProduct(p1, p2, p4);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }

    if (d1 === 0 && this.onSegment(p3, p4, p1)) return true;
    if (d2 === 0 && this.onSegment(p3, p4, p2)) return true;
    if (d3 === 0 && this.onSegment(p1, p2, p3)) return true;
    if (d4 === 0 && this.onSegment(p1, p2, p4)) return true;

    return false;
  }

  private crossProduct(a: Point, b: Point, c: Point): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  private onSegment(a: Point, b: Point, c: Point): boolean {
    return (
      Math.min(a.x, b.x) <= c.x && c.x <= Math.max(a.x, b.x) &&
      Math.min(a.y, b.y) <= c.y && c.y <= Math.max(a.y, b.y)
    );
  }

  private getCrossingDirection(
    prev: Point,
    curr: Point,
    lineStart: Point,
    lineEnd: Point,
  ): string {
    const lineVector = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };
    const motionVector = { x: curr.x - prev.x, y: curr.y - prev.y };

    const cross = lineVector.x * motionVector.y - lineVector.y * motionVector.x;

    const isHorizontal = Math.abs(lineVector.x) >= Math.abs(lineVector.y);

    if (isHorizontal) {
      // Horizontal line: crossing determines top-to-bottom vs bottom-to-top
      return cross > 0 ? 'top-to-bottom' : 'bottom-to-top';
    } else {
      // Vertical line: Bug 1 fix - mapping is reversed for vertical lines
      return cross > 0 ? 'right-to-left' : 'left-to-right';
    }
  }

  get currentCount(): number {
    return this.tracker.currentCount;
  }

  get uniqueVisitors(): number {
    return this.entryLine ? this._uniqueVisitors : this.tracker.totalUnique;
  }

  get exitCount(): number {
    return this._exitCount;
  }

  getObjects(): TrackedObject[] {
    return this.tracker.getObjects();
  }

  reset() {
    this.tracker.reset();
    this._uniqueVisitors = 0;
    this._exitCount = 0;
  }
}
