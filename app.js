// Graph Data Structure with Coordinates
const cityNodes = {
    "Electronic City": { x: 760, y: 930 },
    "Bellandur": { x: 840, y: 770 },
    "HSR Layout": { x: 680, y: 820 },
    "Koramangala": { x: 600, y: 720 },
    "BTM Layout": { x: 520, y: 820 },
    "Madiwala": { x: 568, y: 770 },
    "Jayanagar": { x: 440, y: 740 },
    "JP Nagar": { x: 440, y: 820 },
    "Banashankari": { x: 360, y: 820 },
    "Basavanagudi": { x: 360, y: 660 },
    "Vijayanagar": { x: 200, y: 610 },
    "Rajajinagar": { x: 200, y: 450 },
    "Malleshwaram": { x: 280, y: 290 },
    "Majestic": { x: 360, y: 450 },
    "Indiranagar": { x: 680, y: 530 },
    "Domlur": { x: 600, y: 610 },
    "Marathahalli": { x: 840, y: 610 },
    "Whitefield": { x: 1000, y: 530 },
    "Hebbal": { x: 440, y: 210 },
    "Yelahanka": { x: 520, y: 130 }
};

const cityGraph = {
    "Electronic City": ["HSR Layout", "Bellandur"],
    "Bellandur": ["Electronic City", "HSR Layout", "Marathahalli"],
    "HSR Layout": ["Electronic City", "Bellandur", "Koramangala", "BTM Layout"],
    "Koramangala": ["HSR Layout", "BTM Layout", "Madiwala", "Indiranagar", "Domlur"],
    "BTM Layout": ["HSR Layout", "Koramangala", "Madiwala", "Jayanagar", "JP Nagar"],
    "Madiwala": ["Koramangala", "BTM Layout", "Jayanagar"],
    "Jayanagar": ["BTM Layout", "Madiwala", "JP Nagar", "Basavanagudi"],
    "JP Nagar": ["BTM Layout", "Jayanagar", "Banashankari"],
    "Banashankari": ["JP Nagar", "Basavanagudi", "Vijayanagar"],
    "Basavanagudi": ["Jayanagar", "Banashankari", "Majestic"],
    "Vijayanagar": ["Banashankari", "Rajajinagar"],
    "Rajajinagar": ["Vijayanagar", "Majestic", "Malleshwaram"],
    "Malleshwaram": ["Rajajinagar", "Majestic", "Hebbal"],
    "Majestic": ["Basavanagudi", "Rajajinagar", "Malleshwaram", "Domlur"],
    "Indiranagar": ["Koramangala", "Domlur"],
    "Domlur": ["Indiranagar", "Koramangala", "Majestic", "Marathahalli"],
    "Marathahalli": ["Bellandur", "Domlur", "Whitefield"],
    "Whitefield": ["Marathahalli"],
    "Hebbal": ["Malleshwaram", "Yelahanka"],
    "Yelahanka": ["Hebbal"]
};

const nodeNames = Object.keys(cityNodes);

let totalCollection = 0;
let systemSpeedMultiplier = 1.0;

function getCabColor(cabId, alpha = 1) {
    const colors = [
        '255, 0, 0',     // 1. Vivid Cherry Red
        '255, 0, 255',   // 2. Hot Magenta
        '0, 255, 0',     // 3. Electric Lime Green
        '255, 127, 0',   // 4. Vibrant Electric Orange
        '130, 0, 255',   // 5. Deep Intense Purple
        '255, 240, 0',   // 6. Neon Bright Yellow
        '255, 255, 255', // 7. Pure Crisp White
        '255, 105, 180', // 8. Hot Bubblegum Pink
        '160, 0, 90',     // 9. Crimson Wine / Plum
        '255, 200, 150', // 10. Soft Warm Peach
        '190, 80, 0',     // 11. Vibrant Rust / Terracotta (Replaced Sand)
        '210, 140, 255'  // 12. Soft Pastel Lavender
    ];
    const rgb = colors[(cabId - 1) % colors.length];
    return `rgba(${rgb}, ${alpha})`;
}

// DOM Elements
const canvas = document.getElementById('cityMap');
const ctx = canvas.getContext('2d');
const logContainer = document.getElementById('system-log');
let width, height;

