import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CameraFeed } from './CameraFeed';
import { mapDetectionsToZones } from '../../lib/zoneMapper';
import { HeatmapAccumulator } from '../../lib/heatmapAccumulator';
import type { TrackedObject } from '../../lib/centroidTracker';
import type { EntryLineConfig } from '../../lib/directionalEntryTracker';
import { useFilterStore } from '../../stores/useFilterStore';

interface DetectionPanelProps {
  entryLine?: EntryLineConfig | null;
  onSubmitDetection?: (data: {
    storeId: number;
    timestamp: string;
    personCount: number;
    exitCount: number;
    zoneDistribution: number[][];
  }) => void;
}

export const DetectionPanel: React.FC<DetectionPanelProps> = ({ entryLine, onSubmitDetection }) => {
  const { selectedStore } = useFilterStore();
  const [lastUniqueCount, setLastUniqueCount] = useState(0);
  const [lastExitCount, setLastExitCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<string | null>(null);
  const accumulatorRef = useRef(new HeatmapAccumulator());
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestObjectsRef = useRef<{ objects: TrackedObject[]; videoWidth: number; videoHeight: number }>({
    objects: [],
    videoWidth: 640,
    videoHeight: 480,
  });

  const handleDetectionUpdate = useCallback(
    (
      objects: TrackedObject[],
      uniqueCount: number,
      _currentCount: number,
      videoWidth: number,
      videoHeight: number,
      exitCount: number,
    ) => {
      setLastUniqueCount(uniqueCount);
      setLastExitCount(exitCount);
      latestObjectsRef.current = { objects, videoWidth, videoHeight };
    },
    [],
  );

  // Take snapshots every 1 second for time-weighted heatmap
  useEffect(() => {
    snapshotIntervalRef.current = setInterval(() => {
      const { objects, videoWidth, videoHeight } = latestObjectsRef.current;
      if (objects.length > 0) {
        const zones = mapDetectionsToZones(objects, videoWidth, videoHeight);
        accumulatorRef.current.addSnapshot(zones);
      }
    }, 1000);

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedStore || !onSubmitDetection) return;

    const heatmap = accumulatorRef.current.getTimeWeightedHeatmap();

    setSubmitting(true);
    try {
      onSubmitDetection({
        storeId: selectedStore,
        timestamp: new Date().toISOString(),
        personCount: lastUniqueCount,
        exitCount: lastExitCount,
        zoneDistribution: heatmap,
      });
      setLastSubmitTime(new Date().toLocaleTimeString('tr-TR'));
      accumulatorRef.current.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Kamera Tespiti</h3>
        {lastSubmitTime && (
          <span className="text-xs text-gray-500">Son gonderim: {lastSubmitTime}</span>
        )}
      </div>

      <CameraFeed onDetectionUpdate={handleDetectionUpdate} entryLine={entryLine} />

      {/* Submit button */}
      <div className="mt-3">
        <button
          onClick={handleSubmit}
          disabled={!selectedStore || submitting}
          className="w-full px-4 py-2 text-sm font-medium rounded bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? 'Gonderiliyor...'
            : !selectedStore
              ? 'Magaza secin'
              : 'Verileri Gonder'}
        </button>
      </div>
    </div>
  );
};
