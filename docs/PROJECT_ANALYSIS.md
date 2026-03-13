# HeatTheMap - Kapsamlı Teknik Analiz Raporu

> **Tarih:** 11 Mart 2026
> **Proje:** HeatTheMap - AI Destekli Perakende Mağaza Analitik Platformu
> **Analiz Kapsamı:** Frontend, Backend, AI/CV Pipeline, Mimari

---

## 1. Proje Genel Bakış

HeatTheMap, perakende mağazalarda **gerçek zamanlı kişi tespiti**, **ısı haritası görselleştirmesi** ve **yapay zeka destekli sohbet botu** ile müşteri davranış analizi yapan modern bir full-stack uygulamadır.

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React 19 + TypeScript 5.9 + Vite 7.2 |
| **Backend** | ASP.NET Core 10 + Entity Framework Core 10 |
| **Veritabanı** | PostgreSQL (Npgsql) |
| **AI/ML** | TensorFlow.js + COCO-SSD (Tarayıcı İçi) |
| **3D Görselleştirme** | Three.js + React Three Fiber |
| **Grafikler** | Recharts 3.6 |
| **Orkestrasyon** | .NET Aspire 9.4.2 |
| **LLM Chatbot** | Ollama (llama3.1) |

---

## 2. Mimari Genel Görünüm

```
┌─────────────────────────────────────────────────────────────────┐
│                      .NET Aspire AppHost                        │
│                    (Orkestrasyon & Servis Keşfi)                 │
├─────────────┬──────────────────┬────────────────┬───────────────┤
│             │                  │                │               │
│  ┌──────────▼──────────┐  ┌───▼────────────┐  ┌▼────────────┐  │
│  │   HeatTheMap.Web    │  │ HeatTheMap.Api │  │ PostgreSQL  │  │
│  │   (React 19 SPA)    │◄─┤ (ASP.NET 10)   ├──┤  (Npgsql)   │  │
│  │   Port: 5173        │  │ Port: 5000     │  │  Port: 5432  │  │
│  └──────────┬──────────┘  └───┬────────────┘  └─────────────┘  │
│             │                  │                                │
│  ┌──────────▼──────────┐  ┌───▼────────────┐                   │
│  │  TensorFlow.js      │  │   Ollama LLM   │                   │
│  │  (Tarayıcı İçi AI)  │  │ (llama3.1)     │                   │
│  │  COCO-SSD Model     │  │ Port: 11434    │                   │
│  └─────────────────────┘  └────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### Veri Akışı

```
Kamera/Video ──► Tarayıcı Video Elementi
                       │
                       ▼
              TensorFlow.js COCO-SSD
              (Kişi Tespiti ~10 FPS)
                       │
                       ▼
              CentroidTracker (Macar Algoritması)
              (Takip & Benzersiz Ziyaretçi Sayımı)
                       │
                       ▼
              DirectionalEntryTracker
              (Giriş/Çıkış Yön Tespiti)
                       │
                       ▼
              ZoneMapper (20x15 Grid)
              HeatmapAccumulator (Zaman Ağırlıklı)
                       │
                       ▼
              POST /api/analytics/detection
              (Sunucuya Gönderim)
                       │
                       ▼
              PostgreSQL (Kalıcı Depolama)
                       │
                       ▼
              Dashboard & Analitik Sayfaları
              (Gerçek Zamanlı Güncelleme)
