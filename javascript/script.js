// Get elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const outlineCanvas = document.getElementById('outlineCanvas');
const outlineCtx = outlineCanvas.getContext('2d');

// Settings
const cellSize = 40;
const lineWidth = 1;
const mouseRadius = 45;
const cursorRadius = 10;
const gravity = 0.5;
const friction = 0.98;
const revealThreshold = 0.5;

// State variables
let cells = [];
let lines = [];
let debris = [];
let mouseX = 0, mouseY = 0;
let lastFrameTime = 0;
let totalCells = 0;
let hiddenCells = 0;
let silhouetteAnalyzed = false;

// Movement analysis variables
let movementHistory = [];
let lastMousePos = { x: 0, y: 0, time: 0 };
let speedValues = [];
let rangeValues = [];

// Movement metrics (0-100)
let speedMetric = 0;
let patternMetric = 0;
let rangeMetric = 0;

// Variable to store determined animal
let determinedAnimal = null;

/**
 * get elements by selected language
 */
function getElements() {
    const lang = window.i18n.getCurrentLanguage();

    // Common elements
    const animalDescription = document.getElementById('animal-description');

    // Language-dependent elements
    const prefix = lang === 'ru' ? 'ru-' : '';
    const animalInstinct = document.getElementById(prefix + 'animal-instinct');
    const originalAnimalWord = document.getElementById(prefix + 'original-animal-word');
    const animalWord = document.getElementById(prefix + 'animal-word');
    const animalInstinctPlaceholder = document.getElementById(prefix + 'animal-instinct-placeholder');

    return {
        animalDescription,
        animalInstinct,
        originalAnimalWord,
        animalWord,
        animalInstinctPlaceholder
    };
}

/**
 * @param {string} gender - masculine, feminine, neuter
 */
function setManifestationEnding(gender) {
    if (window.i18n.getCurrentLanguage() !== 'ru') return;

    const manifestedWord = document.getElementById('manifested-word');

    switch(gender) {
        case 'feminine':
            manifestedWord.textContent = 'проявлена';
            break;
        case 'neuter':
            manifestedWord.textContent = 'проявлено';
            break;
        case 'masculine':
        default:
            manifestedWord.textContent = 'проявлен';
            break;
    }
}


function positionLangSwitcher() {
}

// Canvas initialization
function initCanvas() {
    const canvasContainer = document.getElementById('canvasContainer');
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvasContainer.offsetHeight;
    outlineCanvas.width = canvasContainer.offsetWidth;
    outlineCanvas.height = canvasContainer.offsetHeight;
}

// Creating a grid with cells and lines filling the entire screen
function createGrid() {
    cells = [];
    lines = [];

    // Calculate number of full cells that fit on screen
    const numCellsX = Math.ceil(canvas.width / cellSize);
    const numCellsY = Math.ceil(canvas.height / cellSize);

    // Create cells with fill (no indents)
    for (let row = 0; row < numCellsY; row++) {
        for (let col = 0; col < numCellsX; col++) {
            const x = col * cellSize;
            const y = row * cellSize;

            cells.push({
                x: x,
                y: y,
                width: cellSize,
                height: cellSize,
                visible: true
            });
        }
    }

    totalCells = cells.length;
    hiddenCells = 0;

    // Create horizontal lines
    for (let row = 0; row <= numCellsY; row++) {
        const y = row * cellSize;

        for (let col = 0; col < numCellsX; col++) {
            const x = col * cellSize;

            lines.push({
                x1: x,
                y1: y,
                x2: x + cellSize,
                y2: y,
                centerX: x + cellSize / 2,
                centerY: y,
                length: cellSize,
                angle: 0, // horizontal line
                type: 'horizontal'
            });
        }
    }

    // Create vertical lines
    for (let col = 0; col <= numCellsX; col++) {
        const x = col * cellSize;

        for (let row = 0; row < numCellsY; row++) {
            const y = row * cellSize;

            lines.push({
                x1: x,
                y1: y,
                x2: x,
                y2: y + cellSize,
                centerX: x,
                centerY: y + cellSize / 2,
                length: cellSize,
                angle: Math.PI / 2, // vertical line
                type: 'vertical'
            });
        }
    }
}

