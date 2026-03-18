# HeatTheMap - AI Model Geliştirme Rehberi

Bu rehber, HeatTheMap projesindeki AI/ML bileşenlerinin nasıl geliştirilebileceğine dair kapsamlı öneriler sunar.

---

## 1. Mevcut Durum Analizi

### Nesne Tespiti (Frontend)
- **Model:** COCO-SSD (MobileNetV2 Lite)
- **Framework:** TensorFlow.js v4.22.0
- **Güven Eşiği:** %40
- **FPS:** ~15 kare/saniye
- **Çalışma Ortamı:** Tarayıcı (WebGL)

### Nesne Takibi
- **Algoritma:** Centroid Tracker + Hungarian Algoritması
- **Maliyet Fonksiyonu:** Öklid mesafesi * (1 - IoU * 0.5)
- **Kaybolma Eşiği:** 30 kare
- **Onaylama Eşiği:** 3 kare

### LLM Chatbot (Backend)
- **Model:** LLaMA 3.1 (Ollama üzerinden)
- **Özellikler:** Fonksiyon çağırma (4 fonksiyon), Türkçe/İngilizce destek
- **Bağlam:** Sabit sistem prompt'u

---

## 2. Nesne Tespiti İyileştirmeleri

### 2.1 Daha İyi Modellere Geçiş

#### YOLOv8 Nano (Önerilen - Kısa Vadeli)
```
Avantajlar:
- COCO-SSD'den 2-3x daha yüksek doğruluk (mAP 37.3 vs ~22)
- Benzer hız performansı (~15ms inference)
- ONNX.js ile tarayıcıda çalışabilir
- Daha iyi küçük nesne tespiti

Uygulama Adımları:
1. ultralytics/ultralytics ile YOLOv8n modelini eğit veya hazır kullan
2. ONNX formatına dönüştür: yolo export model=yolov8n.pt format=onnx
3. Frontend'de onnxruntime-web kullanarak yükle
4. usePersonDetection.ts hook'unu güncelle
```

#### YOLOv8 Custom Training (Orta Vadeli)
```
Avantajlar:
- Mağaza ortamına özel eğitim
- Çok daha yüksek doğruluk
- False positive oranını düşürür

Uygulama Adımları:
1. Mağaza kameralarından 1000-5000 etiketli görüntü topla
2. Roboflow veya CVAT ile etiketle (bounding box)
3. YOLOv8n'i custom dataset ile fine-tune et
4. Model boyutunu optimize et (pruning, quantization)
```

#### YOLO-NAS (Uzun Vadeli)
```
Avantajlar:
- Neural Architecture Search ile optimize edilmiş
- YOLOv8'den %1-2 daha yüksek mAP
- Daha iyi hız-doğruluk dengesi

Not: Henüz tarayıcı desteği sınırlı, backend inference önerilir
```

### 2.2 Model Quantization
```
INT8 Quantization:
- Model boyutunu ~4x küçültür (20MB → 5MB)
- İnference hızını ~2x artırır
- Doğruluk kaybı minimal (~%1-2)

Uygulama:
1. TensorFlow Lite Converter ile quantize et
2. tflite-runtime veya onnxruntime ile inference yap
```

### 2.3 Güven Eşiği Optimizasyonu
```
Mevcut: 0.40 (sabit)
Öneri: Dinamik eşik sistemi

- Kalabalık saatlerde: 0.35 (daha fazla tespit)
- Sakin saatlerde: 0.50 (daha az false positive)
- Ortam ışığına göre ayarlama
- A/B test ile optimal eşik belirleme
```

---

## 3. Takip Algoritması İyileştirmeleri

### 3.1 DeepSORT Entegrasyonu
```
Mevcut: Centroid + Hungarian (sadece konum tabanlı)
Öneri: DeepSORT (görünüm + konum tabanlı)

Avantajlar:
- Re-identification (yeniden tanıma) özelliği
- Kaybolan nesneleri daha iyi eşleştirme
- Kalabalık ortamlarda çok daha iyi performans

Uygulama:
1. Küçük bir Re-ID modeli eğit (128 boyutlu embedding)
2. Cosine similarity ile görünüm eşleştirme ekle
3. Kalman filtresi ile hareket tahmini iyileştir
4. Mevcut centroidTracker.ts'yi genişlet
```