```

---

## 3. Frontend Analizi

### 3.1 Proje Yapısı

```
HeatTheMap.Web/src/
├── pages/                          # 5 Ana Sayfa
│   ├── Login.tsx                   # JWT kimlik doğrulama
│   ├── DashboardOverview.tsx       # KPI kartları & genel ısı haritası
│   ├── RealTimeMonitoring.tsx      # Canlı kamera + giriş çizgisi
│   ├── Analytics.tsx               # Trendler, saatlik dağılım, bölge karşılaştırma
│   └── Settings.tsx                # Ayarlar
│
├── components/
│   ├── layout/                     # Uygulama kabığı
│   │   ├── Layout.tsx              # Ana düzen (sidebar + header)
│   │   ├── Header.tsx              # Başlık, mağaza seçici, kullanıcı menüsü
│   │   └── Sidebar.tsx             # Navigasyon menüsü
│   │
│   ├── dashboard/                  # Dashboard bileşenleri
│   │   ├── KPICard.tsx             # Tekil KPI kartı (değişim %)
│   │   ├── KPIGrid.tsx             # 4 KPI grid (ziyaretçi, doluluk, kalış, pik saat)
│   │   ├── HeatmapVisualization.tsx    # 2D renk grid ısı haritası
│   │   ├── HeatmapVisualization3D.tsx  # Three.js 3D çubuk görselleştirme
│   │   ├── HeatmapBars.tsx         # Instanced mesh 3D çubuklar
│   │   ├── StoreFloor.tsx          # 3D zemin düzlemi
│   │   ├── DailyTrendsChart.tsx    # Recharts çizgi grafik (7 gün)
│   │   ├── HourlyDistributionChart.tsx  # Saatlik giriş/çıkış
│   │   └── ZoneComparisonChart.tsx # Sıcak/soğuk bölge sıralaması
│   │
│   ├── detection/                  # AI Tespit bileşenleri
│   │   ├── DetectionPanel.tsx      # Ana tespit UI (kontroller, istatistikler)
│   │   ├── CameraFeed.tsx          # Video + canvas overlay
│   │   ├── VideoSourceSelector.tsx # Webcam/HLS/dosya seçimi
│   │   └── usePersonDetection.ts   # TF.js + COCO-SSD hook
│   │
│   ├── chatbot/                    # AI Sohbet Botu
│   │   ├── ChatButton.tsx          # Yüzen buton
│   │   ├── ChatPanel.tsx           # Sohbet UI + mesaj geçmişi
│   │   └── ChatMessage.tsx         # Tekil mesaj render
│   │
│   ├── zone/                       # Bölge yönetimi
│   │   └── EntryLineEditor.tsx     # Canvas tabanlı çizgi çizimi
│   │
│   └── filters/                    # Filtre bileşenleri
│       ├── StoreSelector.tsx       # Mağaza seçici
│       └── DateRangePicker.tsx     # Tarih aralığı seçici
│
├── hooks/                          # 4 Özel Hook
│   ├── useAnalytics.ts             # React Query - tüm analitik endpoint'leri
│   ├── useDetection.ts             # Tespit verisi gönderimi (mutation)
│   ├── useChat.ts                  # Sohbet mesajı gönderimi
│   └── useEntryLine.ts             # Giriş çizgisi CRUD
│
├── services/                       # 4 Servis Modülü
│   ├── api.ts                      # Axios instance + JWT interceptor'lar
│   ├── auth.service.ts             # Login/logout + token yönetimi
│   ├── analytics.service.ts        # Tüm analitik API çağrıları
│   ├── chat.service.ts             # Sohbet POST
│   └── entryline.service.ts        # Giriş çizgisi CRUD
│
├── stores/                         # Zustand State Management
│   ├── useAuthStore.ts             # Kimlik doğrulama durumu
│   └── useFilterStore.ts           # Mağaza & tarih filtresi
│
├── lib/                            # 5 Yardımcı Kütüphane
│   ├── centroidTracker.ts          # Macar algoritması ile takip
│   ├── directionalEntryTracker.ts  # Yönlü giriş/çıkış tespiti
│   ├── heatmapAccumulator.ts       # Zaman ağırlıklı ısı haritası
│   ├── zoneMapper.ts               # Kişi → grid hücresi eşleme (20x15)
│   └── hungarian.ts                # Macar atama algoritması
│
└── types/                          # TypeScript Tip Tanımları
    ├── index.ts                    # 15+ arayüz (Store, DailySummary, vb.)
    └── videoSource.ts              # Video kaynak union tipi
