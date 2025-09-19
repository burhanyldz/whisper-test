# Whisper ile Konuşma → Metin

Bu proje, tarayıcı içinde çalışan basit ve kompakt bir Türkçe konuşma → metin (speech-to-text) uygulamasıdır. Uygulama, Transformers.js (Xenova) üzerinden Whisper ONNX modellerini kullanarak mikrofon girişini metne dönüştürür ve seçilmiş bir test metniyle karşılaştırma yapar.

## Öne çıkan özellikler

- 🎤 Mikrofon kaydı (Web Audio API + MediaRecorder)
- 🔄 Gerçek zamanlı olmayan, tarayıcıda çalışan model tabanlı transkripsiyon (Transformers.js pipeline)
- 🧾 20 adet önceden tanımlı Türkçe test metni (kolay karşılaştırma için)
- ⏱ Kayıt ve işleme süreleri (ms → kullanıcıya saniye cinsinden gösterilir)
- 🔍 GitHub-stili basit kelime farkı gösterimi (eklenen/silinen kelimeler)
- 📊 Karakter tabanlı Levenshtein doğruluk yüzdesi
- 📋 Seçili test metnini kopyalama düğmesi
- ⚙ Model seçimi (Tiny / Base / Small) — UI üzerinde model değiştirme

## Hızlı kullanım

1. Proje klasörünü bir tarayıcıda açın veya yerel bir sunucuda çalıştırın (mikrofon izinleri için HTTPS veya localhost gereklidir).
2. Sayfa açıldığında model yüklenene kadar bekleyin. (Model boyutuna göre ilk yükleme birkaç saniyeden dakikalara kadar sürebilir.)
3. Soldaki açılır menüden bir test metni seçin (isteğe bağlı).
4. Model seçimi yapın veya varsayılanı kullanın (`Xenova/whisper-small` varsayılan olarak ayarlanmıştır).
5. "Kaydı Başlat" düğmesine tıklayın, metni yüksek sesle okuyun, sonra düğmeye tekrar tıklayarak kaydı durdurun.
6. Ekranda transkripsiyon, kayıt ve işleme süreleri ile seçili metin arasındaki fark ve doğruluk yüzdesi gösterilecektir.

## Yerel olarak çalıştırma (önerilen)

Tarayıcıda doğrudan dosyayı açabilirsiniz, ancak mikrofon izinleri ve kararlı davranış için bir yerel sunucu kullanılması tercih edilir. Örnek basit sunucu (Python 3):

```bash
python3 -m http.server 8000
# sonra tarayıcıda http://localhost:8000/index.html adresini açın
```

## Kontroller ve UI öğeleri

- Model seçimi: `id="model-select"` — `Xenova/whisper-small` (varsayılan), `Xenova/whisper-base`, `Xenova/whisper-tiny`
- Kayıt düğmesi: `id="record-button"` — model yüklenene kadar devre dışı.
- Test metinleri: `id="test-text-select"` — 20 önayarlı Türkçe paragraf.
- Görüntülenen seçili metin: `id="selected-text"` (kopyalama için `id="copy-text-button"`)
- Transkripsiyon çıkışı: `id="transcription-text"`
- Zaman bilgileri: `id="timing-info"` — kayıt ve işleme sürelerini gösterir
- Metin karşılaştırma: `id="diff-comparison"` — kelime-diff ve doğruluk yüzdesi

## Nasıl çalışır (kısa teknik özet)

- Tarayıcı mikrofonundan `MediaRecorder` aracılığıyla `audio/webm;codecs=opus` formatında kayıt alınır.
- Kayıt durduktan sonra veriler `AudioContext` ile decode edilir ve gerekli ise 16 kHz'e yeniden örneklenir.
- Transformers.js `pipeline('automatic-speech-recognition', modelName)` çağrısıyla `audioData` modeline verilerek transkripsiyon alınır. Kod içinde `language: 'turkish'` parametresi ile Türkçe tercih ediliyor.
- Kullanıcıya gösterilen fark (diff) basit bir kelime-seviyeli yaklaşım ile oluşturulur; doğruluk yüzdesi ise karakter tabanlı Levenshtein mesafesi kullanılarak hesaplanır.

## Model boyutları ve notlar

- UI'da gösterilen tahmini boyutlar (yaklaşık):
	- `Small` — ~250MB
	- `Base` — ~77MB
	- `Tiny` — ~31MB

Not: Gerçek indirme miktarı seçilen ONNX varyantlarına (encoder/decoder/quantized) ve Transformers.js konfigürasyonuna bağlıdır. İnternet bağlantısı ve tarayıcı önbelleği model yükleme süresini etkiler.

## Sorun giderme (troubleshooting)

- Model yüklenmiyorsa konsolu kontrol edin (F12). `this.pipe` veya pipeline hataları genellikle ağ, CORS veya Transformers.js sürümüyle ilgilidir.
- Mikrofon izinleri reddedildiyse tarayıcı adres çubuğundaki izinler bölümünden mikrofonu etkinleştirin.
- Kayıt başlamıyor/MediaRecorder hatası: tarayıcınız `MediaRecorder` API desteğine sahip olmalıdır; Chrome/Chromium en stabil seçenektir.
- Transkripsiyon çok kısa veya boş geliyorsa daha yüksek sesle ve net konuşmayı deneyin veya kayıt süresini uzatın.

## Dosyalar

- `index.html` — Uygulama arayüzü ve kontroller
- `styles.css` — Uygulama stilleri ve düzeni
- `script.js` — Tüm mantık: model yükleme, kayıt, ses işleme, diff ve doğruluk hesaplama

## İleri adımlar (isteğe bağlı)

- Model listesini ve varsayılanı `script.js` içindeki `this.currentModelName` değişkeninden değiştirebilirsiniz.
- Daha gelişmiş karşılaştırma için kelime-morfoloji veya sesli-vurgu uyumlu karşılaştırma artırılabilir.