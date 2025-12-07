// Scenario Simulations

function runScenario(type) {
    const viz = document.getElementById('scenarioVisualization');

    switch (type) {
        case 'dining':
            viz.innerHTML = `
                <div class="card">
                    <h3>Dining Philosophers Simulation</h3>
                    <div class="alert alert-info">
                        <p><strong>Scenario:</strong> 5 philosophers, 5 chopsticks</p>
                        <p><strong>Problem:</strong> Each philosopher needs 2 chopsticks to eat</p>
                        <p><strong>Deadlock:</strong> All pick up left chopstick simultaneously</p>
                    </div>
                    <canvas id="diningCanvas" width="600" height="400"></canvas>
                </div>
            `;
            setTimeout(() => animateDining(), 100);
            break;
        case 'producer':
            viz.innerHTML = `
                <div class="card">
                    <h3>Producer-Consumer Simulation</h3>
                    <div class="alert alert-info">
                        <p><strong>Scenario:</strong> Shared buffer with limited capacity</p>
                        <p><strong>Prevention:</strong> Semaphores and mutex locks</p>
                        <p><strong>Solution:</strong> Use counting semaphores to track empty/full slots</p>
                    </div>
                    <div class="grid">
                        <div>
                            <h4>Buffer Status</h4>
                            <div id="bufferStatus" style="padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; margin-top: 10px;">
                                <p>Empty Slots: <span class="status-badge status-safe">10</span></p>
                                <p>Full Slots: <span class="status-badge status-warning">0</span></p>
                            </div>
                        </div>
                        <div>
                            <h4>Process Status</h4>
                            <div style="padding: 20px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; margin-top: 10px;">
                                <p>Producers: <span class="status-badge status-safe">Active</span></p>
                                <p>Consumers: <span class="status-badge status-safe">Active</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'readers':
            viz.innerHTML = `
                <div class="card">
                    <h3>Readers-Writers Simulation</h3>
                    <div class="alert alert-info">
                        <p><strong>Scenario:</strong> Multiple readers, exclusive writers</p>
                        <p><strong>Prevention:</strong> Read-write locks</p>
                        <p><strong>Solution:</strong> Allow multiple readers OR single writer</p>
                    </div>
                    <div class="grid">
                        <div>
                            <h4>Current State</h4>
                            <div style="padding: 20px; background: rgba(6, 182, 212, 0.1); border-radius: 8px; margin-top: 10px;">
                                <p>Active Readers: <span class="status-badge status-safe">3</span></p>
                                <p>Waiting Writers: <span class="status-badge status-warning">1</span></p>
                                <p>Lock Status: <span class="status-badge status-safe">Read Mode</span></p>
                            </div>
                        </div>
                        <div>
                            <h4>Priority Policy</h4>
                            <div style="padding: 20px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; margin-top: 10px;">
                                <p>✓ Readers can share access</p>
                                <p>✓ Writers get exclusive access</p>
                                <p>✓ No starvation prevention</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'traffic':
            viz.innerHTML = `
                <div class="card">
                    <h3>Traffic Intersection Simulation</h3>
                    <div class="alert alert-info">
                        <p><strong>Scenario:</strong> 4-way intersection gridlock</p>
                        <p><strong>Prevention:</strong> Traffic signals and priority rules</p>
                        <p><strong>Deadlock:</strong> All cars enter intersection simultaneously</p>
                    </div>
                    <canvas id="trafficCanvas" width="600" height="400"></canvas>
                </div>
            `;
            setTimeout(() => animateTraffic(), 100);
            break;
    }
}

function animateDining() {
    const canvas = document.getElementById('diningCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = 300;
    const centerY = 200;
    const radius = 120;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw table
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Draw philosophers
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`P${i}`, x, y);
    }

    // Draw chopsticks
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2 + Math.PI / 5;
        const x = centerX + radius * 0.6 * Math.cos(angle);
        const y = centerY + radius * 0.6 * Math.sin(angle);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x + 15, y);
        ctx.stroke();

        // Label chopsticks
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`C${i}`, x, y - 20);
    }
}

function animateTraffic() {
    const canvas = document.getElementById('trafficCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = 300;
    const centerY = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw intersection
    ctx.fillStyle = '#334155';
    ctx.fillRect(centerX - 60, centerY - 60, 120, 120);

    // Draw roads
    ctx.fillStyle = '#475569';
    ctx.fillRect(centerX - 60, 0, 120, canvas.height);
    ctx.fillRect(0, centerY - 60, canvas.width, 120);

    // Draw lane markings
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw cars
    const cars = [
        { x: centerX - 80, y: centerY - 20, color: '#ef4444', dir: 'E' },
        { x: centerX + 80, y: centerY + 20, color: '#3b82f6', dir: 'W' },
        { x: centerX - 20, y: centerY - 80, color: '#10b981', dir: 'S' },
        { x: centerX + 20, y: centerY + 80, color: '#f59e0b', dir: 'N' }
    ];

    cars.forEach((car, i) => {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x - 15, car.y - 10, 30, 20);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(car.dir, car.x, car.y);
    });
}