// Drawing everything on canvas
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells with fill
    ctx.fillStyle = 'white';
    for (const cell of cells) {
        if (cell.visible) {
            ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        }
    }

    // Set line style
    ctx.strokeStyle = 'black';
    ctx.lineWidth = lineWidth;

    // Draw static grid lines
    for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
    }

    // Draw falling debris
    for (const line of debris) {
        ctx.save();
        ctx.translate(line.x, line.y);
        ctx.rotate(line.rotation);

        ctx.beginPath();
        ctx.moveTo(-line.length / 2, 0);
        ctx.lineTo(line.length / 2, 0);
        ctx.stroke();

        ctx.restore();
    }

    // Draw black circle instead of mouse cursor
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, cursorRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Update counters only if silhouette not yet analyzed
    if (!silhouetteAnalyzed) {
        updateStats();
    }
}

// Update statistics
function updateStats() {
    document.getElementById('movement-speed').textContent = Math.round(speedMetric);

    // Convert numeric metric to word description
    let patternText;
    const patternValue = Math.round(patternMetric);
    const lang = window.i18n.getCurrentLanguage();

    // If movement history insufficient to determine style
    if (movementHistory.length < 10) {
        patternText = window.i18n.t("analyzing");
    } else {
        if (patternValue <= 20) patternText = window.i18n.t("chaotic");
        else if (patternValue <= 40) patternText = window.i18n.t("explorative");
        else if (patternValue <= 60) patternText = window.i18n.t("balanced");
        else if (patternValue <= 80) patternText = window.i18n.t("structured");
        else patternText = window.i18n.t("methodical");
    }

    document.getElementById('movement-pattern').textContent = patternText;
    document.getElementById('movement-range').textContent = Math.round(rangeMetric);
}

// Mouse movement handling
function handleMouseMove(e) {
    const canvasContainer = document.getElementById('canvasContainer');
    const rect = canvasContainer.getBoundingClientRect();

    // Convert mouse coordinates relative to canvas container
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Update current position for collision processing
    mouseX = currentX;
    mouseY = currentY;

    // Check mouse collisions with lines and cells
    detectMouseCollisions();

    // If silhouette analysis already done, don't update movement metrics
    if (silhouetteAnalyzed) return;

    // Calculate movement metrics
    const currentTime = Date.now();

    if (lastMousePos.time > 0) {
        const timeDiff = currentTime - lastMousePos.time;

        if (timeDiff > 16) { // ~60fps
            const dx = currentX - lastMousePos.x;
            const dy = currentY - lastMousePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate speed (pixels per second)
            const speed = distance / (timeDiff / 1000);

            // Add point to history
            movementHistory.push({
                x: currentX,
                y: currentY,
                time: currentTime,
                speed: speed
            });

            // Limit history
            if (movementHistory.length > 50) {
                movementHistory.shift();
            }

            // Update metrics
            updateMovementMetrics(currentX, currentY, speed);

            // Update last position
            lastMousePos = { x: currentX, y: currentY, time: currentTime };
        }
    } else {
        // First movement
        lastMousePos = { x: currentX, y: currentY, time: currentTime };
    }
}