```

### 3.2 State Yönetimi

| Yöntem | Kapsam | Kullanım |
|--------|--------|----------|
| **Zustand** | Global UI State | Auth durumu, filtre seçimleri |
| **React Query** | Sunucu State | API verileri, otomatik yenileme |
| **useState/useRef** | Lokal State | Bileşen içi geçici durum |

**Zustand Store'ları:**
- `useAuthStore`: `isAuthenticated`, `username`, `login()`, `logout()` — localStorage ile kalıcı
- `useFilterStore`: `selectedStore`, `dateRange` — filtre seçimleri

**React Query Yenileme Süreleri:**
- Son ısı haritası: **30 saniye**
- Günlük özet: **60 saniye**
- Saatlik dağılım: **5+ dakika**

### 3.3 Görselleştirme Kütüphaneleri

| Kütüphane | Kullanım | Versiyon |
|-----------|----------|----------|
| **Recharts** | Çizgi/çubuk grafikler (trendler, saatlik dağılım) | 3.6.0 |
| **Three.js** | 3D ısı haritası görselleştirmesi | 0.183.2 |
| **React Three Fiber** | React-Three.js köprüsü | 9.5.0 |
| **@react-three/drei** | 3D yardımcı bileşenler | 10.7.7 |

### 3.4 Video Kaynak Desteği

| Kaynak | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Webcam** | getUserMedia API | Doğrudan tarayıcı kamera erişimi |
| **HLS Stream** | HLS.js 1.6.15 | RTMP/HLS canlı akış desteği |
| **Dosya Yükleme** | HTML5 File API | Yerel video dosyası |
| **Kamera Proxy** | CameraProxyController | SSRF korumalı HTTP proxy |

---

## 4. Backend Analizi

### 4.1 Proje Yapısı

```
HeatTheMap.Api/
├── Program.cs                      # Uygulama başlangıç & DI konfigürasyonu
├── Controllers/                    # 6 Controller
│   ├── AuthController.cs           # POST /login, POST /refresh
│   ├── AnalyticsController.cs      # Analitik CRUD endpoint'leri
│   ├── StoresController.cs         # Mağaza CRUD
│   ├── ChatController.cs           # POST /api/chat (Ollama entegrasyonu)
│   ├── EntryLinesController.cs     # Giriş çizgisi CRUD
│   └── CameraProxyController.cs    # SSRF korumalı kamera proxy
├── Services/                       # 4 Servis + Arayüzler
│   ├── AuthService.cs              # JWT token üretimi & yenileme
│   ├── AnalyticsService.cs         # İş mantığı (özet, trendler, bölgeler)
│   ├── EntryLineService.cs         # Giriş çizgisi iş mantığı
│   └── OllamaService.cs           # LLM entegrasyonu + fonksiyon çağrıları
├── Repositories/                   # Generic + Özel Repository
│   ├── Repository<T>.cs            # Genel CRUD operasyonları
│   └── AnalyticsRepository.cs      # Analitik özel sorgular
├── Data/
│   ├── HeatMapDbContext.cs         # EF Core DbContext (5 DbSet)
│   ├── Entities/                   # 5 Varlık sınıfı
│   └── DataSeeder.cs               # Demo veri üreteci
└── DTOs/                           # 15+ DTO kayıt tipi
    ├── AnalyticsDTOs.cs
    ├── AuthDTOs.cs
    ├── ChatDTOs.cs
    └── EntryLineDTOs.cs
```

### 4.2 API Endpoint Haritası

#### Kimlik Doğrulama (`/api/auth`)
| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `POST` | `/login` | JWT token üretimi (username + password) |
| `POST` | `/refresh` | Token yenileme |

#### Analitik (`/api/analytics`) — `[Authorize]`
| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/daily-summary` | Günlük ziyaretçi, ortalama kalış, pik saat |
| `GET` | `/weekly-trends` | Haftalık trendler, hafta-hafta değişim |
| `GET` | `/hourly-distribution` | Saatlik giriş/çıkış dağılımı |
| `GET` | `/zone-performance` | Sıcak/soğuk bölge analizi |
| `GET` | `/peak-hours` | En yoğun saatler |
| `GET` | `/heatmap/latest` | Son ısı haritası matrisi |
| `POST` | `/detection` | Tespit verisi gönderimi (upsert) |

