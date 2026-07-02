// ===== SCRIPT.JS =====
// Funcionalidad interactiva para la web y transiciones circulares

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sitio cargado correctamente');
    
    // --- 1. OBSERVER PARA EL FONDO VERDE EN INICIO ---
    const levelsSection = document.querySelector('.levels-intro-section');
    if (levelsSection) {
        const observerOptions = {
            root: null,
            threshold: 0.1
        };
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.body.classList.add('green-theme');
                } else {
                    const rect = entry.target.getBoundingClientRect();
                    if (rect.top > window.innerHeight * 0.3) {
                        document.body.classList.remove('green-theme');
                    }
                }
            });
        }, observerOptions);
        observer.observe(levelsSection);
    }

    // --- 2. EFECTO REVELAR PÁGINA (SHRINKING OVERLAY AL CARGAR) ---
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
        // Asegurar que exista el elemento de texto de transición
        let transText = overlay.querySelector('.transition-text');
        if (!transText) {
            transText = document.createElement('div');
            transText.className = 'transition-text';
            transText.innerText = 'Nivel de Lenguaje';
            overlay.appendChild(transText);
        }

        // Definir color del texto según la página actual
        let currentTextColor = '#1a1a1a';
        if (document.body.classList.contains('purple-theme')) {
            currentTextColor = '#2d0b4e';
        } else if (document.body.classList.contains('terracotta-theme')) {
            currentTextColor = '#4e1f13';
        } else if (document.body.classList.contains('green-theme')) {
            currentTextColor = '#1b4d3e';
        } else if (document.body.classList.contains('amber-theme')) {
            currentTextColor = '#7c5a0b';
        }
        transText.style.color = currentTextColor;

        // Recuperar coordenadas de click de la sesión (o centrar)
        const rx = sessionStorage.getItem('ripple-x');
        const ry = sessionStorage.getItem('ripple-y');
        
        if (rx && ry) {
            overlay.style.setProperty('--ripple-x', rx + 'px');
            overlay.style.setProperty('--ripple-y', ry + 'px');
        } else {
            overlay.style.setProperty('--ripple-x', '50%');
            overlay.style.setProperty('--ripple-y', '50%');
        }
        
        // Ajustar color del overlay al fondo de la página actual
        const currentBg = getComputedStyle(document.body).backgroundColor;
        overlay.style.backgroundColor = currentBg;
        
        setTimeout(() => {
            overlay.classList.remove('expanding');
            overlay.classList.add('shrinking');
            
            overlay.addEventListener('transitionend', function() {
                overlay.classList.remove('shrinking');
                // Limpiar coordenadas de la sesión
                sessionStorage.removeItem('ripple-x');
                sessionStorage.removeItem('ripple-y');
            }, { once: true });
        }, 50);
    }

    // Helper para verificar si un enlace apunta a la página actual
    function isCurrentPage(targetUrl) {
        try {
            const currentUrl = new URL(window.location.href);
            const target = new URL(targetUrl, window.location.href);
            
            const cleanCurrentPath = currentUrl.pathname.replace(/\/$/, "").toLowerCase();
            const cleanTargetPath = target.pathname.replace(/\/$/, "").toLowerCase();
            
            if (cleanCurrentPath === cleanTargetPath) return true;
            
            // Caso especial de raíz y de index.html
            const isCurrentHome = cleanCurrentPath === "" || cleanCurrentPath.endsWith("index.html") || cleanCurrentPath.endsWith("marii-web");
            const isTargetHome = cleanTargetPath === "" || cleanTargetPath.endsWith("index.html") || cleanTargetPath.endsWith("marii-web");
            if (isCurrentHome && isTargetHome) return true;
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    // --- 3. ANIMACIÓN CIRCULAR AL HACER CLICK EN ENLACES DE LA NAVBAR ---
    const transitionLinks = document.querySelectorAll('.navbar-link, .navbar-title-link');
    transitionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && !href.startsWith('#')) {
                // Si ya estamos en la página del enlace, no hacer nada
                if (isCurrentPage(href)) {
                    e.preventDefault();
                    return;
                }
                
                e.preventDefault();
                
                // Forzar que la animación empiece del centro de la pantalla
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                sessionStorage.setItem('ripple-x', centerX);
                sessionStorage.setItem('ripple-y', centerY);
                
                if (overlay) {
                    overlay.style.setProperty('--ripple-x', centerX + 'px');
                    overlay.style.setProperty('--ripple-y', centerY + 'px');
                    
                    // Asegurar que exista el texto de transición
                    let transText = overlay.querySelector('.transition-text');
                    if (!transText) {
                        transText = document.createElement('div');
                        transText.className = 'transition-text';
                        transText.innerText = 'Nivel de Lenguaje';
                        overlay.appendChild(transText);
                    }

                    // Definir color de fondo y de texto destino
                    let targetColor = '#f5f1eb';
                    let targetTextColor = '#1a1a1a';
                    if (href.includes('fonologico')) {
                        targetColor = '#e0bbf6';
                        targetTextColor = '#2d0b4e';
                    } else if (href.includes('morfosintactico')) {
                        targetColor = '#f3cab8';
                        targetTextColor = '#4e1f13';
                    } else if (href.includes('semantico')) {
                        targetColor = '#fdf8e6';
                        targetTextColor = '#7c5a0b';
                    } else if (href.includes('pragmatico')) {
                        targetColor = '#e3ece4';
                        targetTextColor = '#1b4d3e';
                    }
                    
                    overlay.style.backgroundColor = targetColor;
                    transText.style.color = targetTextColor;
                    
                    overlay.classList.add('expanding');
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 850); // Tiempo extendido para percibir la animación de texto
                } else {
                    window.location.href = href;
                }
            }
        });
    });

    // --- 4. INICIALIZACIÓN DE JUEGOS EN PÁGINA FONOLÓGICA ---
    if (document.getElementById('cloze-card') || document.querySelector('.purple-theme')) {
        initFonologicoGames();
    }

    // --- 5. INICIALIZACIÓN DE JUEGOS EN PÁGINA MORFOSINTÁCTICA ---
    if (document.getElementById('concordance-card') || document.querySelector('.terracotta-theme')) {
        initMorfosintacticoGames();
    }
});

// ===== FUNCIONES GENERALES DE AUDIO Y SÍNTESIS =====
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playSuccessSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.25);
        });
    } catch (e) {
        console.error('Error al reproducir audio de éxito:', e);
    }
}

function playErrorSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.22);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    } catch (e) {
        console.error('Error al reproducir audio de error:', e);
    }
}

function playClapSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        
        // Síntesis de aplauso con ruido blanco filtrado
        const bufferSize = ctx.sampleRate * 0.08; // 80ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 950;
        filter.Q.value = 2.5;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start(now);
    } catch (e) {
        // Fallback simple por si falla el buffer
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (err) {
            console.error('Error al reproducir audio alternativo de aplauso:', err);
        }
    }
}

// Sonido táctil de clic sintetizado por Web Audio API
function playClickSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    } catch (e) {
        console.error('Error al reproducir audio de click:', e);
    }
}

// Desbloquear AudioContext y SpeechSynthesis en navegadores móviles/Safari con la primera interacción del usuario
function unlockAudio() {
    try {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().then(() => {
                console.log('AudioContext desbloqueado con éxito.');
            });
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0; // Silencioso
            window.speechSynthesis.speak(utterance);
            console.log('SpeechSynthesis desbloqueado con éxito.');
        }
    } catch (e) {
        console.warn('Error al desbloquear el audio:', e);
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
}
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

// Enlazar sonido táctil de clic a todos los botones interactivos del sitio
document.addEventListener('click', function(e) {
    const target = e.target.closest('button, .cloze-word, .cloze-dropzone, .speaker-btn, .sa-speaker-main, #clap-btn, .navbar-link, .guide-card-btn, .sequence-card');
    if (target) {
        if (target.classList.contains('game-reset-btn') || 
            target.classList.contains('game-next-btn') || 
            target.classList.contains('navbar-link') || 
            target.classList.contains('guide-card-btn') || 
            target.classList.contains('speaker-btn') || 
            target.classList.contains('sa-speaker-main') || 
            target.id === 'sa-speaker' ||
            target.id === 'clap-btn') {
            playClickSound();
        }
    }
});

// Precargar voces del sistema de forma asíncrona para que estén listas al usar speakWord
let systemVoices = [];
function loadSystemVoices() {
    if ('speechSynthesis' in window) {
        systemVoices = window.speechSynthesis.getVoices();
    }
}
if ('speechSynthesis' in window) {
    loadSystemVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadSystemVoices;
    }
}

