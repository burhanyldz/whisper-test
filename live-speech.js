class LiveSpeechApp {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentLanguage = 'tr-TR';
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        // Turkish test texts (same as Whisper app for consistency)
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
        this.initializeSpeechRecognition();
    }
    
    initializeElements() {
        this.speechButton = document.getElementById('speech-button');
        this.transcriptionText = document.getElementById('transcription-text');
        this.statusDot = document.querySelector('.status-dot');
        this.statusText = document.querySelector('.status-text');
        this.buttonText = document.querySelector('.button-text');
        this.testTextSelect = document.getElementById('test-text-select');
        this.selectedTextDisplay = document.getElementById('selected-text');
        this.copyTextButton = document.getElementById('copy-text-button');
        this.clearButton = document.getElementById('clear-button');
        this.cleanRepetitionsButton = document.getElementById('clean-repetitions-button');
        this.compareButton = document.getElementById('compare-button');
        this.wordCount = document.getElementById('word-count');
        this.diffComparison = document.getElementById('diff-comparison');

        // Event listeners
        this.speechButton.addEventListener('click', () => this.toggleSpeechRecognition());
        this.testTextSelect.addEventListener('change', () => this.onTextSelection());
        this.copyTextButton.addEventListener('click', () => this.copySelectedText());
        this.clearButton.addEventListener('click', () => this.clearTranscription());
        this.cleanRepetitionsButton.addEventListener('click', () => this.cleanCurrentTranscription());
        this.compareButton.addEventListener('click', () => this.compareWithSelectedText());
    }
    
    initializeSpeechRecognition() {
        // Check if Web Speech API is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.updateStatus('error', 'Web Speech API desteklenmiyor');
            this.buttonText.textContent = 'Desteklenmiyor';
            this.speechButton.disabled = true;
            return;
        }
        
        // Create recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
        this.recognition.maxAlternatives = 1;
        
        // Mobile-specific settings
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Shorter timeout for mobile devices
            this.recognition.continuous = false; // Better for mobile
        }
        
        // Auto-restart functionality for mobile
        this.autoRestartEnabled = false;
        this.restartTimeout = null;
        
        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('listening', 'Dinleniyor...');
            this.buttonText.textContent = 'Durdurmak için tıklayın';
            this.speechButton.classList.add('listening');
        };
        
        this.recognition.onresult = (event) => {
            let newInterimTranscript = '';
            let newFinalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim();
                
                if (event.results[i].isFinal) {
                    // Avoid duplicating text that's already in finalTranscript
                    if (!this.finalTranscript.includes(transcript)) {
                        newFinalTranscript += transcript + ' ';
                    }
                } else {
                    newInterimTranscript += transcript;
                }
            }
            
            // Update transcripts
            if (newFinalTranscript) {
                this.finalTranscript += newFinalTranscript;
            }
            this.interimTranscript = newInterimTranscript;
            
            this.updateTranscriptionDisplay();
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Ses tanıma hatası';
            
            switch (event.error) {
                case 'network':
                    errorMessage = 'Ağ bağlantısı hatası';
                    break;
                case 'not-allowed':
                    errorMessage = 'Mikrofon izni reddedildi';
                    break;
                case 'no-speech':
                    errorMessage = 'Konuşma algılanamadı';
                    break;
                case 'audio-capture':
                    errorMessage = 'Mikrofon erişimi başarısız';
                    break;
            }
            
            this.updateStatus('error', errorMessage);
            this.resetSpeechButton();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            
            // Clear any pending restart timeout
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = null;
            }
            
            // Auto-restart if enabled and user hasn't manually stopped
            if (this.autoRestartEnabled && this.speechButton.classList.contains('listening')) {
                this.restartTimeout = setTimeout(() => {
                    if (this.autoRestartEnabled) {
                        console.log('Auto-restarting speech recognition...');
                        this.startListening();
                    }
                }, 100); // Short delay before restart
                return;
            }
            
            this.resetSpeechButton();
            
            if (this.finalTranscript.trim()) {
                this.updateStatus('ready', 'Hazır - Tamamlandı');
                this.updateWordCount();
                this.showCompareButton();
            } else {
                this.updateStatus('ready', 'Hazır');
            }
        };
        
        // Enable the button
        this.speechButton.disabled = false;
        this.buttonText.textContent = 'Dinlemeyi Başlat';
        this.updateStatus('ready', 'Hazır');
    }
    
    toggleSpeechRecognition() {
        if (!this.recognition) {
            alert('Ses tanıma desteklenmiyor.');
            return;
        }
        
        if (this.isListening || this.autoRestartEnabled) {
            // Stop listening and disable auto-restart
            this.autoRestartEnabled = false;
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = null;
            }
            if (this.recognition && this.isListening) {
                this.recognition.stop();
            } else {
                this.resetSpeechButton();
            }
        } else {
            // Start listening and enable auto-restart for mobile
            this.autoRestartEnabled = true;
            this.startListening();
        }
    }
    
    startListening() {
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.updateStatus('error', 'Başlatma hatası');
        }
    }
    
    resetSpeechButton() {
        this.speechButton.classList.remove('listening');
        this.buttonText.textContent = 'Dinlemeyi Başlat';
        this.isListening = false;
        this.autoRestartEnabled = false;
        
        // Clear any pending restart timeout
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
    }
    
    updateTranscriptionDisplay() {
        let fullText = this.finalTranscript + this.interimTranscript;
        
        // Clean repetitive text for better user experience
        if (fullText.trim()) {
            fullText = this.cleanRepetitiveText(fullText);
        }
        
        this.transcriptionText.value = fullText;
        this.updateWordCount();
    }
    
    updateWordCount() {
        const text = this.transcriptionText.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        this.wordCount.textContent = `Kelime sayısı: ${wordCount}`;
    }
    
    showCompareButton() {
        if (this.testTextSelect.value && this.finalTranscript.trim()) {
            this.compareButton.style.display = 'inline-block';
        }
    }
    
    onTextSelection() {
        const selectedIndex = this.testTextSelect.value;
        if (selectedIndex === '') {
            this.selectedTextDisplay.innerHTML = '<p class="placeholder-text">Yukarıdan bir metin seçin ve yüksek sesle okuyun.</p>';
            this.copyTextButton.style.display = 'none';
            this.compareButton.style.display = 'none';
        } else {
            const selectedText = this.turkishTexts[parseInt(selectedIndex)];
            this.selectedTextDisplay.innerHTML = `<p>${selectedText}</p>`;
            this.copyTextButton.style.display = 'block';
            this.showCompareButton();
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
    
    clearTranscription() {
        // Stop any ongoing recognition
        if (this.isListening || this.autoRestartEnabled) {
            this.autoRestartEnabled = false;
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = null;
            }
            if (this.recognition && this.isListening) {
                this.recognition.stop();
            }
        }
        
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.transcriptionText.value = '';
        this.updateWordCount();
        this.compareButton.style.display = 'none';
        this.diffComparison.style.display = 'none';
        this.updateStatus('ready', 'Hazır');
    }
    
    cleanCurrentTranscription() {
        if (!this.finalTranscript.trim()) {
            alert('Temizlenecek metin bulunamadı.');
            return;
        }
        
        const originalLength = this.finalTranscript.length;
        this.finalTranscript = this.cleanRepetitiveText(this.finalTranscript);
        this.interimTranscript = '';
        
        // Update display without cleaning again
        this.transcriptionText.value = this.finalTranscript;
        this.updateWordCount();
        
        // Show feedback
        const cleanedLength = this.finalTranscript.length;
        if (cleanedLength < originalLength) {
            this.updateStatus('ready', `Temizlendi - ${originalLength - cleanedLength} karakter kaldırıldı`);
            setTimeout(() => {
                this.updateStatus('ready', 'Hazır');
            }, 3000);
        } else {
            this.updateStatus('ready', 'Tekrar eden metin bulunamadı');
            setTimeout(() => {
                this.updateStatus('ready', 'Hazır');
            }, 2000);
        }
    }
    
    // Helper function to clean repetitive text
    cleanRepetitiveText(text) {
        if (!text || text.trim().length === 0) return text;
        
        // First, normalize spaces and clean up
        let cleaned = text.trim().replace(/\s+/g, ' ');
        
        // Split into words and process
        const words = cleaned.split(/\s+/);
        const cleanedWords = [];
        let lastWord = '';
        let consecutiveCount = 1;
        
        for (let i = 0; i < words.length; i++) {
            const currentWord = words[i].toLowerCase();
            
            if (currentWord === lastWord) {
                consecutiveCount++;
                // Allow max 2 consecutive repetitions of the same word
                if (consecutiveCount <= 2) {
                    cleanedWords.push(words[i]);
                }
            } else {
                cleanedWords.push(words[i]);
                lastWord = currentWord;
                consecutiveCount = 1;
            }
        }
        
        // Additional cleanup for common patterns
        let result = cleanedWords.join(' ');
        
        // Remove obvious repetitive patterns like "word word word"
        result = result.replace(/\b(\w+)(\s+\1){2,}/gi, '$1');
        
        // Clean up extra spaces
        result = result.replace(/\s+/g, ' ').trim();
        
        return result;
    }
    
    compareWithSelectedText() {
        const selectedIndex = this.testTextSelect.value;
        if (!selectedIndex || !this.finalTranscript.trim()) {
            alert('Karşılaştırma için hem metin seçin hem de konuşma yapın.');
            return;
        }
        
        const originalText = this.turkishTexts[parseInt(selectedIndex)];
        const transcribedText = this.finalTranscript.trim();
        
        this.displayDiffComparison(originalText, transcribedText);
    }
    
    displayDiffComparison(originalText, transcribedText) {
        const diffHtml = this.generateDiffHtml(originalText, transcribedText);
        const accuracyPercentage = this.calculateAccuracyPercentage(originalText, transcribedText);
        
        this.diffComparison.innerHTML = `
            <div class="diff-header">
                Metin Karşılaştırması
                <span class="accuracy-percentage">%${accuracyPercentage} doğruluk</span>
            </div>
            <div class="diff-content">${diffHtml}</div>
        `;
        this.diffComparison.style.display = 'block';
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
    
    updateStatus(type, message) {
        this.statusText.textContent = message;
        this.statusDot.className = `status-dot ${type}`;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LiveSpeechApp();
});

// Handle microphone permission
navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'denied') {
        console.warn('Microphone permission denied');
    }
});