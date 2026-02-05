/* ================================
   VALENTINE WEBSITE - MAIN SCRIPT
   Clean, organized, premium interactions
   ================================ */

// ================================
// STATE MANAGEMENT
// ================================

const state = {
    attempts: 0,
    soundEnabled: true,
    audioContext: null,
    firstInteraction: false,
    buttonCooldown: false,
    lastDodgeTime: 0
};

// ================================
// DODGE MESSAGES
// ================================

const dodgeMessages = [
    "Not today 😌",
    "Nice try, my love.",
    "The universe said 'nope'.",
    "Barbara please 😭",
    "That button is in a relationship.",
    "Try the other one? 💕",
    "Nope nope nope 🙃",
    "This button believes in us.",
    "Come on Barbara... 💘",
    "You know you want to say yes 😏"
];

// ================================
// DOM ELEMENTS
// ================================

const elements = {
    // Screens
    landingScreen: document.getElementById('landingScreen'),
    successScreen: document.getElementById('successScreen'),
    dateSelectorScreen: document.getElementById('dateSelectorScreen'),
    confirmationScreen: document.getElementById('confirmationScreen'),
    
    // Buttons
    yesButton: document.getElementById('yesButton'),
    noButton: document.getElementById('noButton'),
    muteToggle: document.getElementById('muteToggle'),
    pickDateButton: document.getElementById('pickDateButton'),
    screenshotButton: document.getElementById('screenshotButton'),
    
    // Modal
    errorModal: document.getElementById('errorModal'),
    retryButton: document.getElementById('retryButton'),
    forcedYesButton: document.getElementById('forcedYesButton'),
    
    // Text
    attemptCounter: document.getElementById('attemptCounter'),
    dodgeMessage: document.getElementById('dodgeMessage'),
    chosenDate: document.getElementById('chosenDate'),
    
    // Confetti
    confettiCanvas: document.getElementById('confettiCanvas')
};

// ================================
// AUDIO SYSTEM
// ================================

const AudioSystem = {
    init() {
        // Load mute preference from localStorage
        const isMuted = localStorage.getItem('valentineSoundMuted') === 'true';
        state.soundEnabled = !isMuted;
        
        if (isMuted) {
            elements.muteToggle.classList.add('muted');
        }
    },
    
    initContext() {
        if (!state.audioContext && state.soundEnabled) {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    playBoop() {
        if (!state.soundEnabled || !state.firstInteraction) return;
        
        this.initContext();
        const ctx = state.audioContext;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    },
    
    playSparkle() {
        if (!state.soundEnabled || !state.firstInteraction) return;
        
        this.initContext();
        const ctx = state.audioContext;
        
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G
        
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = ctx.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(0.05, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    },
    
    toggle() {
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem('valentineSoundMuted', !state.soundEnabled);
        elements.muteToggle.classList.toggle('muted');
        
        if (state.soundEnabled) {
            this.playBoop();
        }
    }
};

// ================================
// BUTTON DODGE SYSTEM
// ================================

const ButtonDodge = {
    safeZone: {
        padding: 60 // Keep button this many pixels from edges
    },
    
    getRandomPosition(buttonRect, containerRect) {
        const maxX = containerRect.width - buttonRect.width - this.safeZone.padding;
        const maxY = containerRect.height - buttonRect.height - this.safeZone.padding;
        
        const minX = this.safeZone.padding;
        const minY = this.safeZone.padding;
        
        return {
            x: Math.random() * (maxX - minX) + minX,
            y: Math.random() * (maxY - minY) + minY
        };
    },
    
    moveButton() {
        // Cooldown to prevent spam
        const now = Date.now();
        if (state.buttonCooldown || now - state.lastDodgeTime < 500) {
            return;
        }
        
        state.buttonCooldown = true;
        state.lastDodgeTime = now;
        
        const button = elements.noButton;
        const card = button.closest('.card');
        
        // Make button absolute positioned if not already
        if (!button.classList.contains('dodging')) {
            button.classList.add('dodging');
        }
        
        const buttonRect = button.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        // Calculate position relative to card
        const relativeRect = {
            width: cardRect.width,
            height: cardRect.height
        };
        
        const newPos = this.getRandomPosition(buttonRect, relativeRect);
        
        button.style.left = `${newPos.x}px`;
        button.style.top = `${newPos.y}px`;
        
        // Increment attempts
        state.attempts++;
        elements.attemptCounter.textContent = `Attempts: ${state.attempts}`;
        
        // Show dodge message
        const messageIndex = (state.attempts - 1) % dodgeMessages.length;
        elements.dodgeMessage.textContent = dodgeMessages[messageIndex];
        
        // Play sound
        AudioSystem.playBoop();
        
        // Reset cooldown
        setTimeout(() => {
            state.buttonCooldown = false;
        }, 600);
    },
    
    setupDesktopDodge() {
        const button = elements.noButton;
        const proximityThreshold = 100; // Distance in pixels to trigger dodge
        
        const handleMouseMove = (e) => {
            if (!elements.landingScreen.classList.contains('active')) return;
            
            const rect = button.getBoundingClientRect();
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(e.clientX - buttonCenterX, 2) + 
                Math.pow(e.clientY - buttonCenterY, 2)
            );
            
            if (distance < proximityThreshold) {
                this.moveButton();
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
    },
    
    setupMobileDodge() {
        const button = elements.noButton;
        
        const handleTouch = (e) => {
            if (!elements.landingScreen.classList.contains('active')) return;
            
            e.preventDefault();
            this.moveButton();
        };
        
        button.addEventListener('touchstart', handleTouch, { passive: false });
        button.addEventListener('click', (e) => {
            if (!elements.landingScreen.classList.contains('active')) return;
            
            // If click somehow succeeded, show error modal
            e.preventDefault();
            showErrorModal();
        });
    },
    
    init() {
        // Detect device type
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            this.setupMobileDodge();
        } else {
            this.setupDesktopDodge();
        }
    }
};

// ================================
// CONFETTI SYSTEM
// ================================

const Confetti = {
    particles: [],
    animationId: null,
    
    createParticle() {
        const colors = ['#ff4d6d', '#ffb3c1', '#ff6b9d', '#ffc2d1', '#ff85a1'];
        
        return {
            x: Math.random() * window.innerWidth,
            y: -10,
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 5 - 2.5
        };
    },
    
    start() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const canvas = elements.confettiCanvas;
        canvas.classList.add('active');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Create particles
        for (let i = 0; i < 150; i++) {
            this.particles.push(this.createParticle());
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach((particle, index) => {
                particle.y += particle.speedY;
                particle.x += particle.speedX;
                particle.rotation += particle.rotationSpeed;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                // Remove particles that are off screen
                if (particle.y > canvas.height) {
                    this.particles.splice(index, 1);
                }
            });
            
            if (this.particles.length > 0) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                canvas.classList.remove('active');
            }
        };
        
        animate();
    },
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.particles = [];
        }
    }
};

