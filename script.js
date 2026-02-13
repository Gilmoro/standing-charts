// Configuration
let config = {
    risers: 4,
    studentsPerRiser: 12,
    curvature: 50,
    centerStraight: false,
    straightSectionSize: 30,
    names: []
};

// Canvas setup
const canvas = document.getElementById('choirCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = Math.min(1200, window.innerWidth - 100);
    canvas.height = 600;
    drawChoir();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initializeControls();
    initializeNames();
    drawChoir();
});

window.addEventListener('resize', resizeCanvas);

// Control initialization
function initializeControls() {
    document.getElementById('risers').addEventListener('input', (e) => {
        config.risers = parseInt(e.target.value);
        initializeNames();
        drawChoir();
    });

    document.getElementById('studentsPerRiser').addEventListener('input', (e) => {
        config.studentsPerRiser = parseInt(e.target.value);
        initializeNames();
        drawChoir();
    });

    document.getElementById('curvature').addEventListener('input', (e) => {
        config.curvature = parseInt(e.target.value);
        document.getElementById('curvatureValue').textContent = e.target.value;
        drawChoir();
    });

    document.getElementById('centerStraight').addEventListener('change', (e) => {
        config.centerStraight = e.target.checked;
        document.getElementById('straightSectionControl').style.display = 
            e.target.checked ? 'flex' : 'none';
        drawChoir();
    });

    document.getElementById('straightSectionSize').addEventListener('input', (e) => {
        config.straightSectionSize = parseInt(e.target.value);
        document.getElementById('straightSectionSizeValue').textContent = e.target.value + '%';
        drawChoir();
    });

    document.getElementById('generateNames').addEventListener('click', generateSampleNames);
    document.getElementById('clearNames').addEventListener('click', clearNames);

    canvas.addEventListener('click', handleCanvasClick);
}

// Initialize names array
function initializeNames() {
    const totalStudents = config.risers * config.studentsPerRiser;
    const currentLength = config.names.length;

    if (currentLength < totalStudents) {
        // Add empty names
        for (let i = currentLength; i < totalStudents; i++) {
            config.names.push('');
        }
    } else if (currentLength > totalStudents) {
        // Trim extra names
        config.names = config.names.slice(0, totalStudents);
    }

    updateNameList();
}

