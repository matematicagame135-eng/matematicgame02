/**
 * Fuga da Guilhotina: O Desafio Matemático
 * Game Logic - ES6+ OOP Architecture
 */

// ===========================
// MATH QUESTION GENERATOR
// ===========================
class MathGenerator {
    constructor() {
        this.operations = ['+', '−', '×', '÷'];
    }

    /**
     * Generate a math question based on current difficulty level.
     * Level 1-2: Addition/Subtraction (1-10)
     * Level 3-4: Addition/Subtraction (1-20) + Multiplication (1-10)
     * Level 5-6: All operations, larger numbers
     * Level 7+: All operations, big numbers
     */
    generate(level) {
        const roll = Math.random();
        let a, b, op, answer;

        if (level <= 2) {
            // Simple addition & subtraction
            op = roll < 0.5 ? '+' : '−';
            a = this._rand(1, 10);
            b = this._rand(1, 10);
            if (op === '−' && b > a) [a, b] = [b, a]; // avoid negatives
            answer = op === '+' ? a + b : a - b;
        } else if (level <= 4) {
            if (roll < 0.35) {
                op = '+';
                a = this._rand(1, 25);
                b = this._rand(1, 25);
            } else if (roll < 0.65) {
                op = '−';
                a = this._rand(5, 30);
                b = this._rand(1, a);
            } else {
                op = '×';
                a = this._rand(2, 10);
                b = this._rand(2, 10);
            }
            answer = op === '+' ? a + b : op === '−' ? a - b : a * b;
        } else if (level <= 6) {
            if (roll < 0.25) {
                op = '+';
                a = this._rand(10, 50);
                b = this._rand(10, 50);
            } else if (roll < 0.5) {
                op = '−';
                a = this._rand(15, 60);
                b = this._rand(1, a);
            } else if (roll < 0.75) {
                op = '×';
                a = this._rand(2, 12);
                b = this._rand(2, 12);
            } else {
                op = '÷';
                b = this._rand(2, 10);
                answer = this._rand(2, 12);
                a = b * answer;
            }
            if (op !== '÷') {
                answer = op === '+' ? a + b : op === '−' ? a - b : a * b;
            }
        } else {
            if (roll < 0.2) {
                op = '+';
                a = this._rand(20, 100);
                b = this._rand(20, 100);
            } else if (roll < 0.4) {
                op = '−';
                a = this._rand(30, 100);
                b = this._rand(1, a);
            } else if (roll < 0.7) {
                op = '×';
                a = this._rand(3, 15);
                b = this._rand(3, 15);
            } else {
                op = '÷';
                b = this._rand(2, 12);
                answer = this._rand(2, 15);
                a = b * answer;
            }
            if (op !== '÷') {
                answer = op === '+' ? a + b : op === '−' ? a - b : a * b;
            }
        }

        return {
            text: `${a} ${op} ${b} = ?`,
            answer: answer,
            choices: this._generateChoices(answer, level)
        };
    }

    _generateChoices(correct, level) {
        const choices = new Set([correct]);
        const range = Math.max(3, Math.min(level * 2, 10));
        let attempts = 0;

        while (choices.size < 4 && attempts < 100) {
            let offset = this._rand(1, range);
            if (Math.random() < 0.5) offset = -offset;
            let wrong = correct + offset;
            // Avoid negatives and duplicates
            if (wrong >= 0 && wrong !== correct) {
                choices.add(wrong);
            }
            attempts++;
        }

        // Fill remaining with simple offsets if needed
        let fill = 1;
        while (choices.size < 4) {
            if (!choices.has(correct + fill)) choices.add(correct + fill);
            else if (!choices.has(correct - fill) && correct - fill >= 0) choices.add(correct - fill);
            fill++;
        }

        return this._shuffle([...choices]);
    }

    _rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}


// ===========================
// PARTICLE SYSTEM
// ===========================
class ParticleSystem {
    constructor(container) {
        this.container = container;
    }

    emit(x, y, count, color, sizeRange = [4, 10]) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 120;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed - 40;
            const duration = 600 + Math.random() * 600;

