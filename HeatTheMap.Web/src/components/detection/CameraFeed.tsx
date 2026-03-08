import React, { useRef, useEffect, useCallback, useState } from 'react';
import Hls from 'hls.js';
import { usePersonDetection } from './usePersonDetection';
import type { TrackedObject } from '../../lib/centroidTracker';
import type { EntryLineConfig } from '../../lib/directionalEntryTracker';
import type { VideoSource } from '../../types/videoSource';

interface CameraFeedProps {
  entryLine?: EntryLineConfig | null;
  videoSource?: VideoSource | null;
  onDetectionUpdate?: (
    objects: TrackedObject[],
    uniqueCount: number,
    currentCount: number,
    videoWidth: number,
    videoHeight: number,
    exitCount: number,
  ) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ entryLine, videoSource, onDetectionUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceConnected, setSourceConnected] = useState(false);

  const {
    detections,
    trackedObjects,
    uniqueCount,
    currentCount,
    exitCount,
    isModelLoading,
    isDetecting,
    error,
    startDetection,
    stopDetection,
    resetCount,
    setEntryLine,
  } = usePersonDetection(videoRef);

  // Sync entry line config to tracker
  useEffect(() => {
    setEntryLine(entryLine ?? null);
  }, [entryLine, setEntryLine]);

  const disconnectSource = useCallback(() => {
    // Stop webcam stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // Revoke file object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    // Destroy HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
      videoRef.current.load();
    }
    stopDetection();
    setSourceConnected(false);
    setSourceError(null);
  }, [stopDetection]);

  const connectSource = useCallback(async (source: VideoSource) => {
    const video = videoRef.current;
    if (!video) return;

    setSourceError(null);

    const handleVideoError = () => {
      const mediaError = video.error;
      let msg = 'Video kaynagi yuklenemedi';
      if (mediaError) {
        switch (mediaError.code) {
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            msg = 'Video formati desteklenmiyor';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            msg = 'Ag hatasi - video yuklenemedi';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            msg = 'Video cozumlenemedi';
            break;
        }
      }
      setSourceError(msg);
      setSourceConnected(false);
    };

    video.onerror = handleVideoError;

    try {
      if (source.type === 'webcam') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'environment' },
        });
        streamRef.current = stream;
        video.srcObject = stream;
        setSourceConnected(true);
      } else if (source.type === 'file') {
        const objectUrl = URL.createObjectURL(source.file);
        objectUrlRef.current = objectUrl;
        video.src = objectUrl;
        video.loop = true;
        video.play().catch(() => {
          setSourceError('Video oynatilamadi');
        });
        setSourceConnected(true);
      } else if (source.type === 'url') {
        let targetUrl = source.url;

        // If credentials are provided and it's not HLS, use backend proxy
        if (source.username) {
          targetUrl = `/api/camera/proxy?url=${encodeURIComponent(source.url)}&username=${encodeURIComponent(source.username)}&password=${encodeURIComponent(source.password ?? '')}`;
        }

        if (source.url.includes('.m3u8') || source.url.includes('m3u8')) {
          // HLS stream
          if (Hls.isSupported()) {
            const hls = new Hls({
              xhrSetup: (xhr) => {
                if (source.username) {
                  xhr.setRequestHeader(
                    'Authorization',
                    'Basic ' + btoa(`${source.username}:${source.password ?? ''}`),
                  );
                }
              },
            });
            hls.loadSource(targetUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data.fatal) {
                let msg = 'HLS akisi baglanilamadi';
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  msg = 'Ag hatasi - HLS akisi yuklenemedi';
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                  msg = 'Medya hatasi - HLS akisi cozumlenemedi';
                }
                setSourceError(msg);
                setSourceConnected(false);
              }
            });
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {
                setSourceError('Video oynatilamadi');
              });
            });
            hlsRef.current = hls;
            setSourceConnected(true);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS
            video.src = targetUrl;
            video.play().catch(() => {
              setSourceError('Video oynatilamadi');
            });
            setSourceConnected(true);
          } else {
            setSourceError('Bu tarayici HLS akisini desteklemiyor');
          }
        } else {
          // Direct MP4/WebM URL
          video.src = targetUrl;
          video.play().catch(() => {
            setSourceError('Video oynatilamadi');
          });
          setSourceConnected(true);
        }
      }
    } catch {
      setSourceError('Video kaynagina baglanilamadi');
      setSourceConnected(false);
    }
  }, []);

  // Connect/disconnect when videoSource changes
  useEffect(() => {
    disconnectSource();
    if (videoSource) {
      connectSource(videoSource);
    }
  }, [videoSource, connectSource, disconnectSource]);

  // Draw bounding boxes and entry line
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw detections
    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = '#00FF00';
      ctx.font = '12px monospace';
      ctx.fillText(`${Math.round(det.score * 100)}%`, x, y - 4);
    });

    // Draw entry line overlay
    if (entryLine) {
      const startX = entryLine.start.x * canvas.width;
      const startY = entryLine.start.y * canvas.height;
      const endX = entryLine.end.x * canvas.width;
      const endY = entryLine.end.y * canvas.height;

      ctx.strokeStyle = '#00FFAA';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw direction arrow at midpoint
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const arrowSize = 12;

      let arrowDx = 0;
      let arrowDy = 0;
      switch (entryLine.inDirection) {
        case 'left-to-right': arrowDx = arrowSize; break;
        case 'right-to-left': arrowDx = -arrowSize; break;
        case 'top-to-bottom': arrowDy = arrowSize; break;
        case 'bottom-to-top': arrowDy = -arrowSize; break;
      }

      ctx.fillStyle = '#00FFAA';
      ctx.beginPath();
      ctx.moveTo(midX + arrowDx, midY + arrowDy);
      ctx.lineTo(midX + arrowDy / 2 - arrowDx / 2, midY - arrowDx / 2 - arrowDy / 2);
      ctx.lineTo(midX - arrowDy / 2 - arrowDx / 2, midY + arrowDx / 2 - arrowDy / 2);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = '#00FFAA';
      ctx.font = '11px monospace';
      ctx.fillText('Entry Line', startX, startY - 8);
    }
  }, [detections, entryLine]);

  // Notify parent of detection updates
  useEffect(() => {
    if (onDetectionUpdate && videoRef.current) {
      onDetectionUpdate(
        trackedObjects,
        uniqueCount,
        currentCount,
        videoRef.current.videoWidth || 640,
        videoRef.current.videoHeight || 480,
        exitCount,
      );
    }
  }, [trackedObjects, uniqueCount, currentCount, exitCount, onDetectionUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const handleToggle = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const displayError = sourceError || error;

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
                  : sourceConnected
                    ? 'bg-blue-500'
                    : 'bg-gray-500'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isModelLoading
              ? 'Model yukleniyor...'
              : isDetecting
                ? 'Tespit ediliyor'
                : displayError
                  ? 'Hata'
                  : sourceConnected
                    ? 'Kaynak bagli - tespit baslatilabilir'
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
            disabled={!sourceConnected}
            className={`px-3 py-1 text-xs rounded font-medium ${
              isDetecting
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
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
        {displayError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-red-400 text-sm text-center px-4">{displayError}</p>
          </div>
        )}

        {/* Placeholder when not active */}
        {!sourceConnected && !isDetecting && !isModelLoading && !displayError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">Kaynak secin ve baglanti kurun</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800/50 rounded px-3 py-2 text-center">
          <div className="text-xl font-bold text-white">{currentCount}</div>
          <div className="text-xs text-gray-400">Anlik</div>
        </div>
        <div className="bg-gray-800/50 rounded px-3 py-2 text-center">
          <div className="text-xl font-bold text-sky-400">{uniqueCount}</div>
          <div className="text-xs text-gray-400">Giris</div>
        </div>
        <div className="bg-gray-800/50 rounded px-3 py-2 text-center">
          <div className="text-xl font-bold text-orange-400">{exitCount}</div>
          <div className="text-xs text-gray-400">Cikis</div>
        </div>
      </div>
    </div>
  );
};
