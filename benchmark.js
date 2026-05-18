const logContainer = document.getElementById('system-log');
const btnRun = document.getElementById('run-benchmark-btn');
const barBfs = document.getElementById('bar-bfs');
const barBrute = document.getElementById('bar-brute');

const canvasBfs = document.getElementById('canvas-bfs');
const ctxBfs = canvasBfs.getContext('2d');
const canvasBrute = document.getElementById('canvas-brute');
const ctxBrute = canvasBrute.getContext('2d');

const statsBfs = document.getElementById('stats-bfs');
const statsBrute = document.getElementById('stats-brute');

function log(msg, type='sys') {
    const el = document.createElement('div');
    el.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString('en-GB', {hour12: false});
    el.innerHTML = `<span style="color:#475569">[${time}]</span> ${msg}`;
    logContainer.prepend(el);
}

// 1. Generate large 40x40 Grid Graph
const GRID_SIZE = 40;
const NUM_NODES = GRID_SIZE * GRID_SIZE;
const graph = {};

log(`Generating ${GRID_SIZE}x${GRID_SIZE} grid graph (${NUM_NODES} nodes)...`, 'sys');

for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
        const id = `${r},${c}`;
        graph[id] = [];
        // Add neighbors
        if (r > 0) graph[id].push(`${r-1},${c}`);
        if (r < GRID_SIZE - 1) graph[id].push(`${r+1},${c}`);
        if (c > 0) graph[id].push(`${r},${c-1}`);
        if (c < GRID_SIZE - 1) graph[id].push(`${r},${c+1}`);
    }
}

const nodeNames = Object.keys(graph);

// 2. Generate 500 Cabs
const NUM_CABS = 500;
const cabs = [];
for (let i = 0; i < NUM_CABS; i++) {
    cabs.push({
        id: i + 1,
        node: nodeNames[Math.floor(Math.random() * nodeNames.length)]
    });
}
log(`Distributed ${NUM_CABS} cabs randomly across the grid.`, 'sys');

// 3. Algorithms

// BFS Dispatcher: Radiates outwards from pickup, stopping at the first cab it hits.
function runBFSDispatcher(pickupNode) {
    let visited = new Set();
    let queue = [{node: pickupNode, distance: 0}];
    let parent = new Map();
    visited.add(pickupNode);
    let nodesEvaluated = 0;
    
    // Quick lookup for cab positions
    const cabLocations = new Map();
    for (let cab of cabs) {
        if (!cabLocations.has(cab.node)) cabLocations.set(cab.node, []);
        cabLocations.get(cab.node).push(cab);
    }
    
    while(queue.length > 0) {
        let current = queue.shift();
        nodesEvaluated++;
        
        // Check if cab is here
        if (cabLocations.has(current.node)) {
            const foundCab = cabLocations.get(current.node)[0];
            let path = [current.node];
            let p = parent.get(current.node);
            while(p) {
                path.push(p);
                p = parent.get(p);
            }
            return { cab: foundCab, distance: current.distance, visited, nodesEvaluated, path };
        }
        
        for (let neighbor of graph[current.node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, current.node);
                queue.push({node: neighbor, distance: current.distance + 1});
            }
        }
    }
    return null;
}

// Helper for Brute Force: finds distance from a cab to pickup
function getDistance(startNode, endNode, visitedNodes) {
    if (startNode === endNode) return { dist: 0, evals: 1, path: [startNode] };
    let visited = new Set();
    let queue = [{node: startNode, distance: 0}];
    let parent = new Map();
    visited.add(startNode);
    visitedNodes.add(startNode);
    
    let evals = 0;
    while(queue.length > 0) {
        let current = queue.shift();
        evals++;
        if (current.node === endNode) {
            let path = [current.node];
            let p = parent.get(current.node);
            while(p) {
                path.push(p);
                p = parent.get(p);
            }
            return { dist: current.distance, evals, path };
        }
        for (let neighbor of graph[current.node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                visitedNodes.add(neighbor);
                parent.set(neighbor, current.node);
                queue.push({node: neighbor, distance: current.distance + 1});
            }
        }
    }
    return { dist: Infinity, evals, path: [] };
}

// Brute Force Dispatcher: Checks every single cab and calculates its distance to the pickup
function runBruteForceDispatcher(pickupNode) {
    let bestCab = null;
    let minDistance = Infinity;
    let nodesEvaluated = 0;
    let visitedNodes = new Set();
    let bestPath = [];
    
    for (let cab of cabs) {
        let res = getDistance(cab.node, pickupNode, visitedNodes);
        nodesEvaluated += res.evals;
        if (res.dist < minDistance) {
            minDistance = res.dist;
            bestCab = cab;
            bestPath = res.path;
        }
    }
    
    return { cab: bestCab, distance: minDistance, visited: visitedNodes, nodesEvaluated, path: bestPath };
}