### 3.2 ByteTrack (Alternatif)
```
Avantajlar:
- Düşük güvenli tespitleri de kullanır
- İki aşamalı eşleştirme
- DeepSORT'tan daha hızlı
- Re-ID modeli gerektirmez

Uygulama Karmaşıklığı: Orta
```

### 3.3 Kalman Filtresi Ekleme
```
Mevcut: Basit velocity prediction (EMA, α=0.6)
Öneri: Tam Kalman filtresi

Faydalar:
- Daha doğru hareket tahmini
- Gürültü filtreleme
- Kayıp kare telafisi
- Hız ve ivme tahmini

Durum Vektörü: [x, y, vx, vy, ax, ay, w, h]
```

---

## 4. Isı Haritası Doğruluk İyileştirmeleri

### 4.1 Dwell Time (Bekleme Süresi) Analizi
```
Mevcut: Sadece kişi sayısı
Öneri: Bekleme süresi ağırlıklı ısı haritası

Uygulama:
1. Her takip edilen nesne için zone'da geçirdiği süreyi hesapla
2. Isı haritası = Σ(kişi_sayısı × bekleme_süresi)
3. Bu sayede gerçek ilgi alanları daha doğru belirlenirTracker'a dwell time takibi ekle:
- Her nesne için {zoneId, enterTime, exitTime} kaydet
- Zone değişikliklerini tespit et
- Minimum bekleme süresi filtresi (örn. 3 saniye)
```

### 4.2 Müşteri Yol Haritası (Customer Journey)
```
Mevcut: Zone bazlı anlık snapshot'lar
Öneri: Tam yol haritası takibi

- Her müşteri için waypoint listesi oluştur
- Sık kullanılan rotaları tespit et (Sequential Pattern Mining)
- Mağaza düzeni optimizasyonu için kullan
- Sankey diyagramı ile görselleştir
```

### 4.3 Grid Çözünürlüğü İyileştirme
```
Mevcut: 20×15 sabit grid
Öneri: Adaptive grid

- Yoğun bölgelerde daha ince grid (2x subdivision)
- Boş bölgelerde daha kaba grid
- Quadtree veri yapısı kullan
- Performans etkisi minimal
```

---

## 5. LLM Chatbot Geliştirmeleri

### 5.1 RAG (Retrieval-Augmented Generation) Entegrasyonu
```
Mevcut: Sabit fonksiyon çağrıları (4 adet)
Öneri: RAG pipeline

Mimari:
1. Analitik verilerini günlük olarak vektör veritabanına yaz
2. Kullanıcı sorusunu embedding'e dönüştür
3. En alakalı veri noktalarını bul (semantic search)
4. LLM'e context olarak ver

Araçlar:
- Embedding: sentence-transformers (all-MiniLM-L6-v2)
- Vektör DB: ChromaDB veya Qdrant
- .NET entegrasyonu: Microsoft.SemanticKernel

Avantajlar:
- Daha doğru ve detaylı yanıtlar
- Fonksiyon sınırlaması ortadan kalkar
- Tarihsel trend analizi yapabilir
```

### 5.2 Prompt Engineering İyileştirmeleri
```
Mevcut Sorunlar:
- Sistem prompt'u çok genel
- Yanıt formatı tutarsız
- Context window yönetimi yok

Öneriler:
1. Few-shot örnekleri ekle (örnek soru-cevap çiftleri)
2. Chain-of-thought reasoning kullan
3. Yanıt formatını JSON schema ile zorla
4. Conversation history yönetimi ekle (son 10 mesaj)
5. Mağaza profili bilgisini context'e ekle
```

### 5.3 Streaming Yanıtlar
```
Mevcut: stream: false (tam yanıt bekleme)
Öneri: Server-Sent Events ile streaming

Uygulama:
1. OllamaService'de stream: true kullan
2. ChatController'da SSE endpoint ekle
3. Frontend'de EventSource API kullan
4. Token token yanıt göster

Kullanıcı deneyimi önemli ölçüde iyileşir
```

