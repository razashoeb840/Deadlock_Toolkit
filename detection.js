// Deadlock Detection Module - Real-time Implementation

// Detection State
let detectionState = {
    processes: [],
    waitForEdges: [],
    detectionHistory: [],
    isMonitoring: false,
    monitoringInterval: null,
    stats: {
        totalChecks: 0,
        deadlocksFound: 0,
        safeStates: 0,
        unsafeStates: 0
    }
};

// Initialize Detection System
function initializeDetection() {
    // Create sample processes if none exist
    if (detectionState.processes.length === 0) {
        addDetectionProcess('P1');
        addDetectionProcess('P2');
        addDetectionProcess('P3');
        addDetectionProcess('P4');
    }

    renderWaitForGraph();
    updateDetectionStats();
    renderDetectionLog();
}

// Add Process to Detection System
function addDetectionProcess(name = null) {
    const processName = name || `P${detectionState.processes.length + 1}`;
    const process = {
        id: processName,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        status: 'running',
        waitingFor: null
    };

    detectionState.processes.push(process);
    renderWaitForGraph();
    updateProcessList();
}

// Remove Process
function removeDetectionProcess(processId) {
    detectionState.processes = detectionState.processes.filter(p => p.id !== processId);
    detectionState.waitForEdges = detectionState.waitForEdges.filter(
        e => e.from !== processId && e.to !== processId
    );
    renderWaitForGraph();
    updateProcessList();
}

// Add Wait-For Edge
function addWaitForEdge(from, to) {
    // Remove existing edge from this process
    detectionState.waitForEdges = detectionState.waitForEdges.filter(e => e.from !== from);

    // Add new edge
    if (to) {
        detectionState.waitForEdges.push({ from, to });
    }

    renderWaitForGraph();
}

// Render Wait-For Graph with Drag-and-Drop
let draggedProcess = null;
let dragOffset = { x: 0, y: 0 };
let hoveredProcess = null;

function renderWaitForGraph() {
    const canvas = document.getElementById('waitForGraph');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges first
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;

    detectionState.waitForEdges.forEach(edge => {
        const fromProc = detectionState.processes.find(p => p.id === edge.from);
        const toProc = detectionState.processes.find(p => p.id === edge.to);

        if (fromProc && toProc) {
            // Draw arrow
            drawArrow(ctx, fromProc.x, fromProc.y, toProc.x, toProc.y);
        }
    });

    // Draw nodes
    detectionState.processes.forEach(proc => {
        // Check if part of cycle
        const inCycle = isInCycle(proc.id);
        const isHovered = hoveredProcess === proc.id;

        // Draw glow effect if hovered
        if (isHovered) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = inCycle ? '#ef4444' : '#8b5cf6';
        }

        ctx.fillStyle = inCycle ? '#ef4444' : '#8b5cf6';
        ctx.beginPath();
        ctx.arc(proc.x, proc.y, isHovered ? 35 : 30, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Add glow effect if in cycle
        if (inCycle) {
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(proc.id, proc.x, proc.y);
    });

    // Add cursor style
    canvas.style.cursor = hoveredProcess ? 'grab' : 'default';
    if (draggedProcess) {
        canvas.style.cursor = 'grabbing';
    }
}

// Mouse event handlers for dragging
function setupCanvasInteraction() {
    const canvas = document.getElementById('waitForGraph');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked process
        for (let proc of detectionState.processes) {
            const dist = Math.sqrt((x - proc.x) ** 2 + (y - proc.y) ** 2);
            if (dist <= 30) {
                draggedProcess = proc;
                dragOffset.x = x - proc.x;
                dragOffset.y = y - proc.y;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (draggedProcess) {
            // Update position
            draggedProcess.x = x - dragOffset.x;
            draggedProcess.y = y - dragOffset.y;

            // Keep within bounds
            draggedProcess.x = Math.max(30, Math.min(canvas.width - 30, draggedProcess.x));
            draggedProcess.y = Math.max(30, Math.min(canvas.height - 30, draggedProcess.y));

            renderWaitForGraph();
        } else {
            // Check for hover
            let foundHover = null;
            for (let proc of detectionState.processes) {
                const dist = Math.sqrt((x - proc.x) ** 2 + (y - proc.y) ** 2);
                if (dist <= 30) {
                    foundHover = proc.id;
                    break;
                }
            }
            if (hoveredProcess !== foundHover) {
                hoveredProcess = foundHover;
                renderWaitForGraph();
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggedProcess = null;
        renderWaitForGraph();
    });

    canvas.addEventListener('mouseleave', () => {
        draggedProcess = null;
        hoveredProcess = null;
        renderWaitForGraph();
    });

    // Double-click to remove process
    canvas.addEventListener('dblclick', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let proc of detectionState.processes) {
            const dist = Math.sqrt((x - proc.x) ** 2 + (y - proc.y) ** 2);
            if (dist <= 30) {
                if (confirm(`Remove process ${proc.id}?`)) {
                    removeDetectionProcess(proc.id);
                }
                break;
            }
        }
    });
}

// Call setup after DOM is ready
setTimeout(setupCanvasInteraction, 200);

// Draw Arrow Helper
function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Adjust start and end points to account for node radius
    const radius = 30;
    const startX = fromX + radius * Math.cos(angle);
    const startY = fromY + radius * Math.sin(angle);
    const endX = toX - radius * Math.cos(angle);
    const endY = toY - radius * Math.sin(angle);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headlen * Math.cos(angle - Math.PI / 6),
        endY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - headlen * Math.cos(angle + Math.PI / 6),
        endY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(endX, endY);
    ctx.fill();
}

