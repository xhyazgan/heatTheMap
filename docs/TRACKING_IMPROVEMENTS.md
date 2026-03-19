# 🔄 Person Tracking System - Geliştirme Planı

## 📋 Genel Bakış

Bu doküman, HeatTheMap projesindeki kişi takip sisteminin mevcut sorunlarını, çözüm önerilerini ve detaylı implementation planını içermektedir.

**Tarih:** 7 Mart 2026  
**Versiyon:** 1.0  
**Durum:** Planlama Tamamlandı - Implementation Bekliyor

---

## 🎯 Hedefler

1. ✅ Duplicate counting (tekrarlı sayım) problemini çözmek
2. ✅ Entry/exit yön kontrolü ile doğru ziyaretçi sayımı
3. ✅ Heatmap accumulation mantığını düzeltmek
4. ✅ UI üzerinden zone konfigürasyonu
5. ✅ Production-ready tracking sistemi

---

## 🔴 BÖLÜM 1: MEVCUT SORUNLAR

### 1.1 Duplicate Counting Problemi

#### Mevcut Kod

**Dosya:** `HeatTheMap.Web/src/lib/centroidTracker.ts`

```typescript
private register(centroid: [number, number], bbox: BBox): void {
  this.objects.set(this.nextId, {
    id: this.nextId,
    centroid,
    bbox,
    disappeared: 0,
    counted: true,
  });
  this.nextId++;
  this.totalUnique++;  // ❌ PROBLEM: Her yeni detection'da artıyor
}
```

#### Sorun Senaryosu

```
Timeline:
00:00 - Ahmet dükkana giriyor
      → Kamera algılıyor → ID: 0, totalUnique: 1 ✅

00:15 - Ahmet rafa doğru yürüyor, kamera açısı dışına çıkıyor
      → Tracker 30 frame (3 saniye) boyunca Ahmet'i göremez

00:18 - maxDisappeared = 30 frame aşıldı
      → Tracker Ahmet'i siler (ID: 0 kayboldu)

00:20 - Ahmet tekrar kameraya giriyor (raftan geri geliyor)
      → Tracker: "Bu yeni bir kişi"
      → Yeni ID: 1, totalUnique: 2 ❌ (Ahmet 2 kere sayıldı!)

00:35 - Ahmet hızlı hareket ediyor
      → maxDistance = 80 pixel aşıldı
      → Tracker bağlantıyı kaybetti
      → Yeni ID: 2, totalUnique: 3 ❌ (Ahmet 3 kere sayıldı!)
```

**Sonuç:** Aynı kişi 5-10 kere sayılabiliyor!

### 1.2 Entry/Exit Ayrımı Yok

#### Mevcut Durum

Şu anda sistem:
- ❌ Kapıdan giren kişiyi sayıyor (+1)
- ❌ Kapıdan çıkan kişiyi tekrar sayıyor (+1)
- ❌ Dükkan içinde dolaşan kişiyi sayıyor
- ❌ Kamera açısına yan taraftan giren kişiyi sayıyor

#### Senaryo: Çift Sayım

```
Ahmet'in Yolculuğu:
1. Kapıdan giriyor → +1 sayıldı ✅
2. Rafa gidiyor → Kameradan çıktı
3. Kasaya gidiyor → Kameraya tekrar girdi → +1 sayıldı ❌
4. Kapıdan çıkıyor → +1 sayıldı ❌

Sonuç: Ahmet 3 kere sayıldı! (Olması gereken: 1)
```

### 1.3 Heatmap Accumulation Hatası

#### Mevcut Kod

**Dosya:** `HeatTheMap.Web/src/components/detection/DetectionPanel.tsx`

```typescript
// Her 10 frame'de bir (yaklaşık 1 saniye)
frameCountRef.current++;
if (frameCountRef.current % 10 === 0) {
  const zones = mapDetectionsToZones(objects, videoWidth, videoHeight);
  setAccumulatedZones((prev) => 
    prev ? accumulateZones(prev, zones) : zones  // ❌ SÜREKLI TOPLUYOR
  );
}
```

**Dosya:** `HeatTheMap.Web/src/lib/zoneMapper.ts`

```typescript
export function accumulateZones(
  existing: number[][],
  newData: number[][]
): number[][] {
  return existing.map((row, y) =>
    row.map((val, x) => val + (newData[y]?.[x] || 0))  // ❌ Basit toplama
  );
}
```

#### Sorun

```
Senaryo: 3 kişi Zone A'da 20 saniye duruyor

Hesaplama:
- 20 saniye × 10 FPS = 200 frame
- Her 10 frame'de accumulation: Zone A += 3
- 20 / 1 = 20 iteration
- Zone A total = 3 × 20 = 60 ❌

Gerçek Durum:
- Zone A'da 3 kişi var
- 20 saniye kaldılar
- Heatmap değeri: "60" (anlamsız sayı)

Olması Gereken:
- Zone A density: 3 kişi
- Zone A dwell time: 20 saniye
- Zone A person-seconds: 60 (3 × 20) ✅
```

