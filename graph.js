// Resource Allocation Graph Functions
let processCounter = 0;
let resourceCounter = 0;

function addProcess() {
    const process = {
        id: `P${processCounter++}`,
        x: Math.random() * 600 + 50,
        y: Math.random() * 300 + 50
    };
    state.processes.push(process);
    renderGraph();
    historyManager.saveState();
    soundManager.playClick();
    showNotification(`✅ Process ${process.id} added`, 'success');
}

function addResource() {
    const resource = {
        id: `R${resourceCounter++}`,
        instances: 1,
        x: Math.random() * 600 + 50,
        y: Math.random() * 300 + 50
    };
    state.resources.push(resource);
    renderGraph();
    historyManager.saveState();
    soundManager.playClick();
    showNotification(`✅ Resource ${resource.id} added`, 'success');
}

function addEdge() {
    if (state.processes.length === 0 || state.resources.length === 0) {
        showNotification('⚠️ Add processes and resources first!', 'warning');
        return;
    }

    // Open modal and populate dropdowns
    openEdgeModal();
}

function openEdgeModal() {
    const modal = document.getElementById('edgeModal');
    const fromSelect = document.getElementById('edgeFrom');
    const toSelect = document.getElementById('edgeTo');

    // Clear existing options
    fromSelect.innerHTML = '<option value="">-- Select Source --</option>';
    toSelect.innerHTML = '<option value="">-- Select Target --</option>';

    // Add all nodes (processes and resources) to both dropdowns
    state.processes.forEach(proc => {
        fromSelect.innerHTML += `<option value="${proc.id}">Process: ${proc.id}</option>`;
        toSelect.innerHTML += `<option value="${proc.id}">Process: ${proc.id}</option>`;
    });

    state.resources.forEach(res => {
        fromSelect.innerHTML += `<option value="${res.id}">Resource: ${res.id}</option>`;
        toSelect.innerHTML += `<option value="${res.id}">Resource: ${res.id}</option>`;
    });

    modal.classList.add('active');
}

function closeEdgeModal() {
    const modal = document.getElementById('edgeModal');
    modal.classList.remove('active');
}

