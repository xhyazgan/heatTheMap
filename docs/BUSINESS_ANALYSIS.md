# HeatTheMap - Is Alani Analiz Dokumani (Business Domain Analysis)

**Proje:** HeatTheMap - Perakende Magaza Analitigi Platformu
**Versiyon:** 1.0.0
**Analiz Tarihi:** 2026-03-07
**Son Guncelleme:** 2026-03-08
**Durum:** MVP (Minimum Viable Product)

---

## Icerik Tablosu

1. [Proje Genel Bakis](#1-proje-genel-bakis)
2. [Is Alani (Domain) Analizi](#2-is-alani-domain-analizi)
3. [Is Kurallari (Business Rules)](#3-is-kurallari-business-rules)
4. [Is Akislari (Business Flows)](#4-is-akislari-business-flows)
5. [Kullanici Hikayeleri (User Stories)](#5-kullanici-hikayeleri-user-stories)
6. [Veri Modeli ve Entity Iliskileri](#6-veri-modeli-ve-entity-iliskileri)
7. [API Haritasi](#7-api-haritasi)
8. [Modul Analizi](#8-modul-analizi)
9. [Entegrasyon Noktalari](#9-entegrasyon-noktalari)
10. [Mevcut Durum (AS-IS) Analizi](#10-mevcut-durum-as-is-analizi)
11. [Gelecek Durum (TO-BE) Onerileri](#11-gelecek-durum-to-be-onerileri)
12. [Risk Analizi](#12-risk-analizi)

---

## 1. Proje Genel Bakis

### 1.1 Amac ve Vizyon

HeatTheMap, perakende magazalardaki musteri hareketlerini gercek zamanli olarak izleyen, analiz eden ve gorselbestiren bir analitik platformudur. Sistem, fiziksel magazalardaki yaya trafigini kamera tabanli yapay zeka ile tespit eder, bu verileri isi haritasi (heatmap) formatinda gorsellestirir ve magaza yoneticilerine aksiyona donusturulebilir ice gorular (insights) sunar.

### 1.2 Cozulen Problem

Perakende sektorunde fiziksel magazalardaki musteri davranislarini anlamak, dijital ortamdaki web analitigine kiyasla cok daha zordur. HeatTheMap su temel problemleri cozer:

| Problem | Cozum |
|---------|-------|
| Musteri sayiminin manuel yapilmasi | Kamera tabanli otomatik kisi tespiti (TensorFlow.js + COCO-SSD) |
| Magaza ici hareket kaliplarinin bilinmemesi | 2D/3D isi haritasi gorsellestirmesi |
| Yoğun saatlerin tahmin edilememesi | Saatlik dagilim ve peak hour analizi |
| Haftalik trendlerin takip edilememesi | Hafta-hafta karsilastirmali trend analizi |
| Soğuk/sicak bolgelerin belirlenmesi | Zone performans analizi (Hot/Cold zones) |
| Veri odakli karar verilememesi | AI destekli dogal dil sorgu chatbot'u (Ollama LLM) |

### 1.3 Hedef Kullanici Profili

- **Magaza Yoneticileri:** Gunluk operasyonel kararlar icin anlık verilere erisen birincil kullanicilar
- **Bolge Mudürleri:** Birden fazla magazanin performansini karsilastiran yonetim kadrosu [INFERRED]
- **Perakende Analistleri:** Uzun vadeli trendleri ve kaliplari analiz eden uzmanlar [INFERRED]

### 1.4 Teknoloji Yigini

| Katman | Teknoloji | Versiyon/Detay |
|--------|-----------|----------------|
| **Orkestrasyon** | .NET Aspire | 9.4.2 - Distributed Application Host |
| **Backend API** | ASP.NET Core | .NET 10.0 |
| **Veritabani** | PostgreSQL | Aspire Npgsql entegrasyonu |
| **ORM** | Entity Framework Core | Npgsql provider |
| **Kimlik Dogrulama** | JWT Bearer | HmacSha256, 1 saat gecerlilik |
| **Frontend** | React 19 + TypeScript | Vite 7 ile |
| **State Management** | Zustand | 5.x |
| **Data Fetching** | TanStack React Query | 5.x |
| **UI Styling** | Tailwind CSS | 4.x |
| **Grafikler** | Recharts | 3.x |
| **3D Gorsellestirme** | Three.js + React Three Fiber | @react-three/fiber 9.x |
| **AI/ML (Frontend)** | TensorFlow.js + COCO-SSD | Tarayici ici kisi tespiti |
| **AI/ML (Backend)** | Ollama (LLaMA 3.1) | Lokal LLM - NLP chatbot |
| **HTTP Client** | Axios | 1.x |
| **Tarih Islemleri** | date-fns | 4.x |
| **Gozlemlenebilirlik** | OpenTelemetry | Metrikler, izler, loglar |
| **Dayaniklilik** | Polly | Retry, circuit breaker, timeout |

---

## 2. Is Alani (Domain) Analizi

### 2.1 Bounded Context Haritasi

```
+=========================================================================+
|                         HeatTheMap Domain                               |
|                                                                         |
|  +------------------+    +----------------------------------------+     |
|  | Magaza Yonetimi  |    |         Ziyaretci Analitigi             |     |
|  |                  |    |                                        |     |
|  |  [Magaza/Store]<----+---[Gunluk Yaya Trafigi (DailyFootfall)] |     |
|  |        ^         |  | |  [Isi Haritasi (HeatmapData)]<--+     |     |
|  |        |         |  | |  [Musteri Rotasi (CustomerRoute)]|     |     |
|  +--------|------ --+  | +--------------------------------|------+     |
|           |             |                                  |            |
|  +--------|-------------|-----------+    +-----------------|--------+   |
|  | Kamera Tespiti       |           |    | Yapay Zeka Asistani      |   |
|  |                      |           |    |                 |        |   |
|  |  [Kisi Tespiti]------+           |    |  [Chatbot]------+        |   |
|  |       |                          |    |      |                   |   |
|  |       v                          |    |      v                   |   |
|  |  [Centroid Tracker]              |    |  [Ollama LLM]            |   |
|  |   (Hungarian + IoU)             |    |                          |   |
|  |       |                          |    +--------------------------+   |
|  |       v                          |                                   |
|  |  [DirectionalEntryTracker]       |                                   |
|  |       |                          |    +--------------------------+   |
|  |       v                          |    | Giris Cizgisi Yonetimi   |   |
|  |  [Zone Mapper]---+               |    |                          |   |
|  |       |          |               |    |  [EntryLine Entity]      |   |
|  |       v          |               |    |  [Gecis Algilama]        |   |
|  |  [HeatmapAccumulator]           |    |  [State Machine]         |   |
|  +----------------------------------+    +--------------------------+   |
|                                          | Kimlik ve Erisim         |   |
|                                          |  [Auth] --> [JWT Token]  |   |
|                                          +--------------------------+   |
+=========================================================================+
```

### 2.2 Domain Sozlugu (Ubiquitous Language)

| Terim | Tanim | Kodda Karsilik |
|-------|-------|----------------|
| **Magaza (Store)** | Fiziksel perakende satis noktasi; analiz birimi | `Store` entity |
| **Yaya Trafigi (Footfall)** | Belirli bir saat diliminde magazaya giren/cikan kisi sayisi | `DailyFootfall` entity |
| **Isi Haritasi (Heatmap)** | Magaza zemininin gridlere bolunmesiyle olusan yogunluk matrisi | `HeatmapData` entity, `ZoneMatrix` |
| **Zone (Bolge)** | Isi haritasindaki her bir grid hucresi; Zone_X_Y formati | `Zone_{x}_{y}` string pattern |
| **Sicak Bolge (Hot Zone)** | En cok ziyaret edilen magazanin en yogun 5 bolgesi | `HotZone` DTO |
| **Soguk Bolge (Cold Zone)** | En az ziyaret edilen magazanin en seyrek 5 bolgesi | `ColdZone` DTO |
| **Musteri Rotasi (Customer Route)** | Musterinin magaza icindeki hareket yolu (waypoint listesi) | `CustomerRoute` entity |
| **Tepe Saat (Peak Hour)** | Gun icerisinde en fazla girisi olan saat dilimi | `PeakHour` hesaplama |
| **Anlik Doluluk (Current Occupancy)** | O an magazada bulunan kisi sayisi | `CurrentOccupancy` |
| **Centroid Tracker** | Tespit edilen kisilerin kare-kare izlenmesi icin centroid tabanli algoritma | `CentroidTracker` sinifi |
| **Zone Distribution** | Kamera tespitlerinin grid hucrelerine eslemesi | `mapDetectionsToZones()` |
| **Haftalik Degisim** | Bu haftanin verilerinin gecen haftayla yuzdesel karsilastirmasi | `WeeklyChangePercent`, `WeekOverWeekChange` |
| **Benzersiz Ziyaretci** | Centroid tracker ile tekrar sayilmadan tespit edilen kisi sayisi | `uniqueCount`, `totalUnique` |
| **Detection Submission** | Kamera tespitlerinin backend'e gonderilmesi islem birimi | `DetectionSubmissionDto` |
| **Entry Line (Giris Cizgisi)** | Magaza girisine cizilen sanal cizgi; gecen kisilerin giris/cikis yonu belirlenir | `EntryLine` entity |
| **Gecis Yonu (InDirection)** | Entry line'i gecen kisinin giris sayilacagi yon (4 secenekli) | `left-to-right`, `right-to-left`, `top-to-bottom`, `bottom-to-top` |
| **Crossing State** | Bir nesnenin entry line gecis durumu (none/entered/exited) | `crossingState` ozellik |
| **Hungarian Algoritmasi** | Optimal maliyet eslestirmesi icin kullanilan atama algoritmasi | `hungarian.ts` |
| **IoU (Intersection over Union)** | Iki bounding box'in kesisim/birlesim orani; nesne eslestirme kalitesini arttirir | `centroidTracker.ts` maliyet fonksiyonu |
| **Heatmap Accumulator** | Zaman agirlikli heatmap biriktiricisi; her saniye snapshot alir (max 60) | `HeatmapAccumulator` sinifi |
| **DirectionalEntryTracker** | Entry line gecis algilama; cizgi kesisim + yon belirleme state machine'i | `DirectionalEntryTracker` sinifi |
| **Kamera Proxy** | IP kameralara SSRF korumasli backend proxy (sadece ozel ag IP'leri) | `CameraProxyController` |

### 2.3 Mimari Diyagram

```
+-----------------------------------------------------------------------------------+
|                            ISTEMCI KATMANI                                        |
|   [Web Tarayici (React 19 + Vite)]     [Cihaz Kamerasi (WebRTC)]                 |
+-----------|----------------------------------|------------------------------------+
            |                                  |
            v                                  v
+-----------------------------------------------------------------------------------+
|                    FRONTEND UYGULAMA (HeatTheMap.Web)                              |
|                                                                                   |
|  Sayfalar:  [Login]  [Dashboard]  [RealTimeMonitoring]  [Analytics]  [Settings]    |
|                          |               |                  |           |          |
|              +-----------+      +--------+--------+         |           |          |
|              |           |      |        |        |         |           |          |
|              v           v      v        v        v         v           v          |
|  Bilesenler: [KPI]  [Heatmap [Detection [Entry  [Video   [Grafikler] [Entry      |
|              [Grid]  2D/3D]   Panel]     Line    Source   (Hourly,    Line         |
|                               |          Editor] Select]  Daily,Zone) Config]     |
|                               v                                                   |
|  AI/ML:                [TensorFlow.js] --> [COCO-SSD]                             |
|  (Tarayici)                 |                                                     |
|                        [CentroidTracker (Hungarian + IoU)]                         |
|                             |                                                     |
|                        [DirectionalEntryTracker] --> [ZoneMapper]                  |
|                                                          |                        |
|                                                     [HeatmapAccumulator]          |
|                                                                                   |
|  Servisler:  [analytics.service]  [auth.service]  [chat.service]                  |
|  Durum:      [useAuthStore]       [useFilterStore]   (Zustand)                    |
+---------|-------------------------|-------------------|-----------+               |
          |                         |                   |                            |
          +-------------------------+-------------------+                            |
                                    |  REST API (JWT Bearer)                         |
                                    v                                                |
+-----------------------------------------------------------------------------------+
|                       .NET ASPIRE APPHOST                                          |
|                                                                                   |
|  Backend API (HeatTheMap.Api):                                                    |
|    [Controllers] -----> [Services] -----> [Repositories]                          |
|     (Auth, Analytics,   (Analytics,        (Generic,                              |
|      Stores, Chat)       Auth, Ollama)      Analytics)                            |
|          |                   |                   |                                 |
|          v                   |                   v                                 |
|    [JWT Auth]                |            [EF Core (Npgsql)]                       |
|                              |                   |                                 |
|  ServiceDefaults:            |                   |                                 |
|    [OpenTelemetry]           |                   |                                 |
|    [Health Checks]           |                   |                                 |
|    [Polly Resilience]        |                   |                                 |
+------------------------------|-------------------|--------------------------------+
                               |                   |
                               v                   v
+-----------------------------------------------------------------------------------+
|                          DIS SERVISLER                                             |
|     [Ollama API (LLaMA 3.1)]              [PostgreSQL (heatmapdb)]                |
|      localhost:11434                        Aspire Container                       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Is Kurallari (Business Rules)

### 3.1 Kimlik Dogrulama ve Yetkilendirme Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-AUTH-01 | Sisteme giris icin sabit kullanici adi ve sifre kullanilir | `AuthService.cs:23` | `username: "admin"`, `password: "password"` - MVP icin hardcoded |
| BR-AUTH-02 | JWT token suresi 1 saattir | `AuthService.cs:28, 73` | `DateTime.UtcNow.AddHours(1)` |
| BR-AUTH-03 | JWT, HmacSha256 algoritmasi ile imzalanir | `AuthService.cs:59` | `SecurityAlgorithms.HmacSha256` |
| BR-AUTH-04 | Refresh token, cryptographic random 32 byte'tir | `AuthService.cs:82-85` | `RandomNumberGenerator` kullanilir |
| BR-AUTH-05 | Refresh token kullanildiginda eski token silinir ve yenisi olusturulur | `AuthService.cs:44-47` | Token rotasyonu uygulaniyor |
| BR-AUTH-06 | Refresh token'lar bellek ici (in-memory) saklanir | `AuthService.cs:13` | `Dictionary<string, string>` - kalici degil |
| BR-AUTH-07 | Tum Analytics, Stores ve Chat endpoint'leri `[Authorize]` ile korunur | `AnalyticsController.cs:10`, `StoresController.cs:10`, `ChatController.cs:10` | Auth ve Refresh endpoint'leri `[AllowAnonymous]` |
| BR-AUTH-08 | Basarisiz giris denemesi loglanir ama engellenmez | `AuthController.cs:31` | Rate limiting uygulanmiyor |
| BR-AUTH-09 | Frontend'de 401 hatasi alinirsa otomatik token yenileme denenir | `api.ts:34-58` | Basarisiz olursa `/login`'e yonlendirilir |
| BR-AUTH-10 | Token localStorage'da saklanir | `auth.service.ts:12-13` | `token` ve `refreshToken` key'leri |

### 3.2 Magaza Yonetimi Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-STORE-01 | Magaza adi zorunlu ve en fazla 200 karakter | `HeatMapDbContext.cs:28` | `.HasMaxLength(200).IsRequired()` |
| BR-STORE-02 | Konum en fazla 200 karakter | `HeatMapDbContext.cs:29` | `.HasMaxLength(200)` |
| BR-STORE-03 | Adres en fazla 500 karakter | `HeatMapDbContext.cs:30` | `.HasMaxLength(500)` |
| BR-STORE-04 | Yeni magaza olusturulurken CreatedAt UTC olarak ayarlanir | `StoresController.cs:59` | `store.CreatedAt = DateTime.UtcNow` |
| BR-STORE-05 | Magaza varsayilan olarak aktif olusturulur | `HeatMapDbContext.cs:32` | `.HasDefaultValue(true)` |
| BR-STORE-06 | Guncelleme sirasinda ID uyumsuzlugu kontrol edilir | `StoresController.cs:75-76` | `id != store.Id` ise BadRequest |
| BR-STORE-07 | Magaza silindiginde iliskili tum veriler silinir (cascade) | `HeatMapDbContext.cs:49, 67, 87` | `OnDelete(DeleteBehavior.Cascade)` |
| BR-STORE-08 | FloorArea metrekare cinsinden tam sayi olarak saklanir | `Store.cs:11` | `int FloorArea` - square meters |

### 3.3 Yaya Trafigi (Footfall) Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-FOOT-01 | Ayni magaza, tarih ve saat kombinasyonu benzersiz olmalidir | `HeatMapDbContext.cs:41` | Unique index: `{StoreId, Date, Hour}` |
| BR-FOOT-02 | Saat degeri 0-23 araligindadir | `DailyFootfall.cs:8` | `int Hour // 0-23` |
| BR-FOOT-03 | Upsert mantigi: ayni slot varsa EntryCount ve ExitCount toplanir | `AnalyticsRepository.cs:92-95` | `existing.EntryCount += footfall.EntryCount` |
| BR-FOOT-04 | Upsert sirasinda PeakOccupancy, mevcut ve yeni degerden buyuk olan secilir | `AnalyticsRepository.cs:96` | `Math.Max(existing.PeakOccupancy, footfall.PeakOccupancy)` |
| BR-FOOT-05 | Seed verisi 30 gunluk, saat 09:00-21:00 arasi olusturulur | `DataSeeder.cs:69-71` | `day < 30`, `hour = 9..20` |
| BR-FOOT-06 | Ogle ve aksam saatleri daha yuksek trafik alir (seed'de) | `DataSeeder.cs:74` | 12-14 arasi 120, 17-19 arasi 140, diger 80 taban |
| BR-FOOT-07 | Minimum giris sayisi 20'dir (seed'de) | `DataSeeder.cs:78` | `Math.Max(20, baseTraffic + variance)` |

### 3.4 Isi Haritasi (Heatmap) Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-HEAT-01 | Zone matrisi PostgreSQL JSONB formatinda saklanir | `HeatMapDbContext.cs:60-62` | `.HasColumnType("jsonb")` |
| BR-HEAT-02 | Varsayilan grid boyutu 20x15'tir | `zoneMapper.ts:8`, `DataSeeder.cs:109` | `gridWidth=20, gridHeight=15` |
| BR-HEAT-03 | MaxDensity, matristeki en buyuk degere esittir | `AnalyticsService.cs:231` | `.SelectMany(row => row).DefaultIfEmpty(0).Max()` |
| BR-HEAT-04 | Anlik doluluk, son heatmap'teki tum hucre degerlerinin toplamidir | `AnalyticsService.cs:42-43` | `matrix?.Sum(row => row.Sum())` |
| BR-HEAT-05 | Seed'de hotspot'lar giris (alt orta) ve merkezde olusturulur | `DataSeeder.cs:173-179` | Euclidean distance tabanli deger hesaplama |

### 3.5 Analitik Hesaplama Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-ANAL-01 | Haftalik degisim yuzde olarak hesaplanir | `AnalyticsService.cs:30-31` | `((today - lastWeek) / lastWeek) * 100` |
| BR-ANAL-02 | Gecen hafta verisi yoksa (0) haftalik degisim 0 gosterilir | `AnalyticsService.cs:31` | `lastWeekVisitors > 0` kontrolu |
| BR-ANAL-03 | Haftalik trendler 7 gun uzerine hesaplanir | `AnalyticsService.cs:58` | `endDate = startDate.AddDays(6)` |
| BR-ANAL-04 | Zone performansinda en iyi 5 sicak, en kotu 5 soguk bolge raporlanir | `AnalyticsService.cs:142, 148` | `.Take(5)` ve `.TakeLast(5)` |
| BR-ANAL-05 | Peak hour analizi varsayilan son 7 gunu kapsar | `AnalyticsController.cs:114` | `int days = 7` default parametre |
| BR-ANAL-06 | Peak hour'lar ortalama giris sayisina gore siralanir | `AnalyticsService.cs:163-171` | `Average(f => f.EntryCount)` sonra `OrderByDescending` |
| BR-ANAL-07 | En yoğun 5 saat raporlanir | `AnalyticsService.cs:171` | `.Take(5)` |
| BR-ANAL-08 | Ortalama kalinma suresi rotalarin DurationSeconds ortalamasindan hesaplanir | `AnalyticsService.cs:25` | `routes.Average(r => r.DurationSeconds)` |
| BR-ANAL-09 | Yuzde degerleri 2 ondalik basamaga yuvarlanir | `AnalyticsService.cs:52` | `Math.Round(weeklyChange, 2)` |

### 3.6 Kamera Tespiti Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-DET-01 | Yalnizca "person" sinifi ve guven skoru >= %55 olan tespitler kullanilir | `usePersonDetection.ts:97` | `p.class === 'person' && p.score >= 0.55` |
| BR-DET-02 | Tespit hizi ~10 FPS ile sinirlandirilir | `usePersonDetection.ts:82` | 100ms throttle (`now - lastDetectTime.current < 100`) |
| BR-DET-03 | COCO-SSD "lite_mobilenet_v2" varyanti kullanilir | `usePersonDetection.ts:49` | `cocoSsd.load({ base: 'lite_mobilenet_v2' })` |
| BR-DET-04 | Centroid tracker, 30 frame boyunca kaybolma toleransi tanir | `centroidTracker.ts:24` | `maxDisappeared = 30` |
| BR-DET-05 | Adaptif eslestirme mesafesi: bbox diagonal'e gore dinamik ayarlanir | `centroidTracker.ts:64-65` | `max(100, diagonal * 0.75)` -- sabit deger yerine nesne boyutuna uyumlu |
| BR-DET-06 | Maliyet fonksiyonu Centroid mesafe + IoU birlesimi kullanir | `centroidTracker.ts:59` | `centroidDist * (1 - IoU * 0.5)` -- daha guvenilir eslestirme |
| BR-DET-07 | Hungarian (Munkres) algoritması ile optimal eslestirme yapilir | `hungarian.ts` | Greedy matching yerine optimal atama algoritmasi |
| BR-DET-08 | Nesne 3 frame boyunca takip edildikten sonra "onaylanmis" (unique) sayilir | `centroidTracker.ts:91-94` | `trackAge >= 3` kontrolu -- phantom track onlemi |
| BR-DET-09 | Zone verisi her 1 saniyede snapshot olarak biriktirilir (max 60) | `heatmapAccumulator.ts` | HeatmapAccumulator ile zaman agirlikli birikim |
| BR-DET-10 | Kamera 640x480 cozunurluk ister | `CameraFeed.tsx` | `video: { width: 640, height: 480, facingMode: 'environment' }` |
| BR-DET-11 | Veri gonderimi sonrasi heatmap accumulator sifirlanir | `DetectionPanel.tsx` | Accumulator reset + cache invalidation |
| BR-DET-12 | Video kaynagi olarak Webcam, Dosya veya URL (HLS/MJPEG/IP Kamera) secilebi | `VideoSourceSelector.tsx` | Coklu kaynak destegi |
| BR-DET-13 | IP kamera URL'leri icin credential varsa backend proxy kullanilir | `CameraProxyController.cs` | SSRF korumali proxy (sadece ozel ag IP'leri) |

### 3.7 Entry Line (Giris Cizgisi) Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-ENTRY-01 | Bir magaza icin yalnizca 1 aktif entry line olabilir | `EntryLineService.cs:26-32` | Yeni olusturuldiginda onceki tum aktif entry line'lar deaktive edilir |
| BR-ENTRY-02 | Entry line silme islemi soft delete seklindedir | `EntryLineService.cs:67-76` | `IsActive = false` yapilir, fiziksel olarak silinmez |
| BR-ENTRY-03 | Entry line koordinatlari normalize (0-1) araliğinda saklanir | `EntryLine.cs` | StartX, StartY, EndX, EndY -- video boyutundan bagimsiz |
| BR-ENTRY-04 | Giris yonu 4 secenekten biridir | `EntryLine.InDirection` | `left-to-right`, `right-to-left`, `top-to-bottom`, `bottom-to-top` |
| BR-ENTRY-05 | Gecis tespiti cizgi kesisim algoritmasi ile yapilir | `directionalEntryTracker.ts` | Cross product tabanli segment intersection |
| BR-ENTRY-06 | Gecis icin track yasi en az 3 frame olmalidir | `directionalEntryTracker.ts:75` | Phantom track onlemi |
| BR-ENTRY-07 | Ayni nesne icin gecisler arasi en az 1000ms cooldown uygulanir | `directionalEntryTracker.ts:75` | Cift sayimi onleme |
| BR-ENTRY-08 | Gecis state machine: none -> entered/exited -> karsi duruma gecis | `directionalEntryTracker.ts` | Giris yonunde gecis = entered, ters yon = exited |
| BR-ENTRY-09 | EntryLine tablosunda StoreId + IsActive composite index vardir | `DataSeeder.cs` | Aktif entry line sorgulari icin performans |

### 3.8 Chatbot Kurallari

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-CHAT-01 | Bos sorgu reddedilir (BadRequest) | `ChatController.cs:33-35` | `string.IsNullOrWhiteSpace(request.Query)` |
| BR-CHAT-02 | Gecersiz store ID (<=0) reddedilir | `ChatController.cs:38-40` | `request.StoreId <= 0` |
| BR-CHAT-03 | Ollama kullanilamazsa fallback mekanizmasi devreye girer | `OllamaService.cs:35-37` | Keyword-based basit yanit uretimi |
| BR-CHAT-04 | Fallback, Turkce ve Ingilizce anahtar kelimeleri destekler | `OllamaService.cs:122-148` | "today/bugun", "week/hafta", "busiest/peak/yogun" |
| BR-CHAT-05 | Ollama API timeout suresi 60 saniyedir | `Program.cs:31` | `client.Timeout = TimeSpan.FromSeconds(60)` |
| BR-CHAT-06 | LLM modeli "llama3.1" kullanilir | `OllamaService.cs:42` | `Model: "llama3.1"` |
| BR-CHAT-07 | LLM'e 4 farkli fonksiyon tanimi saglanir | `OllamaService.cs:161-231` | `get_daily_summary`, `get_weekly_comparison`, `get_busiest_hours`, `get_zone_performance` |
| BR-CHAT-08 | Chat icin magaza secimi zorunludur | `ChatPanel.tsx:29, 115-117` | `!selectedStore` ise input devre disi |
| BR-CHAT-09 | LLM dil adaptasyonu yapar (Turkce soru -> Turkce cevap) | `OllamaService.cs:303` | System prompt'ta tanimli |

### 3.8 Veri Yenileme Kurallari (Frontend)

| # | Kural | Kaynak | Detay |
|---|-------|--------|-------|
| BR-REFR-01 | Gunluk ozet her 60 saniyede yenilenir | `useAnalytics.ts:9` | `refetchInterval: 60000` |
| BR-REFR-02 | Haftalik trend verisi 5 dakika stale kalabilir | `useAnalytics.ts:18` | `staleTime: 300000` |
| BR-REFR-03 | Son heatmap her 30 saniyede yenilenir | `useAnalytics.ts:63` | `refetchInterval: 30000` |
| BR-REFR-04 | Magaza listesi hic eskilesmez (Infinity) | `useAnalytics.ts:54` | `staleTime: Infinity` |
| BR-REFR-05 | Detection gonderimi sonrasi heatmap, ozet ve saatlik veriler invalidate edilir | `useDetection.ts:11-13` | `invalidateQueries` cagrilari |
| BR-REFR-06 | Pencere odagi degistiginde yeniden sorgu yapilmaz | `App.tsx:9` | `refetchOnWindowFocus: false` |
| BR-REFR-07 | Basarisiz sorgular 1 kez yeniden denenir | `App.tsx:10` | `retry: 1` |

---

## 4. Is Akislari (Business Flows)

### 4.1 Kimlik Dogrulama Akisi

```
  [Kullanici Login Sayfasina Gelir]
                |
                v
  [Kullanici Adi ve Sifre Girer] <----+
                |                      |
                v                      |
          {Form Submit}                |
                |                      |
                v                      |
    [POST /api/auth/login]             |
                |                      |
                v                      |
    {Kimlik Bilgileri Dogru mu?}       |
         |               |            |
       Evet            Hayir          |
         |               |            |
         v               v            |
  [JWT + Refresh     [401 Unauthorized |
   Token Uretilir]   Hata gosterilir]--+
         |
         v
  [Token'lar localStorage'a Kaydedilir]
         |
         v
  [Dashboard'a Yonlendirilir]
         |
         v
  {Token Suresi Doldu mu?}
      |             |
    Hayir         Evet
      |             |
      v             v
  [API Istekleri   [POST /api/auth/refresh]
   Bearer Token         |
   ile Gonderilir]      v
      ^           {Refresh Token Gecerli mi?}
      |              |              |
      |            Evet           Hayir
      |              |              |
      |              v              v
      |      [Yeni JWT +     [localStorage
      |       Refresh Token   Temizlenir]
      |       Alinir]              |
      |           |                v
      |           v          [Login Sayfasina
      +----[localStorage      Yonlendirilir]
            Guncellenir]
```

### 4.2 Kamera Tespiti ve Veri Gonderimi Akisi

```
  [Kullanici 'Baslat' Butonuna Tiklar]
                 |
                 v
  [Kamera Erisim Izni Istenir (getUserMedia)]
                 |
                 v
         {Izin Verildi mi?}
          |             |
        Evet          Hayir --> [Hata Mesaji Gosterilir]
          |
          v
  [Kamera Akisi Baslar]
          |
          v
  [TensorFlow.js + COCO-SSD Model Yuklenir]
          |
          v
  [10 FPS Hizinda Frame Analizi Baslar] <---------------------------+
          |                                                          |
          v                                                          |
  {Frame'de Kisi Tespit Edildi mi? (guven >= %50)}                   |
       |              |                                              |
     Evet           Hayir -------------------------------------------+
       |                                                             |
       v                                                             |
  [Bounding Box Centroid Hesaplanir]                                 |
       |                                                             |
       v                                                             |
  [CentroidTracker ile Eslestirme]                                   |
       |                                                             |
       v                                                             |
  {Mevcut Nesne ile Mesafe < 80px mi?}                               |
       |              |                                              |
     Evet           Hayir                                            |
       |              |                                              |
       v              v                                              |
  [Mevcut Nesne   [Yeni Benzersiz Nesne                              |
   Guncellenir]    Kaydedilir (totalUnique++)]                       |
       |              |                                              |
       +------+-------+                                              |
              |                                                      |
              v                                                      |
       {10 Frame Oldu mu?}                                           |
          |          |                                               |
        Evet       Hayir ------------------------------------------ +
          |
          v
  [Zone Matrisi Hesaplanir (mapDetectionsToZones)]
          |
          v
  [Zone Verisi Biriktirilir (accumulateZones)] ----------------------+


  [Kullanici 'Verileri Gonder' Tiklar]
                 |
                 v
  {Magaza Secili mi? Zone Verisi Var mi?}
       |              |
     Evet           Hayir --> [Buton Devre Disi]
       |
       v
  [POST /api/analytics/detection]
       |
       +---------------------------+
       |                           |
       v                           v
  [Backend:                  [Backend:
   DailyFootfall Upsert]     HeatmapData Kaydet]
       |                           |
       +---------------------------+
                  |
                  v
  [React Query Cache Invalidate]
                  |
                  v
  [Dashboard Guncellenir]
```

### 4.3 Dashboard Veri Yukleme Akisi

```
  [Kullanici Dashboard'a Erisir]
              |
              v
      {Magaza Secili mi?}
        |            |
      Evet         Hayir --> ['Magaza Secin' Mesaji Gosterilir]
        |
        v
  [Paralel API Cagrilari Baslar]
        |
        +----------+----------+-----------+-----------+
        |          |          |           |           |
        v          v          v           v           v
   [GET daily  [GET weekly [GET hourly [GET zone   [GET heatmap
    summary]    trends]     distrib.]   perform.]   /latest]
        |          |          |           |           |
        v          v          v           v           v
   [KPI Kartlar] [Haftalik  [Saatlik   [Zone       {Goruntulem
                  Trend       Dagilim    Karsilast.   Modu?}
                  LineChart]  BarChart]  BarChart]     |       |
                                                    2D      3D
                                                    |       |
                                                    v       v
                                              [Canvas   [Three.js
                                               2D       3D Heatmap
                                               Heatmap] InstancedMesh]
```

### 4.4 AI Chatbot Sorgu Akisi

```
  [Kullanici Soru Yazar]
           |
           v
  {Sorgu Bos mu? Magaza Secili mi?}
      |              |
   Gecerli        Gecersiz --> [Hata Mesaji]
      |
      v
  [POST /api/chat]
      |
      v
  {Ollama Erisilebilir mi?}
      |                    |
    Evet                 Hayir
      |                    |
      v                    v
  [Ollama'ya Sorgu +   [Fallback Mekanizmasi]
   Tool Tanimlari            |
   Gonderilir]               v
      |               {Anahtar Kelime Eslesmesi}
      v                |       |        |        |
  {Tool Call          today/  week/  busiest/  Eslesmedi
   Ister mi?}         bugun   hafta  peak/yogun    |
    |       |          |       |        |          v
  Evet    Hayir        v       v        v     [Genel Yardim
    |       |      [Gunluk [Haftalik [Peak     Mesaji]
    |       v       Ozet]   Trend]   Hours]
    |  [Dogrudan
    |   LLM Yaniti]
    v
  [Ilgili Analitik Fonksiyon Calistirilir]
    |
    v
  [Fonksiyon Sonucu Ollama'ya Gonderilir]
    |
    v
  [LLM Dogal Dil Yaniti Uretir]
    |
    v
  [Yanit Kullaniciya Gosterilir]
```

### 4.5 Detection Verisi Backend Isleme Akisi

```
  [POST /api/analytics/detection - DetectionSubmissionDto]
        |                                |
        v                                v
  [Tarih ve Saat Cikarilir]     {ZoneDistribution Verisi Var mi?}
  (DateOnly + Hour)                  |              |
        |                          Evet           Hayir
        v                            |              |
  [DailyFootfall Nesnesi             v              v
   Olusturulur]              [HeatmapData      [Sadece Footfall
        |                     Nesnesi            Kaydedilir]
        v                     Olusturulur]
  [UpsertFootfallAsync]              |
        |                            v
        v                     [GridWidth = Ilk Satir Uzunlugu
  {Ayni StoreId+Date+Hour     GridHeight = Satir Sayisi
   Kaydi Var mi?}              MaxDensity = En Buyuk Deger]
     |          |                    |
   Evet       Hayir                  v
     |          |             [ZoneMatrix JSON
     v          v              Olarak Kaydedilir]
  [EntryCount   [Yeni Kayit
   += Yeni Sayi  Eklenir]
   PeakOccupancy
   = Max(Eski,Yeni)]
```

---

## 5. Kullanici Hikayeleri (User Stories)

### Epic 1: Kimlik Dogrulama ve Erisim Kontrolu

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-01 | Bir magaza yoneticisi olarak, sisteme guvenli bir sekilde giris yapabilmek istiyorum, boylece yalnizca yetkili kisiler verilere erisebilir | - Kullanici adi ve sifre ile giris yapilabilmeli - Basarisiz denemede hata mesaji gosterilmeli - Basarili giriste JWT token alinmali - Token 1 saat gecerli olmali |
| US-02 | Bir kullanici olarak, oturum suresinin otomatik uzatilmasini istiyorum, boylece calisirken tekrar giris yapmak zorunda kalmam | - Token suresi dolunca refresh token ile otomatik yenilenmeli - Refresh token da gecersizse login sayfasina yonlendirilmeli |
| US-03 | Bir kullanici olarak, guvenli bir sekilde cikis yapabilmek istiyorum | - Cikis butonuna tikladigimda token'lar temizlenmeli - Login sayfasina yonlendirilmeli |

### Epic 2: Magaza Yonetimi

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-04 | Bir yonetici olarak, sisteme kayitli tum magazalari gorebilmek istiyorum | - Magazalar listesi yuklenebilmeli - Her magazanin adi, konumu ve durumu gorunmeli |
| US-05 | Bir yonetici olarak, analiz yapmak icin bir magaza secebilmek istiyorum | - Sidebar'dan dropdown ile magaza secimi yapilabilmeli - Secim sonrasi tum analizler secili magazaya ait olmali - Ilk yuklemede varsayilan olarak ilk magaza secilmeli |
| US-06 | Bir yonetici olarak, yeni magaza ekleyebilmek istiyorum | - Ad, konum, adres, koordinat ve alan bilgileri girilebilmeli - Magaza otomatik olarak aktif durumda olusturulmali |

### Epic 3: Gunluk Analitik Paneli

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-07 | Bir magaza yoneticisi olarak, bugunun ziyaretci ozetini gorebilmek istiyorum | - Toplam ziyaretci sayisi, ortalama kalinma suresi, peak hour ve anlik doluluk KPI kartlarinda gosterilmeli - Gecen haftaya gore yuzdesel degisim gosterilmeli - Veri her 60 saniyede yenilenmeli |
| US-08 | Bir magaza yoneticisi olarak, saatlik giris/cikis dagilimini grafik olarak gorebilmek istiyorum | - Saatlik giris ve cikis sayilari bar chart ile gosterilmeli - En yogun saat vurgulanmali |
| US-09 | Bir magaza yoneticisi olarak, haftalik trendi gorebilmek istiyorum | - Son 7 gunun ziyaretci sayisi ve peak dolulugu line chart ile gosterilmeli - Hafta-hafta degisim yuzdesi gosterilmeli - Toplam ziyaretci sayisi belirtilmeli |
| US-10 | Bir magaza yoneticisi olarak, magazamdaki sicak ve soguk bolgeleri gorebilmek istiyorum | - En yogun 5 bolge (hot zones) bar chart ile gosterilmeli - Her bolgenin ziyaret sayisi ve yuzdelik payi belirtilmeli |

### Epic 4: Isi Haritasi Gorsellestirmesi

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-11 | Bir magaza yoneticisi olarak, magazamin isi haritasini 2D olarak gorebilmek istiyorum | - 20x15 grid uzerinde renk gradyani (mavi->kirmizi) ile yogunluk gosterilmeli - Dusuk ve yuksek trafik legendi olmali |
| US-12 | Bir magaza yoneticisi olarak, isi haritasini 3D olarak gorebilmek istiyorum, boylece yogunluk farklari daha belirgin olsun | - 3D bar chart (InstancedMesh) ile her hucrenin yuksekligi yogunlugu yansitmali - Kullanici orbit kontrolleri ile dondurebilmeli, yaklasabilmeli - Magaza zemini, grid cizgileri ve giris isareti gosterilmeli |
| US-13 | Bir magaza yoneticisi olarak, 2D ve 3D gorunumler arasinda gecis yapabilmek istiyorum | - Buton ile aninda gecis yapilabilmeli - 3D bilesenin lazy loading yapilmali (performans icin) |

### Epic 5: Kamera Tabanli Kisi Tespiti

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-14 | Bir magaza yoneticisi olarak, kamera ile magaza icindeki kisileri otomatik tespit edebilmek istiyorum | - Cihaz kamerasi WebRTC ile erisimi saglanmali - TensorFlow.js COCO-SSD modeli ile kisi tespiti yapilmali - %50 ustu guven skoru olan tespitler kullanilmali - Tespit edilenlerin uzerine bounding box cizilmeli |
| US-15 | Bir magaza yoneticisi olarak, benzersiz ziyaretci sayisini doğru olarak bilmek istiyorum | - Centroid tracking ile ayni kisinin tekrar sayilmasi onlenmeli - Anlik kisi sayisi ve toplam benzersiz sayi ayri ayri gosterilmeli - Sayaci sifirla butonu olmali |
| US-16 | Bir magaza yoneticisi olarak, tespit verilerini sisteme kaydedebilmek istiyorum | - "Verileri Gonder" butonu ile tespit verileri API'ye gonderilmeli - Gonderim sonrasi dashboard otomatik guncellenmeli - Son gonderim zamani gosterilmeli |

### Epic 6: AI Destekli Analitik Asistani

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-17 | Bir magaza yoneticisi olarak, dogal dilde sorular sorarak magaza analizlerine ulasabilmek istiyorum | - "Bugun nasil gecti?" gibi sorular sorabilmeli - Turkce ve Ingilizce desteklenmeli - Yanit kisa ve bilgi verici olmali (2-3 cumle) |
| US-18 | Bir kullanici olarak, LLM servisi calismiyorken bile temel sorularima yanit alabilmek istiyorum | - Ollama calismiyorsa keyword-based fallback devreye girmeli - Fallback durumu kullaniciya bildirilmeli |
| US-19 | Bir kullanici olarak, chatbot'u ihtiyacim oldugunda acip kapatabilmek istiyorum | - Floating button ile chat paneli acilabilmeli - Panel kapatilabilmeli - Panel 600px yuksekliginde fixed konumda olmali |

### Epic 7: Filtreleme ve Navigasyon

| ID | Kullanici Hikayesi | Kabul Kriterleri |
|----|-------------------|------------------|
| US-20 | Bir kullanici olarak, tarih araligi secebilmek istiyorum | - Baslangic ve bitis tarihi secilebilmeli - "Bugun" butonuyla hizli tarih secimi yapilabilmeli - Varsayilan tarih bugunun tarihi olmali |
| US-21 | Bir kullanici olarak, kolay navigasyon yapabilmek icin sidebar ve header kullanabilmek istiyorum | - Sidebar'da magaza secimi ve tarih filtreleri olmali - Header'da kullanici adi ve cikis butonu olmali |

---

## 6. Veri Modeli ve Entity Iliskileri

### 6.1 ER Diyagrami

```
  +====================+          +==========================+
  |       STORE        |          |     DAILY_FOOTFALL       |
  +====================+          +==========================+
  | PK  Id             |---+      | PK  Id                   |
  |     Name (req)     |   |      | FK  StoreId              |
  |     Location       |   +--||--| UQ  Date (StoreId+       |
  |     Address        |   |      |     Date+Hour)           |
  |     Latitude       |   |      | UQ  Hour (0-23)          |
  |     Longitude      |   |      |     EntryCount           |
  |     FloorArea (m2) |   |      |     ExitCount            |
  |     CreatedAt      |   |      |     PeakOccupancy        |
  |     IsActive       |   |      |     CreatedAt            |
  +--------------------+   |      +--------------------------+
                           |
                           |      +==========================+
                           |      |      HEATMAP_DATA        |
                           |      +==========================+
                           +--||--| PK  Id                   |
                           |      | FK  StoreId              |
                           |      | IX  Timestamp            |
                           |      |     ZoneMatrix (JSONB)   |
                           |      |     GridWidth  (def: 20) |
                           |      |     GridHeight (def: 15) |
                           |      |     MaxDensity           |
                           |      +--------------------------+
                           |
                           |      +==========================+
                           |      |    CUSTOMER_ROUTE        |
                           |      +==========================+
                           +--||--| PK  Id                   |
                                  | FK  StoreId              |
                                  | IX  Timestamp            |
                                  |     Waypoints (JSONB)    |
                                  |     DurationSeconds      |
                                  |     DistanceMeters       |
                                  |     CreatedAt            |
                                  +--------------------------+

  Iliskiler: STORE 1 ---o{ N  DAILY_FOOTFALL
             STORE 1 ---o{ N  HEATMAP_DATA
             STORE 1 ---o{ N  CUSTOMER_ROUTE
```

### 6.2 Index Stratejisi

| Entity | Index | Tip | Amac |
|--------|-------|-----|------|
| Store | Name | Normal | Ada gore arama |
| Store | IsActive | Normal | Aktif magazalari filtreleme |
| DailyFootfall | {StoreId, Date, Hour} | Unique | Tekrarlanan kayitlari onleme ve hizli sorgulama |
| DailyFootfall | Date | Normal | Tarihe gore filtreleme |
| HeatmapData | {StoreId, Timestamp} | Normal | Magazaya gore zaman sirali sorgulama |
| CustomerRoute | {StoreId, Timestamp} | Normal | Magazaya gore zaman sirali sorgulama |

### 6.3 Veri Hacmi Tahminleri

| Entity | Seed Miktari | Gunluk Artis (Tahmin) |
|--------|-------------|----------------------|
| Store | 2 adet | Dusuk (ayda 1-2) |
| DailyFootfall | 720 kayit (2 magaza x 30 gun x 12 saat) | ~24 kayit/magaza/gun |
| HeatmapData | 168 kayit (2 magaza x 7 gun x 12 saat) | ~12 kayit/magaza/gun (saatlik) + detection gonderimi |
| CustomerRoute | 200 kayit (2 magaza x 100 rota) | Degisken (rota takibi aktif degilse 0) |

---

## 7. API Haritasi

### 7.1 Endpoint Tablosu

| Metod | Yol | Yetkilendirme | Aciklama | Istek Parametreleri | Yanit |
|-------|-----|---------------|----------|---------------------|-------|
| **Kimlik Dogrulama** | | | | | |
| POST | `/api/auth/login` | AllowAnonymous | Kullanici girisi | `Body: {username, password}` | `{token, refreshToken, expiresAt, username}` |
| POST | `/api/auth/refresh` | AllowAnonymous | Token yenileme | `Body: {refreshToken}` | `{token, refreshToken, expiresAt, username}` |
| **Magaza Yonetimi** | | | | | |
| GET | `/api/stores` | Authorize | Tum magazalari listele | - | `Store[]` |
| GET | `/api/stores/{id}` | Authorize | Magazayi getir | `Path: id` | `Store` |
| POST | `/api/stores` | Authorize | Yeni magaza olustur | `Body: Store` | `Store (201 Created)` |
| PUT | `/api/stores/{id}` | Authorize | Magazayi guncelle | `Path: id, Body: Store` | `Store` |
| DELETE | `/api/stores/{id}` | Authorize | Magazayi sil | `Path: id` | `204 No Content` |
| **Analitik** | | | | | |
| GET | `/api/analytics/daily-summary` | Authorize | Gunluk ozet | `Query: storeId, date` | `DailySummaryDto` |
| GET | `/api/analytics/weekly-trends` | Authorize | Haftalik trendler | `Query: storeId, startDate` | `WeeklyTrendsDto` |
| GET | `/api/analytics/hourly-distribution` | Authorize | Saatlik dagilim | `Query: storeId, date` | `HourlyDistributionDto` |
| GET | `/api/analytics/zone-performance` | Authorize | Bolge performansi | `Query: storeId, startDate, endDate` | `ZonePerformanceDto` |
| GET | `/api/analytics/peak-hours` | Authorize | Tepe saatler | `Query: storeId, days(varsayilan=7)` | `PeakHoursDto` |
| GET | `/api/analytics/heatmap/latest` | Authorize | Son isi haritasi | `Query: storeId` | `HeatmapDataDto` |
| POST | `/api/analytics/detection` | Authorize | Tespit verisi gonder | `Body: DetectionSubmissionDto` | `201 Created` |
| **Chatbot** | | | | | |
| POST | `/api/chat` | Authorize | AI sohbet sorgusu | `Body: {query, storeId}` | `{message}` |
| **Altyapi** | | | | | |
| GET | `/health` | - | Saglik kontrolu | - | `Healthy/Unhealthy` |
| GET | `/alive` | - | Canlilik kontrolu | - | `Healthy/Unhealthy` |
| **Scaffold Artigi** | | | | | |
| GET | `/WeatherForecast` | Yok (Acik!) | Sablon artigi - kaldirilinmali | - | `WeatherForecast[]` |

### 7.2 Hata Yonetimi Kaliplari

Tum controller'lar asagidaki tutarli hata yonetimi kalibini kullanir:

| HTTP Kodu | Durum | Kullanim |
|-----------|-------|----------|
| 200 | OK | Basarili GET/PUT islemleri |
| 201 | Created | Basarili POST islemleri |
| 204 | No Content | Basarili DELETE islemleri |
| 400 | Bad Request | Gecersiz istek verisi (bos sorgu, ID uyumsuzlugu) |
| 401 | Unauthorized | Gecersiz kimlik bilgileri veya token |
| 404 | Not Found | Kayit bulunamadi |
| 500 | Internal Server Error | Sunucu hatasi (try-catch ile sarmalanan islemler) |

---

## 8. Modul Analizi

### 8.1 Backend Modulleri

#### 8.1.1 heatTheMap (AppHost) - Orkestrasyon Modulu

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `AppHost.cs` | .NET Aspire tabanli dagitik uygulama orkestratoru. PostgreSQL, API ve Web frontend'i yapilandirir ve birbirine baglar |
| `heatTheMap.csproj` | Aspire hosting paketleri, PostgreSQL ve Node.js entegrasyonlari |

**Is Degeri:** Tek komutla tum altyapiyi ayaga kaldirma, servis kesfetme (service discovery), veri hacmi yonetimi.

#### 8.1.2 HeatTheMap.Api - Backend API Modulu

| Alt Modul | Dosyalar | Is Fonksiyonu |
|-----------|---------|---------------|
| **Controllers** | `AuthController.cs` | Kimlik dogrulama islemleri (login, refresh) |
| | `AnalyticsController.cs` | Tum analitik veri endpoint'leri |
| | `StoresController.cs` | Magaza CRUD islemleri |
| | `ChatController.cs` | AI chatbot sorgu islemleri |
| | `EntryLinesController.cs` | Entry line CRUD islemleri (giris cizgisi yonetimi) |
| | `CameraProxyController.cs` | IP kamera akisini SSRF korumasli proxy etme |
| **Services** | `AuthService.cs` | JWT uretimi, kimlik dogrulama mantigi |
| | `AnalyticsService.cs` | Analitik hesaplamalar ve veri donusumleri |
| | `OllamaService.cs` | LLM entegrasyonu, fonksiyon cagrisi, fallback |
| | `EntryLineService.cs` | Entry line CRUD, tek aktif line kurali, soft delete |
| **Repositories** | `Repository.cs` | Generic CRUD islemleri |
| | `AnalyticsRepository.cs` | Analitik sorgulamalar ve upsert mantigi |
| **Data** | `HeatMapDbContext.cs` | EF Core veritabani baglami ve yapilandirmasi |
| | `DataSeeder.cs` | Gelistirme ortami icin ornek veri ureten sinif |
| **Entities** | `Store.cs` | Magaza domain entity'si |
| | `DailyFootfall.cs` | Gunluk yaya trafigi entity'si |
| | `HeatmapData.cs` | Isi haritasi entity'si |
| | `CustomerRoute.cs` | Musteri rota entity'si |
| | `EntryLine.cs` | Giris cizgisi entity'si (normalize 0-1 koordinatlari, yon, soft delete) |
| **DTOs** | `AnalyticsDTOs.cs` | Analitik veri transfer nesneleri |
| | `AuthDTOs.cs` | Kimlik dogrulama veri transfer nesneleri |
| | `ChatDTOs.cs` | Chatbot ve Ollama API veri transfer nesneleri |

#### 8.1.3 HeatTheMap.ServiceDefaults - Altyapi Modulu

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `Extensions.cs` | OpenTelemetry (logging, metrics, tracing), health check'ler, service discovery, HTTP resilience (retry, circuit breaker, timeout) yapilandirmasi |

**Is Degeri:** Cross-cutting concern'lerin merkezi yonetimi, gozlemlenebilirlik (observability), hata toleransi.

### 8.2 Frontend Modulleri

#### 8.2.1 Sayfa Modulleri

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `pages/Login.tsx` | Kullanici giris formu, kimlik dogrulama UI |
| `pages/Dashboard.tsx` | Ana analitik dashboard, tum bilesenlerin orkestratoru |

#### 8.2.2 Dashboard Bilesenleri

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `dashboard/KPICard.tsx` | Tekil KPI gosterge karti (deger, degisim, alt baslik) |
| `dashboard/KPIGrid.tsx` | 4 KPI kartinin grid duzeninde sunumu |
| `dashboard/HeatmapVisualization.tsx` | 2D/3D heatmap gecisi ve 2D canvas rendering |
| `dashboard/HeatmapVisualization3D.tsx` | Three.js ile 3D heatmap sahnesi |
| `dashboard/HeatmapBars.tsx` | InstancedMesh ile 3D bar rendering (performans optimizasyonu) |
| `dashboard/StoreFloor.tsx` | 3D magaza zemini, grid cizgileri, giris isareti |
| `dashboard/HourlyDistributionChart.tsx` | Saatlik giris/cikis bar chart (Recharts) |
| `dashboard/DailyTrendsChart.tsx` | Haftalik ziyaretci ve doluluk trend grafigi (Recharts) |
| `dashboard/ZoneComparisonChart.tsx` | Sicak bolgeler karsilastirma bar chart (Recharts) |

#### 8.2.3 Kamera Tespiti Bilesenleri

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `detection/DetectionPanel.tsx` | Tespit paneli: kamera, istatistikler, gonderim butonu |
| `detection/CameraFeed.tsx` | WebRTC kamera akisi, bounding box cizimi, durum gostergesi |
| `detection/usePersonDetection.ts` | TensorFlow.js/COCO-SSD model yukleme, frame analizi, centroid tracking hook'u |

#### 8.2.4 Chatbot Bilesenleri

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `chatbot/ChatButton.tsx` | Floating chat acma butonu |
| `chatbot/ChatPanel.tsx` | Chat paneli: mesaj listesi, input, oneri sorulari |
| `chatbot/ChatMessage.tsx` | Tekil chat mesaji gosterimi (kullanici/asistan stili) |

#### 8.2.5 Layout ve Filtre Bilesenleri

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `layout/Layout.tsx` | Ana sayfa duzeni (sidebar + header + content) |
| `layout/Sidebar.tsx` | Sol panel: marka, magaza secimi, tarih filtresi |
| `layout/Header.tsx` | Ust panel: baslik, kullanici bilgisi, cikis butonu |
| `filters/StoreSelector.tsx` | Magaza dropdown secici |
| `filters/DateRangePicker.tsx` | Tarih araligi secici |

#### 8.2.6 Yardimci Kutuphaneler

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `lib/centroidTracker.ts` | Centroid tabanli nesne izleme algoritmasi. Greedy matching, euclidean mesafe, kaybolma yonetimi |
| `lib/zoneMapper.ts` | Tespit koordinatlarini grid hucrelerine esleme ve birikim fonksiyonlari |

#### 8.2.7 State ve Servis Katmani

| Dosya | Is Fonksiyonu |
|-------|---------------|
| `stores/useAuthStore.ts` | Kimlik dogrulama durumu (Zustand) |
| `stores/useFilterStore.ts` | Secili magaza ve tarih araligi durumu (Zustand) |
| `hooks/useAnalytics.ts` | Analitik veriler icin React Query hook'lari |
| `hooks/useDetection.ts` | Tespit verisi gonderimi icin mutation hook'u |
| `hooks/useChat.ts` | Chat mesaji gonderimi icin mutation hook'u |
| `services/api.ts` | Axios instance, JWT interceptor, otomatik token yenileme |
| `services/analytics.service.ts` | Analitik API cagri fonksiyonlari |
| `services/auth.service.ts` | Kimlik dogrulama API cagri fonksiyonlari |
| `services/chat.service.ts` | Chat API cagri fonksiyonu |

---

## 9. Entegrasyon Noktalari

### 9.1 Entegrasyon Diyagrami

```
  +------------------------------------------+       +---------------------------+
  |        FRONTEND (Tarayici)               |       |    BACKEND (.NET)         |
  |                                          |       |                           |
  |  [React Uygulama]                        | REST  |  [ASP.NET Core API]       |
  |       ^        |                         | API   |       |          |        |
  |       |        +-------------------------|------>|       |          |        |
  |       |                                  | (JWT) |       |          |        |
  |  [TensorFlow.js]  [WebRTC Camera API]    |       |       |          |        |
  |   (COCO-SSD CDN)   (getUserMedia)        |       |       |          |        |
  +------------------------------------------+       +-------|----------|--------+
                                                             |          |
                        +------------------------------------+          |
                        |                                               |
                        v                                               v
  +------------------------------------------+       +---------------------------+
  |          DIS SERVISLER                   |       |   GOZLEMLENEBILIRLIK      |
  |                                          |       |                           |
  |  [PostgreSQL (heatmapdb)]  EF Core       |       |  [OpenTelemetry           |
  |       |                    (Npgsql)      |       |   Collector (OTLP)]       |
  |       v                                  |       +---------------------------+
  |  [pgAdmin (Yonetim UI)]                  |
  |                                          |
  |  [Ollama API]  HTTP POST (/api/chat)     |
  |   (localhost:11434)                      |
  +------------------------------------------+
```

### 9.2 Entegrasyon Detaylari

| # | Entegrasyon | Protokol | Yonu | Amac | Hata Toleransi |
|---|-------------|----------|------|------|----------------|
| INT-01 | Frontend -> Backend API | REST/HTTP + JWT | Istemci -> Sunucu | Tum is mantigi istekleri | Retry (1 kez), Token refresh |
| INT-02 | Backend -> PostgreSQL | TCP (Npgsql) | Sunucu -> Veritabani | Veri okuma/yazma | Aspire health check |
| INT-03 | Backend -> Ollama | HTTP (REST) | Sunucu -> LLM | Dogal dil islemleri | Fallback mekanizmasi, 60s timeout |
| INT-04 | Frontend -> COCO-SSD | HTTP (CDN) | Istemci -> Model | ML model yukleme | Hata mesaji gosterimi |
| INT-05 | Frontend -> Cihaz Kamerasi | WebRTC | Istemci -> Donanim | Video akisi | Izin reddedilirse UI uyarisi |
| INT-06 | Backend -> OTLP Collector | gRPC/HTTP | Sunucu -> Gozlemlenebilirlik | Metrik, iz, log gonderimi | Opsiyonel (env degiskenine bagli) |
| INT-07 | Aspire -> PostgreSQL | Docker | Orkestrator -> Container | DB yasam dongusu | DataVolume ile veri kaliciligi |
| INT-08 | Aspire -> pgAdmin | Docker | Orkestrator -> Container | DB yonetim araci | - |

### 9.3 CORS Yapilandirmasi

```
Izin Verilen Kaynaklar: http://localhost:5173, https://localhost:5173
Izin Verilen Metodlar: Tum metodlar
Izin Verilen Header'lar: Tum header'lar
Kimlik Bilgileri: Izin verilir (AllowCredentials)
```
**Kaynak:** `Program.cs:62-71`

---

## 10. Mevcut Durum (AS-IS) Analizi

### 10.1 Uygulanan Yetenekler

| Yetenek | Durum | Olgunluk |
|---------|-------|----------|
| JWT tabanli kimlik dogrulama | Uygulanmis | MVP (hardcoded kullanici) |
| Magaza CRUD islemleri | Uygulanmis | Temel |
| Gunluk ozet analitigi | Uygulanmis | Iyi |
| Haftalik trend analizi | Uygulanmis | Iyi |
| Saatlik dagilim analizi | Uygulanmis | Iyi |
| Zone (bolge) performans analizi | Uygulanmis | Iyi |
| Peak hour analizi | Uygulanmis | Iyi |
| 2D isi haritasi gorsellestirmesi | Uygulanmis | Iyi |
| 3D isi haritasi gorsellestirmesi | Uygulanmis | Iyi (Three.js + InstancedMesh) |
| Kamera tabanli kisi tespiti | Uygulanmis | Iyi (COCO-SSD + CentroidTracker) |
| Centroid tabanli nesne izleme | Uygulanmis | Temel (greedy matching) |
| Zone distribution haritlamasi | Uygulanmis | Iyi |
| AI chatbot (Ollama LLM) | Uygulanmis | MVP (fallback dahil) |
| Chatbot fonksiyon cagrisi (tool use) | Uygulanmis | Iyi (4 fonksiyon) |
| Otomatik veri seed | Uygulanmis | Gelistirme ortami |
| OpenTelemetry gozlemlenebilirlik | Uygulanmis | Temel |
| Health check endpoint'leri | Uygulanmis | Temel |
| HTTP dayaniklilik (Polly) | Uygulanmis | Framework varsayilanlari |
| React Query ile veri yonetimi | Uygulanmis | Iyi (stale/refetch stratejileri) |
| Zustand ile state management | Uygulanmis | Temel |
| Responsive UI (Tailwind) | Uygulanmis | Temel |

### 10.2 Mimari Guclukler

1. **Temiz katmanli mimari:** Controller -> Service -> Repository -> DbContext ayriligi
2. **Interface tabanli bagimlilik enjeksiyonu:** Tum servisler ve repository'ler interface'ler uzerinden baglaniyor
3. **Generic Repository deseni:** CRUD islemleri icin yeniden kullanilanilir kod
4. **Aspire orkestrasyon:** Altyapi yonetimi deklaratif ve tekrarlanabilir
5. **Lazy loading:** 3D bilesenler lazy import ile yukleniyor
6. **InstancedMesh kullanimi:** 300 bar icin performans optimizasyonu
7. **Tarayici ici ML:** Sunucu yukunu azaltan istemci tarafli kisi tespiti
8. **Fallback mekanizmasi:** LLM erisilemediklerinde keyword-based yanit uretimi
9. **Token rotasyonu:** Refresh token kullanim sonrasi yenileniyor

### 10.3 Teknik Borc ve Zayifliklar

| # | Alan | Problem | Kaynak | Oncelik |
|---|------|---------|--------|---------|
| TD-01 | Kimlik Dogrulama | Hardcoded kullanici bilgileri (admin/password) | `AuthService.cs:23` | Yuksek |
| TD-02 | Kimlik Dogrulama | Refresh token'lar in-memory - sunucu yeniden baslatilirsa kaybolur | `AuthService.cs:13` | Yuksek |
| TD-03 | Guvenlik | JWT anahtari kaynak kodda hardcoded | `appsettings.json:11` | Yuksek |
| TD-04 | Guvenlik | Token localStorage'da saklaniyor (XSS riski) | `auth.service.ts:12-13` | Orta |
| TD-05 | Yetkilendirme | Rol tabanli erisim kontrolu yok (tek "Admin" rolu) | `AuthService.cs:64` | Orta |
| TD-06 | Hata Yonetimi | Bazi catch bloklari bos - sessiz hata yutma | `AnalyticsService.cs:43-44, 136` | Orta |
| TD-07 | Validasyon | DTO'larda input validasyonu yok (FluentValidation vb.) | Tum DTO'lar | Orta |
| TD-08 | Performans | Heatmap sorgulari filtresiz tum kayitlari cekiyor | `AnalyticsRepository.cs:41-47` | Orta |
| TD-09 | Performans | Zone performance hesaplamasi her istekte tum heatmap'leri deserialize ediyor | `AnalyticsService.cs:117-137` | Orta |
| TD-10 | Veri Butunlugu | CustomerRoute verisi aktif olarak olusturulmuyor (sadece seed) | Sistem genelinde | Dusuk |
| TD-11 | Test | Unit test veya integration test yok | Proje genelinde | Yuksek |
| TD-12 | API | Sayfalama (pagination) uygulanmamis | `Repository.cs:26` | Orta |
| TD-13 | API | Rate limiting uygulanmamis | Sistem genelinde | Orta |
| TD-14 | Frontend | Bazi metinler Turkce, bazilari Ingilizce (tutarsiz lokalizasyon) | UI bilesenleri | Dusuk |
| TD-15 | Frontend | Error boundary uygulanmamis | React bilesenleri | Orta |
| TD-16 | Kamera | Detection verisi gonderimi manuel (otomatik periyodik gonderim yok) | `DetectionPanel.tsx:44` | Dusuk |
| TD-17 | Scaffold | WeatherForecast controller ve model artigi kaldirilinmamis | `WeatherForecastController.cs`, `WeatherForecast.cs` | Dusuk |
| TD-18 | Guvenlik | WeatherForecast endpoint'i `[Authorize]` olmadan acik | `WeatherForecastController.cs:7` | Orta |
| TD-19 | CSS | `App.css` Vite scaffold stilleri kaldirilinmamis (kullanilmiyor) | `App.css:1-43` | Dusuk |
| TD-20 | Veritabani | EF Core Migrations yerine `EnsureCreatedAsync` kullaniliyor (prod'a uygun degil) | `DataSeeder.cs:23` | Yuksek |
| TD-21 | Mimari | AuthService Scoped olarak kayitli ama `_refreshTokens` instance bazli - her request yeni instance alir | `Program.cs:24`, `AuthService.cs:13` | Kritik |

### 10.4 Magaza Durumu Durum Diyagrami

```
  Magaza Durumu (State Diagram)

                  POST /api/stores
        (*) --------------------------> [Olusturuldu]
                                             |
                                  IsActive = true (varsayilan)
                                             |
                                             v
                           +------------> [Aktif] <-----------+
                           |                |  |              |
                 IsActive  |                |  |   IsActive   |
                 = true    |                |  |   = false    |
                 (PUT)     |                |  |   (PUT)      |
                           |                |  |              |
                           +-- [Pasif] <----+  +-------> [Pasif]
                                |                         |
                                |   DELETE /api/stores/id |
                                +--------+   +------------+
                                         |   |
                                         v   v
                                      [Silindi] --> (*)

  Not: Aktif   = Analitik verileri toplanir, Dashboard'da gosterilir
       Silindi = Cascade: Tum footfall, heatmap, route verileri silinir
```

### 10.5 Kamera Tespiti Durum Diyagrami

```
  Kamera Tespiti Durum Diyagrami

  (*) --> [Hazir] ------Baslat tiklandi------> [Model Yukleniyor]
              ^                                    |           |
              |                             Model yuklendi  Model
              |                                    |      yuklenemedi
              |                                    v           |
              |    Durdur tiklandi          [Tespit Ediliyor]  v
              +<-------------------------------+   |       [Hata]
              |                                    |          |
              +<------Tekrar denemek icin----------+---------+

  Tespit Ediliyor (ic durumlar):
  +------------------------------------------------------------------+
  |                                                                  |
  |  [Frame Yakala] --> [Kisi Tespit]  --> [Centroid Guncelle]       |
  |       ^              COCO-SSD          person && score >= 0.5    |
  |       |              .detect()              |          |         |
  |       |                              Frame < 10    Her 10 frame  |
  |       |                                 |              |         |
  |       +<--------------------------------+     [Zone Hesapla]     |
  |       +<----------------------------------------------+         |
  |                                                                  |
  +------------------------------------------------------------------+
```

---

## 11. Gelecek Durum (TO-BE) Onerileri

### 11.1 Kisa Vadeli Iyilestirmeler (1-3 Ay)

| # | Oneri | Oncelik | Is Degeri | Teknik Etki |
|---|-------|---------|-----------|-------------|
| TO-01 | **Veritabani tabanli kullanici yonetimi** - ASP.NET Identity ile kullanici kaydi, sifre hashleme, rol yonetimi | Kritik | Gercek coklu kullanici destegi | `AuthService.cs` tamamen yeniden yazilmali, User entity eklenmeli |
| TO-02 | **Refresh token'larin veritabaninda saklanmasi** | Kritik | Sunucu yeniden baslatmada oturum kaybi onlenir | Redis veya PostgreSQL'de tablo |
| TO-03 | **JWT anahtarinin guvende tutulmasi** - User Secrets veya Azure Key Vault | Kritik | Guvenlik acigini kapatir | `appsettings.json`'dan cikarilmali |
| TO-04 | **Input validasyonu** - FluentValidation entegrasyonu | Yuksek | Veri butunlugu ve guvenlik | Tum DTO'lar icin validasyon kurallari |
| TO-05 | **Unit ve integration testleri** - xUnit + Testcontainers | Yuksek | Guvenilirlik, regresyon onleme | Test projesi eklenmeli |
| TO-06 | **Sayfalama (pagination)** - Tum liste endpoint'lerine | Yuksek | Buyuk veri setlerinde performans | Repository ve controller seviyesi |
| TO-07 | **Rate limiting** - IP ve kullanici bazli | Orta | DDoS ve kotu niyetli kullanim onleme | Middleware |
| TO-08 | **Otomatik detection gonderimi** - Belirli araliklarla API'ye gonderim | Orta | Manuel islem gerekmez | Frontend timer mekanizmasi |

### 11.2 Orta Vadeli Iyilestirmeler (3-6 Ay)

| # | Oneri | Is Degeri |
|---|-------|-----------|
| TO-09 | **Coklu magaza karsilastirma dashboard'u** - Yan yana magaza performans karsilastirmasi | Bolge yoneticileri icin karar destegi |
| TO-10 | **Gercek zamanli veri akisi** - SignalR/WebSocket ile anlik heatmap guncellemesi | Anlik durumsal farkindalik |
| TO-11 | **Musteri rota izleme** - Centroid tracker'dan rota verisi olusturma ve API'ye gonderme | Hareket kaliplarini anlama |
| TO-12 | **Lokalizasyon (i18n)** - Turkce/Ingilizce dil destegi | Genis kullanici tabani |
| TO-13 | **PDF/Excel rapor ciktisi** - Analitik verilerin disa aktarimi | Yonetim raporlamasi |
| TO-14 | **Bildirim sistemi** - Anormal yogunluk, doluluk esigi asimi uyarilari | Proaktif yonetim |
| TO-15 | **HttpOnly cookie ile token saklama** - XSS riskini azaltmak icin | Guvenlik iyilestirmesi |
| TO-16 | **Sunucu tarafli kisi tespiti** - YOLO/OpenCV ile daha guvenilir tespit | Daha yuksek dogruluk, gizlilik |

### 11.3 Uzun Vadeli Vizyon (6-12+ Ay)

| # | Oneri | Is Degeri |
|---|-------|-----------|
| TO-17 | **Predictive analytics** - Makine ogrenmesi ile ziyaretci tahmini | Personel planlama ve stok yonetimi |
| TO-18 | **A/B test altyapisi** - Magaza duzenlemelerinin etkisini olcme | Magaza optimizasyonu |
| TO-19 | **Multi-tenant mimari** - Birden fazla perakende zinciri destegi | SaaS is modeli |
| TO-20 | **Mobil uygulama** - React Native ile magaza yoneticisi uygulamasi | Saha erisimi |
| TO-21 | **IoT sensör entegrasyonu** - Kapi sayaclari, BLE beacon, WiFi probe | Daha zengin veri kaynaklari |
| TO-22 | **Anomali tespiti** - Otoamtik anomali belirleme ve uyari | Guvenlik ve operasyonel verimlilik |
| TO-23 | **Magaza 3D modeli** - Gercekci magaza planini 3D olarak gosterme | Daha anlamli gorsellestirme |

---

## 12. Risk Analizi

### 12.1 Is Riskleri

| # | Risk | Olasilik | Etki | Azaltma Stratejisi |
|---|------|----------|------|---------------------|
| BR-R01 | **Gizlilik ihlali** - Kamera verileri kisisel veri kapsaminda (KVKK/GDPR) | Yuksek | Kritik | Videonun yalnizca tarayici icerisinde islenmesi (sunucuya goruntu gitmez) avantajdir. Ancak KVKK uyumluluk dokumantasyonu ve acik riza mekanizmasi gereklidir |
| BR-R02 | **Veri dogrulugu** - COCO-SSD modeli karisik ortamlarda dusuk dogruluk gosterebilir | Orta | Yuksek | Daha gelismis modeller (YOLOv8), sunucu tarafli islem, kamera yerlesim optimizasyonu |
| BR-R03 | **Tek kullanicili sistem** - MVP'de sadece admin/password ile giris | Kesin | Orta | Kullanici yonetim modulu eklenmeli (TO-01) |
| BR-R04 | **Veri kaybi** - Refresh token'lar in-memory | Yuksek | Orta | Kalici depolama cozumu (TO-02) |
| BR-R05 | **Olceklenebilirlik** - Tek sunucu mimarisi | Dusuk (su an) | Orta | Aspire + container orkestrasyonu ile yatay olcekleme hazir |

### 12.2 Teknik Riskler

| # | Risk | Olasilik | Etki | Azaltma Stratejisi |
|---|------|----------|------|---------------------|
| TR-R01 | **Tarayici performansi** - TensorFlow.js GPU kullaniminda cihaz sinirlamalari | Orta | Yuksek | `lite_mobilenet_v2` secimi iyi. Dusuk performansli cihazlarda FPS daha da dusurulmeli |
| TR-R02 | **Ollama bagantisi** - LLM servisi lokal, production'da guvenilir degil | Yuksek | Dusuk | Fallback mekanizmasi mevcut. Bulut LLM API (OpenAI, Anthropic) alternatif olarak eklenebilir |
| TR-R03 | **Veritabani boyutu** - HeatmapData JSONB buyuk veri uretir (20x15 matris) | Orta | Orta | Eski verilerin arsilenmesi, veri sureleri (retention policy), ozet tablolari |
| TR-R04 | **CORS guvenlik acigi** - localhost ile sinirli, production'da guncellenmmesi gerekir | Kesin | Orta | Production ortam icin dogru origin tanimlari |
| TR-R05 | **XSS riski** - JWT token localStorage'da | Orta | Yuksek | HttpOnly cookie'ye gecis (TO-15) |
| TR-R06 | **Test eksikligi** - Hicbir test mevcut degil | Kesin | Yuksek | Test stratejisi ve CI/CD pipeline'i olusturulmali (TO-05) |
| TR-R07 | **Cascade delete riski** - Magaza silindiginde tum analitik veriler kaybolur | Dusuk | Kritik | Soft delete mekanismasi veya arsivleme |
| TR-R08 | **Session yonetimi** - AuthService Scoped olarak kayitli, `_refreshTokens` Dictionary'si instance bazli. Her HTTP request yeni AuthService instance'i alir, dolayisiyla refresh token'lar aslinda calismiyor | Kesin | Kritik | AuthService'i Singleton yapmak veya refresh token'lari veritabaninda/Redis'te saklamak |
| TR-R09 | **WeatherForecast guvenlik acigi** - Yetkilendirme olmadan erisilebilir scaffold endpoint'i | Kesin | Dusuk | Controller ve model dosyalarinin silinmesi |
| TR-R10 | **EnsureCreated riskleri** - Mevcut veritabani uzerinde sema degisiklikleri uygulanmaz, veri kaybi riski | Yuksek | Yuksek | EF Core Migrations'a gecis |

### 12.3 Risk Matrisi

```
  Risk Matrisi (Etki vs Olasilik)

  Yuksek  |  IZLENMELI              |  ONCELIKLI AKSIYON
  Etki    |                         |
          |  * TR-R05 XSS Riski     |  * TR-R08 Session Yonetimi [!]
          |  * TR-R01 Tarayici Perf |  * TR-R06 Test Eksikligi [!]
          |  * BR-R02 Veri Dogrulugu|  * BR-R01 Gizlilik
          |  * TR-R10 EnsureCreated |
          |                         |
  --------|-------------------------|--------------------------
          |  KABUL EDILEBILIR       |  PLANLANMALI
  Dusuk   |                         |
  Etki    |  * TR-R03 DB Boyutu     |  * BR-R03 Tek Kullanici
          |                         |  * BR-R04 Veri Kaybi
          |                         |  * TR-R02 Ollama Bagimlilik
          |                         |  * TR-R09 WeatherForecast
          |                         |
          +-------------------------+--------------------------
            Dusuk Olasilik            Yuksek Olasilik

  [!] = Kritik oncelik
```

---

## Ekler

### Ek A: Dosya Yapisi Ozeti

```
heatTheMap/
├── AppHost.cs                          # Aspire orkestrator
├── heatTheMap.csproj                   # AppHost proje dosyasi
├── heatTheMap.sln                      # Solution dosyasi
│
├── HeatTheMap.Api/                     # Backend API
│   ├── Controllers/
│   │   ├── AnalyticsController.cs      # 7 endpoint
│   │   ├── AuthController.cs           # 2 endpoint
│   │   ├── ChatController.cs           # 1 endpoint
│   │   └── StoresController.cs         # 5 endpoint (CRUD)
│   ├── Data/
│   │   ├── Entities/                   # 4 entity
│   │   ├── DataSeeder.cs              # Seed data
│   │   └── HeatMapDbContext.cs        # EF Core context
│   ├── DTOs/                          # 3 DTO dosyasi
│   ├── Repositories/                  # 2 repository + interface'ler
│   ├── Services/                      # 3 servis + interface'ler
│   └── Program.cs                     # Uygulama yapilandirmasi
│
├── HeatTheMap.ServiceDefaults/         # Altyapi
│   └── Extensions.cs                  # OpenTelemetry, Health, Resilience
│
└── HeatTheMap.Web/                     # Frontend
    └── src/
        ├── components/
        │   ├── chatbot/               # 3 bilesen
        │   ├── dashboard/             # 9 bilesen
        │   ├── detection/             # 3 bilesen (hook dahil)
        │   ├── filters/               # 2 bilesen
        │   └── layout/                # 3 bilesen
        ├── hooks/                     # 3 hook
        ├── lib/                       # 2 yardimci kutuphane
        ├── pages/                     # 2 sayfa
        ├── services/                  # 4 servis
        ├── stores/                    # 2 Zustand store
        └── types/                     # 1 tip tanimlama dosyasi
```

### Ek B: Seed Veri Kaliplari

| Veri Tipi | Magaza Sayisi | Gun Sayisi | Saat Araligi | Kayit/Magaza | Toplam |
|-----------|--------------|------------|-------------|-------------|--------|
| DailyFootfall | 2 | 30 | 09:00-20:00 (12h) | 360 | 720 |
| HeatmapData | 2 | 7 | 09:00-20:00 (12h) | 84 | 168 |
| CustomerRoute | 2 | 7 (random) | - | 100 | 200 |

### Ek C: Renk Kodlamasi (Heatmap)

| Yogunluk Araligi | Renk | RGB |
|-------------------|------|-----|
| 0% - 25% | Mavi -> Turkuaz | (0,0,255) -> (0,255,255) |
| 25% - 50% | Turkuaz -> Yesil | (0,255,255) -> (0,255,0) |
| 50% - 75% | Yesil -> Sari | (0,255,0) -> (255,255,0) |
| 75% - 100% | Sari -> Kirmizi | (255,255,0) -> (255,0,0) |

**Kaynak:** `HeatmapVisualization.tsx:46-66` ve `HeatmapBars.tsx:11-21`

---

### Ek D: Deployment Topolojisi (.NET Aspire)

```
  +============================================+
  |     ASPIRE APPHOST (Orkestrator)           |
  |     heatTheMap.csproj                      |
  |     DistributedApplication                 |
  +======+=========+=========+========+=======+
         |         |         |        |
    AddPostgres  WithPgAdmin AddProject AddNpmApp
    ('postgres')             ('api')   ('web')
         |         |         |        |
         v         v         v        v
  +-----------+ +--------+ +----------+ +----------+
  | PostgreSQL| | pgAdmin| | HeatTheMap| | HeatTheMap|
  | Container | | (Web   | | .Api      | | .Web      |
  | port:5432 | |  UI)   | | .NET 10   | | Vite Dev  |
  | +DataVol. | |        | | Kestrel   | | port:5173 |
  +-----------+ +--------+ +----------+ +----------+
       |             ^           |   ^        ^
       |             |           |   |        |
       +--(.pgAdmin)-+           |   +--------+
       |                         |  WithReference(api)
       +--- AddDatabase ------->+
            ('heatmapdb')        |
                                 |  WithEnvironment
                                 |  Ollama__BaseUrl
                                 v
                          +--------------+
                          | Ollama       |
                          | localhost:   |
                          | 11434        |
                          | (Dis Servis) |
                          +--------------+

  Baslatma Sirasi: PostgreSQL --> API (WaitFor heatmapdb) --> Web
```

**Baslatma Sirasi:** PostgreSQL (heatmapdb hazir) --> API (WaitFor heatmapdb) --> Web (WithReference api)

**Kaynak:** `AppHost.cs:1-23`

### Ek E: Uctan Uca Veri Akisi (End-to-End Data Flow)

```
  Uctan Uca Veri Akisi (End-to-End Data Flow)

  Yonetici    Kamera     TF.js/COCO-SSD  CentroidTracker  ZoneMapper   React UI       .NET API      PostgreSQL
     |           |             |               |              |            |               |              |
     |  ====== 1. KAMERA TESPITI VE VERI TOPLAMA ================================================       |
     |           |             |               |              |            |               |              |
     |--"Baslat" tiklandi---->|               |              |            |               |              |
     |           |<--getUserMedia(640x480)-----|              |----------->|               |              |
     |           |---Video stream------------->|              |            |               |              |
     |           |             |               |              |            |               |              |
     |   +--- HER FRAME (~100ms, 10 FPS) -----loop-----------------------------------+   |              |
     |   |       |             |               |              |            |           |   |              |
     |   |       |       model.detect(video)-->|              |            |           |   |              |
     |   |       |             |--predictions->|              |            |           |   |              |
     |   |       |             | (class,score, |              |            |           |   |              |
     |   |       |             |  bbox)        |              |            |           |   |              |
     |   |       |             |          update(bboxes)----->|            |           |   |              |
     |   |       |             |               |--tracked---->|            |           |   |              |
     |   |       |             |               |  objects,    |            |           |   |              |
     |   |       |             |               |  uniqueCount |            |           |   |              |
     |   |       |             |               |              |            |           |   |              |
     |   |  [Her 10. frame]    |               |  mapDetectionsToZones---->|           |   |              |
     |   |       |             |               |              |--20x15--->|           |   |              |
     |   |       |             |               |              |  matrix   |           |   |              |
     |   |       |             |               |              |  accumulateZones      |   |              |
     |   +-------+-------------+---------------+--------------+-----------+-----------+   |              |
     |           |             |               |              |            |               |              |
     |  ====== 2. VERI GONDERIMI ====================================================================   |
     |           |             |               |              |            |               |              |
     |--"Verileri Gonder"---->|               |              |----------->|               |              |
     |           |             |               |              |   POST /api/analytics/detection---------->|
     |           |             |               |              |            |               |--UPSERT----->|
     |           |             |               |              |            |               |  Footfall    |
     |           |             |               |              |            |               |--INSERT----->|
     |           |             |               |              |            |<--201 Created--|  HeatmapData|
     |           |             |               |              |            |               |              |
     |  ====== 3. DASHBOARD GUNCELLEME ==============================================================   |
     |           |             |               |              |            |               |              |
     |           |             |               |              | invalidateQueries          |              |
     |           |             |               |              |   GET /api/daily-summary-->|              |
     |           |             |               |              |            |               |--SELECT----->|
     |           |             |               |              |            |<-DailySummary--|<--results----|
     |<--KPI kartlari + Heatmap guncellenir----|              |            |               |              |
     |           |             |               |              |            |               |              |
```

### Ek F: AI Chatbot Fonksiyon Cagrisi (Tool Use) Detay Akisi

```
  AI Chatbot Tool Use Akisi

  Kullanici     ChatPanel      ChatController    OllamaService     Ollama LLM     AnalyticsSvc    PostgreSQL
     |              |               |                 |              (llama3.1)        |              |
     |--"Bugun en-->|               |                 |                |               |              |
     |  yogun saat  |               |                 |                |               |              |
     |  kacti?"     |               |                 |                |               |              |
     |              |--POST-------->|                 |                |               |              |
     |              |  /api/chat    |--ProcessQuery-->|                |               |              |
     |              |  {query,      |  Async()        |                |               |              |
     |              |   storeId:1}  |                 |--Check-------->|               |              |
     |              |               |                 |  Availability  |               |              |
     |              |               |                 |                |               |              |
     |   ===== SENARYO A: Ollama Erisilebilir =============================================           |
     |              |               |                 |                |               |              |
     |              |               |                 |--POST /api/--->|               |              |
     |              |               |                 |  chat {model:  |               |              |
     |              |               |                 |  llama3.1,     |               |              |
     |              |               |                 |  tools:[4]}    |               |              |
     |              |               |                 |<-toolCalls:----|               |              |
     |              |               |                 |  get_daily_    |               |              |
     |              |               |                 |  summary       |               |              |
     |              |               |                 |--GetDailySummaryAsync--------->|              |
     |              |               |                 |                |               |--SELECT----->|
     |              |               |                 |                |               |<--results----|
     |              |               |                 |<--DailySummaryDto--------------|              |
     |              |               |                 |--POST /api/--->|               |              |
     |              |               |                 |  chat {tool_   |               |              |
     |              |               |                 |  result:850..} |               |              |
     |              |               |                 |<-"850 ziyaret--|               |              |
     |              |               |                 |  ci, peak:14"  |               |              |
     |              |               |<--ChatResponse--|                |               |              |
     |              |               |                 |                |               |              |
     |   ===== SENARYO B: Ollama Erisilemez ===============================================           |
     |              |               |                 |                |               |              |
     |              |               |                 |--Fallback:-----|               |              |
     |              |               |                 |  Keyword match |               |              |
     |              |               |                 |  "bugun" -->   |               |              |
     |              |               |                 |  GetDailySummaryAsync--------->|              |
     |              |               |                 |                |               |--SELECT----->|
     |              |               |                 |                |               |<--results----|
     |              |               |                 |<--DailySummaryDto--------------|              |
     |              |               |<--Basit metin---|                |               |              |
     |              |               |                 |                |               |              |
     |   ===========================================================================                  |
     |              |               |                 |                |               |              |
     |              |<--{message}---|                 |                |               |              |
     |<--Yanit------|               |                 |                |               |              |
     |  baloncugu   |               |                 |                |               |              |
     |              |               |                 |                |               |              |
```

### Ek G: UI Tasarim Sistemi

#### Renk Paleti

| Kullanim | Token | Hex Kodu | Uygulama |
|----------|-------|----------|----------|
| Birincil (Primary) | `primary-500` | `#0ea5e9` (Sky Blue) | Butonlar, vurgular, linkler |
| Birincil Hover | `primary-600` | `#0284c7` | btn-primary, chat button |
| Birincil Koyu | `primary-700` | `#0369a1` | Hover durumlar |
| Arka Plan | `gray-900` | `#111827` | Sayfa arka plani |
| Kart Arka Plani | `gray-800` | `#1F2937` | card bilesen sinifi |
| Kenar Rengi | `gray-700` | `#374151` | Kenarliklari, boluculer |
| Input Arka Plani | `gray-700` | `#374151` | Form elemanlari |
| Metin (Birincil) | `white` | `#FFFFFF` | Basliklar, degerler |
| Metin (Ikincil) | `gray-400` | `#9CA3AF` | Aciklamalar, etiketler |
| Metin (Soluk) | `gray-500` | `#6B7280` | Ipuclari |
| Basari | `green-500` | `#22c55e` | Tespit aktif, anlik durum |
| Uyari | `yellow-500` | `#eab308` | Model yukleniyor |
| Hata | `red-400/500` | `#f87171/#ef4444` | Hata mesajlari, negatif degerler |

**Kaynak:** `tailwind.config.js:9-21`, `index.css:5-27`

#### Bilesen Sinif Sistemi

| Sinif | CSS Tanimlari | Kullanim |
|-------|---------------|----------|
| `.btn-primary` | `bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors` | Ana aksiyon butonlari |
| `.btn-secondary` | `bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors` | Ikincil butonlar (Logout, Today) |
| `.card` | `bg-gray-800 border border-gray-700 rounded-lg shadow-lg` | Icerik panelleri, KPI kartlari |
| `.input` | `bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500` | Tum form inputlari |

**Kaynak:** `index.css:11-27`

#### Koyu Tema

Uygulama tamamen koyu tema uzerine tasarlanmistir. `body` elemani `bg-gray-900 text-gray-100 antialiased` siniflarini kullanir. Tailwind `darkMode: 'class'` yapilandirmasi mevcut ancak acik tema gecisi uygulanmamistir.

### Ek H: NuGet ve npm Paket Bagimliliklari

#### Backend NuGet Paketleri

| Paket | Versiyon | Amac | Proje |
|-------|----------|------|-------|
| Aspire.AppHost.Sdk | 9.4.2 | Dagitik uygulama orkestrasyonu | AppHost |
| Aspire.Hosting.PostgreSQL | 9.4.2 | PostgreSQL container yonetimi | AppHost |
| Aspire.Hosting.NodeJs | 9.4.2 | Node.js/npm uygulama yonetimi | AppHost |
| Aspire.Npgsql.EntityFrameworkCore.PostgreSQL | 13.1.0 | Aspire-uyumlu PostgreSQL EF Core entegrasyonu | API |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.1 | JWT token dogrulama middleware'i | API |
| Microsoft.AspNetCore.OpenApi | 10.0.1 | OpenAPI/Swagger dokumantasyonu | API |
| Microsoft.EntityFrameworkCore.Design | 10.0.1 | EF Core migration arac destegi | API |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.0 | PostgreSQL icin EF Core provider'i | API |
| Microsoft.Extensions.Http.Resilience | 10.1.0 | Polly tabanli HTTP dayaniklilik (retry, circuit breaker) | ServiceDefaults |
| Microsoft.Extensions.ServiceDiscovery | 10.1.0 | Servis kesfetme altyapisi | ServiceDefaults |
| OpenTelemetry.Exporter.OpenTelemetryProtocol | 1.14.0 | OTLP export (metrik, iz, log) | ServiceDefaults |
| OpenTelemetry.Extensions.Hosting | 1.14.0 | OpenTelemetry host entegrasyonu | ServiceDefaults |
| OpenTelemetry.Instrumentation.AspNetCore | 1.14.0 | ASP.NET Core otomatik enstrumantasyonu | ServiceDefaults |
| OpenTelemetry.Instrumentation.Http | 1.14.0 | HTTP client otomatik enstrumantasyonu | ServiceDefaults |
| OpenTelemetry.Instrumentation.Runtime | 1.14.0 | .NET runtime metrikleri (GC, threadpool) | ServiceDefaults |

#### Frontend npm Paketleri

| Paket | Versiyon | Amac |
|-------|----------|------|
| react | 19.2.0 | UI framework |
| react-dom | 19.2.0 | React DOM renderer |
| react-router-dom | 7.12.0 | Sayfa yonlendirme (routing) |
| @tanstack/react-query | 5.90.16 | Sunucu durumu yonetimi, cache, refetch |
| zustand | 5.0.9 | Hafif istemci durumu yonetimi (state management) |
| axios | 1.13.2 | HTTP istemcisi, interceptor'lar |
| recharts | 3.6.0 | React tabanli grafik kutuphanesi (bar, line chart) |
| three | 0.183.2 | 3D grafik motoru (WebGL) |
| @react-three/fiber | 9.5.0 | Three.js icin React renderer |
| @react-three/drei | 10.7.7 | Three.js yardimci bilesenleri (OrbitControls vb.) |
| @tensorflow/tfjs | 4.22.0 | Tarayici ici makine ogrenmesi runtime'i |
| @tensorflow-models/coco-ssd | 2.2.3 | Nesne tespiti on-egitimli modeli |
| date-fns | 4.1.0 | Tarih formatlama ve islemleri |

### Ek I: Performans Parametreleri ve SLA Degerleri

| Parametre | Deger | Kaynak | Aciklama |
|-----------|-------|--------|----------|
| Kamera FPS | ~10 FPS | `usePersonDetection.ts:74` | 100ms throttle ile sinirlandirilmis |
| Zone birikim periyodu | ~1 saniye (10 frame) | `DetectionPanel.tsx:36` | Her 10 frame'de zone matrisi guncellenir |
| Gunluk ozet yenileme | 60 saniye | `useAnalytics.ts:9` | `refetchInterval: 60000` |
| Heatmap yenileme | 30 saniye | `useAnalytics.ts:63` | `refetchInterval: 30000` |
| Haftalik trend stale suresi | 5 dakika | `useAnalytics.ts:18` | `staleTime: 300000` |
| Magaza listesi stale suresi | Sonsuz | `useAnalytics.ts:54` | `staleTime: Infinity` |
| JWT token suresi | 1 saat | `AuthService.cs:28` | `DateTime.UtcNow.AddHours(1)` |
| Ollama API timeout | 60 saniye | `Program.cs:31` | `TimeSpan.FromSeconds(60)` |
| Basarisiz sorgu tekrar sayisi | 1 | `App.tsx:10` | `retry: 1` |
| Centroid kaybolma toleransi | 30 frame (~3 saniye) | `usePersonDetection.ts:35` | `maxDisappeared = 30` |
| Centroid esleme mesafesi | 80 piksel | `usePersonDetection.ts:35` | `maxDistance = 80` |
| COCO-SSD guven esigi | %50 | `usePersonDetection.ts:83` | `p.score >= 0.5` |

### Ek J: Gap (Bosluk) Analizi

Mevcut uygulama ile uretim ortaminda beklenen yetenekler arasindaki bosluklar:

| # | Alan | Mevcut Durum | Beklenen Durum | Bosluk | Oncelik |
|---|------|-------------|---------------|--------|---------|
| GAP-01 | Kullanici Yonetimi | Hardcoded tek kullanici (admin/password) | Veritabani tabanli coklu kullanici, rol yonetimi, sifre hashleme | Kritik | P0 |
| GAP-02 | Token Saklama | In-memory Dictionary | Redis veya veritabani tabanli kalici saklama | Kritik | P0 |
| GAP-03 | Guvenlik Anahtarlari | Kaynak kodda hardcoded JWT key | User Secrets, Azure Key Vault veya AWS Secrets Manager | Kritik | P0 |
| GAP-04 | Test Altyapisi | Hicbir test yok | Unit, integration, E2E testler + CI/CD pipeline | Buyuk | P1 |
| GAP-05 | Input Validasyonu | Yok | FluentValidation ile tum DTO'lar icin validasyon | Buyuk | P1 |
| GAP-06 | Hata Yonetimi | Bos catch bloklari, genel 500 hatalari | Yapilandirilmis hata yonetimi, problem details (RFC 7807) | Orta | P1 |
| GAP-07 | Sayfalama | Yok | Tum liste endpoint'lerinde cursor/offset pagination | Orta | P2 |
| GAP-08 | Rate Limiting | Yok | IP ve kullanici bazli rate limiting | Orta | P2 |
| GAP-09 | Loglama | Temel - console loglama | Yapilandirilmis loglama, Serilog, log seviyeleri | Kucuk | P2 |
| GAP-10 | CORS | Sadece localhost | Production URL'leri, ortam bazli yapilandirma | Orta | P1 |
| GAP-11 | Musteri Rota Izleme | Seed verisi var, aktif uretim yok | Centroid tracker'dan otomatik rota olusturma | Buyuk | P2 |
| GAP-12 | Lokalizasyon | Karisik Turkce/Ingilizce | Tutarli i18n altyapisi (react-intl veya i18next) | Orta | P3 |
| GAP-13 | Error Boundary | Yok | React Error Boundary bilesenleri | Kucuk | P2 |
| GAP-14 | Otomatik Detection | Manuel gonderim | Periyodik otomatik gonderim (timer) | Orta | P2 |
| GAP-15 | Veritabani Migration | EnsureCreated (dev only) | EF Core Migrations ile surumlu sema yonetimi | Buyuk | P1 |
| GAP-16 | API Dokumantasyonu | OpenApi aktif, dokuman yok | Swagger UI + API aciklamalari | Kucuk | P3 |
| GAP-17 | Gercek Zamanli Veri | Periyodik polling (30-60s) | SignalR/WebSocket ile push bildirimleri | Buyuk | P2 |

### Ek K: WeatherForecast (Scaffold Artigi)

Projede .NET Web API sablon tarafindan otomatik olusturulmus `WeatherForecastController.cs` ve `WeatherForecast.cs` dosyalari bulunmaktadir. Bu dosyalar projenin is mantigi ile ilgisizdir ve temizlenmesi gereken scaffold artigidir.

| Dosya | Yol | Durum |
|-------|-----|-------|
| `WeatherForecastController.cs` | `HeatTheMap.Api/Controllers/` | Gereksiz - kaldirilinabilir |
| `WeatherForecast.cs` | `HeatTheMap.Api/` | Gereksiz - kaldirilinabilir |

**Not:** Bu endpoint `[Authorize]` attribute'u tasimadigindan, yetkilendirme olmadan erisilebilir bir API noktasi olusturmaktadir (guvenlik riski).

**Kaynak:** `WeatherForecastController.cs:7-25` - Route: `GET /WeatherForecast`

---

*Bu dokuman, HeatTheMap projesinin kaynak kodunun kapsamli incelenmesiyle olusturulmustur. Tum is kurallari ve teknik detaylar ilgili kaynak kod referanslariyla desteklenmistir. [INFERRED] olarak isaretlenen maddeler dogrudan koddan degil, baglamdan cikarilmistir.*