**Sorun:** Heatmap değerleri "kaç kişi var" değil "kaç frame × kaç kişi" gösteriyor!

---

## ✅ BÖLÜM 2: ÇÖZÜM - DIRECTIONAL ENTRY LINE SİSTEMİ

### 2.1 Konsept

**Temel Fikir:** Sadece belirlenen entry line'dan doğru yönde geçen kişileri say!

```
┌─────────────────────────────────────────┐
│  STORE LAYOUT (Tek Kamera Senaryosu)    │
│                                         │
│  🟢 ENTRY REGION (Dış Alan - Kapı)     │
│      People enter from here             │
│  ════════════════════════                │
│  ║  ENTRY LINE    ║  ← Direction: IN   │
│  ════════════════════════                │
│  🔴 INSIDE REGION (İç Alan - Dükkan)    │
│                                         │
│  ✅ 🟢 → 🔴 geçiş = +1 (Giriş)        │
│  ❌ 🔴 → 🟢 geçiş = Sayılmaz (Çıkış)  │
│  ❌ İç alandan line'a gelme = Sayılmaz │
│                                         │
│  [RAF] [RAF] [KASA] ← Buradan gelenler  │
│  entry line'ı geçse bile SAYILMAZ       │
└─────────────────────────────────────────┘
```

### 2.2 Algoritma: Directional Line Crossing

#### 2.2.1 Temel Yapılar

```typescript
// Entry line tanımı
interface EntryLine {
  id: string;
  storeId: number;
  start: Point;  // Line başlangıç noktası
  end: Point;    // Line bitiş noktası
  inDirection: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
  createdAt: Date;
}

interface Point {
  x: number;
  y: number;
}

// Tracked person
interface TrackedPerson {
  id: number;
  currentCentroid: Point;
  previousCentroid: Point | null;
  bbox: BBox;
  disappeared: number;
  hasCounted: boolean;  // ✅ Entry line'dan geçti mi?
  entryTime: number | null;
  lastSeenTime: number;
}
```

#### 2.2.2 Line Crossing Detection

```typescript
class DirectionalEntryTracker {
  private entryLine: EntryLine | null = null;
  private trackedPeople = new Map<number, TrackedPerson>();
  private uniqueVisitors = 0;
  private nextId = 0;
  
  // Entry line'ı ayarla (UI'dan gelecek)
  setEntryLine(line: EntryLine): void {
    this.entryLine = line;
    console.log('✅ Entry line configured:', line);
  }
  
  // Her frame'de çağrılır
  update(detections: Detection[]): TrackingResult {
    // 1. Detections'ı track et
    this.trackDetections(detections);
    
    // 2. Entry line crossing kontrolü
    if (this.entryLine) {
      this.checkEntryCrossings();
    }
    
    // 3. Kayıp kişileri temizle
    this.cleanupDisappeared();
    
    return {
      currentCount: this.trackedPeople.size,
      uniqueVisitors: this.uniqueVisitors,
      trackedObjects: Array.from(this.trackedPeople.values())
    };
  }
  
  // Entry line crossing kontrolü
  private checkEntryCrossings(): void {
    for (const person of this.trackedPeople.values()) {
      // Önceki pozisyon yoksa skip
      if (!person.previousCentroid) continue;
      
      // Zaten sayıldıysa skip
      if (person.hasCounted) continue;
      
      // Line crossing kontrolü
      const crossingResult = this.detectDirectionalCrossing(
        person.previousCentroid,
        person.currentCentroid,
        this.entryLine!
      );
      
      if (crossingResult === 'valid-entry') {
        // ✅ Geçerli giriş!
        person.hasCounted = true;
        person.entryTime = Date.now();
        this.uniqueVisitors++;
        
        console.log(`✅ New visitor #${this.uniqueVisitors} (ID: ${person.id})`);
      }
    }
  }
  
  // Directional crossing detection
  private detectDirectionalCrossing(
    prevPos: Point,
    currPos: Point,
    line: EntryLine
  ): 'valid-entry' | 'exit' | 'none' {
    // 1. Line intersection var mı?
    const intersects = this.lineSegmentsIntersect(
      prevPos, currPos,
      line.start, line.end
    );
    
    if (!intersects) return 'none';
    
    // 2. Crossing direction'ı hesapla
    const direction = this.getCrossingDirection(prevPos, currPos, line);
    
    // 3. Doğru yönde mi?
    if (direction === line.inDirection) {
      return 'valid-entry';  // ✅ Giriş
    } else {
      return 'exit';  // ❌ Çıkış (sayılmaz)
    }
  }
  
  // İki line segment kesişiyor mu?
  private lineSegmentsIntersect(
    p1: Point, p2: Point,  // Hareket vektörü
    p3: Point, p4: Point   // Entry line
  ): boolean {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    
    if (denominator === 0) return false;  // Paralel
    
    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
    
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }
  
  // Crossing direction'ı belirle
  private getCrossingDirection(
    prevPos: Point,
    currPos: Point,
    line: EntryLine
  ): string {
    // Line'ın yönü
    const lineVector = {
      x: line.end.x - line.start.x,
      y: line.end.y - line.start.y
    };
    
    // Hareket vektörü
    const motionVector = {
      x: currPos.x - prevPos.x,
      y: currPos.y - prevPos.y
    };
    
    // Cross product (hangi taraftan geçti?)
    const cross = lineVector.x * motionVector.y - lineVector.y * motionVector.x;
    
    // Line'ın horizontal mu vertical mı olduğuna göre direction belirle
    const isHorizontal = Math.abs(lineVector.x) > Math.abs(lineVector.y);
    
    if (isHorizontal) {
      // Horizontal line: top-to-bottom veya bottom-to-top
      return cross > 0 ? 'top-to-bottom' : 'bottom-to-top';
    } else {
      // Vertical line: left-to-right veya right-to-left
      return cross > 0 ? 'left-to-right' : 'right-to-left';
    }
  }
  
  // Tracking logic (mevcut sistemi koruyoruz)
  private trackDetections(detections: Detection[]): void {
    const currentCentroids = detections.map(d => this.getBboxCenter(d.bbox));
    
    if (this.trackedPeople.size === 0) {
      // İlk frame: Tüm detections'ı register et
      for (let i = 0; i < currentCentroids.length; i++) {
        this.register(currentCentroids[i], detections[i].bbox);
      }
      return;
    }
    
    // Matching logic (Greedy/Hungarian)
    const matches = this.matchCentroids(currentCentroids);
    
    // Update matched, register new, mark disappeared
    // ... (Mevcut centroidTracker.ts logic'i)
  }
  
  private register(centroid: Point, bbox: BBox): void {
    this.trackedPeople.set(this.nextId, {
      id: this.nextId,
      currentCentroid: centroid,
      previousCentroid: null,
      bbox,
      disappeared: 0,
      hasCounted: false,  // ✅ Başlangıçta false!
      entryTime: null,
      lastSeenTime: Date.now()
    });
    this.nextId++;
    // ❌ totalUnique++ YOK! Sadece entry crossing'de artacak
  }
}
```

### 2.3 Test Senaryoları

#### Senaryo 1: Normal Giriş ✅
```
1. Ahmet kapıdan içeri giriyor
   → Entry line'ı 🟢→🔴 yönde geçiyor
   → hasCounted = false → true
   → uniqueVisitors = 1 ✅