// Resize handling
function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Pan & Zoom State --- //
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);
    
    // Zoom relative to mouse position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    offsetX = mouseX - (mouseX - offsetX) * zoomFactor;
    offsetY = mouseY - (mouseY - offsetY) * zoomFactor;
    
    scale *= zoomFactor;
    scale = Math.max(0.3, Math.min(scale, 5)); // restrict zoom limits
});

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX = e.clientX - dragStartX;
        offsetY = e.clientY - dragStartY;
    }
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

// Live clock
function updateClock() {
    const el = document.getElementById('live-clock');
    if (el) el.innerText = new Date().toLocaleTimeString('en-GB', {hour12: false});
}
setInterval(updateClock, 1000);
updateClock();

// Helper to log
function log(msg, type='sys') {
    const el = document.createElement('div');
    el.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString('en-GB', {hour12: false});
    el.innerHTML = `<span style="color:#475569">[${time}]</span> ${msg}`;
    logContainer.prepend(el);
    // Cap log length
    while (logContainer.children.length > 60) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// OS Process States
const CAB_STATE = {
    READY: 'Ready',       // Idle
    WAITING: 'Waiting',   // To Pickup
    RUNNING: 'Running',   // To Dropoff
};

class Cab {
    constructor(id) {
        this.id = id;
        this.currentNode = nodeNames[Math.floor(Math.random() * nodeNames.length)];
        this.state = CAB_STATE.READY;
        this.path = [];
        
        // Exact pixel coords
        this.x = cityNodes[this.currentNode].x;
        this.y = cityNodes[this.currentNode].y;
        
        this.speed = 0.35; // increased to match larger map scale
        
        this.currentRide = null; // {pickup, dropoff}
        this.idleTimer = 0;
        this.pickupDelay = 0; // Timer for boarding passenger
        this.isManualRide = false;
        this.angle = 0; // direction of travel in radians
        this.fare = 0; // dynamic ride fare
        
        // Static paths for highlighting
        this.pickupPath = null;
        this.dropoffPath = null;
    }

    update() {
        const effectiveSpeed = this.speed * systemSpeedMultiplier;
        
        if (this.pickupDelay > 0) {
            this.pickupDelay -= systemSpeedMultiplier;
            if (this.pickupDelay <= 0) {
                this.pickupDelay = 0;
                this.beginDropoffPhase();
            }
            return; // Wait while boarding
        }
        
        if (this.path.length > 0) {
            // Move towards next node in path
            const nextNode = this.path[0];
            const targetX = cityNodes[nextNode].x;
            const targetY = cityNodes[nextNode].y;
            
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist <= effectiveSpeed) {
                // Reached node
                this.x = targetX;
                this.y = targetY;
                this.currentNode = nextNode;
                this.path.shift();
                
                // If path empty, we arrived at destination
                if (this.path.length === 0) {
                    this.onDestinationReached();
                }
            } else {
                // Track heading
                this.angle = Math.atan2(dy, dx);
                // Interpolate
                this.x += (dx / dist) * effectiveSpeed;
                this.y += (dy / dist) * effectiveSpeed;
            }
        } else {
            // Idle wander logic
            if (this.state === CAB_STATE.READY) {
                this.idleTimer += systemSpeedMultiplier;
                if (this.idleTimer > 180) { // Every ~3s wander
                    this.idleTimer = 0;
                    const neighbors = cityGraph[this.currentNode];
                    const randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                    this.path.push(randNeighbor);
                }
            }
        }
    }
    
    onDestinationReached() {
        if (this.state === CAB_STATE.WAITING) {
            // Reached pickup
            log(`Cab ${this.id} arrived at pickup (${this.currentNode}). Boarding...`, 'wait');
            this.pickupDelay = 120; // Pause for ~2 seconds
            
        } else if (this.state === CAB_STATE.RUNNING) {
            // Reached dropoff
            log(`========= RIDE SUMMARY =========`, 'done');
            log(`Cab: #${this.id}`, 'done');
            log(`Route: ${this.currentRide.pickup} -> ${this.currentRide.dropoff}`, 'done');
            log(`Path Hopped: ${this.dropoffPath.join(' -> ')}`, 'done');
            log(`Fare Paid: ₹${this.fare}`, 'done');
            log(`================================`, 'done');
            
            // Show premiumCompleted ride glassmorphism toast popup
            showCompletedRideToast(this);
            
            log(`[OS] Cab ${this.id} Terminated -> Ready.`, 'done');
            this.state = CAB_STATE.READY;
            this.currentRide = null;
            this.pickupPath = null;
            this.dropoffPath = null;
            this.isManualRide = false;
            this.fare = 0;
        }
    }
    
    beginDropoffPhase() {
        this.state = CAB_STATE.RUNNING;
        log(`[OS] Cab ${this.id} state -> Running. En route to dropoff...`);
        this.path = [...this.dropoffPath];
        if(this.path[0] === this.currentNode) this.path.shift();
    }

    draw(ctx) {
        let color;
        if (this.state === CAB_STATE.READY) {
            color = '#16a34a'; // green
        } else {
            color = getCabColor(this.id, 1); // custom neon color
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // --- Car silhouette (top-down, facing right at 0 radians) ---
        const W = 18, H = 10;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        
        // Body
        ctx.beginPath();
        ctx.roundRect(-W/2, -H/2, W, H, 3);
        ctx.fill();
        
        // Windscreen (lighter front, right side)
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.roundRect(W/2 - 6, -H/2 + 1.5, 4, H - 3, 2);
        ctx.fill();
        
        // Rear window (left side)
        ctx.beginPath();
        ctx.roundRect(-W/2 + 2, -H/2 + 1.5, 3, H - 3, 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // Premium cyber-glass Cab ID label matching the UI
        const labelText = `#${this.id}`;
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        const tw = ctx.measureText(labelText).width;
        
        // Pill background
        ctx.fillStyle = "rgba(7, 11, 20, 0.85)";
        ctx.beginPath();
        ctx.roundRect(this.x - tw/2 - 4, this.y + 11, tw + 8, 12, 3);
        ctx.fill();
        
        // Glowing border matching cab's status/color
        ctx.strokeStyle = this.state === CAB_STATE.READY ? "rgba(22, 163, 74, 0.4)" : getCabColor(this.id, 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Bright matching text
        ctx.fillStyle = this.state === CAB_STATE.READY ? "#4ade80" : getCabColor(this.id, 1);
        ctx.fillText(labelText, this.x - tw/2, this.y + 20);
    }
}

const cabs = [];
const NUM_CABS = 12;
for (let i = 1; i <= NUM_CABS; i++) {
    cabs.push(new Cab(i));
}

// --- DAA Algorithms --- //

// BFS
function findNearestCabBFS(pickupNode) {
    let visited = new Set();
    let queue = [{node: pickupNode, distance: 0}];
    visited.add(pickupNode);
    
    while(queue.length > 0) {
        let current = queue.shift();
        
        // Check if an available cab is here
        for (let cab of cabs) {
            if (cab.state === CAB_STATE.READY) {
                const isAtCurrent = cab.currentNode === current.node;
                const isMovingToCurrent = cab.path.length > 0 && cab.path[0] === current.node;
                
                if (isAtCurrent || isMovingToCurrent) {
                    return { cab, distance: current.distance };
                }
            }
        }
        
        // Explore neighbors
        for (let neighbor of cityGraph[current.node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({node: neighbor, distance: current.distance + 1});
            }
        }
    }
    return null;
}

// DFS for Route Exploration (Finds multiple paths, picks shortest)
function findBestRouteDFS(start, end) {
    let allPaths = [];
    
    function dfs(current, target, path, visited) {
        if (allPaths.length > 500) return; // Safety limit
        if (path.length > 12) return; // Depth limit to prevent long cycles
        
        visited.add(current);
        path.push(current);
        
        if (current === target) {
            allPaths.push([...path]);
        } else {
            for (let neighbor of cityGraph[current]) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, target, path, visited);
                }
            }
        }
        
        path.pop();
        visited.delete(current); // Backtrack
    }
    
    dfs(start, end, [], new Set());
    
    if (allPaths.length === 0) return null;
    allPaths.sort((a, b) => a.length - b.length);
    
    log(`[DAA] DFS found ${allPaths.length} possible routes. Selecting shortest.`, 'sys');
    return allPaths[0];
}