#### Mağazalar (`/api/stores`) — `[Authorize]`
| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/` | Tüm mağazalar |
| `GET` | `/{id}` | Tekil mağaza |
| `POST` | `/` | Mağaza oluştur |
| `PUT` | `/{id}` | Mağaza güncelle |
| `DELETE` | `/{id}` | Mağaza sil |

#### Giriş Çizgileri (`/api/entrylines`) — `[Authorize]`
| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/store/{storeId}` | Aktif giriş çizgisi |
| `POST` | `/` | Yeni giriş çizgisi |
| `PUT` | `/{id}` | Güncelle |
| `DELETE` | `/{id}` | Sil |

#### Sohbet (`/api/chat`) — `[Authorize]`
| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `POST` | `/` | LLM ile sohbet (Ollama) |

#### Kamera (`/api/camera`) — `[Authorize]`
| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/proxy` | SSRF korumalı video akışı proxy |

### 4.3 Veritabanı Şeması

```
┌─────────────────────┐
│       Store          │
├─────────────────────┤
│ Id (PK, Guid)       │
│ Name                 │
│ Location             │
│ Address              │
│ Latitude             │
│ Longitude            │
│ FloorAreaSqm         │
│ CreatedAt            │
│ IsActive             │
└──────┬──────────────┘
       │ 1:N
       ├──────────────────────────────┐
       │                              │
┌──────▼──────────────┐  ┌───────────▼───────────┐
│   DailyFootfall     │  │     HeatmapData       │
├─────────────────────┤  ├───────────────────────┤
│ Id (PK, Guid)       │  │ Id (PK, Guid)         │
│ StoreId (FK)        │  │ StoreId (FK)          │
│ Date                │  │ Timestamp             │
│ Hour (0-23)         │  │ ZoneMatrix (JSONB)    │
│ EntryCount          │  │ GridWidth (20)        │
│ ExitCount           │  │ GridHeight (15)       │
│ PeakOccupancy       │  │ MaxDensity            │
│ CreatedAt           │  └───────────────────────┘
│ UQ: (StoreId,       │
│      Date, Hour)    │  ┌───────────────────────┐
└─────────────────────┘  │   CustomerRoute       │
                         ├───────────────────────┤