// Update movement metrics
function updateMovementMetrics(x, y, speed) {
    // 1. Speed processing
    speedValues.push(speed);
    if (speedValues.length > 20) {
        speedValues.shift();
    }

    // Calculate average speed from recent values
    const avgSpeed = speedValues.reduce((sum, val) => sum + val, 0) / speedValues.length;

    // Normalize speed to 0-100 scale
    // Approximate range: 0-1000 pixels per second
    speedMetric = Math.min(100, Math.max(0, avgSpeed / 10));

    // 2. Movement pattern processing
    if (movementHistory.length >= 10) {
        // Calculate predictability/linearity of movement
        let totalAngleChange = 0;
        let directionChanges = 0;

        for (let i = 2; i < movementHistory.length; i++) {
            const p1 = movementHistory[i-2];
            const p2 = movementHistory[i-1];
            const p3 = movementHistory[i];

            // Calculate angles between sequential segments
            const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);

            // Find angle change
            let angleChange = Math.abs(angle2 - angle1);
            // Normalize to [0, π] range
            if (angleChange > Math.PI) {
                angleChange = 2 * Math.PI - angleChange;
            }

            totalAngleChange += angleChange;

            // Count significant direction changes
            if (angleChange > 0.5) { // approximately 30 degrees
                directionChanges++;
            }
        }

        // Average angle variability
        const avgAngleChange = totalAngleChange / (movementHistory.length - 2);

        // Invert: lower angle change = more methodical movement
        // Scale: 0 (chaotic) to 100 (methodical)
        patternMetric = 100 - Math.min(100, (avgAngleChange / Math.PI) * 100 + directionChanges * 5);
    }

    // 3. Movement range processing
    if (movementHistory.length >= 5) {
        // Take last N points and find maximum distance between any two
        const recentPoints = movementHistory.slice(-15);
        let maxRange = 0;

        for (let i = 0; i < recentPoints.length; i++) {
            for (let j = i + 1; j < recentPoints.length; j++) {
                const p1 = recentPoints[i];
                const p2 = recentPoints[j];
                const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                maxRange = Math.max(maxRange, distance);
            }
        }

        // Normalize range to 0-100 scale
        // Assumed maximum range: 500 pixels
        rangeMetric = Math.min(100, Math.max(0, maxRange / 5));

        // Add to history for smoothing
        rangeValues.push(rangeMetric);
        if (rangeValues.length > 10) {
            rangeValues.shift();
        }

        // Smooth
        rangeMetric = rangeValues.reduce((sum, val) => sum + val, 0) / rangeValues.length;
    }

    // Try to determine animal if we have enough data
    if (movementHistory.length > 20 && !determinedAnimal) {
        determineAnimal();
    }
}

// Determine animal based on metrics
function determineAnimal() {
    // User metrics
    const userMetrics = {
        speed: speedMetric,
        pattern: patternMetric,
        range: rangeMetric
    };

    // Calculate match for each animal
    let bestMatch = null;
    let bestScore = -Infinity;

    for (const animal of animalDatabase) {
        // Calculate match score for current animal
        let score = 0;

        // Check speed match
        if (userMetrics.speed >= animal.metrics.speed.min &&
            userMetrics.speed <= animal.metrics.speed.max) {
            score += 1;
        }

        // Check pattern match
        if (userMetrics.pattern >= animal.metrics.pattern.min &&
            userMetrics.pattern <= animal.metrics.pattern.max) {
            score += 1;
        }

        // Check range match
        if (userMetrics.range >= animal.metrics.range.min &&
            userMetrics.range <= animal.metrics.range.max) {
            score += 1;
        }

        // If current animal has better score, remember it
        if (score > bestScore) {
            bestScore = score;
            bestMatch = animal;
        }
    }

    // Save result
    if (bestMatch) {
        determinedAnimal = bestMatch;
    }
}

// Create debris
function createDebris(centerX, centerY, length, angle) {
    // Add random initial velocity for more natural movement
    const initialVelocityX = (Math.random() - 0.5) * 2; // Random left-right movement

    return {
        x: centerX,
        y: centerY,
        length: length,
        rotation: angle,
        velocityX: initialVelocityX, // Added horizontal velocity
        velocityY: Math.random() * 2 - 0.5,  // Some debris may start moving upward
        rotationSpeed: (Math.random() - 0.5) * 0.2  // Increased rotation speed
    };
}

// Detect mouse collisions with lines and cells
function detectMouseCollisions() {
    // If analysis already done, stop collision processing
    if (silhouetteAnalyzed) return;

    // First check collisions with lines
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];

        // Calculate distance from mouse to line center
        const dx = mouseX - line.centerX;
        const dy = mouseY - line.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If mouse is close enough to line, remove it and create debris
        if (distance < mouseRadius) {
            const removedLine = lines.splice(i, 1)[0];

            // Create debris
            const debrisObject = createDebris(
                removedLine.centerX,
                removedLine.centerY,
                removedLine.length,
                removedLine.angle
            );

            debris.push(debrisObject);

            // Also hide nearby cell
            hideNearbyCell(removedLine.centerX, removedLine.centerY);
        }
    }
}

