const WENGER_SIGNATURE_DEFAULTS = {
    moduleWidthInches: 72,
    stepDepthInches: 18,
    riseInches: 8,
    peoplePerModule: 4
};

const config = {
    risers: 4,
    layoutMode: 'curved',
    assignmentMode: 'name',
    modulesPerRow: 3,
    peoplePerModule: 4,
    peoplePattern: '',
    curvature: 45,
    straightSectionSize: 35,
    wingAngle: 20,
    riserPreset: 'custom',
    moduleWidthInches: 72,
    stepDepthInches: 18,
    riseInches: 8,
    names: []
};

const canvas = document.getElementById('choirCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = Math.min(1300, window.innerWidth - 90);
    canvas.height = 640;
    drawChoir();
}

document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initializeControls();
    initializeNames();
    updateLayoutSummary();
    syncModeControls();
    drawChoir();
});

window.addEventListener('resize', resizeCanvas);

function initializeControls() {
    const bindInput = (id, handler) => {
        document.getElementById(id).addEventListener('input', handler);
    };

    bindInput('risers', (e) => {
        config.risers = clampInt(e.target.value, 1, 12);
        initializeNames();
        updateLayoutSummary();
        drawChoir();
    });

    bindInput('layoutMode', (e) => {
        config.layoutMode = e.target.value;
        syncModeControls();
        drawChoir();
    });

    bindInput('assignmentMode', (e) => {
        config.assignmentMode = e.target.value;
        drawChoir();
    });

    bindInput('modulesPerRow', (e) => {
        config.modulesPerRow = clampInt(e.target.value, 1, 10);
        initializeNames();
        updateLayoutSummary();
        drawChoir();
    });

    bindInput('peoplePerModule', (e) => {
        config.peoplePerModule = clampInt(e.target.value, 1, 8);
        initializeNames();
        updateLayoutSummary();
        drawChoir();
    });

    bindInput('peoplePattern', (e) => {
        config.peoplePattern = e.target.value;
        initializeNames();
        updateLayoutSummary();
        drawChoir();
    });

    bindInput('curvature', (e) => {
        config.curvature = clampInt(e.target.value, 0, 100);
        document.getElementById('curvatureValue').textContent = String(config.curvature);
        drawChoir();
    });

    bindInput('straightSectionSize', (e) => {
        config.straightSectionSize = clampInt(e.target.value, 10, 90);
        document.getElementById('straightSectionSizeValue').textContent = `${config.straightSectionSize}%`;
        drawChoir();
    });

    bindInput('wingAngle', (e) => {
        config.wingAngle = clampInt(e.target.value, 0, 60);
        document.getElementById('wingAngleValue').textContent = `${config.wingAngle}°`;
        drawChoir();
    });

    bindInput('riserPreset', (e) => {
        config.riserPreset = e.target.value;
        applyRiserPreset(e.target.value);
        initializeNames();
        updateLayoutSummary();
        drawChoir();
    });

    document.getElementById('generateNames').addEventListener('click', generateSampleNames);
    document.getElementById('clearNames').addEventListener('click', clearNames);
    canvas.addEventListener('click', handleCanvasClick);
}

function clampInt(value, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        return min;
    }
    return Math.max(min, Math.min(max, parsed));
}

function applyRiserPreset(preset) {
    if (preset === 'wenger3' || preset === 'wenger4') {
        config.moduleWidthInches = WENGER_SIGNATURE_DEFAULTS.moduleWidthInches;
        config.stepDepthInches = WENGER_SIGNATURE_DEFAULTS.stepDepthInches;
        config.riseInches = WENGER_SIGNATURE_DEFAULTS.riseInches;
        config.peoplePerModule = WENGER_SIGNATURE_DEFAULTS.peoplePerModule;
        document.getElementById('peoplePerModule').value = String(config.peoplePerModule);
    }
}