// Cycle Detection using DFS
function detectCycleInWaitForGraph() {
    const graph = {};

    // Build adjacency list
    detectionState.waitForEdges.forEach(edge => {
        if (!graph[edge.from]) graph[edge.from] = [];
        graph[edge.from].push(edge.to);
    });

    const visited = new Set();
    const recStack = new Set();
    let cycleNodes = [];

    function dfs(node, path = []) {
        visited.add(node);
        recStack.add(node);
        path.push(node);

        if (graph[node]) {
            for (let neighbor of graph[node]) {
                if (!visited.has(neighbor)) {
                    if (dfs(neighbor, [...path])) return true;
                } else if (recStack.has(neighbor)) {
                    // Found cycle
                    const cycleStart = path.indexOf(neighbor);
                    cycleNodes = path.slice(cycleStart);
                    cycleNodes.push(neighbor);
                    return true;
                }
            }
        }

        recStack.delete(node);
        return false;
    }

    for (let node of detectionState.processes.map(p => p.id)) {
        if (!visited.has(node)) {
            if (dfs(node)) {
                return { hasCycle: true, cycle: cycleNodes };
            }
        }
    }

    return { hasCycle: false, cycle: [] };
}

// Check if process is in cycle
function isInCycle(processId) {
    const result = detectCycleInWaitForGraph();
    return result.cycle.includes(processId);
}

// Run Detection
function runDetection() {
    const result = detectCycleInWaitForGraph();

    detectionState.stats.totalChecks++;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        time: timestamp,
        result: result.hasCycle ? 'DEADLOCK' : 'SAFE',
        cycle: result.cycle,
        processes: detectionState.processes.length,
        edges: detectionState.waitForEdges.length
    };

    if (result.hasCycle) {
        detectionState.stats.deadlocksFound++;
        detectionState.stats.unsafeStates++;
    } else {
        detectionState.stats.safeStates++;
    }

    detectionState.detectionHistory.unshift(logEntry);
    if (detectionState.detectionHistory.length > 20) {
        detectionState.detectionHistory.pop();
    }

    renderWaitForGraph();
    updateDetectionStats();
    renderDetectionLog();

    return result;
}

// Start Real-time Monitoring
function startMonitoring() {
    if (detectionState.isMonitoring) return;

    detectionState.isMonitoring = true;
    document.getElementById('startMonitoring').disabled = true;
    document.getElementById('stopMonitoring').disabled = false;

    // Run detection every 2 seconds
    detectionState.monitoringInterval = setInterval(() => {
        runDetection();
    }, 2000);

    addLogMessage('Real-time monitoring started', 'info');
}

// Stop Monitoring
function stopMonitoring() {
    if (!detectionState.isMonitoring) return;

    detectionState.isMonitoring = false;
    document.getElementById('startMonitoring').disabled = false;
    document.getElementById('stopMonitoring').disabled = true;

    if (detectionState.monitoringInterval) {
        clearInterval(detectionState.monitoringInterval);
        detectionState.monitoringInterval = null;
    }

    addLogMessage('Real-time monitoring stopped', 'info');
}