// Hide cell near specified coordinates
function hideNearbyCell(x, y) {
    // Find cell containing specified point
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (x >= cell.x && x < cell.x + cell.width &&
            y >= cell.y && y < cell.y + cell.height && cell.visible) {
            cell.visible = false;
            hiddenCells++;

            // Check if it's time to analyze silhouette
            checkRevealSilhouette();
            break;
        }
    }
}

// Check if it's time to analyze silhouette
function checkRevealSilhouette() {
    const clearPercentage = hiddenCells / totalCells;

    if (clearPercentage > revealThreshold && !silhouetteAnalyzed) {
        silhouetteAnalyzed = true;

        // Get current language
        const lang = window.i18n.getCurrentLanguage();

        // Get the UI elements based on current language
        const elements = getElements();

        // Fix final metric values before displaying result
        document.getElementById('movement-speed').textContent = Math.round(speedMetric);

        let patternText;
        const patternValue = Math.round(patternMetric);

        if (patternValue <= 20) patternText = window.i18n.t("chaotic");
        else if (patternValue <= 40) patternText = window.i18n.t("explorative");
        else if (patternValue <= 60) patternText = window.i18n.t("balanced");
        else if (patternValue <= 80) patternText = window.i18n.t("structured");
        else patternText = window.i18n.t("methodical");

        document.getElementById('movement-pattern').textContent = patternText;
        document.getElementById('movement-range').textContent = Math.round(rangeMetric);

        // Draw empty area contour
        drawEmptyAreaContour();

        // If animal determined, show result
        if (determinedAnimal) {
            // Hide original words and placeholders
            elements.originalAnimalWord.style.display = 'none';
            elements.animalInstinctPlaceholder.style.display = 'none';

            // Set animal name, instinct, and description based on language
            const animalInfo = determinedAnimal[lang];

            if (lang === 'en') {
                elements.animalWord.textContent = animalInfo.name + "'s";
            } else {
                elements.animalWord.textContent = animalInfo.nameGenitive;
                // Set correct ending for "проявлен" based on instinct gender in Russian
                setManifestationEnding(animalInfo.gender);
            }

            elements.animalInstinct.textContent = animalInfo.instinct;
            elements.animalDescription.textContent = determinedAnimal.description[lang];

            // Show all elements simultaneously
            elements.animalWord.style.opacity = 1;
            elements.animalInstinct.style.opacity = 1;
            elements.animalDescription.style.opacity = 1;
        }
    }
}

// Draw empty area contour
function drawEmptyAreaContour() {
    // Clear outline canvas
    outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);

    // Create mask from hidden cells for analysis
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');

    // Fill everything white (background)
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Fill invisible (hidden) cells black
    maskCtx.fillStyle = 'black';
    for (const cell of cells) {
        if (!cell.visible) {
            maskCtx.fillRect(cell.x, cell.y, cell.width, cell.height);
        }
    }

    // Apply blur for smoothing
    maskCtx.filter = 'blur(15px)';
    maskCtx.drawImage(maskCanvas, 0, 0);
    maskCtx.filter = 'none';

    // Get image data to determine contour
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;

    // Find points on mask boundary (with brightness threshold)
    const threshold = 128;
    const stepSize = 4;
    const boundaryPoints = [];

    for (let y = 0; y < maskCanvas.height; y += stepSize) {
        for (let x = 0; x < maskCanvas.width; x += stepSize) {
            const idx = (y * maskCanvas.width + x) * 4;
            // If value is close to threshold, consider point as boundary
            const pixelValue = data[idx]; // take only R-channel

            if (pixelValue > threshold - 30 && pixelValue < threshold + 30) {
                // Add random deviations for hand-drawn effect
                const jitterX = (Math.random() - 0.5) * 5;
                const jitterY = (Math.random() - 0.5) * 5;

                boundaryPoints.push({
                    x: x + jitterX,
                    y: y + jitterY
                });
            }
        }
    }

    // Draw contour in "hand-drawn" style
    outlineCtx.strokeStyle = 'black';
    outlineCtx.lineWidth = 2;
    outlineCtx.lineJoin = 'round';
    outlineCtx.lineCap = 'round';

    // If we have contour points
    if (boundaryPoints.length > 0) {
        // Simple sorting of points by movement direction along contour
        const sortedPoints = simplifyAndSortBoundaryPoints(boundaryPoints);

        // Draw contour through ordered points
        outlineCtx.beginPath();
        outlineCtx.moveTo(sortedPoints[0].x, sortedPoints[0].y);

        for (let i = 1; i < sortedPoints.length; i++) {
            const point = sortedPoints[i];
            const prevPoint = sortedPoints[i-1];

            // Add small random deviations for hand-drawn effect
            const jitter = (Math.random() - 0.5) * 1.5;

            // For smoother lines, use quadratic curves
            // at certain intervals
            if (i % 3 === 0) {
                // Control point with deviation
                const cpX = (prevPoint.x + point.x) / 2 + (Math.random() - 0.5) * 8;
                const cpY = (prevPoint.y + point.y) / 2 + (Math.random() - 0.5) * 8;

                outlineCtx.quadraticCurveTo(cpX, cpY, point.x + jitter, point.y + jitter);
            } else {
                outlineCtx.lineTo(point.x + jitter, point.y + jitter);
            }

            // Sometimes break line for hand-drawn effect
            if (i % 40 === 0) {
                outlineCtx.stroke();
                outlineCtx.beginPath();

                // Small gap in line
                const jumpTo = Math.min(i + 2, sortedPoints.length - 1);
                outlineCtx.moveTo(sortedPoints[jumpTo].x, sortedPoints[jumpTo].y);
                i = jumpTo;
            }
        }

        outlineCtx.stroke();
    }
}