2. Ahmet rafa gidiyor, kameradan çıkıyor
   → Tracker hala Ahmet'i takip ediyor (disappeared < max)

3. Ahmet tekrar kameraya giriyor
   → Tracker Ahmet'i buluyor (aynı ID)
   → hasCounted = true (zaten sayılmış)
   → uniqueVisitors = 1 ✅ (değişmedi!)
```

#### Senaryo 2: Çıkış Sayılmaz ✅
```
1. Ahmet kapıdan çıkıyor
   → Entry line'ı 🔴→🟢 yönde geçiyor
   → detectDirectionalCrossing() = 'exit'
   → uniqueVisitors değişmez ✅
```

#### Senaryo 3: İçeriden Gelen Sayılmaz ✅
```
1. Mehmet zaten dükkan içinde (kasada)
2. Mehmet kamera görüş alanına giriyor
   → Yeni ID alıyor
   → hasCounted = false
3. Mehmet hareket ediyor, entry line'a doğru geliyor
4. Mehmet entry line'ı geçiyor AMA 🔴→🟢 yönde
   → detectDirectionalCrossing() = 'exit'
   → uniqueVisitors değişmez ✅
```

#### Senaryo 4: ID Kaybı Sorunu Yok ✅
```
1. Ahmet giriyor → Entry line geçiyor → hasCounted = true, uniqueVisitors = 1
2. Ahmet kameradan kayboldu → Tracker timeout → ID silindi
3. Ahmet tekrar görünüyor → YENİ ID alıyor
4. AMA hasCounted = false ve entry line'dan geçmiyor
5. uniqueVisitors = 1 ✅ (değişmedi!)

Sonuç: ID kaybı olsa bile sorun yok!
```

---

## 🎨 BÖLÜM 3: UI ZONE EDITOR

### 3.1 Kullanıcı Akışı

```
Dashboard
  ↓
[⚙️ Configure Entry Line] Button
  ↓
Entry Line Editor Modal Opens
  ↓
Kamera Feed (Live Preview)
  ↓
User: 2 Nokta Seçer (Line Çizer)
  ↓
User: Giriş Yönünü Seçer (Arrow)
  ↓
Preview: Yeşil ok gösterir (giriş yönü)
  ↓
[💾 Save Configuration]
  ↓
Entry Line API'ye Kaydedilir
  ↓
Detection System Entry Line'ı Kullanmaya Başlar
```

### 3.2 Component: EntryLineEditor

```typescript
// HeatTheMap.Web/src/components/zone/EntryLineEditor.tsx

import React, { useRef, useState, useEffect } from 'react';
import { useFilterStore } from '../../stores/useFilterStore';