function parsePeoplePattern() {
    if (!config.peoplePattern.trim()) {
        return [];
    }

    return config.peoplePattern
        .split(',')
        .map((entry) => Number.parseInt(entry.trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0);
}

function getPeopleCountForRiser(riserIndex) {
    const pattern = parsePeoplePattern();
    if (pattern.length > 0) {
        if (riserIndex < pattern.length) {
            return pattern[riserIndex];
        }
        return pattern[pattern.length - 1];
    }

    return Math.max(1, config.modulesPerRow * config.peoplePerModule);
}

function getRiserCounts() {
    return Array.from({ length: config.risers }, (_, riserIndex) => getPeopleCountForRiser(riserIndex));
}

function getGlobalIndex(riserIndex, positionIndex) {
    const counts = getRiserCounts();
    let totalBefore = 0;
    for (let i = 0; i < riserIndex; i++) {
        totalBefore += counts[i];
    }
    return totalBefore + positionIndex;
}

function getRiserPositionFromGlobalIndex(index) {
    const counts = getRiserCounts();
    let remaining = index;

    for (let riser = 0; riser < counts.length; riser++) {
        if (remaining < counts[riser]) {
            return { riser, position: remaining };
        }
        remaining -= counts[riser];
    }

    return { riser: counts.length - 1, position: 0 };
}

function initializeNames() {
    const totalSingers = getRiserCounts().reduce((sum, count) => sum + count, 0);

    if (config.names.length < totalSingers) {
        for (let i = config.names.length; i < totalSingers; i++) {
            config.names.push('');
        }
    } else if (config.names.length > totalSingers) {
        config.names = config.names.slice(0, totalSingers);
    }

    updateNameList();
}

function generateSampleNames() {
    const firstNames = ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
        'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];

    config.names = config.names.map(() => {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${first} ${last}`;
    });

    updateNameList();
    drawChoir();
}

function clearNames() {
    config.names = config.names.map(() => '');
    updateNameList();
    drawChoir();
}

function updateNameList() {
    const nameList = document.getElementById('nameList');
    nameList.innerHTML = '';

    config.names.forEach((name, index) => {
        const location = getRiserPositionFromGlobalIndex(index);
        const nameItem = document.createElement('div');
        nameItem.className = 'name-item';
        nameItem.dataset.index = String(index);

        const label = document.createElement('label');
        label.textContent = `R${location.riser + 1} P${location.position + 1}:`;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = name;
        input.dataset.index = String(index);
        input.addEventListener('input', (e) => {
            config.names[index] = e.target.value;
            drawChoir();
        });

        nameItem.appendChild(label);
        nameItem.appendChild(input);
        nameList.appendChild(nameItem);
    });
}

function calculatePosition(riserIndex, positionIndex, totalInRiser) {
    const padding = 60;
    const riserSpacing = (canvas.height - 140) / (config.risers + 0.8);
    const baseY = canvas.height - 70 - (riserIndex * riserSpacing);

    const centerX = canvas.width / 2;
    const maxWidth = canvas.width - (padding * 2);
    const depthScale = riserIndex / (config.risers - 1 || 1);
    const width = maxWidth * (0.58 + 0.42 * depthScale);

    if (config.layoutMode === 'straight') {
        return calculateStraightPosition(positionIndex, totalInRiser, centerX, baseY, width);
    }
    if (config.layoutMode === 'wings') {
        return calculateWingedPosition(positionIndex, totalInRiser, centerX, baseY, width);
    }
    return calculateCurvedPosition(positionIndex, totalInRiser, centerX, baseY, width);
}

function normalizedPosition(positionIndex, total) {
    if (total <= 1) {
        return 0;
    }
    return (positionIndex / (total - 1)) * 2 - 1;
}

function calculateStraightPosition(positionIndex, total, centerX, y, width) {
    const normalizedPos = normalizedPosition(positionIndex, total);
    const x = centerX + normalizedPos * (width / 2);
    return { x, y };
}

function calculateCurvedPosition(positionIndex, total, centerX, y, width) {
    const normalizedPos = normalizedPosition(positionIndex, total);
    const x = centerX + normalizedPos * (width / 2);
    const curveHeight = 85 * (config.curvature / 100);
    const curveOffset = curveHeight * (1 - (normalizedPos * normalizedPos));
    return { x, y: y - curveOffset };
}

function calculateWingedPosition(positionIndex, total, centerX, y, width) {
    const normalizedPos = normalizedPosition(positionIndex, total);
    const x = centerX + normalizedPos * (width / 2);

    const centerHalf = Math.max(0.08, config.straightSectionSize / 200);
    const absPos = Math.abs(normalizedPos);

    if (absPos <= centerHalf) {
        return { x, y };
    }

    const wingProgress = (absPos - centerHalf) / (1 - centerHalf);
    const curveLift = (config.curvature / 100) * 45 * wingProgress;
    const angleLift = Math.tan((config.wingAngle * Math.PI) / 180) * 18 * wingProgress;

    return { x, y: y - curveLift - angleLift };
}

function getDisplayText(name, position) {
    if (config.assignmentMode === 'number') {
        return String(position + 1);
    }

    if (name && name.trim()) {
        return name.trim();
    }

    return String(position + 1);
}

function drawChoir() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = '#444';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUDIENCE', canvas.width / 2, canvas.height - 10);

    const counts = getRiserCounts();
    const positions = [];

    for (let riser = 0; riser < config.risers; riser++) {
        const count = counts[riser];
        const riserPositions = [];

        for (let pos = 0; pos < count; pos++) {
            const globalIndex = getGlobalIndex(riser, pos);
            const point = calculatePosition(riser, pos, count);
            riserPositions.push(point);
            positions.push({ ...point, index: globalIndex });
        }

        if (riserPositions.length > 1) {
            ctx.strokeStyle = '#d7dde6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(riserPositions[0].x, riserPositions[0].y);
            for (let i = 1; i < riserPositions.length; i++) {
                ctx.lineTo(riserPositions[i].x, riserPositions[i].y);
            }
            ctx.stroke();
        }

        riserPositions.forEach((point, pos) => {
            const index = getGlobalIndex(riser, pos);
            const name = config.names[index] || '';
            const displayText = getDisplayText(name, pos);

            ctx.fillStyle = (config.assignmentMode === 'name' && name.trim()) ? '#667eea' : '#98a2b3';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 19, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const words = displayText.split(' ');

            if (words.length > 1 && config.assignmentMode === 'name') {
                ctx.font = 'bold 9px sans-serif';
                ctx.fillText(words[0], point.x, point.y - 4);
                ctx.fillText(words.slice(1).join(' ').slice(0, 10), point.x, point.y + 5);
            } else {
                ctx.font = 'bold 10px sans-serif';
                ctx.fillText(displayText.slice(0, 11), point.x, point.y);
            }

            if (pos === 0) {
                ctx.fillStyle = '#2a2f36';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`Row ${riser + 1} (${count})`, 12, point.y);
            }
        });
    }

    canvas.positions = positions;
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (!canvas.positions) {
        return;
    }

    let closest = null;
    let minDistance = Infinity;

    canvas.positions.forEach((point) => {
        const distance = Math.hypot(clickX - point.x, clickY - point.y);
        if (distance < minDistance && distance < 30) {
            minDistance = distance;
            closest = point;
        }
    });

    if (!closest) {
        return;
    }

    const nameItems = document.querySelectorAll('.name-item');
    nameItems.forEach((item) => item.classList.remove('active'));

    const targetItem = document.querySelector(`.name-item[data-index="${closest.index}"]`);
    if (!targetItem) {
        return;
    }

    targetItem.classList.add('active');
    targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const input = targetItem.querySelector('input');
    input.focus();
    input.select();
}

function syncModeControls() {
    const wingsMode = config.layoutMode === 'wings';
    document.getElementById('straightSectionControl').style.display = wingsMode ? 'flex' : 'none';
    document.getElementById('wingAngleControl').style.display = wingsMode ? 'flex' : 'none';
}

function updateLayoutSummary() {
    const counts = getRiserCounts();
    const total = counts.reduce((sum, count) => sum + count, 0);
    const perRow = counts.join(', ');

    document.getElementById('layoutSummary').innerHTML = `
        <strong>Total singers:</strong> ${total}
        <span>•</span>
        <strong>People per row:</strong> ${perRow}
        <span>•</span>
        <strong>Dimensions basis:</strong> ${config.moduleWidthInches}" module width, ${config.stepDepthInches}" depth, ${config.riseInches}" rise
        <span>•</span>
        <strong>Estimated full-row capacity:</strong> ${config.modulesPerRow * config.peoplePerModule}
    `;
}
