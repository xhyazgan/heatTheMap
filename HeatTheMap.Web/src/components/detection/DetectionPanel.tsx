import React, { useState, useRef, useCallback } from 'react';
import { CameraFeed } from './CameraFeed';
import { mapDetectionsToZones, accumulateZones } from '../../lib/zoneMapper';
import type { TrackedObject } from '../../lib/centroidTracker';
import { useFilterStore } from '../../stores/useFilterStore';

interface DetectionPanelProps {
  onSubmitDetection?: (data: {
    storeId: number;
    timestamp: string;
    personCount: number;
    zoneDistribution: number[][];
  }) => void;
}

export const DetectionPanel: React.FC<DetectionPanelProps> = ({ onSubmitDetection }) => {
  const { selectedStore } = useFilterStore();
  const [accumulatedZones, setAccumulatedZones] = useState<number[][] | null>(null);
  const [lastUniqueCount, setLastUniqueCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<string | null>(null);
  const frameCountRef = useRef(0);

  const handleDetectionUpdate = useCallback(
    (
      objects: TrackedObject[],
      uniqueCount: number,
      _currentCount: number,
      videoWidth: number,
      videoHeight: number,
    ) => {
      setLastUniqueCount(uniqueCount);

      // Accumulate zone data every 10 frames (~1 second)
      frameCountRef.current++;
      if (frameCountRef.current % 10 === 0) {
        const zones = mapDetectionsToZones(objects, videoWidth, videoHeight);
        setAccumulatedZones((prev) => (prev ? accumulateZones(prev, zones) : zones));
      }
    },
    [],
  );

  const handleSubmit = async () => {
    if (!selectedStore || !accumulatedZones || !onSubmitDetection) return;

    setSubmitting(true);
    try {
      onSubmitDetection({
        storeId: selectedStore,
        timestamp: new Date().toISOString(),
        personCount: lastUniqueCount,
        zoneDistribution: accumulatedZones,
      });
      setLastSubmitTime(new Date().toLocaleTimeString('tr-TR'));
      // Reset accumulated zones after submit
      setAccumulatedZones(null);
      frameCountRef.current = 0;
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

      <CameraFeed onDetectionUpdate={handleDetectionUpdate} />

      {/* Submit button */}
      <div className="mt-3">
        <button
          onClick={handleSubmit}
          disabled={!selectedStore || !accumulatedZones || submitting}
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