// Simplify and sort contour points
function simplifyAndSortBoundaryPoints(points) {
    // Apply simplified algorithm to create continuous contour

    // If too many points, thin them out
    if (points.length > 200) {
        // Select every N-th point
        const step = Math.floor(points.length / 200);
        points = points.filter((_, index) => index % step === 0);
    }

    // Start with random point
    const sortedPoints = [points[0]];
    const usedIndices = new Set([0]);

    // Simple "nearest neighbor" algorithm
    while (usedIndices.size < points.length && sortedPoints.length < 500) {
        const lastPoint = sortedPoints[sortedPoints.length - 1];
        let nearestIndex = -1;
        let minDistance = Infinity;

        // Find nearest unused point
        for (let i = 0; i < points.length; i++) {
            if (usedIndices.has(i)) continue;

            const dx = points[i].x - lastPoint.x;
            const dy = points[i].y - lastPoint.y;
            const distance = dx * dx + dy * dy;

            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }

        // If found nearest point, add it
        if (nearestIndex !== -1) {
            sortedPoints.push(points[nearestIndex]);
            usedIndices.add(nearestIndex);
        } else {
            break; // No suitable point found
        }
    }

    return sortedPoints;
}

// Update debris position and state
function updateDebris() {
    for (let i = debris.length - 1; i >= 0; i--) {
        const line = debris[i];

        // Update position
        line.velocityY += gravity;
        line.velocityY *= friction;
        line.y += line.velocityY;

        // Update horizontal position
        line.x += line.velocityX;
        line.velocityX *= friction; // Horizontal velocity damping

        // Update rotation
        line.rotation += line.rotationSpeed;

        // If debris reached bottom boundary, remove it
        if (line.y > canvas.height) {
            debris.splice(i, 1);
        }
    }
}

// Main animation loop
function animate(currentTime) {
    // Limit update to 60 FPS for better performance
    if (currentTime - lastFrameTime > 16) {  // approximately 60 FPS
        updateDebris();
        render();
        lastFrameTime = currentTime;
    }

    requestAnimationFrame(animate);
}

