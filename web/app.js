/**
 * Core Algorithm from Python solution.py
 * Translated exactly to JavaScript
 */
function labirentVerisiOlustur(x, maxAdim = 3) {
    const satir = [];
    const sutun = [];
    const satirToplamlar = [];
    const sutunToplamlar = [];
    const ziyaretEdilenler = new Set();
    
    // (0, 0)
    ziyaretEdilenler.add(`0,0`);

    let mevcutSatirToplam = 0;
    let mevcutSToplam = 0;
    
    satirToplamlar.push(mevcutSatirToplam);
    sutunToplamlar.push(mevcutSToplam);

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // x-1 adım boyunca yolu örüyoruz
    for (let i = 0; i < x - 1; i++) {
        let deneme = 0;
        let pMaxAdim = maxAdim; // Local copy of max_adim, can grow
        
        while (true) {
            const sAlt = Math.max(-mevcutSatirToplam, -pMaxAdim);
            const sUst = Math.min(x - mevcutSatirToplam, pMaxAdim);
            
            const cAlt = Math.max(-mevcutSToplam, -pMaxAdim);
            const cUst = Math.min(x - mevcutSToplam, pMaxAdim);
            
            const sYeni = randomInt(sAlt, sUst);
            const cYeni = randomInt(cAlt, cUst);
            
            if (sYeni === 0 && cYeni === 0) {
                deneme++;
                continue;
            }

            const ySatirToplam = mevcutSatirToplam + sYeni;
            const ySToplam = mevcutSToplam + cYeni;
            const yKoordinat = `${ySatirToplam},${ySToplam}`;

            if (!ziyaretEdilenler.has(yKoordinat) && (ySatirToplam !== x || ySToplam !== x)) {
                satir.push(sYeni);
                sutun.push(cYeni);
                
                mevcutSatirToplam = ySatirToplam;
                mevcutSToplam = ySToplam;
                
                satirToplamlar.push(mevcutSatirToplam);
                sutunToplamlar.push(mevcutSToplam);
                
                ziyaretEdilenler.add(yKoordinat);
                break;
            }
            
            deneme++;
            if (deneme > 200) {
                pMaxAdim += 1;
                if (deneme > 500) break;
            }
        }
    }

    // Son adım: Nerede olursak olalım (x, x) noktasına bağlanıyoruz
    satir.push(x - mevcutSatirToplam);
    sutun.push(x - mevcutSToplam);
    
    satirToplamlar.push(x);
    sutunToplamlar.push(x);

    return {
        satir,
        sutun,
        satirToplamlar,
        sutunToplamlar
    };
}