// Update Process List UI
function updateProcessList() {
    const container = document.getElementById('processList');
    if (!container) return;

    let html = '<div style="display: grid; gap: 10px;">';

    detectionState.processes.forEach(proc => {
        const inCycle = isInCycle(proc.id);
        const statusClass = inCycle ? 'status-unsafe' : 'status-safe';
        const statusText = inCycle ? 'In Deadlock' : 'Running';

        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(99, 102, 241, 0.1); border-radius: 8px;">
                <strong>${proc.id}</strong>
                <span class="status-badge ${statusClass}">${statusText}</span>
                <select onchange="addWaitForEdge('${proc.id}', this.value)" style="flex: 1;">
                    <option value="">Not Waiting</option>
                    ${detectionState.processes
                .filter(p => p.id !== proc.id)
                .map(p => {
                    const selected = detectionState.waitForEdges.find(e => e.from === proc.id && e.to === p.id) ? 'selected' : '';
                    return `<option value="${p.id}" ${selected}>Waiting for ${p.id}</option>`;
                })
                .join('')}
                </select>
                <button class="btn btn-danger" onclick="removeDetectionProcess('${proc.id}')" style="padding: 5px 10px; font-size: 0.9rem;">✕</button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Update Statistics
function updateDetectionStats() {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (window.detectionChart) {
        window.detectionChart.destroy();
    }

    window.detectionChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Total Checks', 'Deadlocks', 'Safe States', 'Unsafe States'],
            datasets: [{
                label: 'Detection Statistics',
                data: [
                    detectionState.stats.totalChecks,
                    detectionState.stats.deadlocksFound,
                    detectionState.stats.safeStates,
                    detectionState.stats.unsafeStates
                ],
                backgroundColor: [
                    '#06b6d4',
                    '#ef4444',
                    '#10b981',
                    '#f59e0b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render Detection Log
function renderDetectionLog() {
    const container = document.getElementById('detectionLog');
    if (!container) return;

    let html = '<h3>Detection History</h3>';
    html += '<div style="max-height: 300px; overflow-y: auto;">';

    if (detectionState.detectionHistory.length === 0) {
        html += '<p style="opacity: 0.6;">No detection runs yet. Click "Run Detection" or start monitoring.</p>';
    } else {
        detectionState.detectionHistory.forEach(entry => {
            const alertClass = entry.result === 'DEADLOCK' ? 'alert-danger' : 'alert-success';
            const icon = entry.result === 'DEADLOCK' ? '⚠️' : '✅';

            html += `
                <div class="alert ${alertClass}" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${icon} ${entry.result}</strong>
                        <span style="opacity: 0.8; font-size: 0.9rem;">${entry.time}</span>
                    </div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">
                        Processes: ${entry.processes} | Edges: ${entry.edges}
                        ${entry.cycle.length > 0 ? `<br>Cycle: ${entry.cycle.join(' → ')}` : ''}
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

// Add Log Message
function addLogMessage(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    detectionState.detectionHistory.unshift({
        time: timestamp,
        result: type.toUpperCase(),
        cycle: [],
        processes: detectionState.processes.length,
        edges: detectionState.waitForEdges.length,
        message: message
    });
    renderDetectionLog();
}

// Clear Detection History
function clearDetectionHistory() {
    detectionState.detectionHistory = [];
    detectionState.stats = {
        totalChecks: 0,
        deadlocksFound: 0,
        safeStates: 0,
        unsafeStates: 0
    };
    renderDetectionLog();
    updateDetectionStats();
}

// Load Example Scenario
function loadDetectionExample() {
    // Stop monitoring if active
    if (detectionState.isMonitoring) {
        stopMonitoring();
    }

    // Clear existing
    detectionState.processes = [];
    detectionState.waitForEdges = [];

    // Create deadlock scenario with 5 processes
    addDetectionProcess('P0');
    addDetectionProcess('P1');
    addDetectionProcess('P2');
    addDetectionProcess('P3');
    addDetectionProcess('P4');

    // Position processes in a pentagon shape
    const centerX = 300;
    const centerY = 200;
    const radius = 120;

    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2; // Start from top
        detectionState.processes[i].x = centerX + radius * Math.cos(angle);
        detectionState.processes[i].y = centerY + radius * Math.sin(angle);
    }

    // Create circular wait forming a deadlock
    setTimeout(() => {
        // P0 → P1 → P2 → P3 → P4 → P0 (circular wait)
        addWaitForEdge('P0', 'P1');
        addWaitForEdge('P1', 'P2');
        addWaitForEdge('P2', 'P3');
        addWaitForEdge('P3', 'P4');
        addWaitForEdge('P4', 'P0');

        updateProcessList();
        runDetection();

        // Show notification
        if (typeof showNotification !== 'undefined') {
            showNotification('Example loaded: 5 processes in circular deadlock', 'success');
        }
    }, 100);
}

// Reset Detection System
function resetDetectionSystem() {
    if (detectionState.isMonitoring) {
        stopMonitoring();
    }

    detectionState.processes = [];
    detectionState.waitForEdges = [];

    initializeDetection();
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDetection);
} else {
    setTimeout(initializeDetection, 100);
}

// ============================================
// DEADLOCK RECOVERY FUNCTIONS FOR DETECTION
// ============================================

// State history for rollback
let detectionStateHistory = [];

// Save current state for rollback
function saveDetectionState() {
    detectionStateHistory.push({
        processes: JSON.parse(JSON.stringify(detectionState.processes)),
        waitForEdges: JSON.parse(JSON.stringify(detectionState.waitForEdges)),
        timestamp: new Date().toLocaleTimeString()
    });
    // Keep only last 10 states
    if (detectionStateHistory.length > 10) {
        detectionStateHistory.shift();
    }
}

// Kill Detection Process - Remove process and all its edges
function killDetectionProcess() {
    if (detectionState.processes.length === 0) {
        alert('⚠️ No processes to kill!');
        return;
    }

    // Save state before recovery action
    saveDetectionState();

    // Create modal to select process
    const processOptions = detectionState.processes.map(p =>
        `<option value="${p.id}">${p.id}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <h3>🔪 Kill Process</h3>
            <p style="opacity: 0.8; margin-bottom: 20px;">Select a process to terminate. This will remove the process and all its wait-for edges.</p>
            <div class="input-group">
                <label>Process to Kill:</label>
                <select id="killDetectionProcessSelect">
                    <option value="">-- Select Process --</option>
                    ${processOptions}
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmKillDetectionProcess()">Kill Process</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmKillDetectionProcess() {
    const processId = document.getElementById('killDetectionProcessSelect').value;
    if (!processId) {
        alert('⚠️ Please select a process!');
        return;
    }

    // Check deadlock before
    const resultBefore = detectCycleInWaitForGraph();

    // Remove process and edges
    const removedEdges = detectionState.waitForEdges.filter(e => e.from === processId || e.to === processId);
    removeDetectionProcess(processId);

    // Check deadlock after
    const resultAfter = detectCycleInWaitForGraph();

    // Update UI
    document.querySelector('.modal-overlay').remove();

    // Show recovery feedback
    showDetectionRecoveryFeedback({
        action: 'Kill Process',
        processTerminated: processId,
        edgesRemoved: removedEdges.length,
        hadDeadlock: resultBefore.hasCycle,
        hasDeadlock: resultAfter.hasCycle
    });

    // Run detection to update stats
    runDetection();
}

// Preempt Detection Resource - Break wait-for edge
function preemptDetectionResource() {
    if (detectionState.waitForEdges.length === 0) {
        alert('⚠️ No wait-for edges to preempt!');
        return;
    }

    // Save state before recovery action
    saveDetectionState();

    const edgeOptions = detectionState.waitForEdges.map(edge =>
        `<option value="${edge.from}|${edge.to}">${edge.from} → ${edge.to}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <h3>🔓 Preempt Resource</h3>
            <p style="opacity: 0.8; margin-bottom: 20px;">Select a wait-for edge to break. This will free the waiting process.</p>
            <div class="input-group">
                <label>Wait-For Edge:</label>
                <select id="preemptDetectionSelect">
                    <option value="">-- Select Edge --</option>
                    ${edgeOptions}
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-warning" onclick="confirmPreemptDetectionResource()">Preempt</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmPreemptDetectionResource() {
    const selection = document.getElementById('preemptDetectionSelect').value;
    if (!selection) {
        alert('⚠️ Please select an edge!');
        return;
    }

    const [fromId, toId] = selection.split('|');

    // Check deadlock before
    const resultBefore = detectCycleInWaitForGraph();

    // Remove the edge
    detectionState.waitForEdges = detectionState.waitForEdges.filter(
        e => !(e.from === fromId && e.to === toId)
    );

    // Check deadlock after
    const resultAfter = detectCycleInWaitForGraph();

    // Update UI
    renderWaitForGraph();
    updateProcessList();
    document.querySelector('.modal-overlay').remove();

    // Show recovery feedback
    showDetectionRecoveryFeedback({
        action: 'Preempt Resource',
        resourceFreed: `${fromId} → ${toId}`,
        fromProcess: fromId,
        hadDeadlock: resultBefore.hasCycle,
        hasDeadlock: resultAfter.hasCycle
    });

    // Run detection to update stats
    runDetection();
}

// Rollback Detection Process - Restore to previous state
function rollbackDetectionProcess() {
    if (detectionStateHistory.length === 0) {
        alert('⚠️ No previous states to rollback to!');
        return;
    }

    const stateOptions = detectionStateHistory.map((s, i) =>
        `<option value="${i}">State ${i + 1} (${s.timestamp})</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <h3>🔁 Rollback Process</h3>
            <p style="opacity: 0.8; margin-bottom: 20px;">Select a previous state to restore. This will undo recent changes.</p>
            <div class="input-group">
                <label>Previous State:</label>
                <select id="rollbackDetectionSelect">
                    <option value="">-- Select State --</option>
                    ${stateOptions}
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-warning" onclick="confirmDetectionRollback()">Rollback</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmDetectionRollback() {
    const stateIndex = document.getElementById('rollbackDetectionSelect').value;
    if (stateIndex === '') {
        alert('⚠️ Please select a state!');
        return;
    }

    // Check deadlock before
    const resultBefore = detectCycleInWaitForGraph();

    // Restore state
    const savedState = detectionStateHistory[parseInt(stateIndex)];
    detectionState.processes = JSON.parse(JSON.stringify(savedState.processes));
    detectionState.waitForEdges = JSON.parse(JSON.stringify(savedState.waitForEdges));

    // Check deadlock after
    const resultAfter = detectCycleInWaitForGraph();

    // Update UI
    renderWaitForGraph();
    updateProcessList();
    document.querySelector('.modal-overlay').remove();

    // Show recovery feedback
    showDetectionRecoveryFeedback({
        action: 'Rollback',
        rolledBackTo: savedState.timestamp,
        hadDeadlock: resultBefore.hasCycle,
        hasDeadlock: resultAfter.hasCycle
    });

    // Run detection to update stats
    runDetection();
}

// Show Detection Recovery Feedback
function showDetectionRecoveryFeedback(data) {
    const feedbackDiv = document.getElementById('detectionRecoveryFeedback');
    if (!feedbackDiv) return;

    let feedbackHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1)); border-left: 4px solid #f59e0b;">
            <h3 style="margin-bottom: 15px;">🛠️ Recovery Action: ${data.action}</h3>
    `;

    // Action-specific details
    if (data.processTerminated) {
        feedbackHTML += `
            <div class="alert alert-danger" style="margin-bottom: 10px;">
                <strong>🔪 Process Terminated:</strong> ${data.processTerminated}
                <br><small>Removed ${data.edgesRemoved} wait-for edge(s)</small>
            </div>
        `;
    }

    if (data.resourceFreed && !data.processTerminated) {
        feedbackHTML += `
            <div class="alert alert-warning" style="margin-bottom: 10px;">
                <strong>🔓 Wait-For Edge Broken:</strong> ${data.resourceFreed}
                <br><small>Process ${data.fromProcess} is no longer waiting</small>
            </div>
        `;
    }

    if (data.rolledBackTo) {
        feedbackHTML += `
            <div class="alert alert-info" style="margin-bottom: 10px;">
                <strong>🔁 Rolled Back To:</strong> ${data.rolledBackTo}
            </div>
        `;
    }

    // Deadlock status
    if (data.hadDeadlock && !data.hasDeadlock) {
        feedbackHTML += `
            <div class="alert alert-success">
                <strong>✅ Deadlock Resolved!</strong> The system is now safe.
            </div>
        `;
        if (typeof soundManager !== 'undefined') soundManager.playSuccess();
        if (typeof particleSystem !== 'undefined') particleSystem.createConfetti(15);
    } else if (!data.hadDeadlock && data.hasDeadlock) {
        feedbackHTML += `
            <div class="alert alert-danger">
                <strong>⚠️ Deadlock Created!</strong> The recovery action created a new deadlock.
            </div>
        `;
    } else if (data.hadDeadlock && data.hasDeadlock) {
        feedbackHTML += `
            <div class="alert alert-warning">
                <strong>⚠️ Deadlock Still Exists</strong> The system is still in deadlock. Try another recovery action.
            </div>
        `;
    } else {
        feedbackHTML += `
            <div class="alert alert-info">
                <strong>ℹ️ No Deadlock</strong> The system remains safe.
            </div>
        `;
    }

    feedbackHTML += `</div>`;
    feedbackDiv.innerHTML = feedbackHTML;

    // Auto-scroll to feedback
    feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Auto-save state when changes are made
window.addEventListener('load', () => {
    // Save initial state after a delay
    setTimeout(() => saveDetectionState(), 1000);
});
