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

    function getCoords(i, j, x) {
        const { padding, width, height } = getPaddingAndSize();
        const pX = padding + (i / x) * width;
        const pY = padding + (j / x) * height;
        return { pX, pY };
    }

    function drawBackgroundGrid(x) {
        bgGridLines.innerHTML = '';
        const { padding, width, height } = getPaddingAndSize();

        // Draw vertical lines
        for (let i = 0; i <= x; i++) {
            const pX = padding + (i / x) * width;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pX);
            line.setAttribute('y1', padding);
            line.setAttribute('x2', pX);
            line.setAttribute('y2', padding + height);
            bgGridLines.appendChild(line);
        }

        // Draw horizontal lines
        for (let j = 0; j <= x; j++) {
            const pY = padding + (j / x) * height;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding);
            line.setAttribute('y1', pY);
            line.setAttribute('x2', padding + width);
            line.setAttribute('y2', pY);
            bgGridLines.appendChild(line);
        }
    }

    function getEdgeId(i1, j1, i2, j2) {
        if (i1 === i2) {
            return `v_${i1}_${Math.min(j1, j2)}`;
        } else {
            return `h_${Math.min(i1, i2)}_{j1}`;
        }
    }

    function generateWalls(x, explicitPath) {
        wallsGroup.innerHTML = '';
        const { padding, width, height } = getPaddingAndSize();
        const pathEdges = new Set();
        
        // Record all edges used by path
        // Since path can jump multiple cells (e.g. 0,0 to 3,0), we need to iterate each sub-segment
        for (let idx = 0; idx < explicitPath.length - 1; idx++) {
            const p1 = explicitPath[idx];
            const p2 = explicitPath[idx+1];
            
            if (p1.i === p2.i) {
                // Vertical segment
                const minJ = Math.min(p1.j, p2.j);
                const maxJ = Math.max(p1.j, p2.j);
                for (let j = minJ; j < maxJ; j++) {
                    pathEdges.add(`v_${p1.i}_${j}`);
                }
            } else if (p1.j === p2.j) {
                // Horizontal segment
                const minI = Math.min(p1.i, p2.i);
                const maxI = Math.max(p1.i, p2.i);
                for (let i = minI; i < maxI; i++) {
                    pathEdges.add(`h_${i}_${p1.j}`);
                }
            }
        }

        // Generate cosmetic random walls for untouched edges
        const density = 0.35; // 35% chance to place a wall
        for (let i = 0; i <= x; i++) {
            for (let j = 0; j <= x; j++) {
                // Horizontal edge to right (i,j) -> (i+1, j)
                if (i < x && !pathEdges.has(`h_${i}_${j}`) && Math.random() < density) {
                    const p1 = getCoords(i, j, x);
                    const p2 = getCoords(i+1, j, x);
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', p1.pX);
                    line.setAttribute('y1', p1.pY);
                    line.setAttribute('x2', p2.pX);
                    line.setAttribute('y2', p2.pY);
                    wallsGroup.appendChild(line);
                }
                
                // Vertical edge downwards (i,j) -> (i, j+1)
                if (j < x && !pathEdges.has(`v_${i}_${j}`) && Math.random() < density) {
                    const p1 = getCoords(i, j, x);
                    const p2 = getCoords(i, j+1, x);
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', p1.pX);
                    line.setAttribute('y1', p1.pY);
                    line.setAttribute('x2', p2.pX);
                    line.setAttribute('y2', p2.pY);
                    wallsGroup.appendChild(line);
                }
            }
        }
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

            drawBackgroundGrid(x);
            generateWalls(x, explicitPath);

            await renderPathAnimated(explicitPath, x);
        } catch (err) {
            console.error("Generation error:", err);
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        }
    }

    function renderPathAnimated(explicitPath, gridX) {
        return new Promise(resolve => {
            let dString = "";
            let currentIndex = 0;

            const drawStep = () => {
                if (currentIndex >= explicitPath.length) {
                    resolve();
                    return;
                }

                const pt = explicitPath[currentIndex];
                const { pX, pY } = getCoords(pt.i, pt.j, gridX);
                
                if (currentIndex === 0) {
                    dString += `M ${pX} ${pY} `;
                } else {
                    dString += `L ${pX} ${pY} `;
                }
                pathSvg.setAttribute("d", dString);

                const node = document.createElement("div");
                node.className = "node";
                if (currentIndex === 0) node.classList.add("start");
                if (currentIndex === explicitPath.length - 1) node.classList.add("end");
                
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
