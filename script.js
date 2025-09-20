import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Configure Transformers.js environment
env.allowRemoteModels = true;
env.allowLocalModels = false;

class SpeechToTextApp {
    constructor() {
        this.pipe = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.isModelLoaded = false;
        this.currentModelName = 'Xenova/whisper-small'; // Default to multilingual small model (better than base)
        
        // Timing tracking
        this.recordingStartTime = null;
        this.recordingDuration = null;
        this.processingStartTime = null;
        this.processingDuration = null;
        
        // Replay functionality
        this.lastRecordedBlob = null;
        this.lastProcessedAudioData = null;
        this.modelCache = new Map(); // Cache loaded models
        this.resultCache = new Map(); // Cache processing results per recording per model
        this.currentRecordingId = null; // Unique ID for current recording session
        this.availableModels = ['Xenova/whisper-tiny', 'Xenova/whisper-base', 'Xenova/whisper-small'];
        
        // Turkish test texts
        this.turkishTexts = [
            "Yapay zeka teknolojileri günümüzde hızla gelişiyor. Makine öğrenmesi algoritmaları sayesinde bilgisayarlar artık insan benzeri görevleri yerine getirebiliyor. Bu gelişmeler tıptan eğitime kadar birçok alanda devrim yaratıyor.",
            "Doğa korunması tüm insanlığın sorumluluğudur. Ormanları korumak, temiz hava solumak ve gelecek nesillere yaşanabilir bir dünya bırakmak için bugünden harekete geçmeliyiz. Küçük adımlar büyük değişimlere yol açar.",
            "Türk sanatı binlerce yıllık zengin bir geçmişe sahiptir. Geleneksel el sanatlarından modern resme, müzikten edebiyata kadar uzanan bu kültürel miras dünyaca takdir edilir. Sanat insanlığın ortak dilidir.",
            "Düzenli spor yapmak hem fiziksel hem de ruhsal sağlık için çok önemlidir. Günde yarım saat yürüyüş bile vücudumuzda olumlu değişiklikler yaratır. Sağlıklı yaşam alışkanlıkları uzun vadede büyük farklar yaratır.",
            "Eğitim hayatın temel taşıdır. Öğrenme süreci doğumla başlar ve ölümle son bulur. Her yaşta yeni bilgiler edinmek ve kendimizi geliştirmek mümkündür. Merak ve öğrenme isteği en değerli hazinelerimizdir.",
            "Türk mutfağı dünyada en zengin lezzetlerden birine sahiptir. Kebaptan baklava'ya, çorbadan meze'ye kadar uzanan bu çeşitlilik damak tadımızı şımartır. Yemek kültürü toplumların kimliğini yansıtan önemli bir unsurdur.",
            "Seyahat etmek ufkumuzu genişletir ve farklı kültürleri tanımamızı sağlar. Her yeni şehir, her yeni ülke bize farklı perspektifler sunar. Gezi anıları yaşamımızın en değerli hatıralarıdır.",
            "Müzik evrensel bir dildir. Farklı kültürlerden insanları bir araya getirir ve duygularımızı en güzel şekilde ifade eder. Dans ise bedenin müzikle buluştuğu büyülü bir sanattır.",
            "Bilimsel araştırmalar insanlığın ilerlemesinin temelini oluşturur. Her yeni keşif, her yeni buluş dünyamızı daha iyi anlamamıza yardımcı olur. Bilim meraktan doğar ve sabırla büyür.",
            "Türk tarihi ve medeniyeti dünya tarihinde önemli bir yere sahiptir. Anadolu toprakları binlerce yıldır farklı kültürlere ev sahipliği yapmıştır. Bu zengin miras günümüze kadar ulaşan değerli bir hazinedir.",
            "Aile bağları hayatımızdaki en güçlü destektir. Sevgi, saygı ve anlayışla örülü aile ilişkileri mutluluğumuzun temelidir. Dostluklar ise yaşamımızı renklendiren güzel bağlardır.",
            "İş hayatında başarı için azim, sabır ve sürekli öğrenme gereklidir. Kariyerimizi planlarken hem kişisel hedeflerimizi hem de toplumsal fayda sağlayacak alanları göz önünde bulundurmalıyız.",
            "Hobiler hayatımıza anlam katar ve stresimizi azaltır. İster kitap okumak, ister bahçıvanlık yapmak olsun, sevdiğimiz aktiviteler ruhumuzu besler. Boş zamanlarımızı değerlendirmek önemli bir yaşam becerisidir.",
            "Kitaplar bilginin ve hayal gücünün kapılarını açar. Okumak kelime dağarcığımızı geliştirir, empati yetimizi artırır ve farklı dünyaları keşfetmemizi sağlar. Edebiyat insanlık deneyiminin en güzel yansımalarından biridir.",
            "Mevsimler doğanın büyülü döngüsünü gösterir. İlkbaharın tazeliği, yazın sıcaklığı, sonbaharın renkleri ve kışın sakinliği, her biri kendine özgü güzellikler sunar. Hava durumu günlük hayatımızı etkileyen önemli bir faktördür.",
            "Şehir hayatının dinamizmi ve kırsal yaşamın huzuru arasında denge kurmak modern insanın arayışıdır. Büyük şehirler fırsatlar sunar ancak doğayla bağımızı koparmamak da önemlidir.",
            "Ulaşım teknolojileri sürekli gelişiyor. Toplu taşıma sistemleri şehirlerin nefes almasını sağlar. Trafik sorunları ise çözüm bekleyen önemli kentsel problemlerdir. Sürdürülebilir ulaşım geleceğin anahtarıdır.",
            "Bilinçli tüketim hem çevreyi korur hem de ekonomik olmamızı sağlar. Alışveriş yaparken ihtiyaçlarımızı gereksinimlerimizdën ayırmak önemlidir. Kaliteli ürünler uzun vadede daha ekonomik olabilir.",
            "Sosyal medya modern iletişimin vazgeçilmez parçası haline geldi. Bu platformlar bilgi paylaşımını kolaylaştırırken, dijital okuryazarlık ve eleştirel düşünme becerileri de giderek önem kazanıyor.",
            "Rüyalar bilinçaltımızın gizemli mesajlarıdır. Hayal kurmak ise yaratıcılığımızı besleyen ve hedeflerimizi belirlememize yardımcı olan güçlü bir araçtır. İnsan hayal gücü sınırsız bir potansiyele sahiptir."
        ];
        
        this.initializeElements();
        this.initializeModel();
    }
    