// Event handlers
function addEventListeners() {
    // Window resize handling
    window.addEventListener('resize', () => {
        // Force messageArea width on window resize
        const messageArea = document.getElementById('messageArea');
        messageArea.style.width = '388px';
        messageArea.style.minWidth = '388px';
        messageArea.style.maxWidth = '388px';

        // Recalculate canvas container width
        const canvasContainer = document.getElementById('canvasContainer');
        canvasContainer.style.width = `calc(100% - ${messageArea.offsetWidth}px)`;

        initCanvas();
        createGrid();
        debris = [];  // clear debris on resize
        silhouetteAnalyzed = false;
        outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);

        // Reset movement metrics
        resetMovementMetrics();

        // Ensure language buttons remain in the correct position
        positionLangSwitcher();
    });

    // Mouse movement handling
    canvas.addEventListener('mousemove', handleMouseMove);

    // Touch input handling
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const canvasContainer = document.getElementById('canvasContainer');
        const rect = canvasContainer.getBoundingClientRect();

        // Emulate mouse movement event
        handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    });

    // Double click to reset
    canvas.addEventListener('dblclick', () => {
        resetGame();
    });

    // Listen for language change event
    document.addEventListener('languageChanged', (e) => {
        // Update UI elements that require explicit updating
        updateUIOnLanguageChange();

        // If there's a determined animal, update its display
        if (determinedAnimal && silhouetteAnalyzed) {
            updateAnimalDisplay();
        }
    });
}

/**
 * Update UI when language changes
 */
function updateUIOnLanguageChange() {
    // Update pattern text with current language
    updateStats();

    // Get current elements based on language
    getElements();
}

/**
 * Update animal display when language changes
 */
function updateAnimalDisplay() {
    if (!determinedAnimal) return;

    const lang = window.i18n.getCurrentLanguage();
    const elements = getElements();

    // Update animal name, instinct, and description
    if (lang === 'en') {
        elements.animalWord.textContent = determinedAnimal[lang].name + "'s";
    } else {
        elements.animalWord.textContent = determinedAnimal[lang].nameGenitive;
        // Update manifestation ending for Russian
        setManifestationEnding(determinedAnimal[lang].gender);
    }

    elements.animalInstinct.textContent = determinedAnimal[lang].instinct;
    elements.animalDescription.textContent = determinedAnimal.description[lang];
}

// Reset movement metrics
function resetMovementMetrics() {
    movementHistory = [];
    lastMousePos = { x: 0, y: 0, time: 0 };
    speedValues = [];
    rangeValues = [];
    speedMetric = 0;
    patternMetric = 0;
    rangeMetric = 0;
    determinedAnimal = null;

    // Get current elements based on language
    const elements = getElements();

    // Reset interface elements
    elements.originalAnimalWord.style.display = 'inline';
    elements.animalInstinctPlaceholder.style.display = 'inline';
    elements.animalWord.textContent = "";
    elements.animalWord.style.opacity = 0;
    elements.animalInstinct.textContent = "";
    elements.animalInstinct.style.opacity = 0;
    elements.animalDescription.textContent = "";
    elements.animalDescription.style.opacity = 0;

    // Reset manifested word to default for Russian
    if (window.i18n.getCurrentLanguage() === 'ru') {
        document.getElementById('manifested-word').textContent = window.i18n.t('manifested');
    }
}

// Reset game
function resetGame() {
    debris = [];
    outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);
    silhouetteAnalyzed = false;
    createGrid();

    // Reset movement metrics
    resetMovementMetrics();
}


window.resetGame = resetGame;

// Initialization
function init() {
    // Wait for i18n to initialize first
    if (!window.i18n) {
        setTimeout(init, 100);
        return;
    }

    // Force messageArea width on initialization
    const messageArea = document.getElementById('messageArea');
    messageArea.style.width = '388px';
    messageArea.style.minWidth = '388px';
    messageArea.style.maxWidth = '388px';

    // Set canvasContainer width based on available space
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.style.width = `calc(100% - ${messageArea.offsetWidth}px)`;

    // Get current elements based on language
    const elements = getElements();

    initCanvas();
    createGrid();
    addEventListeners();


    window.addEventListener('resize', positionLangSwitcher);
    positionLangSwitcher();

    // Initial style setup for animation
    elements.animalWord.style.opacity = 0;
    elements.animalInstinct.style.opacity = 0;
    elements.animalDescription.style.opacity = 0;

    // Ensure original texts are initially displayed
    elements.originalAnimalWord.style.display = 'inline';
    elements.animalInstinctPlaceholder.style.display = 'inline';

    requestAnimationFrame(animate);
}

// Launch after page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialization will happen after i18n is ready
    setTimeout(init, 100);
});