            el.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: ${color};
                box-shadow: 0 0 ${size}px ${color};
                opacity: 1;
            `;

            this.container.appendChild(el);

            el.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0, 0.5, 0.5, 1)',
                fill: 'forwards'
            });

            setTimeout(() => el.remove(), duration);
        }
    }

    emitCorrect(x, y) {
        this.emit(x, y, 18, '#2ecc71', [4, 10]);
        this.emit(x, y, 8, '#f0d078', [3, 7]);
    }

    emitWrong(x, y) {
        this.emit(x, y, 12, '#e74c3c', [4, 8]);
    }

    emitSplash(x, y) {
        // Cartoony red/magenta splash blobs
        this.emit(x, y, 30, '#ff2a4b', [8, 20]);
        this.emit(x, y, 15, '#e00034', [12, 25]);
    }
}


// ===========================
// AUDIO MANAGER (Web Audio API)
// ===========================
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = false; // Starts muted to respect browser policies
        this.masterGain = null;
        this.tensionOsc = null;
        this.tensionGain = null;
        this.isGameOver = false;
        
        // Setup UI button
        this.btnAudio = document.getElementById('btn-audio');
        if (this.btnAudio) {
            this.btnAudio.addEventListener('click', () => this.toggleMute());
            this._updateBtnUI();
        }
    }

    _init() {
        if (!this.ctx && this.enabled) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.connect(this.ctx.destination);
                this.masterGain.gain.value = 0.6; // Base volume
                this._startTensionDrone();
            } catch (e) {
                console.warn("Web Audio API not supported", e);
                this.enabled = false;
            }
        }
    }

    toggleMute() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            if (!this.ctx) {
                this._init();
            } else if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.masterGain) this.masterGain.gain.value = 0.6;
        } else {
            if (this.masterGain) this.masterGain.gain.value = 0;
        }
        
        this._updateBtnUI();
    }

    _updateBtnUI() {
        if (this.btnAudio) {
            this.btnAudio.textContent = this.enabled ? '🔊' : '🔈';
            this.btnAudio.classList.toggle('muted', !this.enabled);
        }
    }

    // --- 1. UI / INTERACTION SOUNDS ---

    playCorrect() {
        if (!this.enabled || !this.ctx) return;
        
        // Magical chime / major chord arpeggio
        const now = this.ctx.currentTime;
        const root = 523.25; // C5
        const notes = [root, root * 1.25, root * 1.5, root * 2]; // C, E, G, C (Major chord)
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            
            gain.gain.setValueAtTime(0, now + i * 0.05);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.5);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.6);
        });
    }

    playWrong() {
        if (!this.enabled || !this.ctx) return;
        
        // Harsh buzzer
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(110, now); // A2
        osc2.frequency.setValueAtTime(116, now); // Slightly detuned A#2 for dissonance
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    }

    // --- 2. MECHANICAL SOUNDS ---

    playRatchet() {
        if (!this.enabled || !this.ctx) return;
        
        // Fast sequence of clicks (ratchet pulling up)
        const now = this.ctx.currentTime;
        const clicks = 8;
        
        for (let i = 0; i < clicks; i++) {
            const time = now + (i * 0.04);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // High-pitched, very short burst
            osc.type = 'square';
            osc.frequency.setValueAtTime(800 + Math.random() * 400, time);
            
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.03);
        }
    }

    playCreak(speed) {
        if (!this.enabled || !this.ctx || this.isGameOver) return;
        
        // Occasional creak based on blade speed
        if (Math.random() > speed * 3) return; 
        
        const now = this.ctx.currentTime;
        
        // Metallic friction / wood groan
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.1); // 100ms noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        // Filter to make it sound like low friction
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 200 + Math.random() * 200;
        filter.Q.value = 5;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05 + (speed * 0.5), now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start(now);
    }

    playGameOver() {
        if (!this.enabled || !this.ctx) return;
        this.isGameOver = true;
        
        // Stop tension drone
        if (this.tensionGain) {
            this.tensionGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        }
        
        const now = this.ctx.currentTime;
        
        // Visceral THUD (low sine sweep)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(150, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.3); // Pitch drop
        subGain.gain.setValueAtTime(1, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        subOsc.connect(subGain);
        subGain.connect(this.masterGain);
        subOsc.start(now);
        subOsc.stop(now + 1);

        // Metallic slice (noise burst)
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
    }

    // --- 3. DYNAMIC TENSION DRONE ---

    _startTensionDrone() {
        if (this.tensionOsc) return;
        
        this.tensionOsc = this.ctx.createOscillator();
        this.tensionGain = this.ctx.createGain();
        
        this.tensionOsc.type = 'sawtooth';
        this.tensionOsc.frequency.value = 40; // Deep low drone
        
        this.tensionGain.gain.value = 0; // Starts silent
        
        // Add a lowpass filter to muddy it up
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        
        this.tensionOsc.connect(filter);
        filter.connect(this.tensionGain);
        this.tensionGain.connect(this.masterGain);
        
        this.tensionOsc.start();
    }

    updateTension(progress) {
        // progress: 0 (top) to 1 (touching character)
        if (!this.enabled || !this.ctx || !this.tensionOsc || this.isGameOver) return;
        
        const now = this.ctx.currentTime;
        
        // As blade gets closer, pitch goes up slightly and volume goes up
        const intensity = Math.pow(Math.max(0, progress), 2); 
        
        const targetFreq = 40 + (intensity * 25);
        const targetVol = intensity * 0.35; // Max 0.35 volume for drone
        
        this.tensionOsc.frequency.setTargetAtTime(targetFreq, now, 0.2);
        this.tensionGain.gain.setTargetAtTime(targetVol, now, 0.2);
    }
    
    reset() {
        this.isGameOver = false;
        if (this.tensionGain) {
            this.tensionGain.gain.setTargetAtTime(0, this.ctx ? this.ctx.currentTime : 0, 0.1);
        }
    }
}


// ===========================
// AMBIENT ATMOSPHERE SYSTEM
// ===========================
class AmbientAtmosphere {
    constructor(particleContainer) {
        this.container = particleContainer;
        this._running = true;
        this._spawnDust();
        this._spawnEmber();
    }

    /** Floating dust motes in the dungeon light */
    _spawnDust() {
        if (!this._running) return;

        const el = document.createElement('div');
        el.className = 'particle';
        const size = 1 + Math.random() * 2.5;
        const x = Math.random() * 100;
        const startY = 20 + Math.random() * 60; // mid-screen area
        const duration = 8000 + Math.random() * 10000;
        const driftX = -30 + Math.random() * 60;

        el.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${startY}%;
            background: rgba(240, 208, 120, ${0.12 + Math.random() * 0.15});
            box-shadow: 0 0 ${size * 2}px rgba(240, 208, 120, 0.1);
        `;