    initializeElements() {
        this.recordButton = document.getElementById('record-button');
        this.transcriptionText = document.getElementById('transcription-text');
        this.statusDot = document.querySelector('.status-dot');
        this.statusText = document.querySelector('.status-text');
        this.buttonText = document.querySelector('.button-text');
        this.modelSelect = document.getElementById('model-select');
        this.testTextSelect = document.getElementById('test-text-select');
        this.selectedTextDisplay = document.getElementById('selected-text');
        this.copyTextButton = document.getElementById('copy-text-button');
        
        // Replay section elements
        this.replaySection = document.getElementById('replay-section');
        this.replayButtons = document.querySelectorAll('.replay-button');

        // Restore saved model from localStorage if present and valid, otherwise use default
        try {
            const savedModel = localStorage.getItem('whisper_selected_model');
            if (savedModel) {
                const optionExists = Array.from(this.modelSelect.options).some(opt => opt.value === savedModel);
                if (optionExists) {
                    this.currentModelName = savedModel;
                }
            }
        } catch (e) {
            // ignore storage errors (e.g., private mode)
            console.warn('localStorage not available:', e);
        }

        // Make selected model in dropdown match current model
        this.modelSelect.value = this.currentModelName;
        
        this.recordButton.addEventListener('click', () => this.toggleRecording());
        this.modelSelect.addEventListener('change', () => this.onModelChange());
        this.testTextSelect.addEventListener('change', () => this.onTextSelection());
        this.copyTextButton.addEventListener('click', () => this.copySelectedText());
        
        // Add event listeners for replay buttons
        this.replayButtons.forEach(button => {
            button.addEventListener('click', (e) => this.replayWithModel(e.target.dataset.model));
        });
    }
    