┌─────────────────────┐  │ Id (PK, Guid)         │
│    EntryLine        │  │ StoreId (FK)          │
├─────────────────────┤  │ Timestamp             │
│ Id (PK, Guid)       │  │ Waypoints (JSONB)     │
│ StoreId (FK)        │  │ DurationSeconds       │
│ StartX, StartY      │  │ DistanceMeters        │
│ EndX, EndY          │  └───────────────────────┘
│ InDirection         │
│ IsActive            │
│ CreatedAt           │
│ UpdatedAt           │
└─────────────────────┘
```

**Önemli Veritabanı Özellikleri:**
- Tüm tarih alanları `timestamp with time zone` (UTC)
- `ZoneMatrix` ve `Waypoints` alanları **PostgreSQL JSONB** formatında
- `DailyFootfall` tablosunda `(StoreId, Date, Hour)` üzerinde **unique index**
- Tüm ilişkilerde **CASCADE DELETE** davranışı

### 4.4 Güvenlik

| Özellik | Uygulama |
|---------|----------|
| **JWT Kimlik Doğrulama** | HMAC-SHA256 simetrik anahtar |
| **Token Süresi** | 1 saat (access) + refresh token |
| **Refresh Token** | Kriptografik güvenli 32 byte, bellek içi depolama |
| **SSRF Koruması** | Özel IP aralığı beyaz listesi (10.x, 172.16.x, 192.168.x) |
| **CORS** | `localhost:5173` ve `localhost:5173` (HTTPS) |
| **[Authorize]** | Login/refresh hariç tüm endpoint'ler korumalı |

---

## 5. AI / Bilgisayarlı Görü Pipeline Analizi

### 5.1 Nesne Tespit Sistemi

```
┌─────────────────────────────────────────────────────┐
│              Tarayıcı İçi AI Pipeline               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Video Kaynağı ──► TF.js COCO-SSD                   │
│                    (lite_mobilenet_v2)               │
│                    ~10 FPS, güven eşiği: 0.55       │
│                         │                           │
│                         ▼                           │
│              Kişi Filtreleme                         │
│              (class === 'person')                   │
│                         │                           │
│                         ▼                           │
│              CentroidTracker                        │
│              ├── Macar Algoritması                   │
│              ├── Uyarlanabilir mesafe eşiği          │
│              ├── 30 kare kaybolma toleransı          │
│              └── 3 kare onay süresi                  │
│                         │                           │
│                         ▼                           │
│              DirectionalEntryTracker                │
│              ├── Çizgi kesişim testi                 │
│              ├── Hareket yönü hesaplama              │
│              ├── 1 sn soğuma süresi                  │
│              └── Giriş/Çıkış sayımı                  │
│                         │                           │
│                         ▼                           │
│              ZoneMapper (20×15 Grid)                 │
│              HeatmapAccumulator                      │
│              (60 anlık görüntü, zaman ağırlıklı)    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Model Detayları

| Parametre | Değer |
|-----------|-------|
| **Model** | COCO-SSD (Single Shot MultiBox Detector) |
| **Temel Ağ** | lite_mobilenet_v2 (hafif, tarayıcı uyumlu) |
| **Çalışma Ortamı** | Tarayıcı (TensorFlow.js) — GPU gerektirmez |
| **Hedef FPS** | ~10 FPS (throttled) |
| **Güven Eşiği** | 0.55 |
| **Tespit Sınıfı** | Yalnızca "person" |
| **Çıktı** | Sınırlayıcı kutu [x, y, w, h] + güven skoru |

### 5.3 Takip Algoritması (CentroidTracker)

**Macar Algoritması Tabanlı Optimal Atama:**

1. **Maliyet Matrisi Oluşturma**: Merkez noktası mesafesi + IoU ağırlıklı
2. **Uyarlanabilir Mesafe**: `max(maxDistance, bbox_diagonal × 0.75)`
3. **Takip Yaşam Döngüsü**:
   - Yeni nesne → 3 kare sonra onay
   - Kaybolma sayacı → 30 kare sonra silme
   - Benzersiz ziyaretçi sayımı → `Set<confirmedIds>`

### 5.4 Giriş/Çıkış Tespiti (DirectionalEntryTracker)

**Yönlü Geçiş Algılama:**
- Kullanıcı tanımlı giriş çizgisi (başlangıç/bitiş noktaları)
- 4 yön desteği: sol→sağ, sağ→sol, yukarı→aşağı, aşağı→yukarı
- Çapraz çarpım tabanlı çizgi kesişim testi
- Durum makinesi: `none` → `entered`/`exited`
- Koruma mekanizmaları: track yaşı ≥ 3, 1 sn soğuma süresi

### 5.5 Isı Haritası Üretimi

| Bileşen | İşlev |
|---------|-------|
| **ZoneMapper** | Piksel koordinatlarını 20×15 grid hücresine eşler |
| **HeatmapAccumulator** | 60 anlık görüntüyü zaman ağırlıklı olarak biriktirir |
| **2D Görselleştirme** | Renk yoğunluk matrisi (HeatmapVisualization.tsx) |
| **3D Görselleştirme** | Three.js instanced mesh çubuklar (HeatmapVisualization3D.tsx) |

---

## 6. Chatbot / LLM Entegrasyonu

### 6.1 Mimari