### 5.4 Fonksiyon Çağrıları Genişletme
```
Mevcut Fonksiyonlar: 4 adet
Önerilen Yeni Fonksiyonlar:

1. get_peak_occupancy(date, zoneId) → Belirli bölgenin pik doluluk zamanı
2. get_customer_flow(startDate, endDate) → Müşteri akış analizi
3. get_conversion_rate(date) → Giriş/çıkış oranı analizi
4. compare_stores(storeId1, storeId2, metric) → Mağaza karşılaştırma
5. get_anomalies(date) → Anormal trafik tespiti
6. get_heatmap_insights(date) → Isı haritası yorumlama
7. predict_traffic(date, hour) → Trafik tahmini
```

### 5.5 Daha Güçlü Model Seçenekleri
```
Mevcut: LLaMA 3.1 (7B)
Alternatifler:

1. Mistral 7B - Daha iyi Türkçe desteği, hızlı
2. LLaMA 3.1 70B - Çok daha yüksek kalite (GPU gerektirir)
3. Phi-3 Mini - Çok hafif, edge deployment için ideal
4. Qwen 2.5 - Çok dilli, güçlü fonksiyon çağırma

Cloud Alternatifleri:
- Claude API (Anthropic) - En iyi analitik anlama
- GPT-4o Mini (OpenAI) - Düşük maliyet, yüksek kalite
- Gemini Flash (Google) - Hızlı, çok modlu
```

---

## 6. Yeni AI Özellikleri

### 6.1 Anomali Tespiti
```
Amaç: Normal dışı müşteri davranışlarını tespit et

Yöntemler:
1. İstatistiksel: Z-score, IQR tabanlı eşik belirleme
2. ML: Isolation Forest, Local Outlier Factor
3. Zaman Serisi: ARIMA tabanlı tahmin ve sapma tespiti

Kullanım Alanları:
- Beklenmedik kalabalık uyarısı
- Düşük trafik alarmı
- Anormal bekleme süresi tespiti
- Güvenlik olayları tespiti
```

### 6.2 Trafik Tahmini
```
Amaç: Gelecek saatler/günler için müşteri trafiği tahmin et

Model: Prophet (Facebook) veya LSTM

Özellikler:
- Saatlik tahmin (sonraki 24 saat)
- Günlük tahmin (sonraki 7 gün)
- Mevsimsellik analizi
- Tatil/kampanya etkisi modelleme

Uygulama:
1. Geçmiş veriyi toplayın (minimum 3 ay)
2. Prophet modeli ile eğitin
3. REST API endpoint olarak sunun
4. Dashboard'da tahmin grafiği gösterin
```

### 6.3 Kuyruk Algılama
```
Amaç: Kasa/gişe önündeki kuyrukları tespit et

Yöntem:
1. Belirli bölgelerdeki kişi yoğunluğunu izle
2. Bekleme süresi eşiğini aş → kuyruk alarm
3. Ortalama bekleme süresini hesapla
4. Kasa açma/kapama önerileri sun

Gereksinimler:
- Kasa bölgelerini zone olarak tanımla
- Bekleme süresi takibi (Bölüm 4.1)
- Eşik değerlerini mağazaya göre ayarla
```

### 6.4 Demografik Analiz (İleri Seviye)
```
Dikkat: Gizlilik ve KVKK mevzuatına uyum zorunludur!

Olası Özellikler:
- Yaş grubu tahmini (genç, orta yaş, yaşlı)
- Cinsiyet tahmini
- Grup tespiti (aile, arkadaş grubu, bireysel)

Model: Özel eğitilmiş CNN (MobileNetV3 tabanlı)

Gizlilik Önlemleri:
1. Görüntüler hiçbir zaman kaydedilmez
2. Sadece anonimleştirilmiş istatistikler saklanır
3. Edge'de inference (veri sunucuya gitmez)
4. KVKK/GDPR uyumluluğu denetlenir
5. Kullanıcı onayı ve şeffaflık
```

