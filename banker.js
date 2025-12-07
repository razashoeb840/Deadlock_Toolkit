// Banker's Algorithm Functions - Enhanced Version

// State for step-by-step execution
let bankerState = {
    isRunning: false,
    isPaused: false,
    currentStep: 0,
    executionSteps: [],
    speed: 1000, // milliseconds per step
    animationTimeout: null
};

function initializeBanker() {
    const numProc = parseInt(document.getElementById('numProcesses').value);
    const numRes = parseInt(document.getElementById('numResources').value);

    state.allocation = Array(numProc).fill(0).map(() => Array(numRes).fill(0));
    state.maximum = Array(numProc).fill(0).map(() => Array(numRes).fill(0));
    state.available = Array(numRes).fill(3);

    renderBankerMatrices(numProc, numRes);
    clearBankerResults();
}

function renderBankerMatrices(numProc, numRes) {
    const container = document.getElementById('bankerMatrices');
    let html = '<div class="banker-matrices-grid">';

    // Allocation Matrix
    html += '<div class="matrix-container"><h3>📊 Allocation Matrix</h3>';
    html += '<p class="matrix-description">Resources currently held by each process</p>';
    html += '<div class="matrix-input">';
    html += '<div class="matrix-row matrix-header">';
    for (let j = 0; j < numRes; j++) {
        html += `<div class="matrix-label">R${j}</div>`;
    }
    html += '</div>';
    for (let i = 0; i < numProc; i++) {
        html += `<div class="matrix-row"><div class="matrix-row-label">P${i}</div>`;
        for (let j = 0; j < numRes; j++) {
            html += `<input type="number" class="matrix-cell" id="alloc-${i}-${j}" value="0" min="0" 
                     onchange="updateAllocation(${i}, ${j}, parseInt(this.value))">`;
        }
        html += '</div>';
    }
    html += '</div></div>';

    // Maximum Matrix
    html += '<div class="matrix-container"><h3>🎯 Maximum Matrix</h3>';
    html += '<p class="matrix-description">Maximum resources each process may need</p>';
    html += '<div class="matrix-input">';
    html += '<div class="matrix-row matrix-header">';
    for (let j = 0; j < numRes; j++) {
        html += `<div class="matrix-label">R${j}</div>`;
    }
    html += '</div>';
    for (let i = 0; i < numProc; i++) {
        html += `<div class="matrix-row"><div class="matrix-row-label">P${i}</div>`;
        for (let j = 0; j < numRes; j++) {
            html += `<input type="number" class="matrix-cell" id="max-${i}-${j}" value="0" min="0" 
                     onchange="updateMaximum(${i}, ${j}, parseInt(this.value))">`;
        }
        html += '</div>';
    }
    html += '</div></div>';

    // Need Matrix (calculated)
    html += '<div class="matrix-container"><h3>🔢 Need Matrix</h3>';
    html += '<p class="matrix-description">Need = Maximum - Allocation (auto-calculated)</p>';
    html += '<div class="matrix-input" id="needMatrix">';
    html += '<div class="matrix-row matrix-header">';
    for (let j = 0; j < numRes; j++) {
        html += `<div class="matrix-label">R${j}</div>`;
    }
    html += '</div>';
    for (let i = 0; i < numProc; i++) {
        html += `<div class="matrix-row"><div class="matrix-row-label">P${i}</div>`;
        for (let j = 0; j < numRes; j++) {
            html += `<div class="matrix-cell matrix-cell-readonly" id="need-${i}-${j}">0</div>`;
        }
        html += '</div>';
    }
    html += '</div></div>';

    html += '</div>'; // Close banker-matrices-grid

    // Available Resources
    html += '<div class="available-resources-container">';
    html += '<h3>💎 Available Resources</h3>';
    html += '<p class="matrix-description">Total available instances of each resource type</p>';
    html += '<div class="matrix-row">';
    for (let j = 0; j < numRes; j++) {
        html += `<div class="available-resource-item">
                    <label>R${j}</label>
                    <input type="number" class="matrix-cell" id="avail-${j}" value="3" min="0" 
                           onchange="updateAvailable(${j}, parseInt(this.value))">
                 </div>`;
    }
    html += '</div></div>';

    container.innerHTML = html;
    updateNeedMatrix();
}

function updateAllocation(i, j, value) {
    state.allocation[i][j] = value;
    updateNeedMatrix();
}

function updateMaximum(i, j, value) {
    state.maximum[i][j] = value;
    updateNeedMatrix();
}

function updateAvailable(j, value) {
    state.available[j] = value;
}