function speakWord(text) {
    try {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.85;
            
            // Obtener voces disponibles (usar precargadas o intentar recargar si está vacío)
            let voices = systemVoices;
            if (!voices || voices.length === 0) {
                voices = window.speechSynthesis.getVoices();
            }
            
            if (voices && voices.length > 0) {
                // Filtrar voces en español (por código de idioma o por palabras clave en el nombre)
                const spanishVoices = voices.filter(v => 
                    v.lang.toLowerCase().startsWith('es') || 
                    v.name.toLowerCase().includes('español') || 
                    v.name.toLowerCase().includes('spanish')
                );
                
                if (spanishVoices.length > 0) {
                    // Nombres comunes de voces femeninas en español en macOS, iOS, Windows, Android y navegadores
                    const femaleNames = [
                        'monica', 'paulina', 'marisol', 'angelica', 'helena', 
                        'sabina', 'siri', 'female', 'femenina', 'yolanda', 
                        'soledad', 'francisca', 'paola', 'isabela', 'alva', 
                        'daria', 'yelda', 'laura', 'marta', 'sofia', 
                        'lucia', 'elena', 'carmen', 'valeria', 'conchita', 
                        'elsa', 'google' // Google español suele ser femenina
                    ];
                    
                    // Voces explícitamente masculinas para evitar
                    const maleNames = ['jorge', 'diego', 'juan', 'carlos', 'miguel', 'julio', 'javier', 'male', 'masculino'];
                    
                    // Calcular un puntaje para cada voz para priorizar voces de alta calidad (Premium / Enhanced / Natural / Neural)
                    const scoredVoices = spanishVoices.map(v => {
                        let score = 0;
                        const nameLower = v.name.toLowerCase();
                        
                        // Prioridad por género femenino
                        if (femaleNames.some(name => nameLower.includes(name))) {
                            score += 200;
                        }
                        
                        // Penalización por género masculino
                        if (maleNames.some(name => nameLower.includes(name))) {
                            score -= 200;
                        }
                        
                        // Gran bonus para voces mejoradas/premium o neurales/naturales (suenan mucho más humanas)
                        if (nameLower.includes('enhanced') || 
                            nameLower.includes('mejorada') || 
                            nameLower.includes('premium') || 
                            nameLower.includes('natural') || 
                            nameLower.includes('google') ||
                            nameLower.includes('neural')) {
                            score += 300;
                        }
                        
                        // Pequeño bonus para dialecto de España o México
                        if (v.lang.toLowerCase() === 'es-es' || v.lang.toLowerCase() === 'es-mx') {
                            score += 10;
                        }
                        
                        return { voice: v, score: score };
                    });
                    
                    // Ordenar por puntaje descendente
                    scoredVoices.sort((a, b) => b.score - a.score);
                    
                    let selectedVoice = null;
                    if (scoredVoices.length > 0) {
                        selectedVoice = scoredVoices[0].voice;
                    }
                    
                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                        console.log('Voz en español seleccionada para "' + text + '":', selectedVoice.name, '(' + selectedVoice.lang + ') - Score:', scoredVoices[0].score);
                    }
                } else {
                    console.warn('No se encontraron voces en español. Voces del sistema:', voices.map(v => `${v.name} [${v.lang}]`));
                }
            } else {
                console.warn('La lista de voces de speechSynthesis está vacía en este navegador.');
            }
            
            window.speechSynthesis.speak(utterance);
            return utterance;
        }
    } catch (e) {
        console.error('Error en speakWord (síntesis de voz):', e);
    }
    return null;
}