### 6.5 Müşteri Segmentasyonu
```
Amaç: Ziyaretçi davranış kalıplarını grupla

Yöntem: K-Means veya DBSCAN kümeleme

Özellikler:
- Hızlı geçiş yapanlar vs uzun süre kalanlar
- Belirli bölgelere yönelen segmentler
- Sık gelen müşteri profilleri
- Zaman bazlı segment analizi (sabah/akşam müşterisi)
```

---

## 7. Performans Optimizasyonu

### 7.1 WebGPU Backend
```
Mevcut: WebGL (TensorFlow.js varsayılan)
Öneri: WebGPU (2-5x hız artışı)

Uygulama:
1. tf.setBackend('webgpu') çağrısı ekle
2. Fallback olarak WebGL'i koru
3. Tarayıcı uyumluluğunu kontrol et (Chrome 113+)

Beklenen İyileşme:
- İnference süresi: ~66ms → ~20-30ms
- FPS: ~15 → ~30-45
```

### 7.2 Web Worker ile Paralel İşleme
```
Mevcut: Ana thread'de detection + tracking
Öneri: Web Worker'a taşı

Uygulama:
1. Detection logic'ini Web Worker'a taşı
2. OffscreenCanvas ile video kare aktarımı
3. SharedArrayBuffer ile hızlı veri paylaşımı
4. Ana thread UI'ı bloklamaz

Faydalar:
- Daha smooth UI deneyimi
- Daha yüksek FPS
- Browser donmaları ortadan kalkar
```

### 7.3 Model Caching & Preloading
```
Mevcut: Her sayfa yüklemede model tekrar yüklenir
Öneri: IndexedDB ile model caching

Uygulama:
1. Model dosyalarını IndexedDB'ye kaydet
2. Versiyon kontrolü ekle
3. İlk yükleme sonrası cache'den oku
4. Service Worker ile background güncelleme

Beklenen İyileşme:
- İlk yükleme: ~3-5 saniye → ~500ms (cache'den)
```

### 7.4 Edge Deployment (İleri Seviye)
```
Amaç: Tarayıcı yerine yerel cihazda çalıştır

Seçenekler:
1. NVIDIA Jetson Nano (~$100)
   - TensorRT ile optimize inference
   - 30+ FPS @ YOLOv8n
   - Düşük güç tüketimi

2. Intel Neural Compute Stick
   - OpenVINO framework
   - USB ile kolay kurulum

3. Raspberry Pi 5 + Hailo-8
   - En uygun fiyat
   - Yeterli performans (15-20 FPS)

Avantajlar:
- Tarayıcı bağımsız çalışma
- Daha yüksek doğruluk (daha büyük model kullanılabilir)
- Daha düşük gecikme
```

---

## 8. Doğruluk Metrikleri ve Değerlendirme

### 8.1 Detection Metrics
```
Ölçülmesi Gerekenler:
1. Precision (Kesinlik): Doğru tespit / Toplam tespit
2. Recall (Duyarlılık): Doğru tespit / Gerçek kişi sayısı
3. F1-Score: Precision ve Recall'ın harmonik ortalaması
4. mAP@0.5: Mean Average Precision @ IoU 0.5
5. False Positive Rate: Yanlış tespit oranı

Uygulama:
1. Manuel etiketlenmiş test seti oluştur (100-500 kare)
2. Model çıktılarını karşılaştır
3. Confusion matrix oluştur
4. Metrikleri dashboard'da göster
```

### 8.2 Tracking Metrics
```
Ölçülmesi Gerekenler:
1. MOTA (Multiple Object Tracking Accuracy)
2. MOTP (Multiple Object Tracking Precision)
3. ID Switch sayısı (kimlik değişimi)
4. Track fragmentation (takip kopması)
5. Mostly Tracked / Mostly Lost oranı

Uygulama:
1. MOTChallenge formatında ground truth hazırla
2. py-motmetrics kütüphanesi ile hesapla
3. Haftalık otomatik raporlama
```