```
Kullanıcı Sorusu ──► POST /api/chat
                         │
                         ▼
                    OllamaService
                    ├── Ollama erişilebilirlik kontrolü
                    │   (GET /api/tags)
                    │
                    ├── [Erişilebilir] ──► Ollama API Çağrısı
                    │   POST http://localhost:11434/api/chat
                    │   Model: llama3.1
                    │   Araçlar: 4 fonksiyon tanımı
                    │        │
                    │        ▼
                    │   Fonksiyon Çağrısı Varsa:
                    │   ├── get_daily_summary(date)
                    │   ├── get_weekly_comparison(startDate)
                    │   ├── get_busiest_hours(days)
                    │   └── get_zone_performance(startDate, endDate)
                    │        │
                    │        ▼
                    │   Sonucu Ollama'ya geri gönder
                    │   Doğal dil yanıtı üret
                    │
                    └── [Erişilemez] ──► Fallback Modu
                        Anahtar kelime tabanlı (TR + EN)
                        "bugün" → günlük özet
                        "hafta" → haftalık trendler
                        "yoğun" → pik saatler
```

### 6.2 Desteklenen Fonksiyonlar

| Fonksiyon | Parametreler | Dönüş |
|-----------|-------------|-------|
| `get_daily_summary` | `date` | Ziyaretçi, kalış süresi, pik saat, değişim % |
| `get_weekly_comparison` | `startDate` | Toplam ziyaretçi, hafta/hafta değişim |
| `get_busiest_hours` | `days` (varsayılan 7) | Saatlere göre ziyaretçi sayıları |
| `get_zone_performance` | `startDate`, `endDate` | Sıcak/soğuk bölgeler |

---

## 7. Bağımlılık Analizi

### 7.1 Frontend Bağımlılıkları

```
Çekirdek:
├── react 19.2.0              # UI framework
├── react-dom 19.2.0          # DOM renderer
├── react-router-dom 7.12.0   # Sayfa yönlendirme
└── typescript 5.9.3          # Tip güvenliği

Durum Yönetimi:
├── zustand 5.0.9             # Global state (auth, filtreler)
└── @tanstack/react-query 5.90.16  # Sunucu state + önbellekleme

AI / Makine Öğrenimi:
├── @tensorflow/tfjs 4.22.0   # Tarayıcı içi ML çerçevesi
└── @tensorflow-models/coco-ssd 2.2.3  # Nesne tespit modeli

3D Görselleştirme:
├── three 0.183.2             # 3D render motoru
├── @react-three/fiber 9.5.0  # React-Three.js köprüsü
└── @react-three/drei 10.7.7  # 3D yardımcı bileşenler

Grafikler & UI:
├── recharts 3.6.0            # Veri görselleştirme
├── tailwindcss 4.1.18        # CSS framework (dark mode)
└── lucide-react 0.523.0      # İkon kütüphanesi

HTTP & Medya:
├── axios 1.13.2              # HTTP istemcisi + interceptor'lar
├── hls.js 1.6.15             # HLS video akışı
└── date-fns 4.1.0            # Tarih yardımcıları

Derleme:
├── vite 7.2.4                # Build tool + dev server
├── @vitejs/plugin-react 5.1.1  # React Vite eklentisi
└── eslint 9.39.1             # Kod kalitesi
```

### 7.2 Backend Bağımlılıkları

```
├── .NET 10.0                                    # Çalışma zamanı
├── Aspire.Npgsql.EntityFrameworkCore.PostgreSQL 13.1.0  # PostgreSQL + Aspire
├── Microsoft.AspNetCore.Authentication.JwtBearer 10.0.1 # JWT auth
├── Microsoft.AspNetCore.OpenApi 10.0.1          # API dokümantasyonu
├── Microsoft.EntityFrameworkCore.Design 10.0.1  # EF Core araçları
└── Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 # PostgreSQL sağlayıcısı
```

---

## 8. Mimari Desenler ve Kalite

### 8.1 Uygulanan Tasarım Desenleri

