import { useRef, useEffect, useState, useCallback } from 'react';
import { CentroidTracker, type TrackedObject } from '../../lib/centroidTracker';

interface DetectionResult {
  bbox: [number, number, number, number];
  score: number;
  class: string;
}

interface UsePersonDetectionReturn {
  detections: DetectionResult[];
  trackedObjects: TrackedObject[];
  uniqueCount: number;
  currentCount: number;
  isModelLoading: boolean;
  isDetecting: boolean;
  error: string | null;
  startDetection: () => void;
  stopDetection: () => void;
  resetCount: () => void;
}

export function usePersonDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
): UsePersonDetectionReturn {
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([]);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modelRef = useRef<any>(null);
  const trackerRef = useRef(new CentroidTracker(30, 80));
  const animFrameRef = useRef<number>(0);
  const lastDetectTime = useRef(0);
  const detectingRef = useRef(false);

  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;

    setIsModelLoading(true);
    setError(null);
    try {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      modelRef.current = model;
      setIsModelLoading(false);
      return model;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Model yuklenemedi';
      setError(message);
      setIsModelLoading(false);
      return null;
    }
  }, []);

  const detectFrame = useCallback(async () => {
    if (!detectingRef.current) return;

    const video = videoRef.current;
    const model = modelRef.current;

    if (!video || !model || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = performance.now();
    // Throttle to ~10 FPS
    if (now - lastDetectTime.current < 100) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    lastDetectTime.current = now;

    try {
      const predictions = await model.detect(video);
      const personDetections: DetectionResult[] = predictions
        .filter((p: any) => p.class === 'person' && p.score >= 0.5)
        .map((p: any) => ({
          bbox: p.bbox as [number, number, number, number],
          score: p.score,
          class: p.class,
        }));

      setDetections(personDetections);

      // Update tracker
      const bboxes = personDetections.map((d) => d.bbox);
      const objects = trackerRef.current.update(bboxes);
      setTrackedObjects(Array.from(objects.values()));
      setUniqueCount(trackerRef.current.totalUnique);
      setCurrentCount(trackerRef.current.currentCount);
    } catch {
      // Skip frame on error
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef]);

  const startDetection = useCallback(async () => {
    const model = await loadModel();
    if (!model) return;

    detectingRef.current = true;
    setIsDetecting(true);
    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [loadModel, detectFrame]);

  const stopDetection = useCallback(() => {
    detectingRef.current = false;
    setIsDetecting(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, []);

  const resetCount = useCallback(() => {
    trackerRef.current.reset();
    setUniqueCount(0);
    setCurrentCount(0);
    setTrackedObjects([]);
  }, []);

  useEffect(() => {
    return () => {
      detectingRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return {
    detections,
    trackedObjects,
    uniqueCount,
    currentCount,
    isModelLoading,
    isDetecting,
    error,
    startDetection,
    stopDetection,
    resetCount,
  };
}
