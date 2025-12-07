// ============================================
// DARK FUTURISTIC DASHBOARD ANIMATIONS
// ============================================

// Network Background Animation
function initNetworkBackground() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;
    const connectionDistance = 150;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = '#00f5ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(0, 245, 255, ${opacity * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Hero Graph Animation
function initHeroGraph() {
    const canvas = document.getElementById('heroGraph');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes = [
        { id: 'P1', x: 150, y: 100, type: 'process', color: '#8b5cf6' },
        { id: 'P2', x: 450, y: 100, type: 'process', color: '#8b5cf6' },
        { id: 'P3', x: 300, y: 300, type: 'process', color: '#8b5cf6' },
        { id: 'R1', x: 150, y: 300, type: 'resource', color: '#00f5ff' },
        { id: 'R2', x: 450, y: 300, type: 'resource', color: '#00f5ff' },
        { id: 'R3', x: 300, y: 500, type: 'resource', color: '#00f5ff' }
    ];

    const edges = [
        { from: 0, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 1 },
        { from: 4, to: 2 },
        { from: 5, to: 0 }
    ];

    let animationProgress = 0;

    function drawArrow(fromX, fromY, toX, toY, progress) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
        const currentDistance = distance * progress;

        const endX = fromX + Math.cos(angle) * currentDistance;
        const endY = fromY + Math.sin(angle) * currentDistance;

        // Draw line
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        if (progress > 0.9) {
            const headLength = 15;
            ctx.fillStyle = '#00f5ff';
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(
                toX - headLength * Math.cos(angle - Math.PI / 6),
                toY - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                toX - headLength * Math.cos(angle + Math.PI / 6),
                toY - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawNode(node, pulse) {
        const radius = 30 + pulse * 5;

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius + 10);
        gradient.addColorStop(0, node.color + '80');
        gradient.addColorStop(1, node.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        if (node.type === 'process') {
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = node.color;
            ctx.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2);
        }

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, node.x, node.y);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        animationProgress += 0.005;
        if (animationProgress > 1) animationProgress = 0;

        const pulse = Math.sin(animationProgress * Math.PI * 2) * 0.5 + 0.5;

        // Draw edges with animation
        edges.forEach(edge => {
            const from = nodes[edge.from];
            const to = nodes[edge.to];
            drawArrow(from.x, from.y, to.x, to.y, animationProgress);
        });

        // Draw nodes
        nodes.forEach(node => {
            drawNode(node, pulse);
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Intersection Observer for Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.glass-card, .feature-list li').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Terminal Typing Effect
function initTerminalTyping() {
    const terminalLines = document.querySelectorAll('.terminal-line');
    let delay = 0;

    terminalLines.forEach((line, index) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.animation = 'fadeIn 0.3s ease';
        }, delay);
        delay += 300;
    });
}

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNetworkBackground();
    initHeroGraph();
    initSmoothScroll();
    initScrollAnimations();

    // Delay terminal typing to trigger when visible
    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initTerminalTyping();
                terminalObserver.unobserve(entry.target);
            }
        });
    });

    const terminal = document.querySelector('.terminal-window');
    if (terminal) {
        terminalObserver.observe(terminal);
    }
});

// Add parallax effect to hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-right');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});