function updateNeedMatrix() {
    const numProc = state.allocation.length;
    const numRes = state.available.length;

    for (let i = 0; i < numProc; i++) {
        for (let j = 0; j < numRes; j++) {
            const need = state.maximum[i][j] - state.allocation[i][j];
            const cell = document.getElementById(`need-${i}-${j}`);
            if (cell) {
                cell.textContent = need;
                cell.className = 'matrix-cell matrix-cell-readonly';
                if (need < 0) {
                    cell.classList.add('matrix-cell-error');
                    cell.title = 'Error: Allocation exceeds Maximum!';
                } else if (need === 0) {
                    cell.classList.add('matrix-cell-satisfied');
                }
            }
        }
    }
}

function runBankerAlgorithm() {
    // Reset state
    bankerState.currentStep = 0;
    bankerState.executionSteps = [];
    bankerState.isRunning = true;
    bankerState.isPaused = false;

    const numProc = state.allocation.length;
    const numRes = state.available.length;

    // Validate input
    for (let i = 0; i < numProc; i++) {
        for (let j = 0; j < numRes; j++) {
            if (state.allocation[i][j] > state.maximum[i][j]) {
                showError('Invalid input: Allocation cannot exceed Maximum for P' + i + ', R' + j);
                return;
            }
        }
    }

    // Calculate Need matrix
    const need = state.allocation.map((row, i) =>
        row.map((val, j) => state.maximum[i][j] - val)
    );

    const work = [...state.available];
    const finish = Array(numProc).fill(false);
    const safeSequence = [];

    // Initial step
    bankerState.executionSteps.push({
        type: 'start',
        work: [...work],
        finish: [...finish],
        message: `🚀 Starting Banker's Algorithm with ${numProc} processes and ${numRes} resource types.`,
        details: `Initial Available Resources: [${work.join(', ')}]`
    });

    let iteration = 0;
    let found = true;

    while (found && safeSequence.length < numProc) {
        found = false;
        iteration++;

        bankerState.executionSteps.push({
            type: 'iteration',
            iteration: iteration,
            work: [...work],
            finish: [...finish],
            message: `🔄 Iteration ${iteration}: Looking for a process that can execute...`,
            details: `Current Work (available): [${work.join(', ')}]`
        });

        for (let i = 0; i < numProc; i++) {
            if (!finish[i]) {
                let canAllocate = true;
                let comparison = [];

                for (let j = 0; j < numRes; j++) {
                    const needVal = need[i][j];
                    const workVal = work[j];
                    comparison.push(`R${j}: Need=${needVal} ${needVal <= workVal ? '≤' : '>'} Work=${workVal}`);

                    if (needVal > workVal) {
                        canAllocate = false;
                    }
                }

                if (canAllocate) {
                    // Process can execute
                    const oldWork = [...work];
                    for (let j = 0; j < numRes; j++) {
                        work[j] += state.allocation[i][j];
                    }
                    finish[i] = true;
                    safeSequence.push(i);
                    found = true;

                    bankerState.executionSteps.push({
                        type: 'execute',
                        process: i,
                        work: [...work],
                        oldWork: oldWork,
                        finish: [...finish],
                        allocation: [...state.allocation[i]],
                        need: [...need[i]],
                        message: `✅ Process P${i} can execute!`,
                        details: `Need: [${need[i].join(', ')}] ≤ Work: [${oldWork.join(', ')}]\nAfter execution, resources released: [${state.allocation[i].join(', ')}]\nNew Work: [${work.join(', ')}]`,
                        comparison: comparison
                    });
                    break; // Found one, start next iteration
                } else {
                    bankerState.executionSteps.push({
                        type: 'skip',
                        process: i,
                        work: [...work],
                        finish: [...finish],
                        need: [...need[i]],
                        message: `⏭️ Process P${i} cannot execute (insufficient resources)`,
                        details: `Need: [${need[i].join(', ')}] > Work: [${work.join(', ')}]`,
                        comparison: comparison
                    });
                }
            }
        }

        if (!found && safeSequence.length < numProc) {
            bankerState.executionSteps.push({
                type: 'deadlock',
                work: [...work],
                finish: [...finish],
                message: `⚠️ No process can proceed! System is in UNSAFE state.`,
                details: `Remaining processes cannot satisfy their needs with available resources.`
            });
        }
    }

    // Final result
    if (safeSequence.length === numProc) {
        bankerState.executionSteps.push({
            type: 'success',
            safeSequence: safeSequence,
            message: `🎉 System is in SAFE state!`,
            details: `All processes can complete. Safe sequence found: ${safeSequence.map(i => 'P' + i).join(' → ')}`
        });
    } else {
        bankerState.executionSteps.push({
            type: 'failure',
            safeSequence: safeSequence,
            message: `❌ System is in UNSAFE state!`,
            details: `Only ${safeSequence.length} out of ${numProc} processes can complete. Deadlock may occur!`
        });
    }

    // Show execution controls
    displayExecutionControls();

    // Start automatic playback
    playExecution();
}