// 4. Visualization
function drawGraph(ctx, sourceNode, destNode, visitedNodes, path, highlightColor) {
    const w = 500;
    const h = 500;
    const cellW = w / GRID_SIZE;
    const cellH = h / GRID_SIZE;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw basic grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let r=0; r<=GRID_SIZE; r++) {
        ctx.beginPath(); ctx.moveTo(0, r*cellH); ctx.lineTo(w, r*cellH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r*cellW, 0); ctx.lineTo(r*cellW, h); ctx.stroke();
    }
    
    // Draw all nodes as tiny dots
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for(let r=0; r<GRID_SIZE; r++) {
        for(let c=0; c<GRID_SIZE; c++) {
            ctx.beginPath();
            ctx.arc(c * cellW + cellW/2, r * cellH + cellH/2, 1, 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    // Draw visited nodes (heatmap of algorithm evaluation)
    if (visitedNodes) {
        ctx.fillStyle = highlightColor;
        for (let node of visitedNodes) {
            const [r, c] = node.split(',').map(Number);
            ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
    }
    
    // Draw Cabs (small green dots)
    ctx.fillStyle = '#34d399';
    for (let cab of cabs) {
        const [r, c] = cab.node.split(',').map(Number);
        ctx.beginPath();
        ctx.arc(c * cellW + cellW/2, r * cellH + cellH/2, 2, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Draw path to selected cab
    if (path && path.length > 0) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24'; // Yellow path
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            const [r, c] = path[i].split(',').map(Number);
            const x = c * cellW + cellW/2;
            const y = r * cellH + cellH/2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    if (!sourceNode) return;
    
    ctx.font = "bold 12px Inter";
    
    // Draw Source (Pickup Node) - Cyan
    const [sr, sc] = sourceNode.split(',').map(Number);
    const sx = sc * cellW + cellW/2;
    const sy = sr * cellH + cellH/2;
    
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillText("Pickup", sx + 10, sy - 5);

    // Draw Destination (Selected Cab) - Red
    if (destNode) {
        const [dr, dc] = destNode.split(',').map(Number);
        const dx = dc * cellW + cellW/2;
        const dy = dr * cellH + cellH/2;
        
        ctx.fillStyle = '#f87171';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(dx, dy, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillText("Cab Found", dx - 35, dy + 15);
    }
}

// Initial draw with random pickup
const initSource = nodeNames[Math.floor(Math.random() * nodeNames.length)];
drawGraph(ctxBfs, initSource, null, null, null, '');
drawGraph(ctxBrute, initSource, null, null, null, '');

// 5. Benchmark Runner
btnRun.addEventListener('click', () => {
    // Generate random pickup node for the request
    let pickupNode = nodeNames[Math.floor(Math.random() * nodeNames.length)];
    
    log(`--- NEW DISPATCH REQUEST @ Node [${pickupNode}] ---`, 'wait');
    
    // Clear graphs
    drawGraph(ctxBfs, pickupNode, null, null, null, '');
    drawGraph(ctxBrute, pickupNode, null, null, null, '');
    
    // Run BFS Dispatcher
    log(`Starting BFS Dispatcher (O(V+E))...`, 'run');
    const t0 = performance.now();
    const resBfs = runBFSDispatcher(pickupNode);
    const t1 = performance.now();
    const bfsTime = t1 - t0;
    log(`[BFS] Found Cab #${resBfs.cab.id} at dist ${resBfs.distance}. Took ${bfsTime.toFixed(2)}ms`, 'done');
    
    // Run Brute Force Dispatcher
    log(`Starting Brute Force Dispatcher through ${NUM_CABS} cabs (O(C * (V+E)))...`, 'run');
    setTimeout(() => {
        const t2 = performance.now();
        const resBrute = runBruteForceDispatcher(pickupNode);
        const t3 = performance.now();
        const bruteTime = t3 - t2;
        log(`[Brute Force] Found Cab #${resBrute.cab.id} at dist ${resBrute.distance}. Took ${bruteTime.toFixed(2)}ms`, 'done');
        
        log(`==> BFS was ${(bruteTime / bfsTime).toFixed(1)}x faster!`, 'sys');
        
        // Update Chart
        const maxHeight = 250;
        let bfsHeight = Math.max(5, (bfsTime / bruteTime) * maxHeight);
        let bruteHeight = Math.max(5, Math.min(250, (bruteTime / bfsTime) * 20));
        
        if (bruteTime > bfsTime) {
            barBrute.style.height = `${maxHeight}px`;
            barBfs.style.height = `${bfsHeight}px`;
        } else {
            barBfs.style.height = `${maxHeight}px`;
            barBrute.style.height = `${Math.max(5, (bruteTime / bfsTime) * maxHeight)}px`;
        }
        
        barBrute.innerText = `${bruteTime.toFixed(1)}ms`;
        barBfs.innerText = `${bfsTime.toFixed(2)}ms`;
        
        // Update Stats & Graphs
        statsBfs.innerText = `Nodes Evaluated: ${resBfs.nodesEvaluated} | Distance: ${resBfs.distance} hops`;
        statsBrute.innerText = `Nodes Evaluated: ${resBrute.nodesEvaluated} | Distance: ${resBrute.distance} hops`;
        
        drawGraph(ctxBfs, pickupNode, resBfs.cab.node, resBfs.visited, resBfs.path, 'rgba(16, 185, 129, 0.4)');
        drawGraph(ctxBrute, pickupNode, resBrute.cab.node, resBrute.visited, resBrute.path, 'rgba(239, 68, 68, 0.4)');
        
    }, 50);
});
