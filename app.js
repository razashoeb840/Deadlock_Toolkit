// Application State Management
let state = {
    processes: [],
    resources: [],
    edges: [],
    theme: 'dark',
    allocation: [],
    maximum: [],
    available: []
};

// Theme Toggle
function toggleTheme() {
    const themeButton = document.getElementById('themeToggle');

    // Cycle through: dark -> light -> sunset -> volcano -> cosmic -> emerald -> dark
    if (state.theme === 'dark') {
        state.theme = 'light';
        document.body.classList.remove('theme-sunset', 'theme-volcano', 'theme-cosmic', 'theme-emerald');
        document.body.classList.add('light-mode');
        themeButton.textContent = '☀️';
        themeButton.title = 'Toggle Theme (Light Mode Active)';
    } else if (state.theme === 'light') {
        state.theme = 'sunset';
        document.body.classList.remove('light-mode', 'theme-volcano', 'theme-cosmic', 'theme-emerald');
        document.body.classList.add('theme-sunset');
        themeButton.textContent = '🌅';
        themeButton.title = 'Toggle Theme (Sunset Mode Active)';
    } else if (state.theme === 'sunset') {
        state.theme = 'volcano';
        document.body.classList.remove('light-mode', 'theme-sunset', 'theme-cosmic', 'theme-emerald');
        document.body.classList.add('theme-volcano');
        themeButton.textContent = '🌋';
        themeButton.title = 'Toggle Theme (Volcano Mode Active)';
    } else if (state.theme === 'volcano') {
        state.theme = 'cosmic';
        document.body.classList.remove('light-mode', 'theme-sunset', 'theme-volcano', 'theme-emerald');
        document.body.classList.add('theme-cosmic');
        themeButton.textContent = '🌌';
        themeButton.title = 'Toggle Theme (Cosmic Mode Active)';
    } else if (state.theme === 'cosmic') {
        state.theme = 'emerald';
        document.body.classList.remove('light-mode', 'theme-sunset', 'theme-volcano', 'theme-cosmic');
        document.body.classList.add('theme-emerald');
        themeButton.textContent = '🌿';
        themeButton.title = 'Toggle Theme (Emerald Mode Active)';
    } else {
        state.theme = 'dark';
        document.body.classList.remove('light-mode', 'theme-sunset', 'theme-volcano', 'theme-cosmic', 'theme-emerald');
        themeButton.textContent = '🌙';
        themeButton.title = 'Toggle Theme (Dark Mode Active)';
    }
    localStorage.setItem('theme', state.theme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    state.theme = 'light';
    document.body.classList.add('light-mode');
    // Update button icon on load
    window.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = '☀️';
        themeButton.title = 'Toggle Theme (Light Mode Active)';
    });
} else if (savedTheme === 'sunset') {
    state.theme = 'sunset';
    document.body.classList.add('theme-sunset');
    // Update button icon on load
    window.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = '🌅';
        themeButton.title = 'Toggle Theme (Sunset Mode Active)';
    });
} else if (savedTheme === 'volcano') {
    state.theme = 'volcano';
    document.body.classList.add('theme-volcano');
    // Update button icon on load
    window.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = '🌋';
        themeButton.title = 'Toggle Theme (Volcano Mode Active)';
    });
} else if (savedTheme === 'cosmic') {
    state.theme = 'cosmic';
    document.body.classList.add('theme-cosmic');
    // Update button icon on load
    window.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = '🌌';
        themeButton.title = 'Toggle Theme (Cosmic Mode Active)';
    });
} else if (savedTheme === 'emerald') {
    state.theme = 'emerald';
    document.body.classList.add('theme-emerald');
    // Update button icon on load
    window.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = '🌿';
        themeButton.title = 'Toggle Theme (Emerald Mode Active)';
    });
} else {
    // Default dark mode
    window.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = '🌙';
        themeButton.title = 'Toggle Theme (Dark Mode Active)';
    });
}

// Sound Toggle
function toggleSound() {
    const enabled = soundManager.toggle();
    const button = document.querySelector('.sound-toggle');
    button.textContent = enabled ? '🔊' : '🔇';
    button.classList.toggle('muted', !enabled);
    soundManager.playClick();
}

// Start Tutorial
function startTutorial() {
    const tutorialSteps = [
        {
            selector: '.btn-primary',
            title: 'Add Processes & Resources',
            content: 'Click these buttons to add processes (circles) and resources (squares) to your graph.'
        },
        {
            selector: '.btn-secondary',
            title: 'Create Dependencies',
            content: 'Use the "Add Edge" button to create dependencies between processes and resources.'
        },
        {
            selector: '.btn-success',
            title: 'Detect Deadlocks',
            content: 'Click "Detect Deadlock" to analyze your graph and find circular dependencies.'
        },
        {
            selector: '#graphCanvas',
            title: 'Interactive Canvas',
            content: 'Drag and drop nodes to rearrange your graph. Hover over nodes for more information.'
        },
        {
            selector: '.tabs',
            title: 'Explore More Features',
            content: 'Use these tabs to explore Banker\'s Algorithm, classic scenarios, and deadlock detection.'
        }
    ];

    tutorial.start(tutorialSteps);
    soundManager.playNotification();
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab, .nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    soundManager.playClick();
}

// Initialize on load
window.addEventListener('load', () => {
    renderGraph();

    // Add tooltips to all buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function (e) {
            const text = this.textContent.trim();
            tooltipManager.show(this, text, 'top');
        });
        btn.addEventListener('mouseleave', () => {
            tooltipManager.hide();
        });
    });

    // Add ripple effect to all buttons
    document.querySelectorAll('.ripple-container').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
});