function displayExecutionControls() {
    const resultDiv = document.getElementById('bankerResult');
    resultDiv.innerHTML = `
        <div class="execution-controls">
            <h3>🎬 Algorithm Execution</h3>
            <div class="playback-controls">
                <button class="btn btn-success btn-sm" onclick="playExecution()" id="playBtn">
                    ▶️ Play
                </button>
                <button class="btn btn-warning btn-sm" onclick="pauseExecution()" id="pauseBtn" disabled>
                    ⏸️ Pause
                </button>
                <button class="btn btn-secondary btn-sm" onclick="stepBackward()">
                    ⏮️ Previous
                </button>
                <button class="btn btn-secondary btn-sm" onclick="stepForward()">
                    ⏭️ Next
                </button>
                <button class="btn btn-danger btn-sm" onclick="resetExecution()">
                    🔄 Reset
                </button>
            </div>
            <div class="execution-progress">
                <label>Speed:</label>
                <input type="range" min="200" max="3000" value="1000" step="100" 
                       oninput="bankerState.speed = 3200 - parseInt(this.value); document.getElementById('speedLabel').textContent = (3200 - parseInt(this.value)) + 'ms'">
                <span id="speedLabel">1000ms</span>
            </div>
            <div class="step-counter">
                Step <span id="currentStepNum">0</span> of <span id="totalSteps">${bankerState.executionSteps.length}</span>
            </div>
        </div>
        <div id="executionLog" class="execution-log"></div>
        <div id="stepDetails" class="step-details"></div>
    `;
}