// ===== LÓGICA ESPECÍFICA DE JUEGOS =====
function initFonologicoGames() {
    console.log('Inicializando juegos interactivos fonológicos con rotación de ejemplos...');

    // ----------------------------------------------------
    // 1. Juego de Completar Oración (Cloze)
    // ----------------------------------------------------
    const clozeCard = document.getElementById('cloze-card');
    if (clozeCard) {
        const sentences = [
            {
                text: "Un [perro] juega [triste] porque la [maite] se [fue].",
                words: ["perro", "triste", "maite", "fue"]
            },
            {
                text: "El [sol] brilla [alto] en la [tarde] de [verano].",
                words: ["sol", "alto", "tarde", "verano"]
            },
            {
                text: "La [casa] tiene [flores] en el [jardín] [grande].",
                words: ["casa", "flores", "jardín", "grande"]
            }
        ];
        let currentIndex = 0;
        let selectedWordElem = null;

        function loadExample() {
            const data = sentences[currentIndex];
            document.getElementById('cloze-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            document.getElementById('cloze-next').style.display = 'none';
            selectedWordElem = null;

            // Renderizar la oración
            let html = data.text;
            data.words.forEach((w, i) => {
                html = html.replace(`[${w}]`, `<span class="cloze-dropzone" data-word="${w}" data-index="${i}">?</span>`);
            });
            const sentenceContainer = document.getElementById('cloze-sentence-container');
            sentenceContainer.innerHTML = html;

            // Renderizar las opciones desordenadas
            const shuffledWords = [...data.words].sort(() => Math.random() - 0.5);
            const colors = ['word-blue', 'word-red', 'word-orange', 'word-green'];
            let optionsHtml = '';
            shuffledWords.forEach((w, i) => {
                const color = colors[i % colors.length];
                optionsHtml += `<span class="cloze-word ${color}" data-word="${w}">${w}</span>`;
            });
            const optionsContainer = document.getElementById('cloze-options-container');
            optionsContainer.innerHTML = optionsHtml;

            // Volver a enlazar eventos
            bindEvents();
        }

        function bindEvents() {
            const dropzones = clozeCard.querySelectorAll('.cloze-dropzone');
            const words = clozeCard.querySelectorAll('.cloze-word');

            words.forEach(word => {
                word.addEventListener('click', function() {
                    if (this.classList.contains('used')) return;
                    words.forEach(w => w.style.outline = 'none');
                    selectedWordElem = this;
                    this.style.outline = '3px solid #2d0b4e';
                });
            });

            dropzones.forEach(zone => {
                zone.addEventListener('click', function() {
                    if (this.classList.contains('filled')) {
                        const placedWord = this.getAttribute('data-placed-word');
                        const originalWord = Array.from(words).find(w => w.getAttribute('data-word') === placedWord);
                        if (originalWord) originalWord.classList.remove('used');
                        this.innerText = '?';
                        this.classList.remove('filled');
                        this.removeAttribute('data-placed-word');
                        checkCompleteness(dropzones, words);
                        return;
                    }

                    if (selectedWordElem) {
                        const wordText = selectedWordElem.getAttribute('data-word');
                        this.innerText = wordText;
                        this.classList.add('filled');
                        this.setAttribute('data-placed-word', wordText);
                        selectedWordElem.classList.add('used');
                        selectedWordElem.style.outline = 'none';
                        selectedWordElem = null;
                        checkCompleteness(dropzones, words);
                    }
                });
            });
        }

        function checkCompleteness(dropzones, words) {
            const filledZones = Array.from(dropzones).filter(z => z.classList.contains('filled'));
            if (filledZones.length === dropzones.length) {
                let allCorrect = true;
                dropzones.forEach(zone => {
                    if (zone.getAttribute('data-word') !== zone.getAttribute('data-placed-word')) {
                        allCorrect = false;
                    }
                });

                if (allCorrect) {
                    playSuccessSound();
                    speakWord("¡Excelente! Completaste el ejemplo correctamente.");
                    dropzones.forEach(z => {
                        z.style.backgroundColor = '#e2fcdb';
                        z.style.borderColor = '#27ae60';
                        z.style.color = '#27ae60';
                    });
                    document.getElementById('cloze-next').style.display = 'inline-flex';
                } else {
                    playErrorSound();
                    speakWord("Casi correcto. Revisa el orden.");
                    dropzones.forEach(z => {
                        if (z.getAttribute('data-word') !== z.getAttribute('data-placed-word')) {
                            z.style.backgroundColor = '#fde8e8';
                            z.style.borderColor = '#eb5757';
                            z.style.color = '#eb5757';
                        } else {
                            z.style.backgroundColor = '#e2fcdb';
                            z.style.borderColor = '#27ae60';
                            z.style.color = '#27ae60';
                        }
                    });
                }
            } else {
                dropzones.forEach(z => {
                    z.style.backgroundColor = '';
                    z.style.borderColor = '';
                    z.style.color = '';
                });
            }
        }

        document.getElementById('cloze-reset').addEventListener('click', loadExample);
        document.getElementById('cloze-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % sentences.length;
            loadExample();
        });

        loadExample();
    }

    // ----------------------------------------------------
    // 2. Juego "¿Dónde escuchas /S/?" (Quiz de fonemas)
    // ----------------------------------------------------
    const sQuizCard = document.getElementById('s-quiz-card');
    if (sQuizCard) {
        const quizExamples = [
            {
                sound: "/S/",
                title: "¿Dónde escuchas el sonido /S/?",
                words: [
                    { word: "pan", correct: false },
                    { word: "mesa", correct: true },
                    { word: "sol", correct: true },
                    { word: "casa", correct: true }
                ]
            },
            {
                sound: "/M/",
                title: "¿Dónde escuchas el sonido /M/?",
                words: [
                    { word: "pelo", correct: false },
                    { word: "mamá", correct: true },
                    { word: "limón", correct: true },
                    { word: "mapa", correct: true }
                ]
            },
            {
                sound: "/P/",
                title: "¿Dónde escuchas el sonido /P/?",
                words: [
                    { word: "gato", correct: false },
                    { word: "pelota", correct: true },
                    { word: "papá", correct: true },
                    { word: "sopa", correct: true }
                ]
            }
        ];
        let currentIndex = 0;

        function loadQuizExample() {
            const data = quizExamples[currentIndex];
            const titleElem = document.getElementById('s-quiz-title');
            if (titleElem) titleElem.innerText = data.title;
            const indicatorElem = document.getElementById('s-quiz-level-indicator');
            if (indicatorElem) indicatorElem.innerText = `Ejemplo ${currentIndex + 1} de 3`;
            const nextBtn = document.getElementById('s-quiz-next');
            if (nextBtn) nextBtn.style.display = 'none';

            const colors = ['blue', 'red', 'orange', 'green'];
            let gridHtml = '';
            data.words.forEach((item, idx) => {
                const color = colors[idx % colors.length];
                gridHtml += `
                    <button class="quiz-button ${color}" data-word="${item.word}" data-correct="${item.correct}">
                        <span>${item.word}</span>
                        <span class="speaker-btn" data-speak="${item.word}" aria-label="Escuchar palabra">🔊</span>
                    </button>
                `;
            });

            const gridContainer = document.getElementById('s-quiz-grid-container');
            gridContainer.innerHTML = gridHtml;
            bindQuizEvents();
        }

        function bindQuizEvents() {
            const quizButtons = sQuizCard.querySelectorAll('.quiz-button');
            let correctFound = 0;
            const totalCorrect = quizExamples[currentIndex].words.filter(w => w.correct).length;
            let answeredCorrectly = [];

            quizButtons.forEach(btn => {
                const speaker = btn.querySelector('.speaker-btn');
                const word = btn.getAttribute('data-word');
                const isCorrect = btn.getAttribute('data-correct') === 'true';

                speaker.addEventListener('click', function(e) {
                    e.stopPropagation();
                    speakWord(word);
                });

                btn.addEventListener('click', function() {
                    this.classList.remove('correct-pulse', 'incorrect-shake');
                    
                    if (isCorrect) {
                        if (!answeredCorrectly.includes(word)) {
                            answeredCorrectly.push(word);
                            correctFound++;
                        }
                        playSuccessSound();
                        speakWord(`¡Correcto! En ${word} se escucha el sonido.`);
                        this.classList.add('correct-pulse');

                        if (correctFound === totalCorrect) {
                            setTimeout(() => {
                                speakWord("¡Genial! Has encontrado todas las palabras con ese sonido.");
                                document.getElementById('s-quiz-next').style.display = 'inline-flex';
                            }, 1200);
                        }
                    } else {
                        playErrorSound();
                        speakWord("Inténtalo de nuevo.");
                        this.classList.add('incorrect-shake');
                        setTimeout(() => this.classList.remove('incorrect-shake'), 400);
                    }
                });
            });
        }

        document.getElementById('s-quiz-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % quizExamples.length;
            loadQuizExample();
        });

        loadQuizExample();
    }

    // ----------------------------------------------------
    // 3. Juego "Escucha y selecciona" (sa-quiz)
    // ----------------------------------------------------
    const saQuizCard = document.getElementById('sa-quiz-card');
    if (saQuizCard) {
        const saExamples = [
            {
                word: "casa",
                blank: "___sa",
                correct: "Ca",
                options: [
                    { syl: "Ca", word: "casa" },
                    { syl: "Ta", word: "tasa" },
                    { syl: "Pa", word: "pasa" },
                    { syl: "Ma", word: "masa" }
                ],
                markup: `
                    <div class="sa-house-container" aria-hidden="true">
                        <div class="sa-roof"></div>
                        <div class="sa-base">
                            <div class="sa-window win-left"></div>
                            <div class="sa-window win-right"></div>
                            <div class="sa-door"></div>
                        </div>
                    </div>
                `
            },
            {
                word: "mesa",
                blank: "___sa",
                correct: "Me",
                options: [
                    { syl: "Me", word: "mesa" },
                    { syl: "Pe", word: "pesa" },
                    { syl: "Be", word: "besa" },
                    { syl: "Le", word: "lesa" }
                ],
                markup: `
                    <div class="sa-table-container" aria-hidden="true">
                        <div class="sa-table-top"></div>
                        <div class="sa-table-leg leg-left"></div>
                        <div class="sa-table-leg leg-right"></div>
                    </div>
                `
            },
            {
                word: "sopa",
                blank: "___pa",
                correct: "So",
                options: [
                    { syl: "So", word: "sopa" },
                    { syl: "Ro", word: "ropa" },
                    { syl: "Co", word: "copa" },
                    { syl: "Po", word: "popa" }
                ],
                markup: `
                    <div class="sa-soup-container" aria-hidden="true">
                        <div class="sa-soup-steam steam1"></div>
                        <div class="sa-soup-steam steam2"></div>
                        <div class="sa-soup-steam steam3"></div>
                        <div class="sa-soup-bowl"></div>
                    </div>
                `
            }
        ];
        let currentIndex = 0;

        function loadSaExample() {
            const data = saExamples[currentIndex];
            const indicatorElem = document.getElementById('sa-level-indicator');
            if (indicatorElem) indicatorElem.innerText = `Ejemplo ${currentIndex + 1} de 3`;
            const displayElem = document.getElementById('sa-word-display');
            if (displayElem) displayElem.innerText = data.blank;
            const containerElem = document.getElementById('sa-illustration-container');
            if (containerElem) containerElem.innerHTML = data.markup;
            const nextBtn = document.getElementById('sa-next');
            if (nextBtn) nextBtn.style.display = 'none';

            // Mezclar aleatoriamente las opciones (shuffle)
            const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);

            const colors = ['blue', 'red', 'orange', 'green'];
            let optionsHtml = '';
            shuffledOptions.forEach((opt, idx) => {
                const color = colors[idx % colors.length];
                optionsHtml += `<button class="sa-opt-btn ${color}" data-syllable="${opt.syl}">${opt.syl}</button>`;
            });
            document.getElementById('sa-options-container').innerHTML = optionsHtml;

            bindSaEvents();
        }

        function bindSaEvents() {
            const data = saExamples[currentIndex];
            const speaker = document.getElementById('sa-speaker');
            const wordDisplay = document.getElementById('sa-word-display');
            const optionButtons = saQuizCard.querySelectorAll('.sa-opt-btn');

            speaker.onclick = function() {
                speaker.classList.add('speaking');
                
                // Temporizador de seguridad para remover la clase visual
                const safetyTimeout = setTimeout(() => {
                    speaker.classList.remove('speaking');
                }, 1500);

                const utterance = speakWord(data.word);
                if (utterance) {
                    utterance.onend = function() {
                        clearTimeout(safetyTimeout);
                        speaker.classList.remove('speaking');
                    };
                    utterance.onerror = function() {
                        clearTimeout(safetyTimeout);
                        speaker.classList.remove('speaking');
                    };
                } else {
                    clearTimeout(safetyTimeout);
                    speaker.classList.remove('speaking');
                }
            };

            optionButtons.forEach(btn => {
                btn.onclick = function() {
                    const syllableSelected = this.getAttribute('data-syllable');
                    const optData = data.options.find(o => o.syl === syllableSelected);
                    optionButtons.forEach(b => b.classList.remove('correct', 'incorrect'));

                    if (syllableSelected === data.correct) {
                        playSuccessSound();
                        this.classList.add('correct');
                        wordDisplay.innerText = data.word;
                        speakWord(`¡Muy bien! Formaste la palabra ${data.word}.`);
                        document.getElementById('sa-next').style.display = 'inline-flex';
                    } else {
                        playErrorSound();
                        this.classList.add('incorrect');
                        if (optData && optData.word) {
                            speakWord(`Formaste ${optData.word}. Inténtalo de nuevo.`);
                        } else {
                            speakWord("Incorrecto, prueba con otra sílaba.");
                        }
                        setTimeout(() => this.classList.remove('incorrect'), 500);
                    }
                };
            });
        }

        document.getElementById('sa-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % saExamples.length;
            loadSaExample();
        });

        loadSaExample();
    }

    // ----------------------------------------------------
    // 4. Juego de Parejas (Memory)
    // ----------------------------------------------------
    const memoryCard = document.getElementById('memory-card');
    if (memoryCard) {
        const memoryExamples = [
            {
                pairs: [
                    { id: 'butterfly', content: '🦋', word: 'mariposa' },
                    { id: 'three', content: '3', word: 'tres' },
                    { id: 'four', content: '4', word: 'cuatro' }
                ]
            },
            {
                pairs: [
                    { id: 'apple', content: '🍎', word: 'manzana' },
                    { id: 'star', content: '⭐', word: 'estrella' },
                    { id: 'sun', content: '☀️', word: 'sol' }
                ]
            },
            {
                pairs: [
                    { id: 'car', content: '🚗', word: 'auto' },
                    { id: 'flower', content: '🌸', word: 'flor' },
                    { id: 'moon', content: '🌙', word: 'luna' }
                ]
            }
        ];
        let currentIndex = 0;
        let firstCard = null;
        let secondCard = null;
        let lockBoard = false;

        function loadMemoryExample() {
            const data = memoryExamples[currentIndex];
            document.getElementById('memory-level-indicator').innerText = `Tablero ${currentIndex + 1} de 3`;
            document.getElementById('memory-next').style.display = 'none';
            firstCard = null;
            secondCard = null;
            lockBoard = false;

            // Duplicar elementos para hacer las parejas
            let deck = [];
            data.pairs.forEach(p => {
                deck.push({ ...p });
                deck.push({ ...p });
            });

            // Barajar
            deck.sort(() => Math.random() - 0.5);

            // Generar HTML
            let boardHtml = '';
            deck.forEach((card, idx) => {
                boardHtml += `
                    <div class="memory-tile" data-pair="${card.id}" data-word="${card.word}" data-index="${idx}">
                        <div class="tile-front">?</div>
                        <div class="tile-back">${card.content}</div>
                    </div>
                `;
            });
            document.getElementById('memory-board').innerHTML = boardHtml;
            bindMemoryEvents();
        }

        function bindMemoryEvents() {
            const tiles = memoryCard.querySelectorAll('.memory-tile');
            
            tiles.forEach(tile => {
                tile.addEventListener('click', function() {
                    if (lockBoard) return;
                    if (this === firstCard) return;
                    if (this.classList.contains('flipped')) return;

                    this.classList.add('flipped');
                    const word = this.getAttribute('data-word');
                    speakWord(word);

                    if (!firstCard) {
                        firstCard = this;
                        return;
                    }

                    secondCard = this;
                    checkMemoryMatch();
                });
            });
        }

        function checkMemoryMatch() {
            const isMatch = firstCard.getAttribute('data-pair') === secondCard.getAttribute('data-pair');
            if (isMatch) {
                disableMemoryCards();
            } else {
                unflipMemoryCards();
            }
        }

        function disableMemoryCards() {
            playSuccessSound();
            firstCard.querySelector('.tile-back').classList.add('matched');
            secondCard.querySelector('.tile-back').classList.add('matched');
            resetMemoryState();

            // Comprobar victoria
            const tiles = memoryCard.querySelectorAll('.memory-tile');
            const allMatched = Array.from(tiles).every(t => t.querySelector('.tile-back').classList.contains('matched'));
            if (allMatched) {
                setTimeout(() => {
                    playSuccessSound();
                    speakWord("¡Felicitaciones! Has completado el juego de memoria.");
                    document.getElementById('memory-next').style.display = 'inline-flex';
                }, 800);
            }
        }

        function unflipMemoryCards() {
            lockBoard = true;
            setTimeout(() => {
                if (firstCard && secondCard) {
                    playErrorSound();
                    firstCard.classList.remove('flipped');
                    secondCard.classList.remove('flipped');
                }
                resetMemoryState();
            }, 1200);
        }

        function resetMemoryState() {
            [firstCard, secondCard] = [null, null];
            lockBoard = false;
        }

        document.getElementById('memory-reset').addEventListener('click', loadMemoryExample);
        document.getElementById('memory-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % memoryExamples.length;
            loadMemoryExample();
        });

        loadMemoryExample();
    }

    // ----------------------------------------------------
    // 5. Juego de Aplaudir Sílabas (Clapping)
    // ----------------------------------------------------
    const clappingCard = document.getElementById('clapping-card');
    if (clappingCard) {
        const clappingExamples = [
            { word: "COMPUTADORA", syllables: ["COM", "PU", "TA", "DO", "RA"] },
            { word: "MARIPOSA", syllables: ["MA", "RI", "PO", "SA"] },
            { word: "PELOTA", syllables: ["PE", "LO", "TA"] }
        ];
        let currentIndex = 0;
        let currentSyllableIndex = 0;
        let isResetting = false;

        function loadClappingExample() {
            const data = clappingExamples[currentIndex];
            document.getElementById('clapping-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            document.getElementById('clapping-word-label').innerText = data.word;
            document.getElementById('clapping-notebook-syllables').innerText = "";
            document.getElementById('clapping-screen').innerText = "MODO SILÁBICO";
            document.getElementById('clap-feedback').innerText = "Presiona el botón de aplauso para contar...";
            document.getElementById('clapping-next').style.display = 'none';
            currentSyllableIndex = 0;
            isResetting = false;

            // Generar chips de sílabas
            let chipsHtml = '';
            data.syllables.forEach(s => {
                chipsHtml += `<span class="syllable-chip" data-syl="${s}">${s}</span>`;
            });
            document.getElementById('clapping-chips').innerHTML = chipsHtml;
        }

        const clapBtn = document.getElementById('clap-btn');
        clapBtn.addEventListener('click', function() {
            if (isResetting) return;

            clapBtn.classList.add('clapped');
            playClapSound();
            setTimeout(() => clapBtn.classList.remove('clapped'), 150);

            const data = clappingExamples[currentIndex];
            if (currentSyllableIndex < data.syllables.length) {
                const currentSyl = data.syllables[currentSyllableIndex];
                
                const chips = clappingCard.querySelectorAll('.syllable-chip');
                const activeChip = Array.from(chips).find(c => c.getAttribute('data-syl') === currentSyl && !c.classList.contains('active'));
                if (activeChip) {
                    activeChip.classList.add('active');
                }

                let textSoFar = data.syllables.slice(0, currentSyllableIndex + 1).join("-");
                document.getElementById('clapping-notebook-syllables').innerText = textSoFar;

                speakWord(currentSyl.toLowerCase());
                document.getElementById('clapping-screen').innerText = currentSyl;

                currentSyllableIndex++;
                document.getElementById('clap-feedback').innerText = `Aplauso ${currentSyllableIndex} de ${data.syllables.length}`;

                if (currentSyllableIndex === data.syllables.length) {
                    isResetting = true;
                    document.getElementById('clap-feedback').innerText = `¡Excelente! ${data.syllables.length} sílabas.`;
                    document.getElementById('clapping-screen').innerText = "¡COMPLETO!";
                    
                    setTimeout(() => {
                        playSuccessSound();
                        speakWord(`¡Excelente! ${data.word} tiene ${data.syllables.length} sílabas.`);
                        document.getElementById('clapping-next').style.display = 'inline-flex';
                    }, 400);
                }
            }
        });

        document.getElementById('clapping-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % clappingExamples.length;
            loadClappingExample();
        });

        loadClappingExample();
    }
}

