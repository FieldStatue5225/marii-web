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

    // --- 2. EFECTO REVELAR PÁGINA (TRANSCIÓN EN ROMPECABEZAS AL CARGAR) ---
    // Procedimiento para construir las piezas del puzle de forma adaptable a la pantalla
    function buildPuzzleOverlay(overlay) {
        const transText = overlay.querySelector('.transition-text');
        overlay.innerHTML = '';
        if (transText) overlay.appendChild(transText);

        // Detectar si la pantalla es más alta que ancha (retrato/móvil)
        const isPortrait = window.innerHeight > window.innerWidth;
        const cols = isPortrait ? 3 : 5;
        const rows = isPortrait ? 6 : 4;

        // Asignar columnas y filas a la grilla dinámicamente
        overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // Generar bordes interlocking (1 = tab out, -1 = tab in, 0 = flat)
        const rightEdges = [];
        const bottomEdges = [];

        for (let r = 0; r < rows; r++) {
            rightEdges.push(new Array(cols - 1).fill(0));
            bottomEdges.push(new Array(cols).fill(0));
        }

        // Definir valores aleatorios para bordes internos
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (c < cols - 1) rightEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
                if (r < rows - 1) bottomEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
            }
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Determinar tipo de borde por lado
                const top = r === 0 ? 0 : -bottomEdges[r - 1][c];
                const left = c === 0 ? 0 : -rightEdges[r][c - 1];
                const bottom = r === rows - 1 ? 0 : bottomEdges[r][c];
                const right = c === cols - 1 ? 0 : rightEdges[r][c];

                // Generar Path SVG de la pieza del rompecabezas
                let path = 'M 0,0 ';

                // Borde Superior
                if (top === 0) path += 'L 100,0 ';
                else if (top === 1) path += 'L 35,0 C 35,-12 43,-16 50,-16 C 57,-16 65,-12 65,0 L 100,0 ';
                else path += 'L 35,0 C 35,12 43,16 50,16 C 57,16 65,12 65,0 L 100,0 ';

                // Borde Derecho
                if (right === 0) path += 'L 100,100 ';
                else if (right === 1) path += 'L 100,35 C 112,35 116,43 116,50 C 116,57 112,65 100,65 L 100,100 ';
                else path += 'L 100,35 C 88,35 84,43 84,50 C 84,57 88,65 100,65 L 100,100 ';

                // Borde Inferior
                if (bottom === 0) path += 'L 0,100 ';
                else if (bottom === 1) path += 'L 65,100 C 65,112 57,116 50,116 C 43,116 35,112 35,100 L 0,100 ';
                else path += 'L 65,100 C 65,88 57,84 50,84 C 43,84 35,88 35,100 L 0,100 ';

                // Borde Izquierdo
                if (left === 0) path += 'L 0,0 ';
                else if (left === 1) path += 'L 0,65 C -12,65 -16,57 -16,50 C -16,43 -12,35 0,35 L 0,0 ';
                else path += 'L 0,65 C 12,65 16,57 16,50 C 16,43 12,35 0,35 L 0,0 ';

                path += 'Z';

                // Crear celda
                const cell = document.createElement('div');
                cell.className = 'puzzle-piece';
                cell.setAttribute('data-row', r);
                cell.setAttribute('data-col', c);

                // Variables para dirección y offsets de desensamblaje
                const randAngle = Math.floor(Math.random() * 40 - 20);
                const randX = Math.floor(Math.random() * 80 - 40);
                const randY = Math.floor(Math.random() * 80 - 40);

                cell.style.setProperty('--rand-angle', `${randAngle}deg`);
                cell.style.setProperty('--rand-x', `${randX}px`);
                cell.style.setProperty('--rand-y', `${randY}px`);

                cell.innerHTML = `
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="${path}"></path>
                    </svg>
                `;

                overlay.appendChild(cell);
            }
        }
    }

    // Procedimiento para desensamblar el puzle y revelar la página
    function disassemblePuzzle(overlay, callback) {
        const pieces = overlay.querySelectorAll('.puzzle-piece');
        overlay.classList.add('shrinking');
        overlay.classList.remove('expanding');

        // Determinar límites de la grilla de forma dinámica
        let maxRow = 0;
        let maxCol = 0;
        pieces.forEach(piece => {
            const r = parseInt(piece.getAttribute('data-row')) || 0;
            const c = parseInt(piece.getAttribute('data-col')) || 0;
            if (r > maxRow) maxRow = r;
            if (c > maxCol) maxCol = c;
        });

        pieces.forEach(piece => {
            const r = parseInt(piece.getAttribute('data-row'));
            const c = parseInt(piece.getAttribute('data-col'));
            
            // Retraso escalonado (stagger) en reversa adaptable
            const delay = ((maxRow - r) + (maxCol - c)) * 40;

            const rx = piece.style.getPropertyValue('--rand-x');
            const ry = piece.style.getPropertyValue('--rand-y');
            const ra = piece.style.getPropertyValue('--rand-angle');

            piece.style.transitionDelay = `${delay}ms`;
            piece.style.transform = `scale(0) rotate(${ra}) translate(${rx}, ${ry})`;
            piece.style.opacity = '0';
        });

        // Ocultar el overlay tras finalizar la animación de la última pieza
        setTimeout(() => {
            overlay.classList.remove('shrinking');
            if (callback) callback();
        }, 850);
    }

    // Procedimiento para ensamblar el puzle (cubrir la pantalla)
    function assemblePuzzle(overlay, callback) {
        const pieces = overlay.querySelectorAll('.puzzle-piece');
        overlay.classList.add('expanding');
        overlay.classList.remove('shrinking');

        pieces.forEach(piece => {
            const r = parseInt(piece.getAttribute('data-row'));
            const c = parseInt(piece.getAttribute('data-col'));
            
            // Retraso escalonado (stagger) de arriba-izquierda a abajo-derecha
            const delay = (r + c) * 40;

            piece.style.transitionDelay = `${delay}ms`;
            piece.style.transform = 'scale(1) rotate(0deg) translate(0, 0)';
            piece.style.opacity = '1';
        });

        // Llamar al callback cuando termine de ensamblarse la última pieza
        setTimeout(() => {
            if (callback) callback();
        }, 850);
    }

    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
        let transText = overlay.querySelector('.transition-text');
        if (!transText) {
            transText = document.createElement('div');
            transText.className = 'transition-text';
            overlay.appendChild(transText);
        }
        transText.innerHTML = 'Niveles de<br>Lenguaje';

        // Definir color del texto y del puzle según la página actual
        let currentTextColor = '#1a1a1a';
        let currentPuzzleColor = '#ebdcd0';
        if (document.body.classList.contains('purple-theme')) {
            currentTextColor = '#2d0b4e';
            currentPuzzleColor = '#dcd0f0';
        } else if (document.body.classList.contains('terracotta-theme')) {
            currentTextColor = '#4e1f13';
            currentPuzzleColor = '#f2cebf';
        } else if (document.body.classList.contains('green-theme')) {
            currentTextColor = '#1b4d3e';
            currentPuzzleColor = '#cce2d3';
        } else if (document.body.classList.contains('amber-theme')) {
            currentTextColor = '#7c5a0b';
            currentPuzzleColor = '#f5e5b3';
        }
        transText.style.color = currentTextColor;
        overlay.style.setProperty('--puzzle-color', currentPuzzleColor);

        // Construir el puzle
        buildPuzzleOverlay(overlay);

        // Forzar a todas las piezas a estar ensambladas inicialmente
        const pieces = overlay.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => {
            piece.style.transform = 'scale(1) rotate(0deg) translate(0, 0)';
            piece.style.opacity = '1';
        });

        // Iniciar desensamblado con delay inicial corto
        setTimeout(() => {
            disassemblePuzzle(overlay, () => {
                // Disparar los brillitos al finalizar la transición de entrada
                if (typeof triggerTitleSparkles === 'function') {
                    const mainTitle = document.querySelector('.striped-header h2, .welcome-title');
                    if (mainTitle) triggerTitleSparkles(mainTitle);
                }
            });
        }, 100);
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

    // --- 3. ANIMACIÓN DE PUZLE AL HACER CLICK EN ENLACES DE LA NAVBAR ---
    const transitionLinks = document.querySelectorAll('.navbar-link, .navbar-title-link');
    transitionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && !href.startsWith('#')) {
                const rightLinks = document.querySelector('.navbar-right-links');

                // Si ya estamos en la página del enlace, no hacer nada
                if (isCurrentPage(href)) {
                    e.preventDefault();
                    if (window.innerWidth <= 600 && rightLinks) {
                        rightLinks.classList.remove('menu-active');
                    }
                    return;
                }

                // CASO ESPECIAL EN MÓVIL PARA EL TÍTULO DE LA NAVBAR
                if (this.classList.contains('navbar-title-link') && window.innerWidth <= 600) {
                    if (rightLinks && !rightLinks.classList.contains('menu-active')) {
                        // Prevenir la navegación y abrir/mostrar los enlaces del menú
                        e.preventDefault();
                        e.stopPropagation();
                        rightLinks.classList.add('menu-active');
                        return; // Detener flujo
                    }
                }
                
                e.preventDefault();
                
                if (overlay) {
                    let transText = overlay.querySelector('.transition-text');
                    if (!transText) {
                        transText = document.createElement('div');
                        transText.className = 'transition-text';
                        overlay.appendChild(transText);
                    }
                    transText.innerHTML = 'Niveles de<br>Lenguaje';

                    // Definir color de las piezas y de texto destino
                    let targetPuzzleColor = '#ebdcd0';
                    let targetTextColor = '#1a1a1a';
                    if (href.includes('fonologico')) {
                        targetPuzzleColor = '#dcd0f0';
                        targetTextColor = '#2d0b4e';
                    } else if (href.includes('morfosintactico')) {
                        targetPuzzleColor = '#f2cebf';
                        targetTextColor = '#4e1f13';
                    } else if (href.includes('semantico')) {
                        targetPuzzleColor = '#f5e5b3';
                        targetTextColor = '#7c5a0b';
                    } else if (href.includes('pragmatico')) {
                        targetPuzzleColor = '#cce2d3';
                        targetTextColor = '#1b4d3e';
                    }
                    
                    overlay.style.setProperty('--puzzle-color', targetPuzzleColor);
                    transText.style.color = targetTextColor;

                    // Re-construir las piezas con el color destino
                    buildPuzzleOverlay(overlay);

                    // Inicialmente desensambladas
                    const pieces = overlay.querySelectorAll('.puzzle-piece');
                    pieces.forEach(piece => {
                        const rx = piece.style.getPropertyValue('--rand-x');
                        const ry = piece.style.getPropertyValue('--rand-y');
                        const ra = piece.style.getPropertyValue('--rand-angle');
                        piece.style.transform = `scale(0) rotate(${ra}) translate(${rx}, ${ry})`;
                        piece.style.opacity = '0';
                    });

                    // Forzar reflow/registro de estilos
                    overlay.offsetHeight;

                    // Ensamblar el puzle y redirigir
                    assemblePuzzle(overlay, () => {
                        window.location.href = href;
                    });
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
        "seccion-actos-habla": {
            type: "quiz",
            title: "Demo: Actos de Habla",
            examples: [
                { text: "Dices: '¡Qué lindo día para jugar!' buscando que tu amigo salga al patio. ☀️", question: "¿Qué tipo de acto de habla es?", options: ["Acto indirecto (petición sutil)", "Acto directo (orden clara)", "Ninguno"], correct: "Acto indirecto (petición sutil)", speech: "Dices: qué lindo día para jugar buscando que tu amigo salga al patio. ¿Qué tipo de acto de habla es?", success: "¡Excelente! Expresas tu deseo de forma indirecta y sutil.", error: "No. No diste una orden directa, sino que sugeriste sutilmente." },
                { text: "El profesor dice: 'Abran su cuaderno en la página diez.' 📖", question: "¿Qué tipo de acto de habla es?", options: ["Acto directo (orden clara)", "Acto indirecto (sugerencia)", "Ninguno"], correct: "Acto directo (orden clara)", speech: "El profesor dice: abran su cuaderno en la página diez. ¿Qué tipo de acto de habla es?", success: "¡Muy bien! Es una instrucción clara y directa de lo que debes hacer.", error: "No, es una orden directa y explícita, no una sugerencia." }
            ]
        },
        "seccion-miremos-siente": {
            type: "quiz",
            title: "Demo: Reconocer Emociones",
            examples: [
                { text: "Juan sonríe ampliamente and aplaude. 😊", question: "¿Cómo se siente Juan?", options: ["Enojado", "Alegre", "Triste"], correct: "Alegre", speech: "Juan sonríe ampliamente y aplaude. ¿Cómo se siente Juan?", success: "¡Excelente! La sonrisa y aplausos indican alegría.", error: "No, las sonrisas no demuestran esa emoción." },
                { text: "Sofía cruza los brazos y frunce el ceño. 😠", question: "¿Cómo se siente Sofía?", options: ["Asustada", "Enojada", "Alegre"], correct: "Enojada", speech: "Sofía cruza los brazos y frunce el ceño. ¿Cómo se siente Sofía?", success: "¡Correcto! Esa postura corporal denota enfado.", error: "Esa expresión facial no indica miedo o alegría." }
            ]
        },
        "seccion-expresion-emociones": {
            type: "quiz",
            title: "Demo: Reconocer Emociones II",
            examples: [
                { text: "Sofía sonríe al ver a su abuela y corre a abrazarla. 🤗", question: "¿Cómo se siente Sofía?", options: ["Feliz y cariñosa", "Enojada", "Asustada"], correct: "Feliz y cariñosa", speech: "Sofía sonríe al ver a su abuela y corre a abrazarla. ¿Cómo se siente Sofía?", success: "¡Excelente! La sonrisa y el abrazo demuestran afecto y felicidad.", error: "No. El comportamiento afectuoso no demuestra enojo o susto." },
                { text: "Luis suspira con los hombros caídos al perder su juguete favorito. 😞", question: "¿Cómo se siente Luis?", options: ["Triste", "Enojado", "Sorprendido"], correct: "Triste", speech: "Luis suspira con los hombros caídos al perder su juguete. ¿Cómo se siente Luis?", success: "¡Muy bien! Los hombros caídos y el suspiro expresan pena.", error: "No. El desánimo y suspiros indican tristeza y desilusión." }
            ]
        },
        "seccion-proxemica": {
            type: "quiz",
            title: "Demo: Espacio Personal (Proxémica)",
            examples: [
                { text: "Tu amigo te está hablando y se acerca tanto que casi toca tu nariz. 👃", question: "¿Qué espacio está invadiendo?", options: ["Tu espacio personal", "Tu espacio público", "Tu espacio escolar"], correct: "Tu espacio personal", speech: "Tu amigo te habla de tan cerca que casi toca tu nariz. ¿Qué espacio está invadiendo?", success: "¡Muy bien! Debemos respetar el espacio personal íntimo de cada uno.", error: "No. El espacio inmediato alrededor de nuestro cuerpo es el espacio personal." },
                { text: "Al conversar con alguien en el patio del colegio. 👥", question: "Al conversar con alguien en el patio, ¿a qué distancia es adecuado pararse?", options: ["A un paso de distancia (distancia cómoda)", "Pegado a él tocando su hombro", "A cinco metros de distancia (muy lejos)"], correct: "A un paso de distancia (distancia cómoda)", speech: "Al conversar con alguien en el patio, ¿a qué distancia es adecuado pararse?", success: "¡Excelente! Mantener un paso de distancia es cómodo y respetuoso.", error: "No. Estar demasiado pegado o extremadamente lejos dificulta la conversación." }
            ]
        },
        "seccion-contacto-ocular": {
            type: "quiz",
            title: "Demo: Contacto Ocular",
            examples: [
                { text: "Cuando le estás contando algo divertido a tu amigo, él te mira fijamente a los ojos. 👀", question: "¿Qué demuestra esto?", options: ["Que te está escuchando con atención", "Que está aburrido", "Que quiere irse"], correct: "Que te está escuchando con atención", speech: "Cuando le cuentas algo divertido a tu amigo, él te mira a los ojos. ¿Qué demuestra esto?", success: "¡Excelente! Mirar a los ojos al hablar demuestra interés y respeto.", error: "No. Evitar la mirada suele indicar desinterés, mirarte indica atención." },
                { text: "Estás conversando con alguien y esa persona mira constantemente su reloj y el suelo. ⌚", question: "¿Qué crees que pasa?", options: ["Está aburrida o apurada", "Está muy feliz escuchándote", "Tiene mucho sueño"], correct: "Está aburrida o apurada", speech: "Estás conversando y esa persona mira su reloj y el suelo constantemente. ¿Qué crees que pasa?", success: "¡Correcto! Apartar la mirada constantemente indica distracción, prisa o aburrimiento.", error: "No. Mirar el reloj no indica alegría o interés en la conversación." }
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
        "seccion-acceso-lexico": {
            type: "quiz",
            title: "Demo: Acceso al Léxico",
            examples: [
                { text: "Pista: Redondo, rebota y sirve para jugar fútbol. ⚽", question: "¿Qué objeto es?", options: ["Pelota", "Mesa", "Lápiz"], correct: "Pelota", speech: "Redondo, rebota y sirve para jugar fútbol. ¿Qué objeto es?", success: "¡Excelente! Una pelota sirve para jugar fútbol.", error: "No es correcto. Piensa en algo redondo que rebote." },
                { text: "Pista: Objeto de vidrio que sirve para beber agua. 🥛", question: "¿Qué objeto es?", options: ["Vaso", "Plato", "Cuchara"], correct: "Vaso", speech: "Objeto de vidrio que sirve para beber agua. ¿Qué objeto es?", success: "¡Muy bien! Bebemos agua en un vaso.", error: "No. ¿En qué servimos el agua para tomar?" }
            ]
        },
        "seccion-fluidez-lexica": {
            type: "quiz",
            title: "Demo: Fluidez Léxica",
            examples: [
                { text: "Consigna: Busca una palabra que comience con la letra M. 🅰️", question: "¿Cuál empieza con M?", options: ["Mesa", "Casa", "Pelota"], correct: "Mesa", speech: "Busca una palabra que comience con la letra M.", success: "¡Excelente! Mesa comienza con la letra M.", error: "Inténtalo de nuevo. Esa palabra no empieza con M." },
                { text: "Consigna: Busca una palabra que comience con la letra P. 🅰️", question: "¿Cuál empieza con P?", options: ["Perro", "Gato", "Árbol"], correct: "Perro", speech: "Busca una palabra que comience con la letra P.", success: "¡Muy bien! Perro comienza con la letra P.", error: "No. Busca la que tiene sonido inicial P." }
            ]
        },
        "seccion-relacion-lexica": {
            type: "quiz",
            title: "Demo: Relación Léxica",
            examples: [
                { text: "Consigna: ¿Cuál de estas palabras se relaciona con la cocina? 🍳", question: "¿Qué elemento es de cocina?", options: ["Olla", "Cama", "Cuaderno"], correct: "Olla", speech: "De las opciones, ¿cuál se relaciona con la cocina?", success: "¡Correcto! La olla es un utensilio de cocina.", error: "Esa palabra no pertenece a la cocina." },
                { text: "Consigna: ¿Cuál de estas palabras se relaciona con el colegio? 🎒", question: "¿Qué elemento es del colegio?", options: ["Estuche", "Cuchillo", "Sofá"], correct: "Estuche", speech: "De las opciones, ¿cuál se relaciona con el colegio?", success: "¡Excelente! El estuche sirve para llevar lápices al colegio.", error: "No. Buscamos algo que uses para tus tareas o clases." }
            ]
        },
        "seccion-funciones-objetos": {
            type: "quiz",
            title: "Demo: Funciones de Objetos",
            examples: [
                { text: "Pregunta: ¿Para qué sirve un cepillo de dientes? 🪥", question: "¿Cuál es su función?", options: ["Para lavarse los dientes", "Para peinarse", "Para escribir"], correct: "Para lavarse los dientes", speech: "¿Para qué sirve un cepillo de dientes?", success: "¡Excelente! Lo usamos para la higiene bucal.", error: "No es correcto. Piensa en tus dientes." },
                { text: "Pregunta: ¿Para qué sirve una llave? 🔑", question: "¿Cuál es su función?", options: ["Para abrir puertas", "Para cortar papel", "Para cocinar"], correct: "Para abrir puertas", speech: "¿Para qué sirve una llave?", success: "¡Muy bien! Las llaves sirven para abrir cerraduras.", error: "No, las llaves no sirven para eso." }
            ]
        },
        "seccion-analogias": {
            type: "quiz",
            title: "Demo: Analogías",
            examples: [
                { text: "Analogía: El día es al sol como la noche es a... ☀️🌙", question: "Completa la relación:", options: ["la luna", "las nubes", "la lluvia"], correct: "la luna", speech: "El día es al sol como la noche es a...", success: "¡Excelente! La luna ilumina la noche.", error: "Piensa en el elemento brillante de la noche." },
                { text: "Analogía: El pájaro vuela por el aire como el pez nada en... 🐦🐟", question: "Completa la relación:", options: ["el agua", "la tierra", "el cielo"], correct: "el agua", speech: "El pájaro vuela por el aire como el pez nada en...", success: "¡Correcto! Los peces nadan en el agua.", error: "No, los peces necesitan agua para nadar." }
            ]
        },
        "seccion-opuestos-antonimos": {
            type: "quiz",
            title: "Demo: Opuestos y Antónimos",
            examples: [
                { text: "Pregunta: ¿Cuál es el opuesto de 'grande'? 🐘", question: "Selecciona el antónimo:", options: ["Pequeño", "Enorme", "Gigante"], correct: "Pequeño", speech: "¿Cuál es el opuesto de grande?", success: "¡Muy bien! Pequeño es el antónimo de grande.", error: "No, eso significa lo mismo o similar. Busca el contrario." },
                { text: "Pregunta: ¿Cuál es el opuesto de 'frío'? ❄️", question: "Selecciona el antónimo:", options: ["Caliente", "Helado", "Templado"], correct: "Caliente", speech: "¿Cuál es el opuesto de frío?", success: "¡Excelente! Caliente es el opuesto directo de frío.", error: "No. Piensa en el fuego o el verano." }
            ]
        },
        "seccion-sinonimos": {
            type: "quiz",
            title: "Demo: Sinónimos",
            examples: [
                { text: "Pregunta: ¿Cuál es el sinónimo de 'feliz'? 😊", question: "Selecciona la palabra con igual significado:", options: ["Alegre", "Triste", "Enojado"], correct: "Alegre", speech: "¿Cuál es el sinónimo de feliz?", success: "¡Excelente! Alegre significa lo mismo que feliz.", error: "Ese es el opuesto. Buscamos el sinónimo." },
                { text: "Pregunta: ¿Cuál es el sinónimo de 'rápido'? ⚡", question: "Selecciona la palabra con igual significado:", options: ["Veloz", "Lento", "Pausado"], correct: "Veloz", speech: "¿Cuál es el sinónimo de rápido?", success: "¡Muy bien! Veloz es sinónimo de rápido.", error: "No, ese es el antónimo. Busca el significado parecido." }
            ]
        },
        "seccion-definicion-elementos": {
            type: "quiz",
            title: "Demo: Definición de Elementos",
            examples: [
                { text: "Pregunta: ¿Cómo se define una 'fruta'? 🍎", question: "Selecciona la definición correcta:", options: ["Alimento dulce que sale de una planta", "Objeto de madera para sentarse", "Vehículo de cuatro ruedas"], correct: "Alimento dulce que sale de una planta", speech: "Cómo se define una fruta.", success: "¡Excelente! Las frutas son alimentos de origen vegetal.", error: "Esa no es la definición de una fruta." },
                { text: "Pregunta: ¿Cómo se define una 'cama'? 🛏️", question: "Selecciona la definición correcta:", options: ["Mueble que sirve para dormir", "Prenda de vestir para abrigarse", "Utensilio para comer sopa"], correct: "Mueble que sirve para dormir", speech: "Cómo se define una cama.", success: "¡Muy bien! La cama es para descansar o dormir.", error: "No. ¿Para qué usamos la cama todos los días?" }
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
            title: "Demo: Categorización Semántica",
            examples: [
                { text: "Elementos: 'manzana, plátano, uva' 🍎🍌🍇", question: "¿A qué grupo pertenecen?", options: ["Frutas", "Verduras", "Juguetes"], correct: "Frutas", speech: "Manzana, plátano y uva. ¿A qué grupo pertenecen?", success: "¡Correcto! Todos son deliciosos tipos de frutas.", error: "No son verduras o juguetes. Son frutas de comer." },
                { text: "Elementos: 'perro, gato, león' 🐶🐱🦁", question: "¿A qué grupo pertenecen?", options: ["Animales", "Plantas", "Medios de transporte"], correct: "Animales", speech: "Perro, gato y león. ¿A qué grupo pertenecen?", success: "¡Excelente! Son animales domésticos y salvajes.", error: "No son plantas ni vehículos. Son seres vivos animales." }
            ]
        },
        "seccion-adivina-conceptos": {
            type: "quiz",
            title: "Demo: Adivinar Conceptos",
            examples: [
                { text: "Pista: Sirve para escribir y tiene una goma atrás. ✏️", question: "¿Qué útil escolar es?", options: ["Lápiz", "Regla", "Tijeras"], correct: "Lápiz", speech: "Sirve para escribir y tiene una goma atrás. ¿Qué útil escolar es?", success: "¡Excelente! El lápiz sirve para escribir y borrar.", error: "Inténtalo de nuevo. Piensa en el objeto con el que escribes." },
                { text: "Pista: Rey de la selva con una gran melena. 🦁", question: "¿Qué animal es?", options: ["León", "Oso", "Jirafa"], correct: "León", speech: "Rey de la selva con una gran melena. ¿Qué animal es?", success: "¡Muy bien! El león es conocido como el rey de la selva.", error: "No. ¿Qué felino ruge fuerte y tiene melena?" }
            ]
        },
        "seccion-definiciones-simples": {
            type: "quiz",
            title: "Demo: Definiciones Simples",
            examples: [
                { text: "Pregunta: ¿Qué prenda se define como: 'Ropa que cubre el pie y parte de la pierna'? 🧦", question: "Selecciona la palabra correcta:", options: ["Calcetín", "Sombrero", "Camiseta"], correct: "Calcetín", speech: "Qué prenda se define como ropa que cubre el pie y parte de la pierna.", success: "¡Excelente! Los calcetines abrigan nuestros pies.", error: "No. Eso se usa en la cabeza o el torso. Piensa en tus pies." },
                { text: "Pregunta: ¿Qué objeto se define como: 'Instrumento para cortar papel o tela'? ✂️", question: "Selecciona la palabra correcta:", options: ["Tijeras", "Lápiz", "Regla"], correct: "Tijeras", speech: "Qué objeto se define como instrumento para cortar papel o tela.", success: "¡Muy bien! Las tijeras sirven para recortar.", error: "No, las reglas o lápices no sirven para recortar." }
            ]
        },
        "seccion-lenguaje-figurado": {
            type: "quiz",
            title: "Demo: Lenguaje Figurado",
            examples: [
                { text: "Dicho: '¡Esa torta me costó un ojo de la cara!' 👁️💰", question: "¿Qué significa realmente?", options: ["Que era extremadamente cara", "Que tuvo que dar su ojo físico", "Que estaba muy barata"], correct: "Que era extremadamente cara", speech: "¡Esa torta me costó un ojo de la cara! ¿Qué significa realmente?", success: "¡Excelente! Significa que el precio era muy elevado.", error: "No, es una metáfora. Nadie da sus ojos por una torta." },
                { text: "Dicho: '¡Se me puso la piel de gallina!' 🐔🥶", question: "¿Qué significa realmente?", options: ["Que sintió frío o mucho susto", "Que le crecieron plumas", "Que se convirtió en gallina"], correct: "Que sintió frío o mucho susto", speech: "¡Se me puso la piel de gallina! ¿Qué significa realmente?", success: "¡Muy bien! Es la reacción de la piel al frío o miedo.", error: "No es literal. ¿Cuándo tiembla nuestra piel de esa forma?" }
            ]
        },
        "seccion-que-pasara": {
            type: "quiz",
            title: "Demo: ¿Qué Pasará?",
            examples: [
                { text: "Un niño corre muy rápido hacia un gran charco de agua sin frenar. 🏃‍♂️💦", question: "¿Qué pasará después?", options: ["Se va a mojar y salpicar todo", "Se quedará seco", "El charco desaparecerá"], correct: "Se va a mojar y salpicar todo", speech: "Un niño corre hacia un charco de agua sin frenar. ¿Qué pasará después?", success: "¡Excelente! Si pisas fuerte el agua, te mojas y salpicas.", error: "No. Si corre y salta al charco, se mojará inevitablemente." },
                { text: "Dejas un vaso con helado de chocolate directo bajo el sol en verano. ☀️🍦", question: "¿Qué pasará después?", options: ["El helado se derretirá", "Se congelará más", "Se convertirá en manzana"], correct: "El helado se derretirá", speech: "Dejas un vaso con helado bajo el sol. ¿Qué pasará después?", success: "¡Muy bien! El calor del sol derrite los helados.", error: "No. El sol entrega calor, por lo que se va a derretir." }
            ]
        },
        "seccion-manejo-topicos": {
            type: "quiz",
            title: "Demo: Manejo de Tópicos",
            examples: [
                { text: "Tu amigo te está hablando de dinosaurios y tú de repente le dices: '¡Ayer comí pizza!' 🦖🍕", question: "¿Qué hiciste con el tema?", options: ["Cambiaste el tema sin avisar", "Mantuviste el tema de dinosaurios", "Escuchaste con atención"], correct: "Cambiaste el tema sin avisar", speech: "Tu amigo te habla de dinosaurios y tú dices ayer comí pizza. ¿Qué hiciste con el tema?", success: "¡Muy bien! Cambiar de tema repentinamente puede confundir al oyente.", error: "No. El tema era dinosaurios, al hablar de pizza cambiaste bruscamente el tema." },
                { text: "Alguien te dice: 'Me gustan mucho los perros'. 🐶", question: "¿Qué le respondes para mantener el tema?", options: ["¿Cuál es tu raza de perro favorita?", "A mí me gusta andar en bicicleta", "Mañana va a llover mucho"], correct: "¿Cuál es tu raza de perro favorita?", speech: "Alguien dice que le gustan los perros. ¿Qué le respondes para mantener el tema?", success: "¡Excelente! Hacer una pregunta relacionada ayuda a mantener la conversación fluida.", error: "No. Esa respuesta no se relaciona con los perros y corta la conversación." }
            ]
        },
        "seccion-funcion-imaginativa": {
            type: "quiz",
            title: "Demo: Función Imaginativa",
            examples: [
                { text: "Ves un cohete espacial de juguete y te imaginas viajando a la Luna. 🚀🌕", question: "¿Qué historia fantástica inventas primero?", options: ["¡Viajaremos al espacio exterior y conoceremos alienígenas!", "El juguete es de plástico duro", "La Luna brilla de noche"], correct: "¡Viajaremos al espacio exterior y conoceremos alienígenas!", speech: "Ves un cohete espacial de juguete y te imaginas viajando a la Luna. ¿Qué historia fantástica inventas primero?", success: "¡Increíble imaginación! Usas el lenguaje para crear mundos y fantasías hermosas.", error: "No. Eso es una descripción fría, no estás creando una historia de fantasía." },
                { text: "Quieres jugar al 'barco pirata' usando una simple caja de cartón. 📦🏴‍☠️", question: "¿Qué dices para iniciar el juego?", options: ["¡Todos a bordo, busquemos el tesoro perdido!", "Esta caja es de color café", "Las cajas sirven para guardar cosas"], correct: "¡Todos a bordo, busquemos el tesoro perdido!", speech: "Quieres jugar al barco pirata usando una simple caja de cartón. ¿Qué dices para iniciar el juego?", success: "¡Perfecto! Así es como el lenguaje imaginativo le da vida a la fantasía.", error: "No. Decir que la caja es de color café es descriptivo, no estimula la imaginación." }
            ]
        },
        "seccion-prosodia": {
            type: "quiz",
            title: "Demo: Entonación (Prosodia)",
            examples: [
                { text: "Alguien te dice con voz fuerte, rápida y el ceño fruncido: '¡No quiero hacer eso!' 🗣️", question: "¿Cómo se siente según su voz?", options: ["Enojado", "Feliz", "Asustado"], correct: "Enojado", speech: "Alguien dice con voz fuerte y rápida ¡no quiero hacer eso! ¿Cómo se siente según su voz?", success: "¡Excelente! El tono fuerte y cortante transmite enfado.", error: "No. El volumen y velocidad no indican felicidad o calma." },
                { text: "Tu mamá te dice suspirando de forma suave y lenta: 'Qué lindo dibujo hiciste...' 🎨💖", question: "¿Qué transmite su tono de voz?", options: ["Cariño y orgullo", "Enojo y rabia", "Susto y pánico"], correct: "Cariño y orgullo", speech: "Tu mamá dice suspirando de forma suave: Qué lindo dibujo hiciste. ¿Qué transmite su tono de voz?", success: "¡Muy bien! Una voz suave y pausada transmite afecto y tranquilidad.", error: "No. El tono suave no refleja enojo, rabia o pánico." }
            ]
        },
        "seccion-teoria-mente": {
            type: "quiz",
            title: "Demo: Teoría de la Mente",
            examples: [
                { text: "María guarda su chocolate en el cajón y sale al patio. Juan entra y cambia el chocolate a la mochila. 🍫🎒", question: "Cuando María regrese, ¿dónde buscará primero su chocolate?", options: ["En el cajón", "En la mochila", "En la mesa"], correct: "En el cajón", speech: "María guarda su chocolate en el cajón y sale. Juan lo cambia a la mochila. Cuando María regrese, ¿dónde buscará primero su chocolate?", success: "¡Excelente! María buscará en el cajón porque ella no vio que Juan lo cambió.", error: "No. Recuerda que María no estuvo presente cuando Juan cambió el chocolate." },
                { text: "Tu amigo está llorando en silencio mirando su dibujo roto. 😢🎨", question: "¿Qué está pensando y sintiendo tu amigo?", options: ["Está triste porque su dibujo se dañó", "Está feliz porque quiere hacer otro", "Está aburrido de pintar"], correct: "Está triste porque su dibujo se dañó", speech: "Tu amigo está llorando en silencio mirando su dibujo roto. ¿Qué está pensando y sintiendo?", success: "¡Muy bien! Llorar por un objeto roto demuestra frustración y tristeza por esa pérdida.", error: "No, las lágrimas de silencio sobre su trabajo roto indican pena, no felicidad." }
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

    // --- EFECTO DE BRILLITOS (SPARKLES) EN TÍTULOS ---
    function triggerTitleSparkles(titleElement) {
        const el = titleElement || document.querySelector('.striped-header h2, .welcome-title');
        if (!el) return;

        // Asegurarse de que el título tenga position relative y la clase sparkle-container
        el.classList.add('sparkle-container');

        // Eliminar spawners antiguos si los hay para reiniciar la animación
        el.querySelectorAll('.sparkle-spawner').forEach(spawner => spawner.remove());

        // Crear spawner izquierdo y derecho
        const leftSpawner = document.createElement('div');
        leftSpawner.className = 'sparkle-spawner left-spawner';
        leftSpawner.style.left = '-15px';
        leftSpawner.style.top = '10px';

        const rightSpawner = document.createElement('div');
        rightSpawner.className = 'sparkle-spawner right-spawner';
        rightSpawner.style.right = '-15px';
        rightSpawner.style.top = '10px';

        // Añadir 3 brillitos al spawner izquierdo
        for (let i = 1; i <= 3; i++) {
            const pill = document.createElement('div');
            pill.className = 'sparkle-pill';
            pill.style.animation = `pop-sparkle-left-${i} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            pill.style.animationDelay = `${(i - 1) * 0.05}s`;
            leftSpawner.appendChild(pill);
        }

        // Añadir 3 brillitos al spawner derecho
        for (let i = 1; i <= 3; i++) {
            const pill = document.createElement('div');
            pill.className = 'sparkle-pill';
            pill.style.animation = `pop-sparkle-right-${i} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            pill.style.animationDelay = `${(i - 1) * 0.05}s`;
            rightSpawner.appendChild(pill);
        }

        el.appendChild(leftSpawner);
        el.appendChild(rightSpawner);
    }

    // Exponer la función para que el overlay de transición la llame
    window.triggerTitleSparkles = triggerTitleSparkles;

    // Inicializar juegos demo al final de la carga
    initDemoGames();

    // Disparar en el título principal diferido al cargar
    setTimeout(() => {
        const mainTitle = document.querySelector('.striped-header h2, .welcome-title');
        if (mainTitle) triggerTitleSparkles(mainTitle);
    }, 600);

    // Seleccionar TODOS los títulos del sitio para aplicarles el efecto
    const allTitles = document.querySelectorAll(
        '.striped-header h2, .welcome-title, .activity-section-title, .guide-title, .intro-title, .levels-subtitle, .levels-title, .activity-card-container h3, .activity-card-container h4, .striped-header-container h2'
    );

    // 1. Agregar listener para disparar los brillitos al pasar el mouse por encima
    allTitles.forEach(title => {
        title.addEventListener('mouseenter', () => {
            triggerTitleSparkles(title);
        });
    });

    // 2. Agregar IntersectionObserver para disparar el efecto al aparecer en pantalla al hacer scroll
    if ('IntersectionObserver' in window) {
        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerTitleSparkles(entry.target);
                    // Dejar de observar para que brille solo la primera vez que se hace scroll hasta él
                    titleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        allTitles.forEach(title => {
            titleObserver.observe(title);
        });
    }

    // Cerrar el menú móvil automáticamente si se hace click fuera de la navbar
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 600) {
            const rightLinks = document.querySelector('.navbar-right-links');
            if (rightLinks && !e.target.closest('.navbar')) {
                rightLinks.classList.remove('menu-active');
            }
        }
    });
}