| Desen | Katman | Açıklama |
|-------|--------|----------|
| **Repository Pattern** | Backend | Generic `IRepository<T>` + özel `IAnalyticsRepository` |
| **Service Layer** | Backend | İş mantığı servislerde izole |
| **DTO Pattern** | Backend | API sözleşmeleri entity'lerden ayrık |
| **Hooks Pattern** | Frontend | React Query ile veri çekme soyutlaması |
| **Store Pattern** | Frontend | Zustand ile kalıcı global state |
| **Strategy Pattern** | AI | Fallback sohbet modu (Ollama yoksa) |
| **Observer Pattern** | Frontend | React Query otomatik yenileme |

### 8.2 Kod İstatistikleri

| Metrik | Backend | Frontend |
|--------|---------|----------|
| **Dosya Sayısı** | ~32 C# dosyası | ~48 TSX/TS dosyası |
| **Controller/Sayfa** | 6 controller | 5 sayfa |
| **Servis** | 4 servis + arayüz | 4 servis modülü |
| **Entity/Tip** | 5 entity + 15 DTO | 15+ TypeScript arayüz |
| **Hook** | — | 4 özel hook |
| **Yardımcı Kütüphane** | — | 5 (tracking, heatmap, zones) |

### 8.3 Güçlü Yönler