// Generate sample names
function generateSampleNames() {
    const firstNames = ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
                       'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas',
                       'Mason', 'Ethan', 'Alexander', 'Henry', 'Jacob', 'Michael', 'Daniel', 'Logan'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
                       'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

    config.names = config.names.map(() => {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${first} ${last}`;
    });

    updateNameList();
    drawChoir();
}

// Clear all names
function clearNames() {
    config.names = config.names.map(() => '');
    updateNameList();
    drawChoir();
}

// Update name list UI
function updateNameList() {
    const nameList = document.getElementById('nameList');
    nameList.innerHTML = '';

    config.names.forEach((name, index) => {
        const riser = Math.floor(index / config.studentsPerRiser) + 1;
        const position = (index % config.studentsPerRiser) + 1;

        const nameItem = document.createElement('div');
        nameItem.className = 'name-item';
        nameItem.dataset.index = index;

        const label = document.createElement('label');
        label.textContent = `R${riser} P${position}:`;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = name;
        input.dataset.index = index;
        input.addEventListener('input', (e) => {
            config.names[index] = e.target.value;
            drawChoir();
        });

        nameItem.appendChild(label);
        nameItem.appendChild(input);
        nameList.appendChild(nameItem);
    });
}

// Calculate position for a student
function calculatePosition(riserIndex, positionIndex) {
    const padding = 50;
    const riserSpacing = (canvas.height - padding * 2) / (config.risers + 1);
    const y = canvas.height - padding - (riserIndex * riserSpacing);

    const studentsInRiser = config.studentsPerRiser;
    const centerX = canvas.width / 2;
    
    // Calculate the width for this riser
    const maxWidth = canvas.width - padding * 2;
    const riserDepth = riserIndex / (config.risers - 1 || 1);
    const width = maxWidth * (0.6 + 0.4 * riserDepth);

    if (config.centerStraight && config.straightSectionSize > 0) {
        // Calculate positions with center straight section
        return calculateMixedCurvePosition(positionIndex, studentsInRiser, centerX, y, width, riserIndex);
    } else {
        // Pure curved arrangement
        return calculateCurvedPosition(positionIndex, studentsInRiser, centerX, y, width, riserIndex);
    }
}

// Calculate position for pure curved arrangement
function calculateCurvedPosition(positionIndex, total, centerX, y, width, riserIndex) {
    const curvatureFactor = config.curvature / 100;
    const maxCurveHeight = 80;
    const curveHeight = maxCurveHeight * curvatureFactor;

    // Normalize position from -1 to 1
    const normalizedPos = (positionIndex / (total - 1)) * 2 - 1;

    // Calculate x position
    const x = centerX + normalizedPos * (width / 2);

    // Calculate curve offset (parabolic)
    const curveOffset = curveHeight * (1 - normalizedPos * normalizedPos);
    const finalY = y - curveOffset;

    return { x, y: finalY };
}

// Calculate position for mixed curve (straight center, curved sides)
function calculateMixedCurvePosition(positionIndex, total, centerX, y, width, riserIndex) {
    const straightPercent = config.straightSectionSize / 100;
    const straightCount = Math.floor(total * straightPercent);
    const straightStart = Math.floor((total - straightCount) / 2);
    const straightEnd = straightStart + straightCount;

    const curvatureFactor = config.curvature / 100;
    const maxCurveHeight = 80;
    const curveHeight = maxCurveHeight * curvatureFactor;

    // Normalize position from -1 to 1
    const normalizedPos = (positionIndex / (total - 1)) * 2 - 1;
    const x = centerX + normalizedPos * (width / 2);

    let finalY = y;

    if (positionIndex >= straightStart && positionIndex < straightEnd) {
        // Straight section - no curve
        finalY = y;
    } else {
        // Curved section
        // Scale the curve based on distance from center
        const distanceFromCenter = Math.abs(normalizedPos);
        const curveOffset = curveHeight * (1 - (1 - distanceFromCenter) * (1 - distanceFromCenter));
        finalY = y - curveOffset;
    }

    return { x, y: finalY };
}

// Draw the choir formation
function drawChoir() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stage/audience reference
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = '#666';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUDIENCE', canvas.width / 2, canvas.height - 10);

    // Store positions for click detection
    const positions = [];

    // Draw risers and students
    for (let riser = 0; riser < config.risers; riser++) {
        const riserPositions = [];

        // Collect all positions for this riser
        for (let pos = 0; pos < config.studentsPerRiser; pos++) {
            const index = riser * config.studentsPerRiser + pos;
            const position = calculatePosition(riser, pos);
            riserPositions.push(position);
            positions.push({ ...position, index });
        }

        // Draw riser line connecting all positions
        if (riserPositions.length > 1) {
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(riserPositions[0].x, riserPositions[0].y);
            for (let i = 1; i < riserPositions.length; i++) {
                ctx.lineTo(riserPositions[i].x, riserPositions[i].y);
            }
            ctx.stroke();
        }

        // Draw students
        riserPositions.forEach((position, idx) => {
            const index = riser * config.studentsPerRiser + idx;
            const name = config.names[index];

            // Draw student circle
            ctx.fillStyle = name ? '#667eea' : '#ccc';
            ctx.beginPath();
            ctx.arc(position.x, position.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw name or position number
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (name && name.trim()) {
                // Draw name - split into lines if needed
                const words = name.trim().split(' ');
                if (words.length > 1) {
                    ctx.font = 'bold 9px sans-serif';
                    ctx.fillText(words[0], position.x, position.y - 5);
                    ctx.fillText(words.slice(1).join(' '), position.x, position.y + 5);
                } else {
                    ctx.fillText(name, position.x, position.y);
                }
            } else {
                // Draw position number
                ctx.fillText(`${idx + 1}`, position.x, position.y);
            }

            // Draw riser label
            if (idx === 0) {
                ctx.fillStyle = '#333';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`Riser ${riser + 1}`, 10, position.y);
            }
        });
    }

    // Store positions for click detection
    canvas.positions = positions;
}

// Handle canvas click
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Find closest position
    if (canvas.positions) {
        let closest = null;
        let minDist = Infinity;

        canvas.positions.forEach(pos => {
            const dist = Math.sqrt(
                Math.pow(clickX - pos.x, 2) + 
                Math.pow(clickY - pos.y, 2)
            );
            if (dist < minDist && dist < 30) {
                minDist = dist;
                closest = pos;
            }
        });

        if (closest) {
            // Highlight the corresponding name input
            const nameItems = document.querySelectorAll('.name-item');
            nameItems.forEach(item => item.classList.remove('active'));
            
            const targetItem = document.querySelector(`.name-item[data-index="${closest.index}"]`);
            if (targetItem) {
                targetItem.classList.add('active');
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                const input = targetItem.querySelector('input');
                input.focus();
                input.select();
            }
        }
    }
}