### 8.3 Counting Accuracy
```
Ölçülmesi Gerekenler:
1. Giriş/çıkış sayımı doğruluğu
2. Mean Absolute Error (MAE)
3. Mean Absolute Percentage Error (MAPE)

Test Yöntemi:
1. Manuel sayım ile karşılaştır (1-2 saatlik video)
2. Farklı saatlerde test et (kalabalık vs sakin)
3. Hata oranını raporla ve takip et

Hedef: MAE < %5
```

### 8.4 A/B Test Framework
```
Amaç: Model değişikliklerini güvenli şekilde karşılaştır

Uygulama:
1. Feature flag sistemi kur
2. Yeni model → %10 trafikte test et
3. Metrikleri paralel ölç
4. İstatistiksel anlamlılık kontrolü
5. Başarılı ise kademeli yaygınlaştır
```

---

## 9. Veri Pipeline ve Sürekli Öğrenme

### 9.1 Veri Toplama Stratejisi
```
Etiketleme:
1. Semi-automated labeling: Model çıktılarını insan doğrular
2. Active learning: Model'in en az emin olduğu örnekleri seç
3. Crowdsourcing: Roboflow veya Labelbox kullan

Veri Miktarı Hedefleri:
- Minimum: 1,000 etiketli görüntü
- İdeal: 5,000-10,000 etiketli görüntü
- Her mağaza türünden örnekler
```

### 9.2 Data Augmentation
```
Offline Augmentation:
- Brightness/contrast değişimi (mağaza ışığı simülasyonu)
- Blur (kamera kalitesi simülasyonu)
- Rotation (±15 derece)
- Scale (uzak/yakın müşteri simülasyonu)

Online Augmentation (Training sırasında):
- Mosaic augmentation
- MixUp
- Random erasing
```

### 9.3 Sürekli Öğrenme Pipeline
```
1. Veri Toplama: Mağaza kameralarından otomatik veri toplama
2. Etiketleme: Active learning ile verimli etiketleme
3. Eğitim: Aylık model güncelleme
4. Değerlendirme: Test seti ile doğruluk kontrolü
5. Deployment: A/B test sonrası yaygınlaştırma
6. İzleme: Gerçek zamanlı performans takibi

CI/CD Entegrasyonu:
- GitHub Actions ile otomatik eğitim pipeline
- MLflow veya Weights & Biases ile experiment tracking
- Model registry ile versiyon yönetimi
```

---

## 10. Uygulama Öncelik Sıralaması

| Öncelik | Görev | Zorluk | Etki | Süre |
|---------|-------|--------|------|------|
| 1 | Güven eşiği optimizasyonu | Düşük | Orta | 1-2 gün |
| 2 | Kalman filtresi ekleme | Orta | Yüksek | 1 hafta |
| 3 | Dwell time analizi | Orta | Yüksek | 1 hafta |
| 4 | Doğruluk metrikleri ekleme | Düşük | Yüksek | 2-3 gün |
| 5 | LLM streaming yanıtlar | Düşük | Orta | 2-3 gün |
| 6 | Fonksiyon çağrıları genişletme | Düşük | Orta | 3-5 gün |
| 7 | Web Worker entegrasyonu | Orta | Yüksek | 1 hafta |
| 8 | YOLOv8 Nano geçişi | Yüksek | Çok Yüksek | 2-3 hafta |
| 9 | RAG entegrasyonu | Yüksek | Yüksek | 2-3 hafta |
| 10 | DeepSORT entegrasyonu | Yüksek | Yüksek | 3-4 hafta |
| 11 | Anomali tespiti | Orta | Orta | 2 hafta |
| 12 | Trafik tahmini | Yüksek | Orta | 3-4 hafta |
| 13 | Edge deployment | Çok Yüksek | Yüksek | 1-2 ay |

---

## Kaynaklar ve Referanslar

- [YOLOv8 Dokümantasyonu](https://docs.ultralytics.com/)
- [TensorFlow.js Rehberi](https://www.tensorflow.org/js)
- [DeepSORT Paper](https://arxiv.org/abs/1703.07402)
- [ByteTrack Paper](https://arxiv.org/abs/2110.06864)
- [Ollama Fonksiyon Çağırma](https://ollama.com/blog/tool-support)
- [Microsoft Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/)
- [MOTChallenge Benchmark](https://motchallenge.net/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
