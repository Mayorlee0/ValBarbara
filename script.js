// ================================
// VALENTINE WEBSITE - MAIN SCRIPT
// ================================

'use strict';

// State
var state = {
    attempts: 0,
    soundEnabled: true,
    audioContext: null,
    firstInteraction: false,
    buttonCooldown: false,
    lastDodgeTime: 0
};

// Messages
var dodgeMessages = [
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

// DOM Elements
var elements = {};

// ================================
// AUDIO SYSTEM
// ================================

var AudioSystem = {
    init: function() {
        var isMuted = localStorage.getItem('valentineSoundMuted') === 'true';
        state.soundEnabled = !isMuted;
        
        if (isMuted) {
            elements.muteToggle.classList.add('muted');
        }
    },
    
    initContext: function() {
        if (!state.audioContext && state.soundEnabled) {
            try {
                state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Audio context not supported');
            }
        }
    },
    
    playBoop: function() {
        if (!state.soundEnabled || !state.firstInteraction) return;
        
        this.initContext();
        if (!state.audioContext) return;
        
        var ctx = state.audioContext;
        var oscillator = ctx.createOscillator();
        var gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    },
    
    playSparkle: function() {
        if (!state.soundEnabled || !state.firstInteraction) return;
        
        this.initContext();
        if (!state.audioContext) return;
        
        var ctx = state.audioContext;
        var frequencies = [523.25, 659.25, 783.99];
        
        frequencies.forEach(function(freq, i) {
            var oscillator = ctx.createOscillator();
            var gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            var startTime = ctx.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(0.05, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    },
    
    toggle: function() {
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

var ButtonDodge = {
    safeZone: {
        padding: 60
    },
    
    getRandomPosition: function(buttonWidth, buttonHeight, cardWidth, cardHeight) {
        var maxX = cardWidth - buttonWidth - this.safeZone.padding;
        var maxY = cardHeight - buttonHeight - this.safeZone.padding;
        var minX = this.safeZone.padding;
        var minY = this.safeZone.padding;
        
        return {
            x: Math.random() * (maxX - minX) + minX,
            y: Math.random() * (maxY - minY) + minY
        };
    },
    
    moveButton: function() {
        var now = Date.now();
        if (state.buttonCooldown || now - state.lastDodgeTime < 500) {
            return;
        }
        
        state.buttonCooldown = true;
        state.lastDodgeTime = now;
        
        var button = elements.noButton;
        var card = button.closest('.card');
        
        if (!button.classList.contains('dodging')) {
            button.classList.add('dodging');
        }
        
        var buttonRect = button.getBoundingClientRect();
        var cardRect = card.getBoundingClientRect();
        
        var newPos = this.getRandomPosition(
            buttonRect.width,
            buttonRect.height,
            cardRect.width,
            cardRect.height
        );
        
        button.style.left = newPos.x + 'px';
        button.style.top = newPos.y + 'px';
        
        state.attempts++;
        elements.attemptCounter.textContent = 'Attempts: ' + state.attempts;
        
        var messageIndex = (state.attempts - 1) % dodgeMessages.length;
        elements.dodgeMessage.textContent = dodgeMessages[messageIndex];
        
        AudioSystem.playBoop();
        
        setTimeout(function() {
            state.buttonCooldown = false;
        }, 600);
    },
    
    setupDesktopDodge: function() {
        var self = this;
        var button = elements.noButton;
        var proximityThreshold = 100;
        
        document.addEventListener('mousemove', function(e) {
            if (!elements.landingScreen.classList.contains('active')) return;
            
            var rect = button.getBoundingClientRect();
            var buttonCenterX = rect.left + rect.width / 2;
            var buttonCenterY = rect.top + rect.height / 2;
            
            var distance = Math.sqrt(
                Math.pow(e.clientX - buttonCenterX, 2) + 
                Math.pow(e.clientY - buttonCenterY, 2)
            );
            
            if (distance < proximityThreshold) {
                self.moveButton();
            }
        });
    },
    
    setupMobileDodge: function() {
        var self = this;
        var button = elements.noButton;
        
        button.addEventListener('touchstart', function(e) {
            if (!elements.landingScreen.classList.contains('active')) return;
            e.preventDefault();
            self.moveButton();
        }, { passive: false });
        
        button.addEventListener('click', function(e) {
            if (!elements.landingScreen.classList.contains('active')) return;
            e.preventDefault();
            showErrorModal();
        });
    },
    
    init: function() {
        var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
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

var Confetti = {
    particles: [],
    animationId: null,
    
    createParticle: function() {
        var colors = ['#ff4d6d', '#ffb3c1', '#ff6b9d', '#ffc2d1', '#ff85a1'];
        
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
    
    start: function() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        var canvas = elements.confettiCanvas;
        canvas.classList.add('active');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        var ctx = canvas.getContext('2d');
        var self = this;
        
        for (var i = 0; i < 150; i++) {
            this.particles.push(this.createParticle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (var i = self.particles.length - 1; i >= 0; i--) {
                var particle = self.particles[i];
                particle.y += particle.speedY;
                particle.x += particle.speedX;
                particle.rotation += particle.rotationSpeed;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                if (particle.y > canvas.height) {
                    self.particles.splice(i, 1);
                }
            }
            
            if (self.particles.length > 0) {
                self.animationId = requestAnimationFrame(animate);
            } else {
                canvas.classList.remove('active');
            }
        }
        
        animate();
    }
};

// ================================
// SCREEN NAVIGATION
// ================================

function showScreen(screenElement) {
    var allScreens = document.querySelectorAll('.screen');
    for (var i = 0; i < allScreens.length; i++) {
        allScreens[i].classList.remove('active');
    }
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
    AudioSystem.playSparkle();
    Confetti.start();
    
    setTimeout(function() {
        showScreen(elements.successScreen);
    }, 600);
}

// ================================
// DATE SELECTION
// ================================

function setupDateSelection() {
    var dateOptions = document.querySelectorAll('.date-option');
    
    for (var i = 0; i < dateOptions.length; i++) {
        dateOptions[i].addEventListener('click', function() {
            var choice = this.getAttribute('data-choice');
            AudioSystem.playBoop();
            elements.chosenDate.textContent = choice;
            showScreen(elements.confirmationScreen);
        });
    }
}

// ================================
// EVENT LISTENERS
// ================================

function setupEventListeners() {
    // Enable first interaction
    document.addEventListener('click', function() {
        state.firstInteraction = true;
    }, { once: true });
    
    document.addEventListener('touchstart', function() {
        state.firstInteraction = true;
    }, { once: true });
    
    // Mute toggle
    elements.muteToggle.addEventListener('click', function() {
        AudioSystem.toggle();
    });
    
    // Yes button
    elements.yesButton.addEventListener('click', handleYesClick);
    
    // Error modal buttons
    elements.retryButton.addEventListener('click', hideErrorModal);
    elements.forcedYesButton.addEventListener('click', function() {
        hideErrorModal();
        handleYesClick();
    });
    
    // Pick date button
    elements.pickDateButton.addEventListener('click', function() {
        AudioSystem.playBoop();
        showScreen(elements.dateSelectorScreen);
    });
    
    // Screenshot button
    elements.screenshotButton.addEventListener('click', function() {
        AudioSystem.playBoop();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.errorModal.classList.contains('active')) {
            hideErrorModal();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (elements.confettiCanvas.classList.contains('active')) {
            elements.confettiCanvas.width = window.innerWidth;
            elements.confettiCanvas.height = window.innerHeight;
        }
    });
}

// ================================
// INITIALIZATION
// ================================

function initializeElements() {
    elements = {
        landingScreen: document.getElementById('landingScreen'),
        successScreen: document.getElementById('successScreen'),
        dateSelectorScreen: document.getElementById('dateSelectorScreen'),
        confirmationScreen: document.getElementById('confirmationScreen'),
        yesButton: document.getElementById('yesButton'),
        noButton: document.getElementById('noButton'),
        muteToggle: document.getElementById('muteToggle'),
        pickDateButton: document.getElementById('pickDateButton'),
        screenshotButton: document.getElementById('screenshotButton'),
        errorModal: document.getElementById('errorModal'),
        retryButton: document.getElementById('retryButton'),
        forcedYesButton: document.getElementById('forcedYesButton'),
        attemptCounter: document.getElementById('attemptCounter'),
        dodgeMessage: document.getElementById('dodgeMessage'),
        chosenDate: document.getElementById('chosenDate'),
        confettiCanvas: document.getElementById('confettiCanvas')
    };
}

function init() {
    initializeElements();
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