// --- Dispatch Logic --- //
let pendingRides = 0;
let isPaused = false;

function dispatchRide(pickup, dropoff, isManual = false) {
    if (pickup === dropoff) {
        log(`Cannot book ride to same location.`, 'wait');
        return;
    }
    
    pendingRides++;
    updateStats();
    
    log(`--------- RIDE REQUEST ---------`);
    log(`Pickup: ${pickup} | Dropoff: ${dropoff}`);
    
    // 1. BFS Search
    log(`[DAA] BFS searching outward from ${pickup}...`);
    const result = findNearestCabBFS(pickup);
    
    if (!result) {
        log(`No available cabs right now!`, 'run');
        pendingRides--;
        updateStats();
        return;
    }
    
    const { cab, distance } = result;
    log(`Found Cab ${cab.id} at ${cab.currentNode} (${distance} hops).`);
    
    // Calculate ride fare dynamically
    const activeCount = cabs.filter(c => c.state !== CAB_STATE.READY).length;
    const isSurge = (activeCount / NUM_CABS) > 0.6;
    let rawDropoffPath = findBestRouteDFS(pickup, dropoff);
    const hops = rawDropoffPath ? rawDropoffPath.length - 1 : 0;
    const baseFare = 50;
    const perHop = 20;
    let rideFare = baseFare + (hops * perHop);
    if (isSurge) {
        rideFare = Math.round(rideFare * 1.5);
    }
    
    cab.fare = rideFare;
    totalCollection += rideFare;
    
    // 2. OS Transition
    log(`[OS] Cab ${cab.id} Ready -> Waiting.`);
    cab.state = CAB_STATE.WAITING;
    cab.currentRide = { pickup, dropoff };
    cab.isManualRide = isManual; // Flag for highlighting
    
    // 3. DFS for routing to pickup
    log(`[DAA] DFS pathing to pickup...`);
    let rawPickupPath;
    if (cab.path && cab.path.length > 0) {
        // Cab is moving from cab.currentNode to cab.path[0]
        const A = cab.currentNode;
        const B = cab.path[0];
        
        const nodeA = cityNodes[A];
        const nodeB = cityNodes[B];
        
        const distToA = Math.sqrt((cab.x - nodeA.x)**2 + (cab.y - nodeA.y)**2);
        const distToB = Math.sqrt((cab.x - nodeB.x)**2 + (cab.y - nodeB.y)**2);
        
        const pathA = findBestRouteDFS(A, pickup);
        const pathB = findBestRouteDFS(B, pickup);
        
        const scoreA = distToA + (pathA ? (pathA.length - 1) * 60 : 999999);
        const scoreB = distToB + (pathB ? (pathB.length - 1) * 60 : 999999);
        
        if (scoreA < scoreB && pathA) {
            log(`[OS] Cab ${cab.id} U-turning back to ${A} (optimal path).`);
            rawPickupPath = [...pathA];
        } else if (pathB) {
            log(`[OS] Cab ${cab.id} continuing to ${B} (optimal path).`);
            rawPickupPath = [...pathB];
        } else {
            rawPickupPath = pathA ? [...pathA] : [];
        }
    } else {
        // Cab is stopped at cab.currentNode
        rawPickupPath = findBestRouteDFS(cab.currentNode, pickup);
    }
    
    cab.pickupPath = rawPickupPath ? [...rawPickupPath] : [];
    cab.dropoffPath = rawDropoffPath ? [...rawDropoffPath] : [];
    
    cab.path = rawPickupPath ? [...rawPickupPath] : [];
    
    if (cab.path && cab.path.length === 0) {
        // Cab is already at the pickup node
        cab.onDestinationReached();
    }
    
    pendingRides--;
    updateStats();
    
    if (isManual) {
        isPaused = true;
        setTimeout(() => {
            isPaused = false;
        }, 2500); // Freeze for 2.5 seconds
    }
}