// ===== JUEGOS DE MORFOSINTAXIS =====
function initMorfosintacticoGames() {
    console.log('Inicializando juegos interactivos de morfosintaxis con rotación de ejemplos...');

    // ----------------------------------------------------
    // 1. Juego de Concordancia de Género y Número
    // ----------------------------------------------------
    const concordanceCard = document.getElementById('concordance-card');
    if (concordanceCard) {
        const nounsData = [
            { noun: "gata", art: "la" },
            { noun: "perros", art: "los" },
            { noun: "manzana", art: "la" }
        ];
        let currentIndex = 0;

        const nounDisplay = document.getElementById('concordance-noun-display');
        const slot = document.getElementById('concordance-slot');
        const phraseNoun = document.getElementById('concordance-phrase-noun');
        const buttons = concordanceCard.querySelectorAll('.concordance-btn');
        const nextBtn = document.getElementById('concordance-next');

        function loadNoun() {
            const currentItem = nounsData[currentIndex];
            document.getElementById('concordance-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            nounDisplay.innerText = currentItem.noun;
            slot.innerText = "?";
            phraseNoun.innerText = currentItem.noun;
            buttons.forEach(b => b.classList.remove('correct', 'incorrect'));
            nextBtn.style.display = 'none';
        }

        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const selectedArt = this.getAttribute('data-art');
                const currentItem = nounsData[currentIndex];

                buttons.forEach(b => b.classList.remove('correct', 'incorrect'));

                if (selectedArt === currentItem.art) {
                    playSuccessSound();
                    this.classList.add('correct');
                    slot.innerText = currentItem.art;
                    speakWord(`¡Muy bien! ${currentItem.art} ${currentItem.noun}`);
                    nextBtn.style.display = 'inline-flex';
                } else {
                    playErrorSound();
                    this.classList.add('incorrect');
                    speakWord("No concuerda, intenta de nuevo.");
                    setTimeout(() => this.classList.remove('incorrect'), 500);
                }
            });
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % nounsData.length;
            loadNoun();
        });

        loadNoun();
    }

    // ----------------------------------------------------
    // 2. Ordenar la Oración (Sintaxis)
    // ----------------------------------------------------
    const syntaxCard = document.getElementById('syntax-card');
    if (syntaxCard) {
        const sentences = [
            {
                correct: ["El", "perro", "come", "comida."],
                pool: ["come", "El", "comida.", "perro"]
            },
            {
                correct: ["La", "niña", "juega", "pelota."],
                pool: ["juega", "La", "pelota.", "niña"]
            },
            {
                correct: ["El", "gato", "duerme", "mucho."],
                pool: ["duerme", "mucho.", "El", "gato"]
            }
        ];
        let currentIndex = 0;
        let selectedWords = [];

        const sentenceDisplay = document.getElementById('syntax-sentence-display');
        const poolContainer = document.getElementById('syntax-words-pool');
        const resetBtn = document.getElementById('syntax-reset');
        const nextBtn = document.getElementById('syntax-next');

        function loadSentence() {
            const data = sentences[currentIndex];
            document.getElementById('syntax-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            nextBtn.style.display = 'none';
            selectedWords = [];
            sentenceDisplay.style.backgroundColor = '';
            sentenceDisplay.style.borderColor = '';
            renderSentence();

            // Renderizar pool
            let poolHtml = '';
            data.pool.forEach(w => {
                poolHtml += `<span class="syntax-pool-word" data-word="${w}">${w}</span>`;
            });
            poolContainer.innerHTML = poolHtml;

            // Rebind events
            bindPoolEvents();
        }

        function bindPoolEvents() {
            const poolWords = poolContainer.querySelectorAll('.syntax-pool-word');
            poolWords.forEach(wordBtn => {
                wordBtn.addEventListener('click', function() {
                    if (this.classList.contains('used')) return;

                    const word = this.getAttribute('data-word');
                    selectedWords.push(word);
                    this.classList.add('used');

                    speakWord(word.replace('.', ''));
                    renderSentence();

                    const data = sentences[currentIndex];
                    if (selectedWords.length === data.correct.length) {
                        checkSentenceOrder();
                    }
                });
            });
        }

        function renderSentence() {
            if (selectedWords.length === 0) {
                sentenceDisplay.innerHTML = '<span style="color:#aaa;">Presiona palabras para iniciar...</span>';
                return;
            }

            sentenceDisplay.innerHTML = "";
            selectedWords.forEach(word => {
                const chip = document.createElement('span');
                chip.className = 'syntax-word-chip';
                chip.innerText = word;
                sentenceDisplay.appendChild(chip);
            });
        }

        function checkSentenceOrder() {
            const data = sentences[currentIndex];
            let isCorrect = true;
            for (let i = 0; i < data.correct.length; i++) {
                if (selectedWords[i] !== data.correct[i]) {
                    isCorrect = false;
                    break;
                }
            }

            if (isCorrect) {
                playSuccessSound();
                const completeSentenceText = data.correct.join(' ');
                speakWord(`¡Excelente! ${completeSentenceText}`);
                sentenceDisplay.style.backgroundColor = '#e2fcdb';
                sentenceDisplay.style.borderColor = '#27ae60';
                nextBtn.style.display = 'inline-flex';
            } else {
                playErrorSound();
                speakWord("Orden incorrecto, inténtalo de nuevo.");
                sentenceDisplay.style.backgroundColor = '#fde8e8';
                sentenceDisplay.style.borderColor = '#eb5757';
            }
        }

        resetBtn.addEventListener('click', loadSentence);
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % sentences.length;
            loadSentence();
        });

        loadSentence();
    }

    // ----------------------------------------------------
    // 3. Secuencia Temporal (Secuencia de la Flor y otras)
    // ----------------------------------------------------
    const sequenceCardGame = document.getElementById('sequence-card-game');
    if (sequenceCardGame) {
        const sequences = [
            {
                title: "Secuencia de la Flor",
                cards: [
                    {
                        step: "3",
                        text: "La flor crece",
                        markup: `
                            <div class="sequence-illustration">
                                <div class="ill-stem"></div>
                                <div class="ill-leaf left"></div>
                                <div class="ill-leaf right"></div>
                                <div class="ill-flower-head">
                                    <div class="ill-flower-center"></div>
                                </div>
                            </div>
                        `
                    },
                    {
                        step: "1",
                        text: "Sembrar semilla",
                        markup: `
                            <div class="sequence-illustration">
                                <div class="ill-pot"></div>
                                <div class="ill-dirt"></div>
                                <div class="ill-seed"></div>
                            </div>
                        `
                    },
                    {
                        step: "2",
                        text: "Regar la planta",
                        markup: `
                            <div class="sequence-illustration">
                                <div class="ill-stem" style="height:25px;"></div>
                                <div class="ill-leaf left" style="bottom:15px;"></div>
                                <div class="ill-water-drops">💧💧</div>
                            </div>
                        `
                    }
                ]
            },
            {
                title: "Preparar un Sándwich",
                cards: [
                    {
                        step: "1",
                        text: "Colocar el pan",
                        markup: `<div class="sequence-emoji-illustration">🍞</div>`
                    },
                    {
                        step: "2",
                        text: "Agregar jamón",
                        markup: `<div class="sequence-emoji-illustration">🧀🥓</div>`
                    },
                    {
                        step: "3",
                        text: "Comer sándwich",
                        markup: `<div class="sequence-emoji-illustration">🥪</div>`
                    }
                ]
            },
            {
                title: "Lavar las Manos",
                cards: [
                    {
                        step: "1",
                        text: "Poner jabón",
                        markup: `<div class="sequence-emoji-illustration">🧼</div>`
                    },
                    {
                        step: "2",
                        text: "Lavar con agua",
                        markup: `<div class="sequence-emoji-illustration">💦</div>`
                    },
                    {
                        step: "3",
                        text: "Secar con toalla",
                        markup: `<div class="sequence-emoji-illustration">🙌</div>`
                    }
                ]
            }
        ];
        let currentIndex = 0;
        let userSequence = [];
        let isDone = false;

        const titleElem = document.getElementById('sequence-title');
        const board = document.getElementById('sequence-board');
        const resetBtn = document.getElementById('sequence-reset');
        const nextBtn = document.getElementById('sequence-next');

        function loadSequence() {
            const data = sequences[currentIndex];
            titleElem.innerText = data.title;
            document.getElementById('sequence-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            nextBtn.style.display = 'none';
            userSequence = [];
            isDone = false;

            // Barajar cartas de la secuencia
            const shuffledCards = [...data.cards].sort(() => Math.random() - 0.5);

            // Generar HTML
            let boardHtml = '';
            shuffledCards.forEach(c => {
                boardHtml += `
                    <div class="sequence-card" data-step="${c.step}">
                        <div class="sequence-order-badge" style="display:none;">?</div>
                        ${c.markup}
                        <span style="font-size:0.85rem; font-weight:600; color:#555;">${c.text}</span>
                    </div>
                `;
            });
            board.innerHTML = boardHtml;

            bindSequenceEvents();
        }

        function bindSequenceEvents() {
            const cards = sequenceCardGame.querySelectorAll('.sequence-card');
            cards.forEach(card => {
                card.addEventListener('click', function() {
                    if (isDone) return;
                    if (userSequence.includes(this)) return;

                    userSequence.push(this);
                    const orderNum = userSequence.length;

                    const badge = this.querySelector('.sequence-order-badge');
                    badge.innerText = orderNum;
                    badge.style.display = 'flex';

                    const text = this.querySelector('span').innerText;
                    speakWord(text);

                    if (userSequence.length === 3) {
                        isDone = true;
                        checkSequenceOrder(cards);
                    }
                });
            });
        }

        function checkSequenceOrder(cards) {
            const step1 = userSequence[0].getAttribute('data-step') === '1';
            const step2 = userSequence[1].getAttribute('data-step') === '2';
            const step3 = userSequence[2].getAttribute('data-step') === '3';

            if (step1 && step2 && step3) {
                playSuccessSound();
                speakWord("¡Magnífico! Secuencia ordenada con éxito.");
                cards.forEach(c => {
                    c.querySelector('.sequence-order-badge').classList.add('correct');
                    c.style.borderColor = '#27ae60';
                });
                nextBtn.style.display = 'inline-flex';
            } else {
                playErrorSound();
                speakWord("Orden incorrecto, inténtalo de nuevo.");
                cards.forEach(c => {
                    const badge = c.querySelector('.sequence-order-badge');
                    badge.style.backgroundColor = '#eb5757';
                    c.style.borderColor = '#eb5757';
                });
            }
        }

        resetBtn.addEventListener('click', loadSequence);
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % sequences.length;
            loadSequence();
        });

        loadSequence();
    }

    // ==========================================================================
    // JUEGO DE REPARACIÓN PRAGMÁTICA (¿Cómo repararías la conversación?)
    // ==========================================================================
    const pragmaticGame = document.getElementById('pragmatic-game');
    if (pragmaticGame) {
        const scenarios = [
            {
                title: "Petición Indirecta",
                speechPrompt: "Escucha la conversación. A dice: ¿Tienes hora? B dice: Sí, claro, y se queda callado. ¿Cómo debería responder B para reparar el malentendido?",
                messages: [
                    { sender: "Persona A", text: "¿Tienes hora? ⏰", isLeft: true },
                    { sender: "Persona B", text: "Sí, claro. (Se queda callado) 🤐", isLeft: false }
                ],
                question: "¿Cómo debería responder B para ayudar a A?",
                options: [
                    { text: "Decir: \"Son las 3 de la tarde.\"", isCorrect: true, class: "blue" },
                    { text: "Decir: \"Qué bueno que tengas prisa.\"", isCorrect: false, class: "red" },
                    { text: "Quedarse en silencio y sonreír.", isCorrect: false, class: "orange" }
                ],
                successSpeech: "¡Excelente! B entendió que A hacía una pregunta indirecta para saber la hora.",
                errorSpeech: "Eso no repara la conversación. B debe responder con la hora."
            },
            {
                title: "Petición de Objeto",
                speechPrompt: "Escucha la conversación. A dice: Me gusta mucho tu lápiz. B dice: Gracias, a mí también, y sigue escribiendo. ¿Qué intención indirecta tenía la persona A?",
                messages: [
                    { sender: "Persona A", text: "Me gusta mucho tu lápiz... ✏️", isLeft: true },
                    { sender: "Persona B", text: "Gracias, a mí también. (Sigue escribiendo) 📝", isLeft: false }
                ],
                question: "¿Qué intención indirecta tenía la persona A?",
                options: [
                    { text: "Quería que le prestara el lápiz.", isCorrect: true, class: "blue" },
                    { text: "Quería comprarle el lápiz.", isCorrect: false, class: "red" },
                    { text: "Quería criticar el lápiz.", isCorrect: false, class: "orange" }
                ],
                successSpeech: "¡Muy bien! A quería pedir prestado el lápiz de forma indirecta.",
                errorSpeech: "Inténtalo de nuevo. A no quería comprarlo, sino usarlo."
            },
            {
                title: "Ironía y Tono de Voz",
                speechPrompt: "Escucha la conversación. A dice con voz triste y mirando al suelo: El examen estuvo genial. ¿Cómo se siente realmente la persona A?",
                messages: [
                    { sender: "Persona A", text: "El examen estuvo... genial... (Voz triste y mirando al suelo) 😔", isLeft: true }
                ],
                question: "¿Cómo se siente realmente la persona A sobre su examen?",
                options: [
                    { text: "Le fue mal y está triste.", isCorrect: true, class: "blue" },
                    { text: "Está muy feliz y contenta.", isCorrect: false, class: "red" },
                    { text: "No le importa el examen.", isCorrect: false, class: "orange" }
                ],
                successSpeech: "¡Magnífico! Lograste interpretar la ironía y el lenguaje corporal de A.",
                errorSpeech: "No, su tono de voz y postura indican que está triste por el resultado."
            }
        ];

        let currentPragIndex = 0;
        const titleElem = document.getElementById('pragmatic-title');
        const chatContainer = document.getElementById('pragmatic-chat-container');
        const questionElem = document.getElementById('pragmatic-question');
        const optionsGrid = document.getElementById('pragmatic-options-grid');
        const nextBtn = document.getElementById('pragmatic-next');
        const ttsBtn = document.getElementById('pragmatic-speak-btn');
        let optionsLocked = false;

        function loadPragmaticScenario(autoSpeak = true) {
            const data = scenarios[currentPragIndex];
            titleElem.innerText = data.title;
            document.getElementById('pragmatic-level-indicator').innerText = `Ejemplo ${currentPragIndex + 1} de ${scenarios.length}`;
            nextBtn.style.display = 'none';
            optionsLocked = false;

            // Cargar mensajes en el chat
            let chatHtml = '';
            data.messages.forEach(m => {
                const alignmentClass = m.isLeft ? 'left' : 'right';
                chatHtml += `
                    <div class="chat-bubble ${alignmentClass}">
                        <span class="chat-bubble-sender">${m.sender}</span>
                        ${m.text}
                    </div>
                `;
            });
            chatContainer.innerHTML = chatHtml;

            // Cargar pregunta y opciones
            questionElem.innerText = data.question;
            
            // Barajar opciones
            const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);
            let optionsHtml = '';
            shuffledOptions.forEach(opt => {
                optionsHtml += `
                    <button class="pragmatic-opt-btn ${opt.class}" data-correct="${opt.isCorrect}">
                        ${opt.text}
                    </button>
                `;
            });
            optionsGrid.innerHTML = optionsHtml;

            bindPragmaticEvents();
            
            // Hablar consigna inicial solo si no es carga inicial automática
            if (autoSpeak) {
                speakWord(data.speechPrompt);
            }
        }

        function bindPragmaticEvents() {
            const buttons = optionsGrid.querySelectorAll('.pragmatic-opt-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', function() {
                    if (optionsLocked) return;
                    
                    const isCorrect = this.getAttribute('data-correct') === 'true';
                    optionsLocked = true;

                    if (isCorrect) {
                        playSuccessSound();
                        this.classList.add('correct');
                        speakWord(scenarios[currentPragIndex].successSpeech);
                        nextBtn.style.display = 'inline-flex';
                    } else {
                        playErrorSound();
                        this.classList.add('incorrect');
                        speakWord(scenarios[currentPragIndex].errorSpeech);
                        // Desbloquear para intentar de nuevo
                        setTimeout(() => {
                            this.classList.remove('incorrect');
                            optionsLocked = false;
                        }, 1500);
                    }
                });
            });
        }

        ttsBtn.addEventListener('click', () => {
            speakWord(scenarios[currentPragIndex].speechPrompt);
        });

        nextBtn.addEventListener('click', () => {
            currentPragIndex = (currentPragIndex + 1) % scenarios.length;
            loadPragmaticScenario(true);
        });

        loadPragmaticScenario(false);
    }

    // ==========================================================================
    // SISTEMA DE MINIJUEGOS DEMO PARA ACTIVIDADES EXTERNAS (WORDWALL / EDUCAPLAY)
    // ==========================================================================
    const DEMO_GAMES_CONFIG = {
        // --- MORFOSINTÁCTICO ---
        "seccion-numero": {
            type: "quiz",
            title: "Demo: Número (Singular y Plural)",
            examples: [
                { text: "perros 🐶", question: "¿Es singular (uno) o plural (varios)?", options: ["Singular", "Plural"], correct: "Plural", speech: "perros. ¿Es singular o plural?", success: "¡Excelente! Perros se refiere a varios.", error: "Inténtalo de nuevo. Perros significa más de uno." },
                { text: "gato 🐱", question: "¿Es singular (uno) o plural (varios)?", options: ["Singular", "Plural"], correct: "Singular", speech: "gato. ¿Es singular o plural?", success: "¡Muy bien! Gato se refiere a uno solo.", error: "No. Gato es solo un animal." }
            ]
        },
        "seccion-sustantivos": {
            type: "quiz",
            title: "Demo: Identificar Sustantivos",
            examples: [
                { text: "manzana 🍎", question: "¿Qué tipo de palabra es manzana?", options: ["Sustantivo (Cosa)", "Acción (Verbo)"], correct: "Sustantivo (Cosa)", speech: "manzana. ¿Qué tipo de palabra es?", success: "¡Correcto! Manzana es una cosa, por lo tanto es un sustantivo.", error: "No, las acciones son verbos. Manzana es un objeto." },
                { text: "correr 🏃", question: "¿Es correr un sustantivo?", options: ["Sí", "No (Es una acción)"], correct: "No (Es una acción)", speech: "correr. ¿Es un sustantivo?", success: "¡Excelente! Correr es una acción, no una cosa.", error: "Inténtalo de nuevo. Correr describe un movimiento." }
            ]
        },
        "seccion-adjetivos": {
            type: "cloze",
            title: "Demo: Adjetivos Calificativos",
            examples: [
                { sentence: "El sol brillante es muy ___ ☀️", options: ["caliente", "saltando", "bajo"], correct: "caliente", speech: "El sol brillante es muy caliente.", success: "¡Correcto! Caliente describe una característica del sol.", error: "Inténtalo de nuevo. Busca una palabra que describa al sol." },
                { sentence: "La tortuga camina muy ___ 🐢", options: ["rápida", "lenta", "azul"], correct: "lenta", speech: "La tortuga camina muy lenta.", success: "¡Muy bien! Lenta describe cómo se mueve la tortuga.", error: "Esa palabra no concuerda con la lentitud de la tortuga." }
            ]
        },
        "seccion-pronombres": {
            type: "cloze",
            title: "Demo: Pronombres Personales",
            examples: [
                { sentence: "___ es mi hermana menor. 👧", options: ["Él", "Ella", "Ellos"], correct: "Ella", speech: "Ella es mi hermana menor.", success: "¡Excelente! Usamos Ella para referirnos a una niña.", error: "No, recuerda que se refiere a una niña." },
                { sentence: "___ somos muy buenos amigos. 👦👧", options: ["Él", "Nosotros", "Ellas"], correct: "Nosotros", speech: "Nosotros somos muy buenos amigos.", success: "¡Correcto! Nosotros nos incluye a ti y a mí.", error: "Esa palabra no nos agrupa a todos." }
            ]
        },
        "seccion-verbos": {
            type: "cloze",
            title: "Demo: Acciones (Verbos)",
            examples: [
                { sentence: "El pájaro azul ___ por el aire. 🐦", options: ["vuela", "corre", "nada"], correct: "vuela", speech: "El pájaro azul vuela por el aire.", success: "¡Correcto! Los pájaros usan sus alas para volar.", error: "Esa acción no corresponde a un pájaro en el aire." },
                { sentence: "Los niños ___ fútbol en el parque. ⚽", options: ["juegan", "vuelan", "escriben"], correct: "juegan", speech: "Los niños juegan fútbol en el parque.", success: "¡Muy bien! Juegan es la acción de realizar un deporte.", error: "Esa palabra no concuerda con jugar fútbol." }
            ]
        },
        "seccion-nexos": {
            type: "cloze",
            title: "Demo: Nexos en Oraciones",
            examples: [
                { sentence: "Llevo paraguas ___ está lloviendo. 🌧️", options: ["porque", "pero", "aunque"], correct: "porque", speech: "Llevo paraguas porque está lloviendo.", success: "¡Correcto! Porque explica la causa de llevar paraguas.", error: "Ese nexo no explica la causa del evento." },
                { sentence: "Quiero ir a jugar ___ debo estudiar. 📝", options: ["pero", "porque", "si"], correct: "pero", speech: "Quiero ir a jugar pero debo estudiar.", success: "¡Muy bien! Pero indica una limitación u obstáculo.", error: "Esa palabra no expresa oposición." }
            ]
        },
        "seccion-preposiciones": {
            type: "cloze",
            title: "Demo: Preposiciones de Lugar",
            examples: [
                { sentence: "El gato duerme ___ de la silla. 🐱", options: ["debajo", "con", "para"], correct: "debajo", speech: "El gato duerme debajo de la silla.", success: "¡Correcto! Debajo indica la posición del gato.", error: "Esa palabra no describe una posición espacial." },
                { sentence: "Voy ___ la casa de mi tía. 🏡", options: ["a", "de", "con"], correct: "a", speech: "Voy a la casa de mi tía.", success: "¡Muy bien! La preposición a indica dirección.", error: "Ese conector no indica movimiento hacia un lugar." }
            ]
        },
        "seccion-adverbios": {
            type: "cloze",
            title: "Demo: Adverbios de Tiempo y Lugar",
            examples: [
                { sentence: "Mi colegio está muy ___ de mi casa. 🏫", options: ["cerca", "ayer", "mañana"], correct: "cerca", speech: "Mi colegio está muy cerca de mi casa.", success: "¡Excelente! Cerca indica distancia.", error: "Esa palabra se refiere al tiempo, no a la distancia." },
                { sentence: "___ fui a jugar a la plaza. 🛝", options: ["Ayer", "Arriba", "Cerca"], correct: "Ayer", speech: "Ayer fui a jugar a la plaza.", success: "¡Correcto! Ayer se refiere a un tiempo pasado.", error: "Esa palabra no indica cuándo sucedió." }
            ]
        },
        "seccion-oraciones-complejas": {
            type: "cloze",
            title: "Demo: Oraciones Complejas",
            examples: [
                { sentence: "Cuando salga el sol, ___ al parque. ☀️", options: ["iremos", "dormiremos", "volaremos"], correct: "iremos", speech: "Cuando salga el sol, iremos al parque.", success: "¡Excelente! Iremos expresa la acción que realizaremos.", error: "Esa acción no concuerda lógicamente con salir el sol e ir al parque." },
                { sentence: "Si terminas la tarea, ___ jugar. 🎮", options: ["puedes", "debes", "tienes"], correct: "puedes", speech: "Si terminas la tarea, puedes jugar.", success: "¡Muy bien! Expresa el permiso o condición para jugar.", error: "Esa palabra no expresa el permiso condicional de jugar." }
            ]
        },

        // --- PRAGMÁTICO ---
        "seccion-miremos-siente": {
            type: "quiz",
            title: "Demo: Reconocer Emociones",
            examples: [
                { text: "Juan sonríe ampliamente y aplaude. 😊", question: "¿Cómo se siente Juan?", options: ["Enojado", "Alegre", "Triste"], correct: "Alegre", speech: "Juan sonríe ampliamente y aplaude. ¿Cómo se siente Juan?", success: "¡Excelente! La sonrisa y aplausos indican alegría.", error: "No, las sonrisas no demuestran esa emoción." },
                { text: "Sofía cruza los brazos y frunce el ceño. 😠", question: "¿Cómo se siente Sofía?", options: ["Asustada", "Enojada", "Alegre"], correct: "Enojada", speech: "Sofía cruza los brazos y frunce el ceño. ¿Cómo se siente Sofía?", success: "¡Correcto! Esa postura corporal denota enfado.", error: "Esa expresión facial no indica miedo o alegría." }
            ]
        },
        "seccion-kinesica": {
            type: "quiz",
            title: "Demo: Expresión Corporal",
            examples: [
                { text: "Colocar el dedo índice sobre los labios. 🤫", question: "¿Qué significa este gesto?", options: ["Pedir silencio", "Saludar", "Tener sueño"], correct: "Pedir silencio", speech: "Colocar el dedo índice sobre los labios. ¿Qué significa?", success: "¡Muy bien! Es el gesto universal para pedir silencio.", error: "Ese gesto no se usa para saludar o dormir." },
                { text: "Mover la mano abierta de un lado a otro. 👋", question: "¿Qué significa este gesto?", options: ["Tener frío", "Decir hola o adiós", "Pedir comida"], correct: "Decir hola o adiós", speech: "Mover la mano abierta de un lado a otro. ¿Qué significa?", success: "¡Excelente! Es un saludo o despedida.", error: "No se asocia con frío o comida." }
            ]
        },
        "seccion-manejo-turnos": {
            type: "quiz",
            title: "Demo: Respetar Turnos",
            examples: [
                { text: "Tu compañero está contando una historia.", question: "¿Qué debes hacer?", options: ["Interrumpirlo para hablar tú", "Escuchar atentamente y esperar", "Darte la vuelta e irte"], correct: "Escuchar atentamente y esperar", speech: "Tu compañero está contando una historia. ¿Qué debes hacer?", success: "¡Correcto! En la conversación debemos saber escuchar.", error: "Eso es descortés y rompe el flujo del diálogo." },
                { text: "Quieres opinar en la sala de clases.", question: "¿Cómo debes actuar?", options: ["Gritar tu opinión fuerte", "Esperar en silencio", "Levantar la mano y esperar el turno"], correct: "Levantar la mano y esperar el turno", speech: "Quieres opinar en la sala de clases. ¿Cómo debes actuar?", success: "¡Excelente! Levantar la mano ayuda a mantener el orden.", error: "Gritar o solo callarse no ayuda a participar con orden." }
            ]
        },
        "seccion-funcion-instrumental": {
            type: "quiz",
            title: "Demo: Pedir Cosas (Instrumental)",
            examples: [
                { text: "Tienes mucha sed y quieres agua.", question: "¿Cómo lo pides adecuadamente?", options: ["¡Dame agua!", "Quiero agua, por favor", "El agua es de color azul"], correct: "Quiero agua, por favor", speech: "Tienes mucha sed. ¿Cómo lo pides adecuadamente?", success: "¡Excelente! Expresar deseos con amabilidad es muy efectivo.", error: "Esa no es la forma más educada o clara de pedirlo." },
                { text: "Quieres usar la pelota de tu amigo.", question: "¿Qué le dices?", options: ["La pelota rebota alto", "Dame tu pelota", "¿Me prestas la pelota, por favor?"], correct: "¿Me prestas la pelota, por favor?", speech: "Quieres usar la pelota de tu amigo. ¿Qué le dices?", success: "¡Muy bien! Pedir prestado con respeto fomenta la amistad.", error: "Esa frase suena imperativa o no es una petición directa." }
            ]
        },
        "seccion-funcion-regulatoria": {
            type: "quiz",
            title: "Demo: Dirigir Conducta (Regulatoria)",
            examples: [
                { text: "Quieres que tus compañeros hagan silencio para el juego.", question: "¿Qué indicación das?", options: ["El juego es divertido", "¡Todos a escuchar en silencio, por favor!", "Yo sé jugar"], correct: "¡Todos a escuchar en silencio, por favor!", speech: "Quieres que hagan silencio. ¿Qué indicación das?", success: "¡Excelente! Das una instrucción clara para regular al grupo.", error: "Eso no es una instrucción para regular la conducta." },
                { text: "Le enseñas las reglas de un juego a tu amigo.", question: "¿Qué le dices?", options: ["Ahora te toca lanzar el dado", "El dado es de color blanco", "A mí me gusta jugar"], correct: "Ahora te toca lanzar el dado", speech: "Le enseñas las reglas del juego. ¿Qué le dices?", success: "¡Correcto! Diriges la acción que le corresponde hacer.", error: "Esa es una descripción o gusto, no una regla de acción." }
            ]
        },
        "seccion-funcion-interactiva": {
            type: "quiz",
            title: "Demo: Relacionarse (Interactiva)",
            examples: [
                { text: "Llegas de visita a la casa de tu tío.", question: "¿Cómo lo saludas?", options: ["Tengo mucha hambre", "¡Hola tío! Qué alegría visitarlo", "Me voy a sentar"], correct: "¡Hola tío! Qué alegría visitarlo", speech: "Llegas de visita. ¿Cómo saludas?", success: "¡Muy bien! Un saludo afectuoso fortalece la relación social.", error: "Eso no demuestra una interacción o cortesía de llegada." },
                { text: "Un amigo te presta su juguete favorito.", question: "¿Qué le dices?", options: ["El juguete es genial", "Muchas gracias por prestármelo", "Yo tengo uno mejor"], correct: "Muchas gracias por prestármelo", speech: "Te prestan un juguete. ¿Qué le dices?", success: "¡Excelente! Agradecer es clave para la interacción positiva.", error: "Presumir o solo describir no agradece el gesto del amigo." }
            ]
        },
        "seccion-funcion-personal": {
            type: "quiz",
            title: "Demo: Expresar Identidad (Personal)",
            examples: [
                { text: "Te preguntan qué opinas del helado de frutilla.", question: "¿Cómo respondes expresando tu gusto?", options: ["El helado es frío", "A mí me parece delicioso", "Se vende en la esquina"], correct: "A mí me parece delicioso", speech: "Te preguntan por tu helado favorito. ¿Cómo respondes?", success: "¡Correcto! Expresas tu gusto y opinión personal.", error: "Esa es una descripción objetiva o de ubicación, no tu gusto." },
                { text: "Quieres contarle a tu amigo cuál es tu juego favorito.", question: "¿Qué le dices?", options: ["Los juegos son entretenidos", "Mi juego favorito son las escondidas", "Hay un juego en el patio"], correct: "Mi juego favorito son las escondidas", speech: "Quieres contar tu juego favorito. ¿Qué dices?", success: "¡Excelente! Verbalizas tus preferencias personales.", error: "Esa frase habla de los juegos en general, no de ti." }
            ]
        },
        "seccion-funciones-heuristicas": {
            type: "quiz",
            title: "Demo: Investigar el Entorno (Heurística)",
            examples: [
                { text: "Ves una planta extraña en el jardín.", question: "¿Qué preguntas para conocer más sobre ella?", options: ["La planta tiene hojas", "¡Qué bonita planta!", "¿Cómo se llama esta planta y qué cuidados requiere?"], correct: "¿Cómo se llama esta planta y qué cuidados requiere?", speech: "Ves una planta extraña. ¿Qué preguntas?", success: "¡Excelente! Formular preguntas es clave para aprender del entorno.", error: "Eso es una descripción o exclamación, no una pregunta indagatoria." },
                { text: "Quieres saber por qué sale el arcoíris.", question: "¿Qué preguntas?", options: ["El arcoíris tiene muchos colores", "¿Por qué sale el arcoíris después de llover?", "Ayer vi un arcoíris"], correct: "¿Por qué sale el arcoíris después de llover?", speech: "Quieres saber sobre el arcoíris. ¿Qué preguntas?", success: "¡Correcto! Buscas comprender la causa de un fenómeno.", error: "Esa frase describe o relata, no indaga." }
            ]
        },
        "seccion-funcion-representativa": {
            type: "quiz",
            title: "Demo: Informar Hechos (Representativa)",
            examples: [
                { text: "Tu amigo no sabe cuándo es la excursión escolar.", question: "¿Cómo le informas objetivamente?", options: ["La excursión será este viernes a las 9 de la mañana", "¡Qué divertida la excursión!", "Ojalá vayamos en autobús"], correct: "La excursión será este viernes a las 9 de la mañana", speech: "Tu amigo no sabe de la excursión. ¿Cómo le informas?", success: "¡Excelente! Transmites información fáctica y objetiva.", error: "Esa es una emoción o deseo, no un dato concreto." },
                { text: "Quieres avisar que se derramó el agua en el piso.", question: "¿Qué dices?", options: ["El agua sirve para limpiar", "Se cayó el vaso y el piso está mojado", "Me gusta jugar con agua"], correct: "Se cayó el vaso y el piso está mojado", speech: "Avisas que se cayó el agua. ¿Qué dices?", success: "¡Correcto! Informas un hecho real acontecido.", error: "Esa es una opinión o descripción general, no un reporte." }
            ]
        },
        "seccion-discurso-narrativo": {
            type: "quiz",
            title: "Demo: Narrar Sucesos",
            examples: [
                { text: "Quieres contar tu mañana escolar en orden.", question: "¿Cómo ordenas tu historia?", options: ["Al final almorcé en casa", "Primero entré a clases, luego jugué en el recreo y al final almorcé", "Jugué en el recreo después de almorzar"], correct: "Primero entré a clases, luego jugué en el recreo y al final almorcé", speech: "Quieres contar tu mañana en orden. ¿Cómo ordenas tu historia?", success: "¡Excelente! Mantienes una secuencia temporal lógica.", error: "Esa secuencia no está ordenada cronológicamente." },
                { text: "Te preguntan cómo termina una historia típica.", question: "¿Qué frase final es la más adecuada?", options: ["Había una vez...", "Y vivieron felices para siempre.", "De repente, apareció un lobo."], correct: "Y vivieron felices para siempre.", speech: "Te preguntan cómo termina una historia. ¿Qué frase final usas?", success: "¡Muy bien! Es la frase clásica de cierre narrativo.", error: "Esa frase se usa para iniciar o en el clímax de la historia." }
            ]
        },
        "seccion-intencion-comunicativa": {
            type: "quiz",
            title: "Demo: Entender la Intención",
            examples: [
                { text: "Tu mamá dice: '¡Qué frío hace aquí!' mirando la ventana abierta.", question: "¿Qué quiere que hagas realmente?", options: ["Que le hables del clima", "Que cierres la ventana", "Que sonrías"], correct: "Que cierres la ventana", speech: "Tu mamá dice que hace frío mirando la ventana. ¿Qué quiere realmente?", success: "¡Excelente! Interpretas el acto de habla indirecto.", error: "No, su intención indirecta es modificar la temperatura cerrando la ventana." },
                { text: "El profesor dice: '¿Podemos escuchar con atención?'.", question: "¿Qué te está pidiendo?", options: ["Que le respondas 'Sí'", "Que dejes de hablar y escuches", "Que grites fuerte"], correct: "Que dejes de hablar y escuches", speech: "El profesor pide escuchar con atención. ¿Qué te está pidiendo?", success: "¡Correcto! Te solicita amablemente mantener el orden.", error: "No es una pregunta literal, es una orden cortés." }
            ]
        },
        "seccion-gestos-comunicativos": {
            type: "quiz",
            title: "Demo: Significado de Gestos",
            examples: [
                { text: "Encogerse de hombros y levantar las manos. 🤷", question: "¿Qué significa?", options: ["No lo sé / No entiendo", "Estoy feliz", "Tengo frío"], correct: "No lo sé / No entiendo", speech: "Encogerse de hombros. ¿Qué significa?", success: "¡Muy bien! Indica desconocimiento o confusión.", error: "Ese gesto no expresa alegría o frío." },
                { text: "Hacer un círculo con el dedo índice al lado de la sien. 🤪", question: "¿Qué significa coloquialmente?", options: ["Que alguien está loco o bromeando", "Que tengo dolor de cabeza", "Que estoy pensando una idea"], correct: "Que alguien está loco o bromeando", speech: "Hacer un círculo al lado de la sien. ¿Qué significa?", success: "¡Excelente! Denota locura o broma en nuestro contexto social.", error: "No se asocia con dolor o pensamiento concentrado." }
            ]
        },
        "seccion-polisemia": {
            type: "quiz",
            title: "Demo: Palabras Polisémicas",
            examples: [
                { text: "Oración: 'Fui a sentarme en el banco de la plaza.' 🤷", question: "¿Qué significa 'banco' aquí?", options: ["Asiento para sentarse", "Entidad de dinero"], correct: "Asiento para sentarse", speech: "Fui a sentarme en el banco de la plaza. ¿Qué significa banco?", success: "¡Muy bien! Se refiere al mueble público para sentarse.", error: "No es la entidad de dinero. En la plaza nos sentamos." },
                { text: "Oración: 'El árbol tiene una gran copa verde.' 🌳", question: "¿Qué significa 'copa' aquí?", options: ["Parte superior del árbol", "Vaso con pie para beber"], correct: "Parte superior del árbol", speech: "El árbol tiene una gran copa verde. ¿Qué significa copa?", success: "¡Excelente! La copa del árbol es su follaje superior.", error: "No es un vaso. Los árboles no beben de copas de vidrio." }
            ]
        },
        "seccion-categorizacion": {
            type: "quiz",
            title: "Demo: Categorización",
            examples: [
                { text: "Elementos: 'manzana, plátano, uva' 🍎🍌🍇", question: "¿A qué grupo pertenecen?", options: ["Frutas", "Verduras", "Juguetes"], correct: "Frutas", speech: "Manzana, plátano y uva. ¿A qué grupo pertenecen?", success: "¡Correcto! Todos son deliciosos tipos de frutas.", error: "No son verduras o juguetes. Son frutas de comer." },
                { text: "Elementos: 'perro, gato, león' 🐶🐱🦁", question: "¿A qué grupo pertenecen?", options: ["Animales", "Plantas", "Medios de transporte"], correct: "Animales", speech: "Perro, gato y león. ¿A qué grupo pertenecen?", success: "¡Excelente! Son animales domésticos y salvajes.", error: "No son plantas ni vehículos. Son seres vivos animales." }
            ]
        }
    };

    function initDemoGames() {
        Object.keys(DEMO_GAMES_CONFIG).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const card = section.querySelector('.game-card');
            if (!card) return;

            // Encontrar el botón de redirección existente para rescatar el link, texto y clase original
            let originalLink = '#';
            let originalText = 'Iniciar Actividad ↗';
            let originalClass = 'game-secondary-btn'; // Fallback

            const wordwallLink = card.querySelector('.wordwall-link-btn, .game-secondary-btn[href*="wordwall"]');
            const educaplayLink = card.querySelector('.educaplay-link-btn, .game-secondary-btn[href*="educaplay"]');

            if (wordwallLink) {
                originalLink = wordwallLink.getAttribute('href');
                originalText = wordwallLink.innerText;
                originalClass = 'wordwall-link-btn';
            } else if (educaplayLink) {
                originalLink = educaplayLink.getAttribute('href');
                originalText = educaplayLink.innerText;
                originalClass = 'educaplay-link-btn';
            } else {
                const anyLink = card.querySelector('a');
                if (anyLink) {
                    originalLink = anyLink.getAttribute('href');
                    originalText = anyLink.innerText;
                    if (anyLink.classList.contains('wordwall-link-btn')) {
                        originalClass = 'wordwall-link-btn';
                    } else if (anyLink.classList.contains('educaplay-link-btn')) {
                        originalClass = 'educaplay-link-btn';
                    }
                }
            }

            const config = DEMO_GAMES_CONFIG[sectionId];
            let currentExIndex = 0;
            let locked = false;

            // Reconstruir la tarjeta con la demo
            card.innerHTML = `
                <div class="game-info">
                    <span class="game-title">${config.title}</span>
                    <p class="game-description" id="desc-${sectionId}" style="min-height:36px;">Cargando ejemplo...</p>
                </div>
                <div class="game-level-header">
                    <span class="game-level-indicator" id="indicator-${sectionId}">Ejemplo 1 de 2</span>
                    <button class="game-speak-btn" id="speak-${sectionId}" title="Escuchar">🔊</button>
                </div>
                <div class="mock-pragmatic-game" style="border-color: inherit; margin-bottom: 15px;">
                    <div class="pragmatic-chat-container" id="game-arena-${sectionId}" style="min-height: auto; padding: 15px; background: #fffdfc;">
                        <!-- Aquí va la pregunta o el texto de la oración -->
                    </div>
                    <div style="padding: 10px 0 0 0;">
                        <div class="pragmatic-options-grid" id="options-${sectionId}">
                            <!-- Opciones -->
                        </div>
                    </div>
                </div>
                <div class="game-controls-row" style="margin-bottom: 15px;">
                    <button class="game-next-btn" id="next-${sectionId}" style="display: none;">Siguiente Ejemplo ➔</button>
                </div>
                <a href="${originalLink}" target="_blank" rel="noopener" class="${originalClass}" style="width: 100%; text-align: center; justify-content: center; box-sizing: border-box; display: inline-flex; margin-top: 15px;">
                    ${originalText}
                </a>
            `;

            const descElem = card.querySelector(`#desc-${sectionId}`);
            const indicatorElem = card.querySelector(`#indicator-${sectionId}`);
            const arenaElem = card.querySelector(`#game-arena-${sectionId}`);
            const optionsElem = card.querySelector(`#options-${sectionId}`);
            const nextBtn = card.querySelector(`#next-${sectionId}`);
            const speakBtn = card.querySelector(`#speak-${sectionId}`);

            function loadExample() {
                const ex = config.examples[currentExIndex];
                locked = false;
                nextBtn.style.display = 'none';

                indicatorElem.innerText = `Ejemplo ${currentExIndex + 1} de ${config.examples.length}`;

                if (config.type === 'quiz') {
                    descElem.innerText = ex.question;
                    arenaElem.innerHTML = `
                        <div style="font-size: 1.2rem; font-weight: 700; text-align: center; color: inherit; width: 100%;">
                            ${ex.text}
                        </div>
                    `;
                } else if (config.type === 'cloze') {
                    descElem.innerText = "Completa la oración seleccionando la palabra correcta.";
                    arenaElem.innerHTML = `
                        <div style="font-size: 1.15rem; font-weight: 700; text-align: center; color: inherit; width: 100%;">
                            ${ex.sentence}
                        </div>
                    `;
                }

                // Generar y barajar opciones
                const shuffled = [...ex.options].sort(() => Math.random() - 0.5);
                optionsElem.innerHTML = '';
                shuffled.forEach((opt, idx) => {
                    const colorClass = idx === 0 ? 'blue' : (idx === 1 ? 'red' : 'orange');
                    const isCorrect = opt === ex.correct;

                    const btn = document.createElement('button');
                    btn.className = `pragmatic-opt-btn ${colorClass}`;
                    btn.style.padding = '10px 14px';
                    btn.style.fontSize = '1rem';
                    btn.innerText = opt;

                    btn.addEventListener('click', function() {
                        if (locked) return;
                        locked = true;

                        if (isCorrect) {
                            playSuccessSound();
                            this.classList.add('correct');
                            
                            // Mostrar la palabra en la oración si es cloze
                            if (config.type === 'cloze') {
                                arenaElem.innerHTML = `
                                    <div style="font-size: 1.15rem; font-weight: 700; text-align: center; color: #27ae60; width: 100%;">
                                        ${ex.sentence.replace('___', `<strong style="text-decoration: underline;">${ex.correct}</strong>`)}
                                    </div>
                                `;
                            }

                            speakWord(ex.success || "¡Correcto! Muy bien hecho.");
                            nextBtn.style.display = 'inline-flex';
                        } else {
                            playErrorSound();
                            this.classList.add('incorrect');
                            speakWord(ex.error || "Inténtalo de nuevo.");
                            
                            setTimeout(() => {
                                this.classList.remove('incorrect');
                                locked = false;
                            }, 1500);
                        }
                    });

                    optionsElem.appendChild(btn);
                });
            }

            speakBtn.addEventListener('click', () => {
                const ex = config.examples[currentExIndex];
                if (config.type === 'quiz') {
                    speakWord(ex.speech || `${ex.text}. ${ex.question}`);
                } else if (config.type === 'cloze') {
                    speakWord(ex.speech || ex.sentence.replace('___', 'blanco'));
                }
            });

            nextBtn.addEventListener('click', () => {
                currentExIndex = (currentExIndex + 1) % config.examples.length;
                loadExample();
            });

            loadExample();
        });
    }

    // Inicializar juegos demo al final de la carga
    initDemoGames();
}