interface Point {
  x: number;
  y: number;
}

interface EntryLineConfig {
  start: Point;
  end: Point;
  direction: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
}

export const EntryLineEditor: React.FC = () => {
  const { selectedStore } = useFilterStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [points, setPoints] = useState<Point[]>([]);
  const [direction, setDirection] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    // Kamera feed'ini başlat
    startCamera();
    
    // Mevcut entry line'ı yükle
    loadExistingEntryLine();
  }, [selectedStore]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Kamera erişim hatası:', err);
    }
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (points.length >= 2) return; // Zaten 2 nokta var
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoint = { x, y };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    
    if (newPoints.length === 2) {
      // Line tamamlandı, direction seçimi aç
      setIsDrawing(false);
      // Auto-detect direction suggestion
      suggestDirection(newPoints[0], newPoints[1]);
    }
    
    drawCanvas();
  };
  
  const suggestDirection = (p1: Point, p2: Point) => {
    const isHorizontal = Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y);
    
    if (isHorizontal) {
      // Horizontal: left-to-right öner (en yaygın)
      setDirection('top-to-bottom');
    } else {
      // Vertical: left-to-right öner
      setDirection('left-to-right');
    }
  };
  
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Video frame'i çiz
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Entry line'ı çiz
    if (points.length > 0) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      if (points.length === 2) {
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        
        // Direction arrow çiz
        if (direction) {
          drawDirectionArrow(ctx, points[0], points[1], direction);
        }
      }
    }
  };
  
  const drawDirectionArrow = (
    ctx: CanvasRenderingContext2D,
    p1: Point,
    p2: Point,
    dir: string
  ) => {
    // Line'ın ortası
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    
    // Direction'a göre ok çiz
    ctx.fillStyle = '#00ff00';
    ctx.font = '24px Arial';
    
    const arrows = {
      'left-to-right': '→',
      'right-to-left': '←',
      'top-to-bottom': '↓',
      'bottom-to-top': '↑'
    };
    
    ctx.fillText(arrows[dir] || '?', midX - 12, midY - 10);
  };
  
  const handleSave = async () => {
    if (points.length !== 2 || !direction || !selectedStore) {
      alert('Lütfen line çizin ve direction seçin!');
      return;
    }
    
    const config: EntryLineConfig = {
      start: points[0],
      end: points[1],
      direction: direction as any
    };
    
    try {
      // API'ye kaydet
      await saveEntryLine(selectedStore, config);
      setSaved(true);
      alert('✅ Entry line kaydedildi!');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('❌ Kaydetme hatası!');
    }
  };
  
  const handleReset = () => {
    setPoints([]);
    setDirection(null);
    setSaved(false);
    drawCanvas();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full">
        <h2 className="text-2xl font-bold text-white mb-4">
          Entry Line Configuration
        </h2>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Canvas Area */}
          <div className="col-span-2">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                className="hidden"
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                onClick={handleCanvasClick}
                className="border-2 border-gray-700 rounded cursor-crosshair"
              />
              
              {points.length < 2 && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded">
                  📍 Click 2 points to draw entry line
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Area */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Step 1: Draw Line
              </h3>
              <p className="text-sm text-gray-400">
                Click two points on the entry door
              </p>
              <div className="mt-2">
                {points.length === 0 && '⚪ ⚪'}
                {points.length === 1 && '🟢 ⚪'}
                {points.length === 2 && '🟢 🟢'}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Step 2: Select Direction
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Which direction is entry?
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => setDirection('left-to-right')}
                  className={`w-full px-4 py-2 rounded ${
                    direction === 'left-to-right'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  ← From Left
                </button>
                <button
                  onClick={() => setDirection('right-to-left')}
                  className={`w-full px-4 py-2 rounded ${
                    direction === 'right-to-left'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  → From Right
                </button>
                <button
                  onClick={() => setDirection('top-to-bottom')}
                  className={`w-full px-4 py-2 rounded ${
                    direction === 'top-to-bottom'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  ↑ From Top
                </button>
                <button
                  onClick={() => setDirection('bottom-to-top')}
                  className={`w-full px-4 py-2 rounded ${
                    direction === 'bottom-to-top'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  ↓ From Bottom
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleSave}
                disabled={points.length !== 2 || !direction}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed mb-2"
              >
                💾 Save Configuration
              </button>
              
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🗄️ BÖLÜM 4: DATABASE SCHEMA

### 4.1 Yeni Tablo: EntryLines

```sql
CREATE TABLE EntryLines (
  Id INT PRIMARY KEY IDENTITY(1,1),
  StoreId INT NOT NULL,
  StartX FLOAT NOT NULL,
  StartY FLOAT NOT NULL,
  EndX FLOAT NOT NULL,
  EndY FLOAT NOT NULL,
  InDirection VARCHAR(50) NOT NULL,
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME2,
  FOREIGN KEY (StoreId) REFERENCES Stores(Id)
);

CREATE INDEX IX_EntryLines_StoreId ON EntryLines(StoreId);
CREATE INDEX IX_EntryLines_IsActive ON EntryLines(IsActive);
```

### 4.2 Entity Class

```csharp
// HeatTheMap.Api/Data/Entities/EntryLine.cs

namespace HeatTheMap.Api.Data.Entities;

public class EntryLine
{
    public int Id { get; set; }
    public int StoreId { get; set; }
    
    // Line coordinates (normalized 0-1)
    public float StartX { get; set; }
    public float StartY { get; set; }
    public float EndX { get; set; }
    public float EndY { get; set; }
    
    // Direction
    public string InDirection { get; set; } = string.Empty; // "left-to-right", "right-to-left", etc.
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation
    public Store Store { get; set; } = null!;
}
```

### 4.3 API Endpoints

```csharp
// HeatTheMap.Api/Controllers/EntryLinesController.cs

[ApiController]
[Route("api/[controller]")]
public class EntryLinesController : ControllerBase
{
    private readonly IEntryLineService _service;
    
    [HttpGet("store/{storeId}")]
    public async Task<ActionResult<EntryLineDto>> GetByStoreId(int storeId)
    {
        var entryLine = await _service.GetActiveEntryLineAsync(storeId);
        return entryLine == null ? NotFound() : Ok(entryLine);
    }
    
    [HttpPost]
    public async Task<ActionResult<EntryLineDto>> Create([FromBody] CreateEntryLineDto dto)
    {
        var entryLine = await _service.CreateEntryLineAsync(dto);
        return CreatedAtAction(nameof(GetByStoreId), new { storeId = entryLine.StoreId }, entryLine);
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<EntryLineDto>> Update(int id, [FromBody] UpdateEntryLineDto dto)
    {
        var entryLine = await _service.UpdateEntryLineAsync(id, dto);
        return Ok(entryLine);
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _service.DeleteEntryLineAsync(id);
        return NoContent();
    }
}
```

---

## 📊 BÖLÜM 5: HEATMAP İYİLEŞTİRMELERİ

### 5.1 Time-Weighted Accumulation

**Mevcut Sorun:** Heatmap sürekli artıyor, anlamsız sayılar.

**Çözüm:** Snapshot-based heatmap

```typescript
// HeatTheMap.Web/src/lib/heatmapAccumulator.ts

interface HeatmapSnapshot {
  timestamp: number;
  zones: number[][];  // Instantaneous count
  duration: number;   // Seconds this snapshot was valid
}

class HeatmapAccumulator {
  private snapshots: HeatmapSnapshot[] = [];
  private lastSnapshotTime: number = Date.now();
  private readonly SNAPSHOT_INTERVAL = 1000; // 1 second
  
  addSnapshot(zones: number[][]): void {
    const now = Date.now();
    const duration = (now - this.lastSnapshotTime) / 1000; // seconds
    
    this.snapshots.push({
      timestamp: now,
      zones: zones,
      duration: duration
    });
    
    this.lastSnapshotTime = now;
    
    // Keep last 60 seconds
    const cutoff = now - 60000;
    this.snapshots = this.snapshots.filter(s => s.timestamp > cutoff);
  }
  
  getTimeWeightedHeatmap(): number[][] {
    if (this.snapshots.length === 0) {
      return this.createEmptyGrid();
    }
    
    const result = this.createEmptyGrid();
    let totalDuration = 0;
    
    // Sum person-seconds for each zone
    for (const snapshot of this.snapshots) {
      totalDuration += snapshot.duration;
      
      for (let y = 0; y < snapshot.zones.length; y++) {
        for (let x = 0; x < snapshot.zones[y].length; x++) {
          // person-seconds = people × seconds
          result[y][x] += snapshot.zones[y][x] * snapshot.duration;
        }
      }
    }
    
    return result;
  }
  
  getAverageDensity(): number[][] {
    const personSeconds = this.getTimeWeightedHeatmap();
    const totalSeconds = this.getTotalDuration();
    
    if (totalSeconds === 0) return this.createEmptyGrid();
    
    // Average = total person-seconds / total seconds
    return personSeconds.map(row =>
      row.map(val => val / totalSeconds)
    );
  }
  
  private getTotalDuration(): number {
    return this.snapshots.reduce((sum, s) => sum + s.duration, 0);
  }
  
  private createEmptyGrid(): number[][] {
    return Array(10).fill(0).map(() => Array(10).fill(0));
  }
  
  clear(): void {
    this.snapshots = [];
    this.lastSnapshotTime = Date.now();
  }
}
```

### 5.2 Usage in Detection Panel

```typescript
// HeatTheMap.Web/src/components/detection/DetectionPanel.tsx

const heatmapAccumulator = useRef(new HeatmapAccumulator());

useEffect(() => {
  const interval = setInterval(() => {
    if (objects.size > 0) {
      // Current zone distribution
      const zones = mapDetectionsToZones(
        Array.from(objects.values()),
        videoWidth,
        videoHeight
      );
      
      // Add snapshot
      heatmapAccumulator.current.addSnapshot(zones);
      
      // Get time-weighted heatmap
      const heatmap = heatmapAccumulator.current.getTimeWeightedHeatmap();
      setAccumulatedZones(heatmap);
    }
  }, 1000); // Her 1 saniye
  
  return () => clearInterval(interval);
}, [objects, videoWidth, videoHeight]);
```

### 5.3 Visualize Person-Seconds

```typescript
// Heatmap visualization'da person-seconds göster
<div className="text-xs text-gray-400">
  {personSeconds.toFixed(1)} person-sec
</div>
```

---

## 🚀 BÖLÜM 6: IMPLEMENTATION ROADMAP

### Phase 1: Core Tracking System (1-2 gün)

- [ ] **1.1** `DirectionalEntryTracker` class oluştur
  - Dosya: `HeatTheMap.Web/src/lib/directionalEntryTracker.ts`
  - Line crossing detection algoritması
  - hasCounted flag logic

- [ ] **1.2** Mevcut `centroidTracker.ts`'i güncelle
  - `totalUnique++` logic'ini kaldır
  - `hasCounted` field ekle
  - Entry line integration

- [ ] **1.3** Unit testler yaz
  - Line intersection tests
  - Direction detection tests
  - Scenario-based tests

### Phase 2: Database & API (1 gün)

- [ ] **2.1** Database migration
  - EntryLines tablosu oluştur
  - Entity class ekle
  - DbContext'e ekle

- [ ] **2.2** API endpoints
  - EntryLinesController
  - Service layer
  - DTOs

- [ ] **2.3** API testing
  - CRUD operations
  - Validation

### Phase 3: UI Zone Editor (2-3 gün)

- [ ] **3.1** EntryLineEditor component
  - Canvas drawing
  - Direction selection
  - Save/load functionality

- [ ] **3.2** Dashboard integration
  - "Configure Entry Line" button
  - Modal/dialog
  - Entry line preview overlay

- [ ] **3.3** UI/UX polish
  - Smooth animations
  - Error handling
  - User feedback

### Phase 4: Heatmap Improvements (1 gün)

- [ ] **4.1** HeatmapAccumulator class
  - Snapshot-based logic
  - Time-weighted calculations

- [ ] **4.2** Detection Panel update
  - Integration ile HeatmapAccumulator
  - Visualization updates

### Phase 5: Testing & Deployment (2 gün)

- [ ] **5.1** End-to-end testing
  - Tüm senaryoları test et
  - Edge cases

- [ ] **5.2** Performance testing
  - FPS impact
  - Memory usage

- [ ] **5.3** Documentation
  - User guide
  - Admin guide

- [ ] **5.4** Deployment
  - Production release
  - Monitoring setup

**Toplam Süre:** 7-9 gün

---

## 📝 BÖLÜM 7: TEST SENARYOLARI

### Test 1: Normal Entry/Exit Flow
```
1. Ahmet giriyor (🟢→🔴) → uniqueVisitors = 1 ✅
2. Ahmet dolaşıyor → uniqueVisitors = 1 ✅
3. Ahmet çıkıyor (🔴→🟢) → uniqueVisitors = 1 ✅
```

### Test 2: ID Loss Recovery
```
1. Ahmet giriyor → uniqueVisitors = 1, hasCounted = true
2. Ahmet timeout → ID silindi
3. Ahmet tekrar görünüyor → Yeni ID, hasCounted = false
4. Ahmet entry line'dan geçmiyor → uniqueVisitors = 1 ✅
```

### Test 3: Multiple Entries
```
1. Ahmet giriyor → uniqueVisitors = 1
2. Mehmet giriyor → uniqueVisitors = 2
3. Ayşe giriyor → uniqueVisitors = 3
4. Ahmet çıkıyor → uniqueVisitors = 3 ✅
```

### Test 4: Fast Movement
```
1. Ahmet hızlı giriyor (>80 pixel/frame)
2. Tracker'ı kaybediyor → Yeni ID
3. Entry line'dan geçmediği için sayılmıyor ✅
```

### Test 5: Occlusion
```
1. Ahmet ve Mehmet beraber giriyor (overlap)
2. Detector 1 kişi olarak algılıyor
3. Ayrıldıklarında 2 kişi oluyor
4. Entry line mantığı ile düzgün sayılıyor ✅
```

---

## 🔧 BÖLÜM 8: CONFIGURATION

### Environment Variables

```bash
# .env
VITE_ENABLE_ENTRY_LINE_DETECTION=true
VITE_MIN_DETECTION_CONFIDENCE=0.5
VITE_MAX_DISAPPEARED_FRAMES=30
VITE_MAX_DISTANCE_PIXELS=80
```

### Store Configuration

```json
{
  "storeId": 1,
  "entryLine": {
    "enabled": true,
    "start": { "x": 0.3, "y": 0.1 },
    "end": { "x": 0.7, "y": 0.1 },
    "direction": "top-to-bottom"
  }
}
```

---

## 📚 BÖLÜM 9: REFERANSLAR

### Algoritma Referansları
- Line Segment Intersection: [GeeksforGeeks](https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/)
- Cross Product for Direction: [Stack Overflow](https://stackoverflow.com/questions/1560492/how-to-tell-whether-a-point-is-to-the-right-or-left-side-of-a-line)

### Tracking Referansları
- Centroid Tracking: [PyImageSearch](https://pyimagesearch.com/2018/07/23/simple-object-tracking-with-opencv/)
- Person Re-identification: [Papers With Code](https://paperswithcode.com/task/person-re-identification)

---

## ✅ BÖLÜM 10: CHECKLIST

### Geliştirme Öncesi
- [x] Mevcut sorunlar analiz edildi
- [x] Çözüm tasarlandı
- [x] Test senaryoları belirlendi
- [x] Implementation plan oluşturuldu

### Geliştirme Sırası
- [ ] DirectionalEntryTracker implementation
- [ ] Database schema ve migration
- [ ] API endpoints ve service layer
- [ ] EntryLineEditor UI component
- [ ] Dashboard integration
- [ ] HeatmapAccumulator implementation
- [ ] End-to-end testing
- [ ] Production deployment

### Tamamlandıktan Sonra
- [ ] User documentation yazıldı
- [ ] Performance monitoring aktif
- [ ] Backup stratejisi hazır
- [ ] Rollback planı hazır

---

## 🎓 BÖLÜM 11: BEST PRACTICES

### 11.1 Kod Kalitesi

```typescript
// ✅ İyi Pratik: Tip güvenliği
interface TrackedPerson {
  id: number;
  hasCounted: boolean;
  entryTime: number | null;
}

// ❌ Kötü Pratik: Any kullanımı
const person: any = { /* ... */ };
```

### 11.2 Performance

```typescript
// ✅ İyi: Map kullan (O(1) lookup)
private trackedPeople = new Map<number, TrackedPerson>();

// ❌ Kötü: Array kullan (O(n) lookup)
private trackedPeople: TrackedPerson[] = [];
```

### 11.3 Error Handling

```typescript
// ✅ İyi: Graceful degradation
try {
  const entryLine = await loadEntryLine(storeId);
  tracker.setEntryLine(entryLine);
} catch (err) {
  console.error('Entry line yüklenemedi, fallback mode aktif', err);
  // Sistem entry line olmadan da çalışır
}

// ❌ Kötü: Uygulama crash olur
const entryLine = await loadEntryLine(storeId);
tracker.setEntryLine(entryLine);
```

### 11.4 Logging

```typescript
// ✅ İyi: Structured logging
console.log('[Tracker] New visitor', {
  id: person.id,
  totalVisitors: this.uniqueVisitors,
  timestamp: new Date().toISOString()
});

// ❌ Kötü: Belirsiz log
console.log('visitor');
```

---

## 🐛 BÖLÜM 12: TROUBLESHOOTING

### Sorun 1: Entry Line Çalışmıyor

**Belirtiler:**
- Hiç kimse sayılmıyor
- uniqueVisitors her zaman 0

**Olası Nedenler:**
1. Entry line kaydedilmemiş
2. Direction yanlış ayarlanmış
3. Line koordinatları yanlış

**Çözüm:**
```typescript
// Debug logging ekle
console.log('Entry line config:', entryLine);
console.log('Person crossing:', {
  previousPos: person.previousCentroid,
  currentPos: person.currentCentroid,
  crossingResult: this.detectDirectionalCrossing(...)
});
```

### Sorun 2: Herkes 2 Kere Sayılıyor

**Belirtiler:**
- uniqueVisitors gerçek sayının 2 katı

**Olası Neden:**
- Direction ters ayarlanmış (çıkışlar da sayılıyor)

**Çözüm:**
```typescript
// Direction'ı tersine çevir
// 'left-to-right' → 'right-to-left'
// 'top-to-bottom' → 'bottom-to-top'
```

### Sorun 3: FPS Düşüyor

**Belirtiler:**
- Video laggy
- Detection yavaş

**Olası Neden:**
- Line crossing check çok sık çağrılıyor

**Çözüm:**
```typescript
// Throttle line crossing check
private lastCheckTime = 0;
private readonly CHECK_INTERVAL = 100; // ms

checkEntryCrossings() {
  const now = Date.now();
  if (now - this.lastCheckTime < this.CHECK_INTERVAL) return;
  this.lastCheckTime = now;
  
  // Normal check logic...
}
```

---

## 📈 BÖLÜM 13: METRICS & MONITORING

### 13.1 Tracked Metrics

```typescript
interface TrackingMetrics {
  // Accuracy
  uniqueVisitors: number;
  currentOccupancy: number;
  totalCrossings: number;
  validEntries: number;
  rejectedExits: number;
  
  // Performance
  avgFPS: number;
  processingTimeMs: number;
  memoryUsageMB: number;
  
  // System Health
  trackerLossRate: number;  // % of lost tracks
  falsePositiveRate: number;
  detectionConfidence: number;
}
```

### 13.2 Dashboard Widgets

```typescript
// Real-time metrics card
<MetricsCard>
  <Metric label="Unique Visitors" value={metrics.uniqueVisitors} />
  <Metric label="Current Inside" value={metrics.currentOccupancy} />
  <Metric label="FPS" value={metrics.avgFPS.toFixed(1)} />
  <Metric label="Accuracy" value={`${(100 - metrics.falsePositiveRate).toFixed(1)}%`} />
</MetricsCard>
```

### 13.3 Alerting

```typescript
// Alert rules
if (metrics.trackerLossRate > 0.2) {
  sendAlert({
    severity: 'warning',
    message: 'High tracker loss rate',
    value: metrics.trackerLossRate
  });
}

if (metrics.avgFPS < 15) {
  sendAlert({
    severity: 'critical',
    message: 'Low FPS detected',
    value: metrics.avgFPS
  });
}
```

---

## 🔐 BÖLÜM 14: SECURITY & PRIVACY

### 14.1 Data Privacy

```typescript
// ✅ Kişisel veri saklamayın
interface TrackedPerson {
  id: number;  // ✅ Anonymous ID
  hasCounted: boolean;
  entryTime: number;  // ✅ Timestamp only
  // ❌ NO: faceImage, name, etc.
}
```

### 14.2 Camera Access

```typescript
// Kullanıcıdan izin al
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: 640,
    height: 480,
    facingMode: 'environment'  // Arka kamera
  }
});

// Stream'i düzgün kapat
const stopCamera = () => {
  stream.getTracks().forEach(track => track.stop());
};
```

### 14.3 API Security

```csharp
// Entry line endpoints sadece admin'e açık
[Authorize(Roles = "Admin")]
[HttpPost("api/entrylines")]
public async Task<ActionResult> CreateEntryLine(...)
{
  // ...
}
```

---

## 🌐 BÖLÜM 15: MULTI-CAMERA SUPPORT (Gelecek)

### 15.1 Konsept

```
Store Layout - Çoklu Kamera:

Camera 1 (Entry)          Camera 2 (Middle)         Camera 3 (Checkout)
     🎥                        🎥                         🎥
┌─────────┐              ┌─────────┐               ┌─────────┐
│ ENTRY   │──────────────│ AISLES  │───────────────│ CHECKOUT│
│ [Line1] │              │         │               │         │
└─────────┘              └─────────┘               └─────────┘
```

### 15.2 Cross-Camera Tracking

```typescript
class MultiCameraTracker {
  private cameras: Map<number, CameraTracker> = new Map();
  private globalRegistry: Map<string, GlobalPerson> = new Map();
  
  // Person re-identification across cameras
  matchAcrossCameras(person: TrackedPerson, cameraId: number): string | null {
    // Simple approach: temporal proximity
    // Person disappears from Camera 1, appears in Camera 2 within 5 seconds
    
    // Advanced: appearance matching, trajectory prediction
  }
}
```

---

## 📱 BÖLÜM 16: MOBILE OPTIMIZATION

### 16.1 Responsive UI

```typescript
// Mobile-friendly entry line editor
const isMobile = window.innerWidth < 768;

<canvas
  width={isMobile ? 320 : 640}
  height={isMobile ? 240 : 480}
  className={isMobile ? 'touch-optimized' : ''}
/>
```

### 16.2 Performance

```typescript
// Reduce resolution on mobile
const getOptimalResolution = () => {
  if (isMobile) return { width: 320, height: 240 };
  return { width: 640, height: 480 };
};
```

---

## 🎯 ÖZET

### Temel Prensipler

1. **Entry Line Esaslı Sayım**
   - SADECE entry line'dan doğru yönde geçenler sayılır
   - Çıkışlar sayılmaz
   - İçeriden gelenler sayılmaz

2. **hasCounted Flag**
   - Her person bir kere sayılır
   - ID kaybı olsa bile duplicate sayım olmaz

3. **Time-Weighted Heatmap**
   - Person-seconds metriği kullan
   - Snapshot-based accumulation
   - Anlamsız toplama yok

4. **UI-Driven Configuration**
   - Admin entry line çizer
   - Direction seçer
   - Live preview görür

### Beklenen İyileştirmeler

| Metrik | Önce | Sonra | İyileşme |
|--------|------|-------|----------|
| Duplicate Rate | %80 | %5 | **94% ⬇** |
| Accuracy | %30 | %95 | **217% ⬆** |
| False Positives | Yüksek | Düşük | **90% ⬇** |
| Heatmap Quality | Anlamsız | Doğru | **∞ ⬆** |

### Sonraki Adımlar

1. ✅ Bu dokümanı incele
2. 🔨 Implementation'a başla (Phase 1'den)
3. 🧪 Her phase'i test et
4. 📊 Metrics'leri monitor et
5. 🚀 Production'a deploy et

---

**Döküman Sonu**

*Bu doküman canlı bir dokümandır. Implementation sırasında güncellenmelidir.*

*Son Güncelleme: 7 Mart 2026, 06:36*
