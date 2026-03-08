import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSaveEntryLine } from '../../hooks/useEntryLine';
import type { EntryLineConfig } from '../../types';

type Direction = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';

interface EntryLineEditorProps {
  storeId: number;
  existingLine?: EntryLineConfig | null;
  onClose: () => void;
  mode?: 'modal' | 'inline';
}

export const EntryLineEditor: React.FC<EntryLineEditorProps> = ({
  storeId,
  existingLine,
  onClose,
  mode = 'modal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [direction, setDirection] = useState<Direction>('left-to-right');
  const saveEntryLine = useSaveEntryLine();

  const canvasWidth = 640;
  const canvasHeight = 480;

  // Load existing line (denormalize)
  useEffect(() => {
    if (existingLine) {
      setPoints([
        { x: existingLine.startX * canvasWidth, y: existingLine.startY * canvasHeight },
        { x: existingLine.endX * canvasWidth, y: existingLine.endY * canvasHeight },
      ]);
      setDirection(existingLine.inDirection as Direction);
    }
  }, [existingLine]);

  // Draw canvas when points or direction change (Bug 5 fix)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvasWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw points
    points.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(i === 0 ? 'A' : 'B', p.x - 3, p.y + 3);
    });

    // Draw line between points
    if (points.length === 2) {
      ctx.strokeStyle = '#00FFAA';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw direction arrow
      const midX = (points[0].x + points[1].x) / 2;
      const midY = (points[0].y + points[1].y) / 2;
      const arrowSize = 15;

      let dx = 0, dy = 0;
      switch (direction) {
        case 'left-to-right': dx = arrowSize; break;
        case 'right-to-left': dx = -arrowSize; break;
        case 'top-to-bottom': dy = arrowSize; break;
        case 'bottom-to-top': dy = -arrowSize; break;
      }

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(midX + dx, midY + dy);
      ctx.lineTo(midX + dy / 2 - dx / 2, midY - dx / 2 - dy / 2);
      ctx.lineTo(midX - dy / 2 - dx / 2, midY + dx / 2 - dy / 2);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = '#facc15';
      ctx.font = '12px monospace';
      ctx.fillText(`Giris: ${direction}`, midX + 10, midY - 10);
    }
  }, [points, direction]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      setPoints((prev) => {
        if (prev.length >= 2) return [{ x, y }];
        return [...prev, { x, y }];
      });
    },
    [],
  );

  const handleSave = async () => {
    if (points.length !== 2) return;

    // Normalize to 0-1 (Bug 4 fix)
    await saveEntryLine.mutateAsync({
      storeId,
      startX: points[0].x / canvasWidth,
      startY: points[0].y / canvasHeight,
      endX: points[1].x / canvasWidth,
      endY: points[1].y / canvasHeight,
      inDirection: direction,
    });

    onClose();
  };

  const content = (
    <>
      <p className="text-sm text-gray-400 mb-3">
        Canvas uzerinde 2 nokta secin (A ve B) ve giris yonunu belirleyin.
      </p>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        className="w-full bg-gray-900 rounded cursor-crosshair border border-gray-700"
      />

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-gray-300">Giris Yonu:</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
          className="bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600"
        >
          <option value="left-to-right">Soldan Saga</option>
          <option value="right-to-left">Sagdan Sola</option>
          <option value="top-to-bottom">Yukaridan Asagi</option>
          <option value="bottom-to-top">Asagidan Yukari</option>
        </select>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={() => setPoints([])}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          Temizle
        </button>
        {mode === 'modal' && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            Iptal
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={points.length !== 2 || saveEntryLine.isPending}
          className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saveEntryLine.isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </>
  );

  if (mode === 'inline') {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-[700px] w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Entry Line Ayarla</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        {content}
      </div>
    </div>
  );
};