// ================================
// SCREEN NAVIGATION
// ================================

function showScreen(screenElement) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    screenElement.classList.add('active');
}

function showErrorModal() {
    elements.errorModal.classList.add('active');
}

function hideErrorModal() {
    elements.errorModal.classList.remove('active');
}

// ================================
// YES FLOW
// ================================

function handleYesClick() {
    // Play sparkle sound
    AudioSystem.playSparkle();
    
    // Start confetti
    Confetti.start();
    
    // Show success screen after brief delay
    setTimeout(() => {
        showScreen(elements.successScreen);
    }, 600);
}

// ================================
// DATE SELECTION
// ================================

function setupDateSelection() {
    const dateOptions = document.querySelectorAll('.date-option');
    
    dateOptions.forEach(option => {
        option.addEventListener('click', () => {
            const choice = option.getAttribute('data-choice');
            
            // Play sound
            AudioSystem.playBoop();
            
            // Update confirmation screen
            elements.chosenDate.textContent = choice;
            
            // Show confirmation
            showScreen(elements.confirmationScreen);
        });
    });
}

// ================================
// EVENT LISTENERS
// ================================

function setupEventListeners() {
    // Enable first interaction flag
    document.addEventListener('click', () => {
        state.firstInteraction = true;
    }, { once: true });
    
    document.addEventListener('touchstart', () => {
        state.firstInteraction = true;
    }, { once: true });
    
    // Mute toggle
    elements.muteToggle.addEventListener('click', () => {
        AudioSystem.toggle();
    });
    
    // Yes button
    elements.yesButton.addEventListener('click', handleYesClick);
    
    // Error modal buttons
    elements.retryButton.addEventListener('click', hideErrorModal);
    elements.forcedYesButton.addEventListener('click', () => {
        hideErrorModal();
        handleYesClick();
    });
    
    // Pick date button
    elements.pickDateButton.addEventListener('click', () => {
        AudioSystem.playBoop();
        showScreen(elements.dateSelectorScreen);
    });
    
    // Screenshot button
    elements.screenshotButton.addEventListener('click', () => {
        AudioSystem.playBoop();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.errorModal.classList.contains('active')) {
            hideErrorModal();
        }
    });
    
    // Handle window resize for confetti
    window.addEventListener('resize', () => {
        if (elements.confettiCanvas.classList.contains('active')) {
            elements.confettiCanvas.width = window.innerWidth;
            elements.confettiCanvas.height = window.innerHeight;
        }
    });
}

// ================================
// INITIALIZATION
// ================================

function init() {
    AudioSystem.init();
    ButtonDodge.init();
    setupDateSelection();
    setupEventListeners();
    
    console.log('💘 Valentine website loaded! Good luck, Barbara! 💘');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