// Traffic particle system
const particles = [];
function spawnParticles() {
    const edges = [];
    const drawn = new Set();
    for (let node in cityGraph) {
        for (let neighbor of cityGraph[node]) {
            const id = [node, neighbor].sort().join('-');
            if (!drawn.has(id)) { edges.push([node, neighbor]); drawn.add(id); }
        }
    }
    if (particles.length < 60) {
        const [a, b] = edges[Math.floor(Math.random() * edges.length)];
        const p1 = cityNodes[a], p2 = cityNodes[b];
        const rev = Math.random() > 0.5;
        particles.push({
            x: rev ? p2.x : p1.x,
            y: rev ? p2.y : p1.y,
            tx: rev ? p1.x : p2.x,
            ty: rev ? p1.y : p2.y,
            sx: rev ? p2.x : p1.x,
            sy: rev ? p2.y : p1.y,
            progress: 0,
            speed: 0.002 + Math.random() * 0.003,
            alpha: 0.3 + Math.random() * 0.4
        });
    }
}
setInterval(spawnParticles, 300);

// --- Rendering Loop --- //
function drawGraph() {
    // Animated dot grid background
    const t = Date.now() * 0.0003;
    for (let x = -2000; x < 3000; x += 60) {
        for (let y = -2000; y < 3000; y += 60) {
            const flicker = 0.5 + 0.5 * Math.sin(t + x * 0.02 + y * 0.015);
            ctx.beginPath();
            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56,189,248,${0.06 * flicker})`;
            ctx.fill();
        }
    }
    
    // 2. Draw roads — muted blue-gray with cyan inner lane
    let drawn = new Set();
    for (let node in cityGraph) {
        const p1 = cityNodes[node];
        for (let neighbor of cityGraph[node]) {
            const edgeId = [node, neighbor].sort().join('-');
            if (!drawn.has(edgeId)) {
                const p2 = cityNodes[neighbor];
                // Outer casing
                ctx.lineWidth = 14;
                ctx.strokeStyle = 'rgba(15,23,60,0.9)';
                ctx.lineCap = 'round';
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                // Road surface — muted blue-gray
                ctx.lineWidth = 9;
                ctx.strokeStyle = '#1e2d4a';
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                // Subtle lane glow
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = 'rgba(56,189,248,0.12)';
                ctx.setLineDash([12, 10]);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.setLineDash([]);
                drawn.add(edgeId);
            }
        }
    }
    
    // Draw traffic particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        if (p.progress >= 1) { particles.splice(i, 1); continue; }
        p.x = p.sx + (p.tx - p.sx) * p.progress;
        p.y = p.sy + (p.ty - p.sy) * p.progress;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.alpha * (1 - p.progress)})`;
        ctx.fill();
    }
    
    // 3. Draw highlighted active paths (ABOVE roads)
    for (let cab of cabs) {
        if (cab.state !== CAB_STATE.READY) {
            const cabColorSolid = getCabColor(cab.id, 1);
            const cabColorGlow = getCabColor(cab.id, 0.15);
            const cabColorGlowInner = getCabColor(cab.id, 0.9);
            
            // Pickup Path — dashed custom cab color
            if (cab.state === CAB_STATE.WAITING && cab.path && cab.path.length > 0) {
                // Wide outer glow
                ctx.lineWidth = 14;
                ctx.strokeStyle = cabColorGlow;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.shadowColor = cabColorSolid; ctx.shadowBlur = 18;
                ctx.beginPath(); ctx.moveTo(cab.x, cab.y);
                for (const n of cab.path) { const nd = cityNodes[n]; ctx.lineTo(nd.x, nd.y); }
                ctx.stroke();
                // Dashed inner lane
                ctx.lineWidth = 4;
                ctx.strokeStyle = cabColorGlowInner;
                ctx.shadowBlur = 8;
                ctx.setLineDash([8, 6]);
                ctx.beginPath(); ctx.moveTo(cab.x, cab.y);
                for (const n of cab.path) { const nd = cityNodes[n]; ctx.lineTo(nd.x, nd.y); }
                ctx.stroke();
                ctx.setLineDash([]); ctx.shadowBlur = 0;
            }
            // Dropoff Path — solid custom cab color
            if (cab.state === CAB_STATE.RUNNING && cab.path && cab.path.length > 0) {
                ctx.lineWidth = 14;
                ctx.strokeStyle = cabColorGlow;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.shadowColor = cabColorSolid; ctx.shadowBlur = 20;
                ctx.beginPath(); ctx.moveTo(cab.x, cab.y);
                for (const n of cab.path) { const nd = cityNodes[n]; ctx.lineTo(nd.x, nd.y); }
                ctx.stroke();
                ctx.lineWidth = 4;
                ctx.strokeStyle = cabColorGlowInner;
                ctx.shadowBlur = 10;
                ctx.beginPath(); ctx.moveTo(cab.x, cab.y);
                for (const n of cab.path) { const nd = cityNodes[n]; ctx.lineTo(nd.x, nd.y); }
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // 4. Draw nodes as glowing intersections
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
    for (let node in cityNodes) {
        const p = cityNodes[node];
        const connections = cityGraph[node].length;
        const isMajorHub = connections >= 4;
        const r = isMajorHub ? 9 : 6;
        
        // Outer glow ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 4 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = isMajorHub
            ? `rgba(56,189,248,${0.06 + pulse * 0.04})`
            : `rgba(34,211,238,${0.04 + pulse * 0.02})`;
        ctx.fill();
        
        // Inner glow
        ctx.shadowColor = isMajorHub ? '#38bdf8' : '#22d3ee';
        ctx.shadowBlur = isMajorHub ? 12 : 6;
        
        // Node circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isMajorHub ? '#1e3a6e' : '#0f2447';
        ctx.fill();
        ctx.strokeStyle = isMajorHub ? '#38bdf8' : '#22d3ee';
        ctx.lineWidth = isMajorHub ? 2 : 1.5;
        ctx.stroke();
        
        // Inner dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = isMajorHub ? '#7dd3fc' : '#67e8f9';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Label pill
        const label = node;
        ctx.font = `${isMajorHub ? 'bold' : '500'} 10px Inter`;
        const tw = ctx.measureText(label).width;
        const px = p.x + r + 5, py = p.y + 4;
        ctx.fillStyle = 'rgba(7,11,20,0.85)';
        ctx.beginPath();
        ctx.roundRect(px - 2, py - 11, tw + 8, 14, 4);
        ctx.fill();
        ctx.strokeStyle = isMajorHub ? 'rgba(56,189,248,0.2)' : 'rgba(56,189,248,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = isMajorHub ? '#7dd3fc' : '#94a3b8';
        ctx.fillText(label, px + 2, py);
    }
    
    // 5. Draw special active ride pins (Source & Destination)
    for (let cab of cabs) {
        if (cab.currentRide) {
            const pickupNode = cityNodes[cab.currentRide.pickup];
            const dropoffNode = cityNodes[cab.currentRide.dropoff];
            const cabColor = getCabColor(cab.id, 1);
            
            if (cab.state === CAB_STATE.WAITING) {
                if (pickupNode) drawSpecialPin(ctx, pickupNode.x, pickupNode.y, cabColor, `CAB #${cab.id} PICKUP`);
            }
            if (cab.state === CAB_STATE.WAITING || cab.state === CAB_STATE.RUNNING) {
                if (dropoffNode) drawSpecialPin(ctx, dropoffNode.x, dropoffNode.y, cabColor, `CAB #${cab.id} DEST`);
            }
        }
    }
}

// Helper for drawing large teardrop pins
function drawSpecialPin(ctx, x, y, color, labelText) {
    ctx.save();
    ctx.translate(x, y);
    
    // Pin glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    
    // Pin head (teardrop shape pointing down to x,y)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -24, 12, Math.PI, 0, false);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    
    // Inner white dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -24, 4, 0, Math.PI*2);
    ctx.fill();
    
    // Floating badge above pin
    ctx.shadowBlur = 0;
    ctx.font = 'bold 9px Inter';
    const tw = ctx.measureText(labelText).width;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-tw/2 - 4, -45, tw + 8, 14, 3);
    ctx.fill();
    
    ctx.fillStyle = '#0f172a'; // dark text inside badge
    ctx.fillText(labelText, -tw/2, -34);
    
    ctx.restore();
}

function updateStats() {
    const activeCount = cabs.filter(c => c.state !== CAB_STATE.READY).length;
    document.getElementById('active-cabs').innerText = activeCount;
    document.getElementById('pending-rides').innerText = pendingRides;
    
    const collectionEl = document.getElementById('total-collection');
    if (collectionEl) {
        collectionEl.innerText = `₹${totalCollection}`;
    }
    
    // Live Surge Pricing & Fare Estimation
    const pickupSelect = document.getElementById('pickup-node');
    const dropoffSelect = document.getElementById('dropoff-node');
    if (!pickupSelect || !dropoffSelect) return;
    
    const pickup = pickupSelect.value;
    const dropoff = dropoffSelect.value;
    
    let totalFare = 0;
    const isSurge = (activeCount / NUM_CABS) > 0.6; // >60% fleet dispatched
    
    if (pickup && dropoff && pickup !== dropoff) {
        // Fast DFS to find route length for price calculation
        const route = findBestRouteDFS(pickup, dropoff);
        const hops = route ? route.length - 1 : 0;
        
        const baseFare = 50;
        const perHop = 20;
        totalFare = baseFare + (hops * perHop);
        if (isSurge) {
            totalFare = Math.round(totalFare * 1.5);
        }
    }
    
    const fareVal = document.getElementById('fare-val');
    const surgeBadge = document.getElementById('surge-badge');
    
    if (fareVal) fareVal.innerText = totalFare > 0 ? `₹${totalFare}` : '₹0';
    if (surgeBadge) surgeBadge.style.display = isSurge && totalFare > 0 ? 'inline-block' : 'none';
}

function updateAdminPanel() {
    const tbody = document.getElementById('cab-list');
    tbody.innerHTML = '';
    
    // Sort cabs: Active first, Idle last
    let sortedCabs = [...cabs].sort((a, b) => {
        if (a.state === CAB_STATE.READY && b.state !== CAB_STATE.READY) return 1;
        if (a.state !== CAB_STATE.READY && b.state === CAB_STATE.READY) return -1;
        return a.id - b.id;
    });
    
    // Update fleet count
    const fleetOnline = document.getElementById('fleet-online');
    if (fleetOnline) fleetOnline.innerText = `${NUM_CABS} Online`;
    
    for (let cab of sortedCabs) {
        let tr = document.createElement('tr');
        
        let stateClass = 'idle';
        let stateLabel = 'READY';
        if (cab.state === CAB_STATE.WAITING) {
            stateClass = 'manual'; stateLabel = 'PICKUP';
        } else if (cab.state === CAB_STATE.RUNNING) {
            stateClass = 'manual'; stateLabel = 'EN ROUTE';
        }
        
        const cabColor = getCabColor(cab.id, 1);
        let badgeStyle = '';
        if (cab.state !== CAB_STATE.READY) {
            const cabColorGlow = getCabColor(cab.id, 0.15);
            badgeStyle = `style="background: ${cabColorGlow}; color: ${cabColor}; border: 1px solid ${cabColor}; font-weight: 700;"`;
        }
        
        let routeText = '<span style="color:#334155">—</span>';
        if (cab.state !== CAB_STATE.READY && cab.currentRide) {
            routeText = `<span style="color:#f1f5f9; font-weight:500; font-size:10px">${cab.currentRide.pickup.split(' ')[0]} → ${cab.currentRide.dropoff.split(' ')[0]}</span>`;
        }
        
        let fareText = '<span style="color:#334155">—</span>';
        if (cab.state !== CAB_STATE.READY && cab.fare) {
            fareText = `<span style="color:${cabColor};font-weight:700">₹${cab.fare}</span>`;
        }
        
        tr.innerHTML = `
            <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${cabColor};font-weight:700">#${cab.id}</td>
            <td><span class="badge ${stateClass}" ${badgeStyle}>${stateLabel}</span></td>
            <td class="route-cell">${routeText}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${cabColor};font-weight:700">${fareText}</td>
        `;
        tbody.appendChild(tr);
    }
}

function updateLegend() {
    const legendEl = document.getElementById('map-legend');
    if (!legendEl) return;
    
    let html = `<div class="legend-item" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px; margin-bottom: 4px; font-weight: 700; color: #fff;">Map Legend</div>`;
    html += `<div class="legend-item"><span class="dot green" style="background:#16a34a; box-shadow:0 0 8px #16a34a"></span> Idle / Ready</div>`;
    
    // Filter active cabs
    const activeCabs = cabs.filter(c => c.state !== CAB_STATE.READY && c.currentRide);
    
    for (let cab of activeCabs) {
        const color = getCabColor(cab.id, 1);
        const pickupShort = cab.currentRide.pickup.split(' ')[0];
        const dropoffShort = cab.currentRide.dropoff.split(' ')[0];
        const phase = cab.state === CAB_STATE.WAITING ? 'Pickup' : 'Trip';
        
        html += `
            <div class="legend-item" style="margin-top: 4px;">
                <span class="dot" style="background: ${color}; box-shadow: 0 0 8px ${color}"></span>
                <span style="color:#f1f5f9;font-weight:600">Cab #${cab.id}</span> 
                <span style="color:#64748b">(${phase}: ${pickupShort} → ${dropoffShort})</span>
            </div>
        `;
    }
    
    legendEl.innerHTML = html;
}

function animate() {
    // Reset transform for full canvas clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Deep navy map background
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, width, height);
    
    // Apply pan and zoom
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    
    // Draw Map
    drawGraph();
    
    // Update and Draw Cabs
    for (let cab of cabs) {
        if (!isPaused) cab.update();
        cab.draw(ctx);
    }
    
    // Update UI (throttle to avoid DOM thrashing)
    if (!animate._frame || animate._frame % 6 === 0) {
        updateAdminPanel();
        updateStats();
        updateLegend();
    }
    animate._frame = ((animate._frame || 0) + 1) % 600;
    
    requestAnimationFrame(animate);
}

// --- Setup UI --- //
const pickupSelect = document.getElementById('pickup-node');
const dropoffSelect = document.getElementById('dropoff-node');

nodeNames.forEach(node => {
    let opt1 = document.createElement('option');
    opt1.value = node; opt1.innerText = node;
    pickupSelect.appendChild(opt1);
    
    let opt2 = document.createElement('option');
    opt2.value = node; opt2.innerText = node;
    dropoffSelect.appendChild(opt2);
});

dropoffSelect.selectedIndex = 1;

document.getElementById('request-btn').addEventListener('click', () => {
    dispatchRide(pickupSelect.value, dropoffSelect.value, true);
});

// Speed control slider listener
const speedSlider = document.getElementById('system-speed-slider');
const speedValDisplay = document.getElementById('speed-multiplier-val');

if (speedSlider && speedValDisplay) {
    speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        systemSpeedMultiplier = val;
        speedValDisplay.innerText = `${val.toFixed(1)}x`;
        log(`System Speed set to ${val.toFixed(1)}x`, 'sys');
    });
}

