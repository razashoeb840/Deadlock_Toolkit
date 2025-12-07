// Interactive Features & Effects System

// ============================================
// Tooltip System
// ============================================
class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.init();
    }

    init() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'custom-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(30, 30, 30, 0.95);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.875rem;
            pointer-events: none;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s;
            max-width: 250px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(this.tooltip);
    }

    show(element, content, position = 'top') {
        const rect = element.getBoundingClientRect();
        this.tooltip.innerHTML = content;
        this.tooltip.style.opacity = '1';

        // Position tooltip
        const tooltipRect = this.tooltip.getBoundingClientRect();
        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 8;
                break;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }

    hide() {
        this.tooltip.style.opacity = '0';
    }
}

const tooltipManager = new TooltipManager();

// ============================================
// Particle Effect System
// ============================================
class ParticleSystem {
    createParticles(x, y, count = 20, color = '#6366f1') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle particle-explode';
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                background: ${color};
                --particle-x: ${(Math.random() - 0.5) * 200}px;
                --particle-y: ${(Math.random() - 0.5) * 200}px;
            `;
            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 800);
        }
    }

    createConfetti(count = 50) {
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                left: ${Math.random() * 100}vw;
                top: -10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 0.5}s;
                animation-duration: ${2 + Math.random() * 2}s;
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    }

    createFloatingParticles(element, count = 10) {
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle particle-float';
            particle.style.cssText = `
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + rect.height}px;
                background: rgba(99, 102, 241, 0.6);
                --particle-x: ${(Math.random() - 0.5) * 50}px;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 2000);
        }
    }
}

const particleSystem = new ParticleSystem();

// ============================================
// Sound Effect Manager
// ============================================
class SoundManager {
    constructor() {
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.sounds = {};
        this.initSounds();
    }

    initSounds() {
        // Create audio context for sound generation
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playTone(frequency, duration = 100, type = 'sine') {
        if (!this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    playClick() {
        this.playTone(800, 50, 'square');
    }

    playSuccess() {
        this.playTone(523.25, 100, 'sine'); // C5
        setTimeout(() => this.playTone(659.25, 100, 'sine'), 100); // E5
        setTimeout(() => this.playTone(783.99, 150, 'sine'), 200); // G5
    }

    playError() {
        this.playTone(200, 100, 'sawtooth');
        setTimeout(() => this.playTone(150, 150, 'sawtooth'), 100);
    }

    playNotification() {
        this.playTone(659.25, 100, 'sine');
        setTimeout(() => this.playTone(783.99, 100, 'sine'), 100);
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        return this.enabled;
    }
}

const soundManager = new SoundManager();

// ============================================
// Ripple Effect
// ============================================
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// ============================================
// Tutorial/Guide System
// ============================================
class TutorialManager {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
        this.overlay = null;
        this.highlight = null;
        this.tooltip = null;
    }

    init() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            display: none;
        `;
        document.body.appendChild(this.overlay);

        // Create highlight
        this.highlight = document.createElement('div');
        this.highlight.style.cssText = `
            position: fixed;
            border: 3px solid #6366f1;
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(this.highlight);

        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed;
            background: white;
            color: #1f2937;
            padding: 20px;
            border-radius: 12px;
            max-width: 350px;
            z-index: 10000;
            display: none;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(this.tooltip);
    }

    start(steps) {
        if (!this.overlay) this.init();

        this.steps = steps;
        this.currentStep = 0;
        this.showStep();
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.end();
            return;
        }

        const step = this.steps[this.currentStep];
        const element = document.querySelector(step.selector);

        if (!element) {
            this.next();
            return;
        }

        // Show overlay and highlight
        this.overlay.style.display = 'block';
        this.highlight.style.display = 'block';

        const rect = element.getBoundingClientRect();
        this.highlight.style.top = `${rect.top - 5}px`;
        this.highlight.style.left = `${rect.left - 5}px`;
        this.highlight.style.width = `${rect.width + 10}px`;
        this.highlight.style.height = `${rect.height + 10}px`;

        // Show tooltip
        this.tooltip.style.display = 'block';
        this.tooltip.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #6366f1;">${step.title}</h3>
            <p style="margin: 0 0 15px 0;">${step.content}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.875rem; opacity: 0.7;">Step ${this.currentStep + 1} of ${this.steps.length}</span>
                <div>
                    ${this.currentStep > 0 ? '<button class="btn btn-secondary" onclick="tutorial.previous()" style="margin-right: 10px;">Previous</button>' : ''}
                    <button class="btn btn-primary" onclick="tutorial.next()">${this.currentStep < this.steps.length - 1 ? 'Next' : 'Finish'}</button>
                </div>
            </div>
        `;

        // Position tooltip
        this.tooltip.style.top = `${rect.bottom + 20}px`;
        this.tooltip.style.left = `${rect.left}px`;
    }

    next() {
        this.currentStep++;
        this.showStep();
    }

    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    end() {
        this.overlay.style.display = 'none';
        this.highlight.style.display = 'none';
        this.tooltip.style.display = 'none';
        particleSystem.createConfetti(30);
        soundManager.playSuccess();
    }
}

const tutorial = new TutorialManager();

// ============================================
// Auto-save System
// ============================================
class AutoSaveManager {
    constructor() {
        this.saveInterval = 30000; // 30 seconds
        this.init();
    }

    init() {
        // Auto-save every 30 seconds
        setInterval(() => this.save(), this.saveInterval);

        // Save on page unload
        window.addEventListener('beforeunload', () => this.save());

        // Load on page load
        this.load();
    }

    save() {
        const data = {
            processes: state.processes,
            resources: state.resources,
            edges: state.edges,
            timestamp: Date.now()
        };
        localStorage.setItem('graphState', JSON.stringify(data));
        this.showSaveIndicator();
    }

    load() {
        const saved = localStorage.getItem('graphState');
        if (saved) {
            const data = JSON.parse(saved);
            state.processes = data.processes || [];
            state.resources = data.resources || [];
            state.edges = data.edges || [];

            // Update counters
            processCounter = state.processes.length;
            resourceCounter = state.resources.length;

            if (typeof renderGraph === 'function') {
                renderGraph();
            }
        }
    }

    showSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = '💾 Saved';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.875rem;
            z-index: 10000;
            animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
        `;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }

    clear() {
        localStorage.removeItem('graphState');
    }
}

const autoSave = new AutoSaveManager();

// ============================================
// Keyboard Shortcuts
// ============================================
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            'ctrl+z': () => historyManager.undo(),
            'ctrl+y': () => historyManager.redo(),
            'ctrl+s': (e) => {
                e.preventDefault();
                autoSave.save();
            },
            'delete': () => this.deleteSelected(),
            'escape': () => closeEdgeModal(),
            'ctrl+h': (e) => {
                e.preventDefault();
                this.showHelp();
            }
        };
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (this.shortcuts[key]) {
                this.shortcuts[key](e);
            }
        });
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    deleteSelected() {
        // Implement delete selected node functionality
        console.log('Delete selected node');
    }

    showHelp() {
        const helpContent = `
            <h3>Keyboard Shortcuts</h3>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Ctrl+Z:</strong> Undo</li>
                <li><strong>Ctrl+Y:</strong> Redo</li>
                <li><strong>Ctrl+S:</strong> Save</li>
                <li><strong>Delete:</strong> Delete selected</li>
                <li><strong>Escape:</strong> Close modal</li>
                <li><strong>Ctrl+H:</strong> Show this help</li>
            </ul>
        `;
        showNotification(helpContent, 'info');
    }
}

const keyboardShortcuts = new KeyboardShortcuts();

// ============================================
// History Manager (Undo/Redo)
// ============================================
class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 50;
    }

    saveState() {
        // Remove any states after current index
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new state
        const state = {
            processes: JSON.parse(JSON.stringify(window.state.processes)),
            resources: JSON.parse(JSON.stringify(window.state.resources)),
            edges: JSON.parse(JSON.stringify(window.state.edges))
        };
        this.history.push(state);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.restoreState();
            soundManager.playClick();
        }
    }

    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.restoreState();
            soundManager.playClick();
        }
    }

    restoreState() {
        const state = this.history[this.currentIndex];
        window.state.processes = JSON.parse(JSON.stringify(state.processes));
        window.state.resources = JSON.parse(JSON.stringify(state.resources));
        window.state.edges = JSON.parse(JSON.stringify(state.edges));

        if (typeof renderGraph === 'function') {
            renderGraph();
        }
    }
}

const historyManager = new HistoryManager();

// Export for global access
window.tooltipManager = tooltipManager;
window.particleSystem = particleSystem;
window.soundManager = soundManager;
window.tutorial = tutorial;
window.autoSave = autoSave;
window.historyManager = historyManager;
window.createRipple = createRipple;