    async initializeModel() {
        try {
            const modelName = this.currentModelName;
            const modelSize = modelName.split('-').pop(); // Extract size (tiny, base, small, etc.)
            
            this.updateStatus('loading', `Whisper ${modelSize} modeli yükleniyor...`);
            this.buttonText.textContent = 'Model Yükleniyor...';
            this.recordButton.disabled = true;
            this.modelSelect.disabled = true;
            
            // Check if model is already cached
            if (this.modelCache.has(modelName)) {
                this.pipe = this.modelCache.get(modelName);
                console.log(`${modelName} loaded from cache`);
            } else {
                // Load the selected multilingual Whisper model
                this.pipe = await pipeline('automatic-speech-recognition', modelName);
                // Cache the loaded model
                this.modelCache.set(modelName, this.pipe);
                console.log(`${modelName} (multilingual) model loaded and cached`);
            }
            
            this.isModelLoaded = true;
            this.updateStatus('ready', 'Kayda hazır');
            this.recordButton.disabled = false;
            this.modelSelect.disabled = false;
            this.buttonText.textContent = 'Kaydı Başlat';
            
        } catch (error) {
            console.error('Error loading model:', error);
            this.updateStatus('error', 'Model yüklenirken hata oluştu');
            this.buttonText.textContent = 'Model Yüklenemedi';
            this.modelSelect.disabled = false;
        }
    }
    
    async onModelChange() {
        const newModelName = this.modelSelect.value;
        if (newModelName !== this.currentModelName) {
            this.currentModelName = newModelName;
            // Persist the user's model choice so it survives reloads
            try {
                localStorage.setItem('whisper_selected_model', newModelName);
            } catch (e) {
                console.warn('Could not persist model selection to localStorage:', e);
            }
            this.isModelLoaded = false;
            this.pipe = null;
            await this.initializeModel();
        }
    }
    
    updateStatus(type, message) {
        this.statusText.textContent = message;
        this.statusDot.className = `status-dot ${type}`;
    }
    
    async toggleRecording() {
        if (!this.isModelLoaded) {
            alert('Model hâlâ yükleniyor. Lütfen bekleyin...');
            return;
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            this.audioChunks = [];
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.processAudio();
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now(); // Start timing
            
            // Clear previous replay section when starting new recording
            if (this.replaySection) {
                this.replaySection.style.display = 'none';
            }
            
            this.recordButton.classList.add('recording');
            this.buttonText.textContent = 'Kaydı Durdur';
            this.updateStatus('recording', 'Kaydediliyor... Durdurmak için tıklayın');
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Mikrofona erişilirken hata oluştu. Lütfen mikrofon izinlerini verdiğinizden emin olun.');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordingDuration = Date.now() - this.recordingStartTime; // Calculate duration
            
            this.recordButton.classList.remove('recording');
            this.buttonText.textContent = 'İşleniyor...';
            this.updateStatus('processing', 'Ses işleniyor...');
        }
    }
    