// Start
log("CabGrid Dashboard initialized.", 'sys');
animate();

// Helper for completed ride pop-up toast
function showCompletedRideToast(cab) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const cabColor = getCabColor(cab.id, 1);
    const toast = document.createElement('div');
    toast.className = 'ride-toast';
    toast.style.borderColor = getCabColor(cab.id, 0.3);
    toast.style.color = cabColor; // Sets progress bar currentColor!
    
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title" style="color: ${cabColor}">⚡ Ride Completed</span>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-body">
            <div class="toast-row">
                <span class="label">Cab ID</span>
                <span class="value" style="color: ${cabColor}">#${cab.id}</span>
            </div>
            <div class="toast-row">
                <span class="label">Route</span>
                <span class="value" style="color: #fff">${cab.currentRide.pickup.split(' ')[0]} → ${cab.currentRide.dropoff.split(' ')[0]}</span>
            </div>
            <div class="toast-row">
                <span class="label">Fare Collected</span>
                <span class="value" style="color: #10b981; font-weight: 700">₹${cab.fare}</span>
            </div>
            <div class="toast-path">
                Path: ${cab.dropoffPath.join(' → ')}
            </div>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Wire up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    };
    
    // Auto-remove after 5 seconds
    const timer = setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    container.appendChild(toast);
}