1. **Tarayıcı İçi AI**: GPU sunucusu gerektirmeden kişi tespiti yapabilme
2. **3D Görselleştirme**: Three.js ile etkileyici ısı haritası deneyimi
3. **Macar Algoritması**: Optimal nesne takibi için akademik düzeyde çözüm
4. **LLM Fonksiyon Çağrıları**: Yapılandırılmış veri erişimi ile doğal dil sohbet
5. **SSRF Koruması**: Kamera proxy'de güvenlik önlemi
6. **.NET Aspire**: Modern orkestrasyon ve servis keşfi
7. **Temiz Katmanlı Mimari**: Repository → Service → Controller ayrımı
8. **Type Safety**: Hem frontend (TypeScript) hem backend (C#) tip güvenliği

### 8.4 Kritik Bulgular (Bug'lar)

| Bulgu | Dosya | Açıklama |
|-------|-------|----------|
| **AuthService Refresh Token Bug** | `AuthService.cs` | Scoped olarak kayıtlı ama in-memory Dictionary kullanıyor. Her HTTP isteğinde yeni instance oluşturuluyor, bu yüzden refresh token doğrulama **çalışmıyor**. Çözüm: Singleton yapılmalı veya Redis/DB'ye taşınmalı. |
| **TF.js Bellek Sızıntısı Riski** | `usePersonDetection.ts` | `tf.tidy()` veya `tf.dispose()` kullanılmamış. Uzun süreli oturumlarda WebGL tensor bellek sızıntısı riski var. |
| **Hungarian Sonsuz Döngü** | `hungarian.ts:80` | `while(true)` döngüsü teorik olarak sonlanmayabilir. Pratikte düşük kişi sayısı sorun yaratmaz ama guard clause eklenmeli. |
| **Silent Exception Swallowing** | `AnalyticsService.cs:43,136,198` | Bazı catch blokları hataları sessizce yutarak sorun teşhisini zorlaştırıyor. |

### 8.5 İyileştirme Fırsatları

| Alan | Mevcut Durum | Öneri |
|------|-------------|-------|
| **Gerçek Zamanlı** | HTTP polling (30-60 sn) | SignalR WebSocket entegrasyonu |
| **Token Depolama** | In-memory refresh token (çalışmıyor) | Redis veya veritabanı depolama + Singleton |
| **Tespit Gönderimi** | Manuel buton tıklama | Otomatik periyodik gönderim (30 sn) |
| **Video Kayıt** | Yok | Kayıt ve tekrar oynatma |
| **Çoklu Kullanıcı** | Tek kullanıcı (appsettings) | Veritabanı tabanlı kullanıcı yönetimi |
| **Model Çeşitliliği** | COCO-SSD (~22 mAP) | YOLO v8n/v11 (2x+ doğruluk) veya ONNX Runtime Web |
| **Performans İzleme** | OpenTelemetry temel | Detaylı metrik dashboard |
| **Test Kapsamı** | Test dosyası yok | Unit + integration + E2E testler |
| **Global Exception Handler** | Her controller'da try-catch | Middleware + ProblemDetails (RFC 7807) |
| **Validation** | HTML required attribute | FluentValidation veya Zod + React Hook Form |
| **Error Boundary** | Yok | React Error Boundary (3D/TF.js crash koruması) |
| **Migration** | EnsureCreatedAsync + raw SQL | EF Core Migrations |
| **Pagination** | GetAllAsync() tüm kayıtlar | Skip/Take pagination |
| **Re-identification** | Yok (kişi çıkıp girince yeni ID) | Re-ID modeli veya appearance embedding |

### 8.6 Performans Profili (AI Pipeline)

| Bölüm | Süre | Açıklama |
|-------|------|----------|
| COCO-SSD Inference | ~30-100ms | GPU'ya bağlı (WebGL backend) |
| CentroidTracker.update() | <1ms | Hungarian N=kişi sayısı, tipik <20 |
| DirectionalEntryTracker | <0.1ms | Basit geometri hesaplamaları |
| Canvas BBox çizimi | <1ms | Her frame'de yeniden çizim |
| HeatmapAccumulator | <0.5ms | Her 1 saniyede bir snapshot |
| **Toplam frame süresi** | **~35-105ms** | |
| **Efektif FPS** | **~10 FPS** | Throttle limiti |

**Bellek Kullanımı:**
- TF.js model yükleme: ~20-50 MB (WebGL tensorları)
- HeatmapAccumulator: 60 snapshot × 20×15 grid × 8 byte ≈ 144 KB
- Three.js 3D sahne: ~5-20 MB (yalnızca 3D görünüm aktifken)

---

## 9. Dağıtım ve Orkestrasyon

### .NET Aspire ile Orkestrasyon

```
AppHost (HeatTheMap.AppHost)
├── PostgreSQL Container
│   ├── Veritabanı: heatmapdb
│   └── pgAdmin yönetim arayüzü
│
├── HeatTheMap.Api
│   ├── Port: 5000
│   ├── PostgreSQL bağlantısı (Aspire referansı)
│   └── Ollama HTTP istemcisi
│
├── HeatTheMap.Web
│   ├── Port: 5173 (Vite dev server)
│   └── API referansı
│
└── ServiceDefaults
    ├── OpenTelemetry dağıtık izleme
    ├── Sağlık kontrolleri
    └── Servis keşfi
```

### Yerel Geliştirme

```bash
# Başlatma
dotnet run --project HeatTheMap.AppHost

# Erişim
# Frontend:  http://localhost:5173
# Backend:   http://localhost:5000
# PostgreSQL: localhost:5432
# Ollama:    http://localhost:11434
```

---

## 10. Sonuç

HeatTheMap, **perakende analitik** alanında kapsamlı bir çözüm sunan modern bir full-stack uygulamadır. Tarayıcı içi AI ile sunucu bağımsız kişi tespiti, 3D ısı haritası görselleştirmesi, LLM destekli sohbet botu ve temiz katmanlı mimari ile dikkat çekmektedir.

**Teknik Olgunluk**: MVP seviyesinde, temel işlevsellik tamamlanmış durumda. Gerçek zamanlı WebSocket desteği, test kapsamı ve çoklu kullanıcı yönetimi gibi alanlarda geliştirme potansiyeli mevcuttur.

**Mimari Kalite**: Repository-Service-Controller katmanlı yapı, TypeScript tip güvenliği, Zustand + React Query state yönetimi ve .NET Aspire orkestrasyon ile endüstri standartlarına uygun bir mimari sergilemektedir.

---

*Bu analiz, HeatTheMap projesinin tüm kaynak kodunun incelenmesiyle hazırlanmıştır.*