function confirmAddEdge() {
    const from = document.getElementById('edgeFrom').value;
    const to = document.getElementById('edgeTo').value;

    if (!from || !to) {
        showNotification('⚠️ Please select both source and target!', 'warning');
        return;
    }

    if (from === to) {
        showNotification('⚠️ Source and target cannot be the same!', 'warning');
        return;
    }

    // Check if edge already exists
    const edgeExists = state.edges.some(e => e.from === from && e.to === to);
    if (edgeExists) {
        showNotification('⚠️ This edge already exists!', 'warning');
        return;
    }

    state.edges.push({ from, to });
    renderGraph();
    closeEdgeModal();
    showNotification(`✅ Edge added: ${from} → ${to}`, 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '3000';
    notification.style.minWidth = '300px';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function clearGraph() {
    state.processes = [];
    state.resources = [];
    state.edges = [];
    processCounter = 0;
    resourceCounter = 0;
    renderGraph();
    document.getElementById('graphStatus').innerHTML = '';
    historyManager.saveState();
    soundManager.playClick();
    showNotification('🗑️ Graph cleared', 'info');
}

function renderGraph() {
    const canvas = document.getElementById('graphCanvas');
    canvas.innerHTML = '';

    // Create SVG for edges
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1';
    canvas.appendChild(svg);

    // Add arrowhead marker definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#6366f1');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Render edges first (so they appear behind nodes)
    state.edges.forEach(edge => {
        const fromNode = [...state.processes, ...state.resources].find(n => n.id === edge.from);
        const toNode = [...state.processes, ...state.resources].find(n => n.id === edge.to);

        if (fromNode && toNode) {
            // Calculate center positions (node position + 30px for center of 60px node)
            const x1 = fromNode.x + 30;
            const y1 = fromNode.y + 30;
            const x2 = toNode.x + 30;
            const y2 = toNode.y + 30;

            // Calculate angle and adjust for node radius
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const radius = 30;

            const startX = x1 + radius * Math.cos(angle);
            const startY = y1 + radius * Math.sin(angle);
            const endX = x2 - radius * Math.cos(angle);
            const endY = y2 - radius * Math.sin(angle);

            // Create line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', '#6366f1');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('marker-end', 'url(#arrowhead)');
            svg.appendChild(line);
        }
    });

    // Render processes
    state.processes.forEach(proc => {
        const node = document.createElement('div');
        node.className = 'process-node';
        node.textContent = proc.id;
        node.style.left = proc.x + 'px';
        node.style.top = proc.y + 'px';
        node.style.position = 'absolute';
        node.style.zIndex = '10';
        node.draggable = true;
        node.ondragstart = (e) => {
            e.dataTransfer.setData('nodeId', proc.id);
            e.dataTransfer.setData('nodeType', 'process');
        };
        canvas.appendChild(node);
    });

    // Render resources
    state.resources.forEach(res => {
        const node = document.createElement('div');
        node.className = 'resource-node';
        node.textContent = res.id;
        node.style.left = res.x + 'px';
        node.style.top = res.y + 'px';
        node.style.position = 'absolute';
        node.style.zIndex = '10';
        node.draggable = true;
        node.ondragstart = (e) => {
            e.dataTransfer.setData('nodeId', res.id);
            e.dataTransfer.setData('nodeType', 'resource');
        };
        canvas.appendChild(node);
    });

    canvas.ondragover = (e) => e.preventDefault();
    canvas.ondrop = (e) => {
        e.preventDefault();
        const nodeId = e.dataTransfer.getData('nodeId');
        const nodeType = e.dataTransfer.getData('nodeType');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 30;
        const y = e.clientY - rect.top - 30;

        if (nodeType === 'process') {
            const proc = state.processes.find(p => p.id === nodeId);
            if (proc) {
                proc.x = x;
                proc.y = y;
            }
        } else {
            const res = state.resources.find(r => r.id === nodeId);
            if (res) {
                res.x = x;
                res.y = y;
            }
        }
        renderGraph();
    };
}

function detectDeadlock() {
    if (state.edges.length === 0) {
        showStatus('No edges to analyze', 'info');
        soundManager.playError();
        return;
    }

    // Get cycle path from detectCycle
    const cycle = detectCycle();

    if (cycle) {
        // Format the cycle path
        const cyclePath = cycle.join(' → ');
        showStatus(`🚨 DEADLOCK DETECTED! Cycle: ${cyclePath}`, 'danger');
        soundManager.playError();
        // Create particle explosion effect
        const canvas = document.getElementById('graphCanvas');
        const rect = canvas.getBoundingClientRect();
        particleSystem.createParticles(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            30,
            '#ef4444'
        );
        // Add shake animation to graph
        canvas.classList.add('animate-shake');
        setTimeout(() => canvas.classList.remove('animate-shake'), 500);
    } else {
        showStatus('✅ No deadlock detected. System is safe.', 'success');
        soundManager.playSuccess();
        particleSystem.createConfetti(20);
    }
}

function detectCycle() {
    const graph = {};
    state.edges.forEach(edge => {
        if (!graph[edge.from]) graph[edge.from] = [];
        graph[edge.from].push(edge.to);
    });

    const visited = new Set();
    const recStack = new Set();
    const parent = {};
    let cycleStart = null;
    let cycleEnd = null;

    function dfs(node) {
        visited.add(node);
        recStack.add(node);

        if (graph[node]) {
            for (let neighbor of graph[node]) {
                if (!visited.has(neighbor)) {
                    parent[neighbor] = node;
                    if (dfs(neighbor)) return true;
                } else if (recStack.has(neighbor)) {
                    cycleStart = neighbor;
                    cycleEnd = node;
                    return true;
                }
            }
        }

        recStack.delete(node);
        return false;
    }

    for (let node in graph) {
        if (!visited.has(node)) {
            if (dfs(node)) {
                // Build the cycle path
                const cycle = [];
                let current = cycleEnd;

                // Build path from cycleEnd to cycleStart
                while (current !== cycleStart) {
                    cycle.unshift(current);
                    current = parent[current];
                }

                // Add cycleStart at the beginning
                cycle.unshift(cycleStart);

                // Add cycleStart at the end to show complete cycle
                cycle.push(cycleStart);

                return cycle;
            }
        }
    }

    return null;
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('graphStatus');
    statusDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// ============================================
// DEADLOCK RECOVERY FUNCTIONS
// ============================================

// State history for rollback
let graphStateHistory = [];

// Save current state for rollback
function saveGraphState() {
    graphStateHistory.push({
        processes: JSON.parse(JSON.stringify(state.processes)),
        resources: JSON.parse(JSON.stringify(state.resources)),
        edges: JSON.parse(JSON.stringify(state.edges)),
        timestamp: new Date().toLocaleTimeString()
    });
    // Keep only last 10 states
    if (graphStateHistory.length > 10) {
        graphStateHistory.shift();
    }
}

// Kill Process - Remove process and all its edges
function killProcess() {
    if (state.processes.length === 0) {
        showNotification('⚠️ No processes to kill!', 'warning');
        return;
    }

    // Save state before recovery action
    saveGraphState();

    // Create modal to select process
    const processOptions = state.processes.map(p =>
        `<option value="${p.id}">${p.id}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <h3>🔪 Kill Process</h3>
            <p style="opacity: 0.8; margin-bottom: 20px;">Select a process to terminate. This will remove the process and all its edges.</p>
            <div class="input-group">
                <label>Process to Kill:</label>
                <select id="killProcessSelect">
                    <option value="">-- Select Process --</option>
                    ${processOptions}
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmKillProcess()">Kill Process</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmKillProcess() {
    const processId = document.getElementById('killProcessSelect').value;
    if (!processId) {
        showNotification('⚠️ Please select a process!', 'warning');
        return;
    }

    // Check deadlock before
    const hadDeadlockBefore = detectCycle();

    // Remove process
    state.processes = state.processes.filter(p => p.id !== processId);

    // Remove all edges connected to this process
    const removedEdges = state.edges.filter(e => e.from === processId || e.to === processId);
    state.edges = state.edges.filter(e => e.from !== processId && e.to !== processId);

    // Check deadlock after
    const hasDeadlockAfter = detectCycle();

    // Update UI
    renderGraph();
    document.querySelector('.modal-overlay').remove();

    // Show recovery feedback
    showRecoveryFeedback({
        action: 'Kill Process',
        processTerminated: processId,
        edgesRemoved: removedEdges.length,
        hadDeadlock: hadDeadlockBefore,
        hasDeadlock: hasDeadlockAfter
    });

    soundManager.playClick();
}

// Preempt Resource - Free resource from a process
function preemptResource() {
    if (state.edges.length === 0) {
        showNotification('⚠️ No resource allocations to preempt!', 'warning');
        return;
    }

    // Save state before recovery action
    saveGraphState();

    // Get all resource->process edges (allocations)
    const allocations = state.edges.filter(e => {
        const fromNode = state.resources.find(r => r.id === e.from);
        const toNode = state.processes.find(p => p.id === e.to);
        return fromNode && toNode;
    });

    if (allocations.length === 0) {
        showNotification('⚠️ No resource allocations found!', 'warning');
        return;
    }

    const allocationOptions = allocations.map(edge =>
        `<option value="${edge.from}|${edge.to}">${edge.from} → ${edge.to}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <h3>🔓 Preempt Resource</h3>
            <p style="opacity: 0.8; margin-bottom: 20px;">Select a resource allocation to preempt. This will free the resource from the process.</p>
            <div class="input-group">
                <label>Resource Allocation:</label>
                <select id="preemptSelect">
                    <option value="">-- Select Allocation --</option>
                    ${allocationOptions}
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-warning" onclick="confirmPreemptResource()">Preempt</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmPreemptResource() {
    const selection = document.getElementById('preemptSelect').value;
    if (!selection) {
        showNotification('⚠️ Please select an allocation!', 'warning');
        return;
    }

    const [resourceId, processId] = selection.split('|');

    // Check deadlock before
    const hadDeadlockBefore = detectCycle();

    // Remove the edge
    state.edges = state.edges.filter(e => !(e.from === resourceId && e.to === processId));

    // Check deadlock after
    const hasDeadlockAfter = detectCycle();

    // Update UI
    renderGraph();
    document.querySelector('.modal-overlay').remove();

    // Show recovery feedback
    showRecoveryFeedback({
        action: 'Preempt Resource',
        resourceFreed: resourceId,
        fromProcess: processId,
        hadDeadlock: hadDeadlockBefore,
        hasDeadlock: hasDeadlockAfter
    });

    soundManager.playClick();
}

// Rollback Process - Restore to previous state
function rollbackProcess() {
    if (graphStateHistory.length === 0) {
        showNotification('⚠️ No previous states to rollback to!', 'warning');
        return;
    }

    const stateOptions = graphStateHistory.map((s, i) =>
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
                <select id="rollbackSelect">
                    <option value="">-- Select State --</option>
                    ${stateOptions}
                </select>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-warning" onclick="confirmRollback()">Rollback</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmRollback() {
    const stateIndex = document.getElementById('rollbackSelect').value;
    if (stateIndex === '') {
        showNotification('⚠️ Please select a state!', 'warning');
        return;
    }

    // Check deadlock before
    const hadDeadlockBefore = detectCycle();

    // Restore state
    const savedState = graphStateHistory[parseInt(stateIndex)];
    state.processes = JSON.parse(JSON.stringify(savedState.processes));
    state.resources = JSON.parse(JSON.stringify(savedState.resources));
    state.edges = JSON.parse(JSON.stringify(savedState.edges));

    // Check deadlock after
    const hasDeadlockAfter = detectCycle();

    // Update UI
    renderGraph();
    document.querySelector('.modal-overlay').remove();

    // Show recovery feedback
    showRecoveryFeedback({
        action: 'Rollback',
        rolledBackTo: savedState.timestamp,
        hadDeadlock: hadDeadlockBefore,
        hasDeadlock: hasDeadlockAfter
    });

    soundManager.playClick();
}

// Show Recovery Feedback
function showRecoveryFeedback(data) {
    const feedbackDiv = document.getElementById('recoveryFeedback');

    let feedbackHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1)); border-left: 4px solid #f59e0b;">
            <h3 style="margin-bottom: 15px;">🛠️ Recovery Action: ${data.action}</h3>
    `;

    // Action-specific details
    if (data.processTerminated) {
        feedbackHTML += `
            <div class="alert alert-danger" style="margin-bottom: 10px;">
                <strong>🔪 Process Terminated:</strong> ${data.processTerminated}
                <br><small>Removed ${data.edgesRemoved} edge(s)</small>
            </div>
        `;
    }

    if (data.resourceFreed) {
        feedbackHTML += `
            <div class="alert alert-warning" style="margin-bottom: 10px;">
                <strong>🔓 Resource Freed:</strong> ${data.resourceFreed}
                <br><small>From process: ${data.fromProcess}</small>
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
        soundManager.playSuccess();
        particleSystem.createConfetti(15);
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

// Load Example Graph with 5 Processes and Resources
function loadGraphExample() {
    // Clear existing graph manually
    state.processes = [];
    state.resources = [];
    state.edges = [];
    processCounter = 0;
    resourceCounter = 0;
    document.getElementById('graphStatus').innerHTML = '';

    // Create 5 processes
    for (let i = 0; i < 5; i++) {
        state.processes.push({
            id: `P${processCounter++}`,
            x: 150 + (i % 3) * 200,
            y: 100 + Math.floor(i / 3) * 150
        });
    }

    // Create 3 resources
    for (let i = 0; i < 3; i++) {
        state.resources.push({
            id: `R${resourceCounter++}`,
            x: 250 + i * 150,
            y: 300
        });
    }

    // Create edges to form a deadlock scenario
    // P0 requests R0
    state.edges.push({ from: 'P0', to: 'R0', type: 'request' });
    // R0 allocated to P1
    state.edges.push({ from: 'R0', to: 'P1', type: 'allocation' });
    // P1 requests R1
    state.edges.push({ from: 'P1', to: 'R1', type: 'request' });
    // R1 allocated to P2
    state.edges.push({ from: 'R1', to: 'P2', type: 'allocation' });
    // P2 requests R2
    state.edges.push({ from: 'P2', to: 'R2', type: 'request' });
    // R2 allocated to P0 (creates cycle)
    state.edges.push({ from: 'R2', to: 'P0', type: 'allocation' });

    // P3 requests R1
    state.edges.push({ from: 'P3', to: 'R1', type: 'request' });
    // P4 requests R2
    state.edges.push({ from: 'P4', to: 'R2', type: 'request' });

    // Update history
    historyManager.saveState();

    // Render the graph
    renderGraph();

    // Show notification
    showNotification('Example loaded: 5 processes, 3 resources with deadlock scenario', 'success');
    soundManager.playSuccess();

    // Auto-detect deadlock
    setTimeout(() => {
        detectDeadlock();
    }, 500);
}

// Auto-save state when changes are made
const originalAddProcess = addProcess;
const originalAddResource = addResource;
const originalConfirmAddEdge = confirmAddEdge;

// Override to save state
window.addEventListener('load', () => {
    // Save initial state
    setTimeout(() => saveGraphState(), 500);
});