function playExecution() {
    bankerState.isPaused = false;
    document.getElementById('playBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    executeNextStep();
}

function pauseExecution() {
    bankerState.isPaused = true;
    document.getElementById('playBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;

    if (bankerState.animationTimeout) {
        clearTimeout(bankerState.animationTimeout);
    }
}

function executeNextStep() {
    if (bankerState.isPaused || bankerState.currentStep >= bankerState.executionSteps.length) {
        bankerState.isPaused = true;
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        return;
    }

    displayStep(bankerState.currentStep);
    bankerState.currentStep++;

    if (bankerState.currentStep < bankerState.executionSteps.length) {
        bankerState.animationTimeout = setTimeout(executeNextStep, bankerState.speed);
    } else {
        pauseExecution();
    }
}

function stepForward() {
    if (bankerState.currentStep < bankerState.executionSteps.length) {
        pauseExecution();
        displayStep(bankerState.currentStep);
        bankerState.currentStep++;
    }
}

function stepBackward() {
    if (bankerState.currentStep > 0) {
        pauseExecution();
        bankerState.currentStep--;
        displayStep(bankerState.currentStep);
    }
}

function resetExecution() {
    pauseExecution();
    bankerState.currentStep = 0;
    clearMatrixHighlights();
    document.getElementById('executionLog').innerHTML = '';
    document.getElementById('stepDetails').innerHTML = '';
    document.getElementById('currentStepNum').textContent = '0';
}

function displayStep(stepIndex) {
    const step = bankerState.executionSteps[stepIndex];
    const logDiv = document.getElementById('executionLog');
    const detailsDiv = document.getElementById('stepDetails');

    document.getElementById('currentStepNum').textContent = stepIndex + 1;
    document.getElementById('totalSteps').textContent = bankerState.executionSteps.length;

    // Clear previous highlights
    clearMatrixHighlights();

    // Add log entry
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${step.type}`;
    logEntry.innerHTML = `
        <div class="log-header">
            <span class="log-step">Step ${stepIndex + 1}</span>
            <span class="log-message">${step.message}</span>
        </div>
        <div class="log-details">${step.details || ''}</div>
    `;
    logDiv.appendChild(logEntry);
    logEntry.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Show detailed step information
    let detailsHTML = `<div class="step-detail-card ${step.type}">`;
    detailsHTML += `<h4>${step.message}</h4>`;

    if (step.type === 'execute') {
        detailsHTML += `<div class="step-info">`;
        detailsHTML += `<p><strong>Process P${step.process} Analysis:</strong></p>`;
        detailsHTML += `<div class="comparison-grid">`;
        step.comparison.forEach(comp => {
            const isOk = comp.includes('≤');
            detailsHTML += `<div class="comparison-item ${isOk ? 'ok' : 'fail'}">${comp}</div>`;
        });
        detailsHTML += `</div>`;
        detailsHTML += `<p class="success-msg">✅ All resource needs can be satisfied!</p>`;
        detailsHTML += `<p><strong>Resources Released:</strong> [${step.allocation.join(', ')}]</p>`;
        detailsHTML += `<p><strong>Work Before:</strong> [${step.oldWork.join(', ')}] → <strong>After:</strong> [${step.work.join(', ')}]</p>`;
        detailsHTML += `</div>`;

        // Highlight the process row
        highlightProcessRow(step.process, 'success');
    } else if (step.type === 'skip') {
        detailsHTML += `<div class="step-info">`;
        detailsHTML += `<p><strong>Process P${step.process} Analysis:</strong></p>`;
        detailsHTML += `<div class="comparison-grid">`;
        step.comparison.forEach(comp => {
            const isOk = comp.includes('≤');
            detailsHTML += `<div class="comparison-item ${isOk ? 'ok' : 'fail'}">${comp}</div>`;
        });
        detailsHTML += `</div>`;
        detailsHTML += `<p class="fail-msg">❌ Insufficient resources available</p>`;
        detailsHTML += `</div>`;

        // Highlight the process row
        highlightProcessRow(step.process, 'blocked');
    } else if (step.type === 'success') {
        detailsHTML += `<div class="step-info success-final">`;
        detailsHTML += `<p class="safe-sequence">Safe Sequence: <strong>${step.safeSequence.map(i => 'P' + i).join(' → ')}</strong></p>`;
        detailsHTML += `<p>The system can avoid deadlock by executing processes in this order.</p>`;
        detailsHTML += `</div>`;
    } else if (step.type === 'failure' || step.type === 'deadlock') {
        detailsHTML += `<div class="step-info failure-final">`;
        detailsHTML += `<p>The system cannot find a safe sequence. Deadlock prevention failed!</p>`;
        if (step.safeSequence && step.safeSequence.length > 0) {
            detailsHTML += `<p>Partial sequence: ${step.safeSequence.map(i => 'P' + i).join(' → ')}</p>`;
        }
        detailsHTML += `</div>`;
    }

    detailsHTML += `</div>`;
    detailsDiv.innerHTML = detailsHTML;
}

function highlightProcessRow(processIndex, type) {
    const numRes = state.available.length;

    // Highlight allocation cells
    for (let j = 0; j < numRes; j++) {
        const allocCell = document.getElementById(`alloc-${processIndex}-${j}`);
        const maxCell = document.getElementById(`max-${processIndex}-${j}`);
        const needCell = document.getElementById(`need-${processIndex}-${j}`);

        if (allocCell) allocCell.classList.add(`matrix-cell-${type}`);
        if (maxCell) maxCell.classList.add(`matrix-cell-${type}`);
        if (needCell) needCell.classList.add(`matrix-cell-${type}`);
    }
}

function clearMatrixHighlights() {
    document.querySelectorAll('.matrix-cell').forEach(cell => {
        cell.classList.remove('matrix-cell-success', 'matrix-cell-blocked', 'matrix-cell-active');
    });
    document.querySelectorAll('.matrix-cell-readonly').forEach(cell => {
        cell.classList.remove('matrix-cell-success', 'matrix-cell-blocked', 'matrix-cell-active');
    });
}

function clearBankerResults() {
    const resultDiv = document.getElementById('bankerResult');
    resultDiv.innerHTML = '';
    bankerState.currentStep = 0;
    bankerState.executionSteps = [];
    clearMatrixHighlights();
}

function showError(message) {
    const resultDiv = document.getElementById('bankerResult');
    resultDiv.innerHTML = `
        <div class="alert alert-danger">
            <h3>❌ Error</h3>
            <p>${message}</p>
        </div>
    `;
}

function loadExample() {
    state.allocation = [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]];
    state.maximum = [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]];
    state.available = [3, 3, 2];

    document.getElementById('numProcesses').value = 5;
    document.getElementById('numResources').value = 3;
    renderBankerMatrices(5, 3);

    // Update input values
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const allocInput = document.getElementById(`alloc-${i}-${j}`);
                const maxInput = document.getElementById(`max-${i}-${j}`);
                if (allocInput) allocInput.value = state.allocation[i][j];
                if (maxInput) maxInput.value = state.maximum[i][j];
            }
        }
        for (let j = 0; j < 3; j++) {
            const availInput = document.getElementById(`avail-${j}`);
            if (availInput) availInput.value = state.available[j];
        }
        updateNeedMatrix();
    }, 100);
}