// UI Interaction & Visualization Logic
document.addEventListener('DOMContentLoaded', () => {
    
    // Inputs
    const gridSizeInput = document.getElementById('grid-size');
    const gridSizeVal = document.getElementById('grid-size-val');
    const maxStepInput = document.getElementById('max-step');
    const maxStepVal = document.getElementById('max-step-val');
    
    // Button
    const generateBtn = document.getElementById('generate-btn');
    
    // Stats
    const statSteps = document.getElementById('stat-steps');
    const statDim = document.getElementById('stat-dim');
    
    // Visualization elements
    const container = document.getElementById('grid-container');
    const pathSvg = document.getElementById('maze-path');
    const nodesContainer = document.getElementById('nodes-container');
    const bgGridLines = document.getElementById('bg-grid-lines');
    const wallsGroup = document.getElementById('walls-group');

    // Update displays
    gridSizeInput.addEventListener('input', (e) => {
        gridSizeVal.textContent = e.target.value;
    });
    
    maxStepInput.addEventListener('input', (e) => {
        maxStepVal.textContent = e.target.value;
    });

    let currentAnimationTimeout = null;

    generateBtn.addEventListener('click', generateAndAnimate);

    function getPaddingAndSize() {
        const padding = 40;
        const width = container.clientWidth - padding * 2;
        const height = container.clientHeight - padding * 2;
        return { padding, width, height };
    }

    function getCellCenter(i, j, cols) {
        const { padding, width, height } = getPaddingAndSize();
        const cellSizeX = width / cols;
        const cellSizeY = height / cols;
        const pX = padding + i * cellSizeX + cellSizeX / 2;
        const pY = padding + j * cellSizeY + cellSizeY / 2;
        return { pX, pY };
    }

    function getGridLineCoords(i, j, cols) {
        const { padding, width, height } = getPaddingAndSize();
        const cellSizeX = width / cols;
        const cellSizeY = height / cols;
        const pX = padding + i * cellSizeX;
        const pY = padding + j * cellSizeY;
        return { pX, pY };
    }
    
    function drawLine(parent, x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        parent.appendChild(line);
    }

    function drawBackgroundGrid(cols) {
        bgGridLines.innerHTML = '';
        
        for (let i = 0; i <= cols; i++) {
            const top = getGridLineCoords(i, 0, cols);
            const bot = getGridLineCoords(i, cols, cols);
            drawLine(bgGridLines, top.pX, top.pY, bot.pX, bot.pY);
        }

        for (let j = 0; j <= cols; j++) {
            const left = getGridLineCoords(0, j, cols);
            const right = getGridLineCoords(cols, j, cols);
            drawLine(bgGridLines, left.pX, left.pY, right.pX, right.pY);
        }
    }

    function generateWalls(cols, explicitPath) {
        wallsGroup.innerHTML = '';
        const corridorEdges = new Set();
        const visitedCells = new Set();
        
        // Record all broken walls from solution path
        for (let idx = 0; idx < explicitPath.length - 1; idx++) {
            const p1 = explicitPath[idx];
            const p2 = explicitPath[idx+1];
            
            if (p1.i === p2.i) {
                // Vertical segment breaks horizontal walls
                const minJ = Math.min(p1.j, p2.j);
                const maxJ = Math.max(p1.j, p2.j);
                for (let j = minJ; j < maxJ; j++) {
                    corridorEdges.add(`h_${p1.i}_${j}`);
                    visitedCells.add(`${p1.i},${j}`);
                    visitedCells.add(`${p1.i},${j+1}`);
                }
            } else if (p1.j === p2.j) {
                // Horizontal segment breaks vertical walls
                const minI = Math.min(p1.i, p2.i);
                const maxI = Math.max(p1.i, p2.i);
                for (let i = minI; i < maxI; i++) {
                    corridorEdges.add(`v_${i}_${p1.j}`);
                    visitedCells.add(`${i},${p1.j}`);
                    visitedCells.add(`${i+1},${p1.j}`);
                }
            }
        }

        // DFS to generate remaining maze branches
        const stack = Array.from(visitedCells).map(s => {
            const parts = s.split(',');
            return { i: parseInt(parts[0], 10), j: parseInt(parts[1], 10) };
        });
        
        for (let i = stack.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [stack[i], stack[j]] = [stack[j], stack[i]];
        }

        while (stack.length > 0) {
            const current = stack[stack.length - 1]; 
            const neighbors = [];
            
            if (current.j > 0 && !visitedCells.has(`${current.i},${current.j - 1}`)) {
                neighbors.push({ i: current.i, j: current.j - 1, wall: `h_${current.i}_${current.j - 1}` });
            }
            if (current.j < cols - 1 && !visitedCells.has(`${current.i},${current.j + 1}`)) {
                neighbors.push({ i: current.i, j: current.j + 1, wall: `h_${current.i}_${current.j}` });
            }
            if (current.i > 0 && !visitedCells.has(`${current.i - 1},${current.j}`)) {
                neighbors.push({ i: current.i - 1, j: current.j, wall: `v_${current.i - 1}_${current.j}` });
            }
            if (current.i < cols - 1 && !visitedCells.has(`${current.i + 1},${current.j}`)) {
                neighbors.push({ i: current.i + 1, j: current.j, wall: `v_${current.i}_${current.j}` });
            }

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                corridorEdges.add(next.wall);
                visitedCells.add(`${next.i},${next.j}`);
                stack.push({ i: next.i, j: next.j });
            } else {
                stack.pop();
            }
        }

        // Draw physical walls
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < cols; j++) {
                // Vertical wall right of cell (i,j)
                if (i < cols - 1 && !corridorEdges.has(`v_${i}_${j}`)) {
                    const top = getGridLineCoords(i+1, j, cols);
                    const bot = getGridLineCoords(i+1, j+1, cols);
                    drawLine(wallsGroup, top.pX, top.pY, bot.pX, bot.pY);
                }
                
                // Horizontal wall bottom of cell (i,j)
                if (j < cols - 1 && !corridorEdges.has(`h_${i}_${j}`)) {
                    const left = getGridLineCoords(i, j+1, cols);
                    const right = getGridLineCoords(i+1, j+1, cols);
                    drawLine(wallsGroup, left.pX, left.pY, right.pX, right.pY);
                }
            }
        }
        
        // Draw Outer Maze Borders
        const topleft = getGridLineCoords(0, 0, cols);
        const topright = getGridLineCoords(cols, 0, cols);
        const botleft = getGridLineCoords(0, cols, cols);
        const botright = getGridLineCoords(cols, cols, cols);
        
        drawLine(wallsGroup, topleft.pX, topleft.pY, topright.pX, topright.pY);
        drawLine(wallsGroup, topleft.pX, topleft.pY, botleft.pX, botleft.pY);
        drawLine(wallsGroup, topright.pX, topright.pY, botright.pX, botright.pY);
        drawLine(wallsGroup, botleft.pX, botleft.pY, botright.pX, botright.pY);
    }

    function buildOrthogonalPath(data) {
        const { satirToplamlar, sutunToplamlar } = data;
        const explicitPath = [];
        for (let k = 0; k < satirToplamlar.length; k++) {
            const i = satirToplamlar[k];
            const j = sutunToplamlar[k];
            if (k > 0) {
                const prev = explicitPath[explicitPath.length - 1];
                if (i !== prev.i && j !== prev.j) {
                    explicitPath.push({ i: i, j: prev.j });
                }
            }
            explicitPath.push({ i, j });
        }
        return explicitPath;
    }

    async function generateAndAnimate() {
        const x = parseInt(gridSizeInput.value, 10);
        const limit = parseInt(maxStepInput.value, 10);

        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
        generateBtn.style.cursor = 'not-allowed';

        try {
            pathSvg.setAttribute('d', '');
            nodesContainer.innerHTML = '';
            if (currentAnimationTimeout) {
                clearTimeout(currentAnimationTimeout);
            }

            statDim.textContent = `${x} x ${x}`;

            const data = labirentVerisiOlustur(x, limit);
            const explicitPath = buildOrthogonalPath(data);
            
            statSteps.textContent = explicitPath.length - 1;

            let cols = x + 1;
            
            drawBackgroundGrid(cols);
            generateWalls(cols, explicitPath);

            // Draw Start and End Markers immediately
            const startPt = explicitPath[0];
            const endPt = explicitPath[explicitPath.length - 1];
            
            const startCoords = getCellCenter(startPt.i, startPt.j, cols);
            const startNode = document.createElement("div");
            startNode.className = "node start";
            startNode.style.left = `${startCoords.pX}px`;
            startNode.style.top = `${startCoords.pY}px`;
            startNode.style.transform = 'translate(-50%, -50%) scale(1)';
            nodesContainer.appendChild(startNode);
            
            const startLabel = document.createElement("div");
            startLabel.textContent = "Start";
            startLabel.className = "marker-label target-start";
            startLabel.style.left = `${startCoords.pX}px`;
            startLabel.style.top = `${startCoords.pY}px`;
            nodesContainer.appendChild(startLabel);
            
            const endCoords = getCellCenter(endPt.i, endPt.j, cols);
            const endNode = document.createElement("div");
            endNode.className = "node end";
            endNode.style.left = `${endCoords.pX}px`;
            endNode.style.top = `${endCoords.pY}px`;
            endNode.style.transform = 'translate(-50%, -50%) scale(1)';
            nodesContainer.appendChild(endNode);

            const endLabel = document.createElement("div");
            endLabel.textContent = "Finish";
            endLabel.className = "marker-label target-end";
            endLabel.style.left = `${endCoords.pX}px`;
            endLabel.style.top = `${endCoords.pY}px`;
            nodesContainer.appendChild(endLabel);

            await renderPathAnimated(explicitPath, cols);
        } catch (err) {
            console.error("Generation error:", err);
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        }
    }

    function renderPathAnimated(explicitPath, cols) {
        return new Promise(resolve => {
            let dString = "";
            let currentIndex = 0;

            const drawStep = () => {
                if (currentIndex >= explicitPath.length) {
                    resolve();
                    return;
                }

                const pt = explicitPath[currentIndex];
                const { pX, pY } = getCellCenter(pt.i, pt.j, cols);
                
                if (currentIndex === 0) {
                    dString += `M ${pX} ${pY} `;
                } else {
                    dString += `L ${pX} ${pY} `;
                }
                pathSvg.setAttribute("d", dString);

                // Avoid duplicating the large colored dots. Just drop generic white dots along the path.
                const node = document.createElement("div");
                node.className = "node";
                
                node.style.left = `${pX}px`;
                node.style.top = `${pY}px`;
                nodesContainer.appendChild(node);
                
                requestAnimationFrame(() => {
                    node.style.transform = 'translate(-50%, -50%) scale(1)';
                });

                currentIndex++;
                const duration = Math.max(50, 600 / explicitPath.length);
                currentAnimationTimeout = setTimeout(drawStep, duration);
            };

            drawStep();
        });
    }

    // Initial Handle on resize to redraw gracefully
    window.addEventListener('resize', () => {
        // Can be improved, but for now we won't handle active redraw on resize to keep pure simplicity
    });
    
    // First paint default load
    setTimeout(() => {
       generateBtn.click();
    }, 500);

});