    async processAudio() {
        this.processingStartTime = Date.now(); // Start processing timer
        try {
            if (this.audioChunks.length === 0) {
                this.resetUI();
                return;
            }
            
            // Create audio blob
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
            
            // Store the recording for replay functionality
            this.lastRecordedBlob = audioBlob;
            
            // Generate unique recording ID and clear old results
            this.currentRecordingId = Date.now().toString();
            this.resultCache.clear();
            
            // Convert to ArrayBuffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Create audio context to process the audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });
            
            // Decode audio data
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Get audio data as Float32Array (Whisper expects mono audio at 16kHz)
            let audioData = audioBuffer.getChannelData(0);
            
            // Resample to 16kHz if necessary
            if (audioBuffer.sampleRate !== 16000) {
                audioData = this.resampleAudio(audioData, audioBuffer.sampleRate, 16000);
            }
            
            // Store processed audio data for replay
            this.lastProcessedAudioData = audioData;
            
            this.updateStatus('processing', 'Konuşma metne dönüştürülüyor...');
            
            // Run inference with Turkish language preference
            const result = await this.pipe(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'turkish', // Specify Turkish language for better recognition
                task: 'transcribe'
            });
            
            // Display result
            const transcription = result.text.trim();
            this.processingDuration = Date.now() - this.processingStartTime; // Calculate processing duration
            
            // Cache the result for current model
            this.resultCache.set(this.currentModelName, {
                transcription: transcription,
                processingDuration: this.processingDuration,
                timestamp: Date.now()
            });
            
            if (transcription) {
                this.transcriptionText.value = transcription;
                this.updateStatus('ready', 'Transkripsiyon tamamlandı');
                this.displayTimingInfo();
                this.displayDiffComparison(transcription);
                this.showReplaySection(); // Show replay buttons after successful transcription
            } else {
                this.transcriptionText.value = 'Ses algılanamadı. Lütfen daha net konuşmayı deneyin.';
                this.updateStatus('ready', 'Ses algılanamadı');
                this.displayTimingInfo();
                this.showReplaySection(); // Show replay buttons even if transcription failed
            }
            
        } catch (error) {
            console.error('Error processing audio:', error);
            this.transcriptionText.value = 'Ses işlenirken hata oluştu. Lütfen tekrar deneyin.';
            this.updateStatus('ready', 'Hata oluştu');
        } finally {
            this.resetUI();
        }
    }
    
    resampleAudio(audioData, originalSampleRate, targetSampleRate) {
        if (originalSampleRate === targetSampleRate) {
            return audioData;
        }
        
        const ratio = originalSampleRate / targetSampleRate;
        const newLength = Math.round(audioData.length / ratio);
        const resampledData = new Float32Array(newLength);
        
        for (let i = 0; i < newLength; i++) {
            const originalIndex = i * ratio;
            const index = Math.floor(originalIndex);
            const fraction = originalIndex - index;
            
            if (index + 1 < audioData.length) {
                resampledData[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
            } else {
                resampledData[i] = audioData[index];
            }
        }
        
        return resampledData;
    }
    
    resetUI() {
    this.buttonText.textContent = 'Kaydı Başlat';
        this.recordButton.classList.remove('recording');
        this.recordButton.disabled = false;
        
        setTimeout(() => {
            this.updateStatus('ready', 'Kayda hazır');
        }, 2000);
    }
    
    displayTimingInfo() {
        const timingInfoEl = document.getElementById('timing-info');
        if (timingInfoEl && this.recordingDuration && this.processingDuration) {
            const recordingSeconds = (this.recordingDuration / 1000).toFixed(1);
            const processingSeconds = (this.processingDuration / 1000).toFixed(1);
            timingInfoEl.innerHTML = `
                <span class="timing-item">📼 Kayıt: ${recordingSeconds}s</span>
                <span class="timing-item">⚡ İşleme: ${processingSeconds}s</span>
            `;
            timingInfoEl.style.display = 'flex';
        }
    }
    
    displayDiffComparison(transcription) {
        const selectedTextIndex = this.testTextSelect.value;
        if (selectedTextIndex && this.turkishTexts[selectedTextIndex]) {
            const originalText = this.turkishTexts[selectedTextIndex];
            const diffContainer = document.getElementById('diff-comparison');
            if (diffContainer) {
                const diffHtml = this.generateDiffHtml(originalText, transcription);
                const accuracyPercentage = this.calculateAccuracyPercentage(originalText, transcription);
                diffContainer.innerHTML = `
                    <div class="diff-header">
                        Metin Karşılaştırması
                        <span class="accuracy-percentage">%${accuracyPercentage} doğruluk</span>
                    </div>
                    <div class="diff-content">${diffHtml}</div>
                `;
                diffContainer.style.display = 'block';
            }
        }
    }
    
    generateDiffHtml(original, transcribed) {
        // Normalize text: remove punctuation and convert to Turkish lowercase
        const toTurkishLowerCase = (text) => text.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        const normalizePunctuation = (text) => toTurkishLowerCase(text).replace(/[.,;:!?'"()[\]{}\-–—]/g, '').replace(/\s+/g, ' ').trim();
        
        const originalWords = normalizePunctuation(original).split(/\s+/);
        const transcribedWords = normalizePunctuation(transcribed).split(/\s+/);
        
        // Create a simple diff using word matching
        let result = '';
        let originalIndex = 0;
        let transcribedIndex = 0;
        
        while (originalIndex < originalWords.length || transcribedIndex < transcribedWords.length) {
            if (originalIndex >= originalWords.length) {
                // Only transcribed words left (additions)
                result += `<span class="diff-added">+${transcribedWords[transcribedIndex]}</span> `;
                transcribedIndex++;
            } else if (transcribedIndex >= transcribedWords.length) {
                // Only original words left (deletions)
                result += `<span class="diff-removed">-${originalWords[originalIndex]}</span> `;
                originalIndex++;
            } else if (originalWords[originalIndex] === transcribedWords[transcribedIndex]) {
                // Words match
                result += `<span class="diff-unchanged">${originalWords[originalIndex]}</span> `;
                originalIndex++;
                transcribedIndex++;
            } else {
                // Words don't match - try to find next match
                const nextMatch = this.findNextMatch(originalWords, transcribedWords, originalIndex, transcribedIndex);
                
                if (nextMatch.originalSkip > 0) {
                    // Words were deleted from original
                    for (let i = 0; i < nextMatch.originalSkip; i++) {
                        result += `<span class="diff-removed">-${originalWords[originalIndex + i]}</span> `;
                    }
                    originalIndex += nextMatch.originalSkip;
                }
                
                if (nextMatch.transcribedSkip > 0) {
                    // Words were added to transcription
                    for (let i = 0; i < nextMatch.transcribedSkip; i++) {
                        result += `<span class="diff-added">+${transcribedWords[transcribedIndex + i]}</span> `;
                    }
                    transcribedIndex += nextMatch.transcribedSkip;
                }
            }
        }
        
        return result.trim();
    }
    
    findNextMatch(originalWords, transcribedWords, originalStart, transcribedStart) {
        // Simple heuristic: look ahead up to 3 words to find a match
        const maxLookAhead = 3;
        
        for (let origSkip = 0; origSkip <= maxLookAhead && originalStart + origSkip < originalWords.length; origSkip++) {
            for (let transSkip = 0; transSkip <= maxLookAhead && transcribedStart + transSkip < transcribedWords.length; transSkip++) {
                if (originalWords[originalStart + origSkip] === transcribedWords[transcribedStart + transSkip]) {
                    return { originalSkip: origSkip, transcribedSkip: transSkip };
                }
            }
        }
        
        // No match found, assume single word difference
        return { originalSkip: 1, transcribedSkip: 1 };
    }
    
    calculateAccuracyPercentage(original, transcribed) {
        // Normalize both texts for comparison (Turkish lowercase, remove punctuation and extra spaces)
        const toTurkishLowerCase = (text) => text.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        const normalizeText = (text) => toTurkishLowerCase(text).replace(/[.,;:!?'"()[\]{}\-–—]/g, '').replace(/\s+/g, ' ').trim();
        const originalNormalized = normalizeText(original);
        const transcribedNormalized = normalizeText(transcribed);
        
        // Use Levenshtein distance algorithm for character-based similarity
        const distance = this.levenshteinDistance(originalNormalized, transcribedNormalized);
        const maxLength = Math.max(originalNormalized.length, transcribedNormalized.length);
        
        if (maxLength === 0) return 100;
        
        const accuracy = ((maxLength - distance) / maxLength) * 100;
        return Math.round(accuracy);
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        // Create matrix
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        // Fill matrix
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    onTextSelection() {
        const selectedIndex = this.testTextSelect.value;
        if (selectedIndex === '') {
            this.selectedTextDisplay.innerHTML = '<p class="placeholder-text">Yukarıdan bir metin seçin ve yüksek sesle okuyun.</p>';
            this.copyTextButton.style.display = 'none';
        } else {
            const selectedText = this.turkishTexts[parseInt(selectedIndex)];
            this.selectedTextDisplay.innerHTML = `<p>${selectedText}</p>`;
            this.copyTextButton.style.display = 'block';
        }
    }
    
    copySelectedText() {
        const textElement = this.selectedTextDisplay.querySelector('p:not(.placeholder-text)');
        if (textElement) {
            navigator.clipboard.writeText(textElement.textContent).then(() => {
                const originalText = this.copyTextButton.textContent;
                this.copyTextButton.textContent = 'Kopyalandı!';
                this.copyTextButton.style.background = '#00a085';
                
                setTimeout(() => {
                    this.copyTextButton.textContent = originalText;
                    this.copyTextButton.style.background = '#00b894';
                }, 1500);
            }).catch(err => {
                console.error('Text copying failed:', err);
                alert('Metin kopyalanamadı. Lütfen manuel olarak seçin.');
            });
        }
    }
    
    showReplaySection() {
        if (this.lastProcessedAudioData && this.replaySection) {
            // Update button states - show cached results indicators
            this.replayButtons.forEach(button => {
                const buttonModel = button.dataset.model;
                const modelSize = buttonModel.split('-').pop().toUpperCase();
                
                if (this.resultCache.has(buttonModel)) {
                    const cached = this.resultCache.get(buttonModel);
                    const duration = (cached.processingDuration / 1000).toFixed(1);
                    button.textContent = `${modelSize} (${duration}s) ✓`;
                    button.className = 'replay-button cached';
                } else {
                    button.textContent = `${modelSize} ile Test Et`;
                    button.className = 'replay-button';
                }
                button.disabled = false;
            });
            this.replaySection.style.display = 'block';
        }
    }
    
    async replayWithModel(modelName) {
        if (!this.lastProcessedAudioData) {
            alert('Tekrar oynatılacak kayıt bulunamadı.');
            return;
        }
        
        const button = document.querySelector(`[data-model="${modelName}"]`);
        const modelSize = modelName.split('-').pop().toUpperCase();
        const originalText = button.textContent;
        
        // Check if we have cached results for this model and recording
        if (this.resultCache.has(modelName)) {
            const cached = this.resultCache.get(modelName);
            // Display cached result
            const resultText = `[${modelSize} Model - ${(cached.processingDuration/1000).toFixed(1)}s - Önbellekten]\n${cached.transcription}`;
            this.transcriptionText.value = resultText;
            this.displayDiffComparison(cached.transcription);
            
            // Update timing info to show this model's processing time
            const timingInfoEl = document.getElementById('timing-info');
            if (timingInfoEl && this.recordingDuration) {
                const recordingSeconds = (this.recordingDuration / 1000).toFixed(1);
                const processingSeconds = (cached.processingDuration / 1000).toFixed(1);
                timingInfoEl.innerHTML = `
                    <span class="timing-item">📼 Kayıt: ${recordingSeconds}s</span>
                    <span class="timing-item">⚡ İşleme (${modelSize}): ${processingSeconds}s</span>
                `;
            }
            return;
        }
        
        // Need to process with this model
        try {
            button.disabled = true;
            
            // Load model if not cached
            let pipeline_instance;
            if (this.modelCache.has(modelName)) {
                pipeline_instance = this.modelCache.get(modelName);
                button.textContent = `${modelSize} İşleniyor...`;
                button.className = 'replay-button processing';
                // Force DOM update
                await new Promise(resolve => requestAnimationFrame(resolve));
            } else {
                button.textContent = `${modelSize} İndiriliyor...`;
                button.className = 'replay-button downloading';
                // Force DOM update
                await new Promise(resolve => requestAnimationFrame(resolve));
                
                pipeline_instance = await pipeline('automatic-speech-recognition', modelName);
                this.modelCache.set(modelName, pipeline_instance);
                
                button.textContent = `${modelSize} İşleniyor...`;
                button.className = 'replay-button processing';
                // Force DOM update
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            const startTime = Date.now();
            
            // Run inference with the selected model
            const result = await pipeline_instance(this.lastProcessedAudioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'turkish',
                task: 'transcribe'
            });
            
            const processingTime = Date.now() - startTime;
            const transcription = result.text.trim();
            
            // Cache the result
            this.resultCache.set(modelName, {
                transcription: transcription,
                processingDuration: processingTime,
                timestamp: Date.now()
            });
            
            // Display result in transcription area with model info
            const resultText = `[${modelSize} Model - ${(processingTime/1000).toFixed(1)}s]\n${transcription}`;
            this.transcriptionText.value = resultText;
            
            // Update diff comparison
            this.displayDiffComparison(transcription);
            
            // Update timing info to show this model's processing time
            const timingInfoEl = document.getElementById('timing-info');
            if (timingInfoEl && this.recordingDuration) {
                const recordingSeconds = (this.recordingDuration / 1000).toFixed(1);
                const processingSeconds = (processingTime / 1000).toFixed(1);
                timingInfoEl.innerHTML = `
                    <span class="timing-item">📼 Kayıt: ${recordingSeconds}s</span>
                    <span class="timing-item">⚡ İşleme (${modelSize}): ${processingSeconds}s</span>
                `;
            }
            
            // Update the replay section to reflect new cached result
            this.showReplaySection();
            
        } catch (error) {
            console.error(`Error with ${modelName}:`, error);
            alert(`${modelName} modelinde hata oluştu.`);
            // Restore button to original state on error
            const modelSize = modelName.split('-').pop().toUpperCase();
            button.textContent = `${modelSize} ile Test Et`;
            button.className = 'replay-button';
            button.disabled = false;
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeechToTextApp();
});

// Handle microphone permission
navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'denied') {
        console.warn('Microphone permission denied');
    }
});