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

    // --- 3. ANIMACIÓN CIRCULAR AL HACER CLICK EN ENLACES DE LA NAVBAR ---
    const transitionLinks = document.querySelectorAll('.navbar-link, .navbar-title-link');
    transitionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && !href.startsWith('#') && href !== window.location.pathname.split('/').pop()) {
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
            document.getElementById('s-quiz-title').innerText = data.title;
            document.getElementById('s-quiz-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            document.getElementById('s-quiz-next').style.display = 'none';

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
                options: ["Si", "La", "Me", "Ca"],
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
                options: ["Si", "La", "Me", "Ca"],
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
                options: ["Te", "Ro", "So", "Lu"],
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
        let isSpeaking = false;

        function loadSaExample() {
            const data = saExamples[currentIndex];
            document.getElementById('sa-level-indicator').innerText = `Ejemplo ${currentIndex + 1} de 3`;
            document.getElementById('sa-word-display').innerText = data.blank;
            document.getElementById('sa-illustration-container').innerHTML = data.markup;
            document.getElementById('sa-next').style.display = 'none';

            const colors = ['blue', 'red', 'orange', 'green'];
            let optionsHtml = '';
            data.options.forEach((opt, idx) => {
                const color = colors[idx % colors.length];
                optionsHtml += `<button class="sa-opt-btn ${color}" data-syllable="${opt}">${opt}</button>`;
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
                if (isSpeaking) return;
                isSpeaking = true;
                speaker.classList.add('speaking');
                
                const utterance = speakWord(data.word);
                if (utterance) {
                    utterance.onend = function() {
                        speaker.classList.remove('speaking');
                        isSpeaking = false;
                    };
                } else {
                    speaker.classList.remove('speaking');
                    isSpeaking = false;
                }
            };

            optionButtons.forEach(btn => {
                btn.onclick = function() {
                    const syllableSelected = this.getAttribute('data-syllable');
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
                        speakWord("Incorrecto, prueba con otra sílaba.");
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
}
