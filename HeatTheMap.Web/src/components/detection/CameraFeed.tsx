import React, { useRef, useEffect, useCallback } from 'react';
import { usePersonDetection } from './usePersonDetection';
import type { TrackedObject } from '../../lib/centroidTracker';

interface CameraFeedProps {
  onDetectionUpdate?: (
    objects: TrackedObject[],
    uniqueCount: number,
    currentCount: number,
    videoWidth: number,
    videoHeight: number,
  ) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onDetectionUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const {
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
  } = usePersonDetection(videoRef);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera permission denied handled in UI
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    stopDetection();
  }, [stopDetection]);

  // Draw bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = '#00FF00';
      ctx.font = '12px monospace';
      ctx.fillText(`${Math.round(det.score * 100)}%`, x, y - 4);
    });
  }, [detections]);

  // Notify parent of detection updates
  useEffect(() => {
    if (onDetectionUpdate && videoRef.current) {
      onDetectionUpdate(
        trackedObjects,
        uniqueCount,
        currentCount,
        videoRef.current.videoWidth || 640,
        videoRef.current.videoHeight || 480,
      );
    }
  }, [trackedObjects, uniqueCount, currentCount, onDetectionUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleToggle = async () => {
    if (isDetecting) {
      stopCamera();
    } else {
      await startCamera();
      startDetection();
    }
  };

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isDetecting
                ? 'bg-green-500 animate-pulse'
                : isModelLoading
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-500'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isModelLoading
              ? 'Model yukleniyor...'
              : isDetecting
                ? 'Tespit ediliyor'
                : error
                  ? 'Hata'
                  : 'Hazir'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetCount}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            Sifirla
          </button>
          <button
            onClick={handleToggle}
            className={`px-3 py-1 text-xs rounded font-medium ${
              isDetecting
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isDetecting ? 'Durdur' : 'Baslat'}
          </button>
        </div>
      </div>

      {/* Video container */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Count badge */}
        {isDetecting && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
            {currentCount} kisi
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-red-400 text-sm text-center px-4">{error}</p>
          </div>
        )}

        {/* Placeholder when not active */}
        {!isDetecting && !isModelLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">Kamerayi baslatmak icin tiklayin</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded px-3 py-2 text-center">
          <div className="text-xl font-bold text-white">{currentCount}</div>
          <div className="text-xs text-gray-400">Anlik</div>
        </div>
        <div className="bg-gray-800/50 rounded px-3 py-2 text-center">
          <div className="text-xl font-bold text-sky-400">{uniqueCount}</div>
          <div className="text-xs text-gray-400">Toplam Benzersiz</div>
        </div>
      </div>
    </div>
  );
};