        this.container.appendChild(el);

        el.animate([
            { transform: 'translate(0, 0)', opacity: 0 },
            { transform: `translate(${driftX * 0.3}px, -20px)`, opacity: 0.7 },
            { transform: `translate(${driftX}px, -60px)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'linear',
            fill: 'forwards'
        });

        setTimeout(() => el.remove(), duration);
        setTimeout(() => this._spawnDust(), 600 + Math.random() * 1200);
    }

    /** Rising ember-like particles from torches / ground */
    _spawnEmber() {
        if (!this._running) return;

        const el = document.createElement('div');
        el.className = 'particle';
        const size = 1.5 + Math.random() * 2;
        // Emit from sides where torches are
        const side = Math.random() < 0.5;
        const x = side ? (5 + Math.random() * 10) : (85 + Math.random() * 10);
        const duration = 3000 + Math.random() * 4000;
        const driftX = -15 + Math.random() * 30;

        const hue = 20 + Math.random() * 25; // orange-amber range
        const color = `hsl(${hue}, 100%, ${55 + Math.random() * 20}%)`;

        el.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: 30%;
            background: ${color};
            box-shadow: 0 0 ${size * 3}px ${color};
        `;

        this.container.appendChild(el);

        el.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
            { transform: `translate(${driftX}px, ${-80 - Math.random() * 120}px) scale(0)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        });

        setTimeout(() => el.remove(), duration);
        setTimeout(() => this._spawnEmber(), 300 + Math.random() * 800);
    }

    stop() {
        this._running = false;
    }
}


// ===========================
// MAIN GAME CLASS
// ===========================
class Game {
    // Game states
    static STATE = {
        MENU: 'menu',
        PLAYING: 'playing',
        GAME_OVER: 'gameover'
    };

    // Configuration
    static CONFIG = {
        BLADE_START_TOP: 40,           // px from top of guillotine frame
        ROPE_ANCHOR_TOP: 42,           // px - where ropes are anchored (matches CSS #rope-system top)
        BLADE_MAX_TOP: 200,            // px - when blade reaches character
        BLADE_BASE_SPEED: 0.018,       // px per ms base speed
        BLADE_SPEED_INCREMENT: 0.002,  // extra speed per level
        BLADE_PENALTY_MULTIPLIER: 2.5, // speed multiplier on wrong answer
        BLADE_PENALTY_DURATION: 2000,  // ms
        BLADE_LIFT_PERCENT: 0.15,      // lift 15% of travel on correct answer
        SCORE_BASE: 10,
        COMBO_MULTIPLIER: 5,
        POINTS_PER_LEVEL: 80,          // score needed per level up
        RELIEVED_DURATION: 800,        // ms to show relieved face
        ANSWER_LOCKOUT: 400,           // ms before new answers can be clicked
    };

    constructor() {
        // Core
        this.state = Game.STATE.MENU;
        this.mathGen = new MathGenerator();
        this.particles = new ParticleSystem(document.getElementById('particles-container'));
        this.audio = new AudioManager();

        // Game state
        this.score = 0;
        this.level = 1;
        this.streak = 0;
        this.bestStreak = 0;
        this.highScore = parseInt(localStorage.getItem('guillotine_highscore')) || 0;
        this.bladeTop = Game.CONFIG.BLADE_START_TOP;
        this.bladeSpeed = Game.CONFIG.BLADE_BASE_SPEED;
        this.penaltyUntil = 0;
        this.lockedUntil = 0;
        this.lastTime = 0;
        this.animFrameId = null;
        this.currentQuestion = null;

        // DOM References
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            gameover: document.getElementById('gameover-screen')
        };
        this.els = {
            gameContainer: document.getElementById('game-container'),
            btnPlay: document.getElementById('btn-play'),
            btnRetry: document.getElementById('btn-retry'),
            btnMenu: document.getElementById('btn-menu'),
            bladeAssembly: document.getElementById('blade-assembly'),
            bladeEdge: document.querySelector('.blade-edge'),
            ropeSystem: document.getElementById('rope-system'),
            character: document.getElementById('character'),
            questionBox: document.getElementById('question-box'),
            questionText: document.getElementById('question-text'),
            answers: [
                document.getElementById('answer-0'),
                document.getElementById('answer-1'),
                document.getElementById('answer-2'),
                document.getElementById('answer-3'),
            ],
            scoreDisplay: document.getElementById('score-display'),
            streakDisplay: document.getElementById('streak-display'),
            levelDisplay: document.getElementById('level-display'),
            feedbackCorrect: document.getElementById('feedback-correct'),
            feedbackWrong: document.getElementById('feedback-wrong'),
            screenFlash: document.getElementById('screen-flash'),
            dangerGlow: document.getElementById('danger-glow'),
            finalScore: document.getElementById('final-score'),
            finalLevel: document.getElementById('final-level'),
            finalStreak: document.getElementById('final-streak'),
            newRecord: document.getElementById('new-record'),
            startHighScore: document.getElementById('start-high-score'),
            gameoverHighScore: document.getElementById('gameover-high-score'),
        };

        this._bindEvents();
        this._updateHighScoreDisplay();
    }

    // ---- EVENT BINDING ----
    _bindEvents() {
        this.els.btnPlay.addEventListener('click', () => this.startGame());
        this.els.btnRetry.addEventListener('click', () => this.startGame());
        this.els.btnMenu.addEventListener('click', () => this._showScreen('start'));

        this.els.answers.forEach((btn, index) => {
            btn.addEventListener('click', () => this._handleAnswer(index));
        });

        // Keyboard support (1-4 keys)
        document.addEventListener('keydown', (e) => {
            if (this.state !== Game.STATE.PLAYING) {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (this.state === Game.STATE.MENU) this.startGame();
                    else if (this.state === Game.STATE.GAME_OVER) this.startGame();
                }
                return;
            }
            const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3 };
            if (keyMap[e.key] !== undefined) {
                this._handleAnswer(keyMap[e.key]);
            }
        });
    }

    // ---- SCREEN MANAGEMENT ----
    _showScreen(name) {
        Object.entries(this.screens).forEach(([key, el]) => {
            el.classList.toggle('active', key === name);
        });
        if (name === 'start') this.state = Game.STATE.MENU;
    }

    // ---- START GAME ----
    startGame() {
        this.audio.reset();
        this.score = 0;
        this.level = 1;
        this.streak = 0;
        this.bestStreak = 0;
        this.bladeTop = Game.CONFIG.BLADE_START_TOP;
        this.bladeSpeed = Game.CONFIG.BLADE_BASE_SPEED;
        this.penaltyUntil = 0;
        this.lockedUntil = 0;
        this.state = Game.STATE.PLAYING;

        // Reset visual effects
        if (this.els.bladeEdge) this.els.bladeEdge.classList.remove('blade-stained');

        this._updateHUD();
        this._updateBlade();
        this._updateCharacterExpression();
        this._showScreen('game');
        this._generateNewQuestion();

        // Start game loop
        this.lastTime = performance.now();
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.animFrameId = requestAnimationFrame((t) => this._gameLoop(t));
    }

    // ---- GAME LOOP ----
    _gameLoop(timestamp) {
        if (this.state !== Game.STATE.PLAYING) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Cap delta to prevent jumps (e.g., tab switching)
        const cappedDt = Math.min(dt, 100);

        // Calculate speed
        let speed = this.bladeSpeed;
        if (timestamp < this.penaltyUntil) {
            speed *= Game.CONFIG.BLADE_PENALTY_MULTIPLIER;
        }

        // Move blade down
        this.bladeTop += speed * cappedDt;

        // Dynamically determine max based on frame height
        const maxTop = this._getBladeMaxTop();

        // Check game over
        if (this.bladeTop >= maxTop) {
            this.bladeTop = maxTop;
            this._updateBlade();
            this._gameOver();
            return;
        }

        this._updateBlade();
        this._updateCharacterExpression();
        this._updateDangerGlow();

        this.animFrameId = requestAnimationFrame((t) => this._gameLoop(t));
    }

    _getBladeMaxTop() {
        const frame = document.getElementById('guillotine-frame');
        if (!frame) return Game.CONFIG.BLADE_MAX_TOP;
        // Blade should stop when it reaches the character's head position
        const frameHeight = frame.offsetHeight;
        return frameHeight - 100;
    }

    // ---- BLADE & ROPES ----
    _updateBlade() {
        this.els.bladeAssembly.style.top = `${this.bladeTop}px`;
        // Stretch ropes from fixed anchor to blade top
        const ropeHeight = Math.max(0, this.bladeTop - Game.CONFIG.ROPE_ANCHOR_TOP);
        this.els.ropeSystem.style.height = `${ropeHeight}px`;
        
        // Update audio tension
        const maxTop = this._getBladeMaxTop();
        const progress = (this.bladeTop - Game.CONFIG.BLADE_START_TOP) / (maxTop - Game.CONFIG.BLADE_START_TOP);
        this.audio.updateTension(progress);
    }

    _liftBlade(percent) {
        const maxTop = this._getBladeMaxTop();
        const travel = maxTop - Game.CONFIG.BLADE_START_TOP;
        const lift = travel * percent;
        this.bladeTop = Math.max(Game.CONFIG.BLADE_START_TOP, this.bladeTop - lift);
        this._updateBlade();
        this.audio.playRatchet();
    }

    // ---- CHARACTER EXPRESSION ----
    _updateCharacterExpression() {
        const maxTop = this._getBladeMaxTop();
        const progress = (this.bladeTop - Game.CONFIG.BLADE_START_TOP) / (maxTop - Game.CONFIG.BLADE_START_TOP);

        const char = this.els.character;
        char.classList.remove('scared', 'terrified', 'relieved');

        if (progress > 0.75) {
            char.classList.add('terrified');
        } else if (progress > 0.45) {
            char.classList.add('scared');
        }
        // Normal expression otherwise
    }

    _showRelieved() {
        const char = this.els.character;
        char.classList.remove('scared', 'terrified');
        char.classList.add('relieved');
        setTimeout(() => {
            char.classList.remove('relieved');
            this._updateCharacterExpression();
        }, Game.CONFIG.RELIEVED_DURATION);
    }

    // ---- DANGER GLOW & PANIC ----
    _updateDangerGlow() {
        const maxTop = this._getBladeMaxTop();
        const progress = (this.bladeTop - Game.CONFIG.BLADE_START_TOP) / (maxTop - Game.CONFIG.BLADE_START_TOP);
        
        // Danger Glow (Orange/Red warning)
        this.els.dangerGlow.classList.toggle('active', progress > 0.6);
        
        // Panic Zone (Last 20%)
        if (progress > 0.80) {
            this.els.gameContainer.classList.add('panic-mode');
            
            // Calculate intensity (0 to 1 scaling in the last 20%)
            const panicProgress = Math.min(1, (progress - 0.80) / 0.20);
            
            // Speed of shake (faster as it gets closer)
            const speed = 0.12 - (panicProgress * 0.07); // 0.12s to 0.05s
            
            // Intensity in pixels
            const intensity = 1 + (panicProgress * 12); // 1px to 13px shake
            
            // Vignette glow size
            const glow = 0.5 + (panicProgress * 1.5);
            
            // Vignette alpha pulse (pulsating heartbeat effect)
            const time = performance.now() / (250 - panicProgress * 150);
            const alpha = 0.3 + (panicProgress * 0.5) + (Math.sin(time) * 0.2);
            
            this.els.gameContainer.style.setProperty('--panic-glow', glow);
            this.els.gameContainer.style.setProperty('--panic-alpha', Math.max(0, alpha));
        } else {
            this.els.gameContainer.classList.remove('panic-mode');
        }
    }

    // ---- QUESTIONS ----
    _generateNewQuestion() {
        this.currentQuestion = this.mathGen.generate(this.level);

        // Animate question box
        this.els.questionBox.classList.remove('new-question');
        void this.els.questionBox.offsetWidth; // force reflow
        this.els.questionBox.classList.add('new-question');

        this.els.questionText.textContent = this.currentQuestion.text;

        this.els.answers.forEach((btn, i) => {
            btn.textContent = this.currentQuestion.choices[i];
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
    }

    // ---- ANSWER HANDLING ----
    _handleAnswer(index) {
        if (this.state !== Game.STATE.PLAYING) return;
        if (!this.currentQuestion) return;
        if (performance.now() < this.lockedUntil) return;

        const btn = this.els.answers[index];
        const chosen = this.currentQuestion.choices[index];
        const isCorrect = chosen === this.currentQuestion.answer;

        // Lock buttons briefly
        this.lockedUntil = performance.now() + Game.CONFIG.ANSWER_LOCKOUT;
        this.els.answers.forEach(b => b.disabled = true);

        if (isCorrect) {
            this._onCorrect(btn);
        } else {
            this._onWrong(btn);
        }

        // Generate next question after brief delay
        setTimeout(() => {
            if (this.state === Game.STATE.PLAYING) {
                this._generateNewQuestion();
            }
        }, Game.CONFIG.ANSWER_LOCKOUT);
    }

    _onCorrect(btn) {
        this.streak++;
        if (this.streak > this.bestStreak) this.bestStreak = this.streak;

        // Calculate score
        const points = Game.CONFIG.SCORE_BASE + (this.streak * Game.CONFIG.COMBO_MULTIPLIER);
        this.score += points;

        // Level up check
        const newLevel = Math.floor(this.score / Game.CONFIG.POINTS_PER_LEVEL) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.bladeSpeed = Game.CONFIG.BLADE_BASE_SPEED + (this.level - 1) * Game.CONFIG.BLADE_SPEED_INCREMENT;
        }

        // Lift blade
        this._liftBlade(Game.CONFIG.BLADE_LIFT_PERCENT);
        this._showRelieved();

        // Visual feedback
        btn.classList.add('correct');
        this._showFeedback('correct');
        this._flashScreen('green');
        this.audio.playCorrect();

        // Particles at the question area
        const rect = btn.getBoundingClientRect();
        const containerRect = document.getElementById('game-container').getBoundingClientRect();
        this.particles.emitCorrect(
            rect.left - containerRect.left + rect.width / 2,
            rect.top - containerRect.top + rect.height / 2
        );

        // Score popup
        this._showScorePopup(points, rect);

        // Update HUD
        this._updateHUD();
    }

    _onWrong(btn) {
        this.streak = 0;

        // Apply penalty speed
        this.penaltyUntil = performance.now() + Game.CONFIG.BLADE_PENALTY_DURATION;

        // Visual feedback
        btn.classList.add('wrong');

        // Also highlight the correct answer
        this.els.answers.forEach(b => {
            if (parseInt(b.textContent) === this.currentQuestion.answer) {
                b.classList.add('correct');
            }
        });

        this._showFeedback('wrong');
        this._flashScreen('red');
        this.audio.playWrong();

        // Particles
        const rect = btn.getBoundingClientRect();
        const containerRect = document.getElementById('game-container').getBoundingClientRect();
        this.particles.emitWrong(
            rect.left - containerRect.left + rect.width / 2,
            rect.top - containerRect.top + rect.height / 2
        );

        // Update HUD
        this._updateHUD();
    }

    // ---- UI FEEDBACK ----
    _showFeedback(type) {
        const el = type === 'correct' ? this.els.feedbackCorrect : this.els.feedbackWrong;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 800);
    }

    _flashScreen(color) {
        const el = this.els.screenFlash;
        el.classList.remove('flash-red', 'flash-green');
        void el.offsetWidth;
        el.classList.add(color === 'red' ? 'flash-red' : 'flash-green');
        setTimeout(() => el.classList.remove('flash-red', 'flash-green'), 300);
    }

    _showScorePopup(points, anchorRect) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.color = '#2ecc71';
        popup.style.fontSize = '1.4rem';

        const containerRect = document.getElementById('game-container').getBoundingClientRect();
        popup.style.left = `${anchorRect.left - containerRect.left + anchorRect.width / 2 - 20}px`;
        popup.style.top = `${anchorRect.top - containerRect.top - 10}px`;

        document.getElementById('game-container').appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    _updateHUD() {
        this.els.scoreDisplay.textContent = this.score;
        this.els.streakDisplay.textContent = `x${this.streak}`;
        this.els.levelDisplay.textContent = this.level;

        // Bump animation
        [this.els.scoreDisplay, this.els.streakDisplay, this.els.levelDisplay].forEach(el => {
            el.classList.remove('bump');
            void el.offsetWidth;
            el.classList.add('bump');
        });
    }

    // ---- GAME OVER ----
    _gameOver() {
        this.state = Game.STATE.GAME_OVER;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

        this.audio.playGameOver();

        // Cartoony splash impact
        if (this.els.bladeEdge) this.els.bladeEdge.classList.add('blade-stained');
        
        const rect = this.els.character.getBoundingClientRect();
        const containerRect = document.getElementById('game-container').getBoundingClientRect();
        this.particles.emitSplash(
            rect.left - containerRect.left + rect.width / 2,
            rect.top - containerRect.top + 20 // Splash near the neck
        );

        // Check high score
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('guillotine_highscore', this.highScore);
        }

        // Update game over screen
        this.els.finalScore.textContent = this.score;
        this.els.finalLevel.textContent = this.level;
        this.els.finalStreak.textContent = this.bestStreak;
        this.els.newRecord.style.display = isNewRecord ? 'block' : 'none';
        this._updateHighScoreDisplay();

        // Show game over screen with slight delay for dramatic effect
        setTimeout(() => {
            this._showScreen('gameover');
        }, 600);
    }

    _updateHighScoreDisplay() {
        const text = this.highScore > 0 ? `Recorde: ${this.highScore} pts` : '';
        this.els.startHighScore.textContent = text;
        this.els.gameoverHighScore.textContent = text;
    }
}


// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const atmosphere = new AmbientAtmosphere(document.getElementById('particles-container'));
});
