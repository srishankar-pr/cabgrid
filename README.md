# 🚖 CabGrid — AI-Powered Smart Mobility Operations Center

> A real-time, graph-based cab dispatch simulator for Bangalore, visualizing BFS and DFS algorithms through a cinematic, cyberpunk-inspired operations dashboard.

---

## 📌 Overview

**CabGrid** is a fully interactive cab dispatch simulation built as a web application. It models Bangalore's real road network as a mathematical graph and uses classical **Design and Analysis of Algorithms (DAA)** — specifically **BFS** and **DFS** — to power its dispatch and routing engine.

The system also implements **OS Process State Management**, treating each cab as a process that transitions between `Ready`, `Waiting`, and `Running` states — directly mirroring CPU scheduling concepts.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 🗺️ **Live City Map** | Bangalore's road network rendered as an interactive graph canvas |
| 🔍 **BFS Dispatch** | Breadth-First Search finds the nearest available cab in O(V+E) |
| 🛣️ **DFS Routing** | Depth-First Search explores all paths and picks the shortest route |
| 🚦 **OS State Machine** | Cabs transition between `Ready → Waiting → Running → Ready` |
| 📍 **Location Pins** | Teardrop pickup and dropoff markers with glowing badges |
| 🛸 **Animated Cabs** | Rotating car silhouettes that face their direction of travel |
| 🌐 **Pan & Zoom** | Mouse-wheel zoom + click-drag pan for full map exploration |
| 📊 **Admin Fleet Panel** | Live table sorted by activity — active cabs float to the top |
| 🖥️ **System Terminal** | Timestamped, color-coded logs for every algorithm and OS event |
| ✨ **Traffic Particles** | Ambient cyan particles flow along all road edges |

---

## 🧠 Algorithm Architecture

### BFS — Nearest Cab Detection

**Used in:** `findNearestCabBFS(pickupNode)`

When a ride is requested, BFS radiates outward from the **pickup node** level by level:

```
Pickup Node (0 hops)
    └── Neighbors (1 hop)
         └── Neighbors of Neighbors (2 hops)
              └── ... (until a READY cab is found)
```

The first cab encountered is **guaranteed to be the closest** because BFS processes nodes in order of increasing distance. This is mathematically optimal — O(V + E) — far faster than checking every cab individually (brute force O(V·(V+E))).

---

### DFS — Route Path Planning

**Used in:** `findBestRouteDFS(start, end)`

Once a cab is selected, DFS recursively explores the road network to find a route from the cab's current location to the pickup, and from the pickup to the dropoff:

```
Start Node
  ├── Road A → explore deeper...
  │     ├── Road B → Dead end, backtrack
  │     └── Road C → Found destination! ✓ (path saved)
  └── Road D → explore deeper...
        └── Found destination! ✓ (shorter path saved)
```

Our DFS implementation collects **all valid paths** (up to a depth limit of 12 hops to prevent cycles), then **sorts by length and selects the shortest**. This hybrid approach gives DFS the exploratory power while avoiding the classic issue of returning overly long routes.

---

### OS Process State Model

Each cab is modeled as an **OS process** with three states, directly inspired by CPU scheduling:

```
    ┌────────┐   ride assigned   ┌─────────┐   at pickup   ┌─────────┐
    │ READY  │ ───────────────►  │ WAITING │ ────────────► │ RUNNING │
    │ (Idle) │                   │(To Pickup)│             │(En Route)│
    └────────┘ ◄─────────────── └─────────┘               └─────────┘
                ride complete                                   │
                ◄───────────────────────────────────────────────┘
```

| State | OS Analogy | Behavior |
|---|---|---|
| `Ready` | Process in Ready Queue | Cab idles, wanders between nodes |
| `Waiting` | Process waiting for I/O | Cab drives to pickup, then waits to board |
| `Running` | Process executing | Cab drives passenger to destination |

---

## 🗺️ City Graph — Bangalore Road Network

The simulation covers **20 real Bangalore localities** connected as an undirected weighted graph:

```
Yelahanka ── Hebbal ── Malleshwaram ── Rajajinagar ── Vijayanagar
                              │               │
                           Majestic ── Basavanagudi ── Banashankari
                              │               │               │
                           Domlur ──────── Jayanagar ── JP Nagar
                           /    \
               Indiranagar    Marathahalli ── Bellandur ── Electronic City
                                   │               │
                              Whitefield      HSR Layout
                                              Koramangala ── BTM Layout ── Madiwala
```

**Nodes:** 20 localities  
**Edges:** 26 road connections  
**Graph Type:** Undirected, unweighted (hop-count distance)

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 Semantic |
| Styling | Vanilla CSS3 (Glassmorphism, CSS Animations) |
| Logic | Vanilla JavaScript (ES6+, Canvas 2D API) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Rendering | `requestAnimationFrame` loop at 60fps |
| Backend Ref | Python (`cabgrid.py`) — algorithm prototype |

> No frameworks, no build tools. Pure HTML/CSS/JS — open `index.html` directly in any browser.

---

## 📁 Project Structure

```
flash_hack_2.0/
├── index.html          # Dashboard layout & UI structure
├── style.css           # Cyberpunk glassmorphism design system
├── app.js              # Core simulation engine (graph, BFS, DFS, canvas)
├── cabgrid.py          # Python prototype of BFS/DFS dispatch logic
├── comparison.py       # BFS vs Brute Force performance benchmarking
├── ui_recommendatations # UI design spec (used to revamp the frontend)
└── README.md           # This file
```

---

## 🚀 How to Run

No installation or build step required.

1. **Clone or download** the project folder
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge)
3. The simulation starts automatically

```bash
# Or serve it locally if you prefer:
npx serve .
# Then open http://localhost:3000
```

---

## 🎮 How to Use

### Dispatching a Ride
1. Select a **Pickup Location** from the first dropdown
2. Select a **Dropoff Location** from the second dropdown
3. Click **⚡ Request Ride (BFS + DFS)**
4. Watch the nearest cab get highlighted, then follow the glowing route

### Reading the Map
| Visual | Meaning |
|---|---|
| 🟢 Green cab | Idle (Ready state) |
| 🟡 Amber cab + glow | En route to pickup (Waiting state) |
| 🔵 Cyan cab + glow | Driving passenger to destination (Running state) |
| 🟡 Amber path | Remaining pickup route |
| 🔵 Cyan path | Remaining dropoff route |
| 📍 Yellow teardrop pin | Pickup location |
| 📍 Red teardrop pin | Dropoff destination |
| ✨ Cyan particles | Ambient traffic flow on all roads |

### Map Navigation
- **Scroll** → Zoom in / out (centered on cursor)
- **Click + Drag** → Pan around the city

### Admin Panel
The **Fleet Status** table updates live every frame. Active cabs (PICKUP / EN ROUTE) automatically rise to the top of the table. Idle cabs sink to the bottom.

---

## 📊 Algorithm Complexity

| Algorithm | Time Complexity | Space Complexity | Use Case |
|---|---|---|---|
| BFS (Cab Detection) | O(V + E) | O(V) | Finding nearest idle cab |
| DFS (Route Planning) | O(V + E) per path | O(V) | Exploring all possible routes |
| Brute Force (comparison.py) | O(C × (V + E)) | O(V) | Checking every cab individually |

Where:
- **V** = Number of nodes (localities) = 20
- **E** = Number of edges (roads) = 26  
- **C** = Number of cabs = 12

BFS is **C× faster** than brute force for cab detection. On the 40×40 grid in `comparison.py`, BFS processes **1,600 nodes** vs brute force checking each of **500 cabs** individually.

---

## 🔬 Python Backend Reference (`cabgrid.py`)

The Python file serves as the algorithmic backbone and prototype:

```python
# BFS finds the nearest cab
cab, distance = find_nearest_cab_bfs(graph, "Koramangala", available_cabs)

# DFS finds the optimal route
route = find_best_route_dfs(graph, "Koramangala", "Hebbal")

# OS state transitions
cab.state = CabState.WAITING   # → process enters waiting queue
cab.state = CabState.RUNNING   # → process dispatched to CPU
cab.state = CabState.READY     # → process terminated, back to pool
```

---

## 📈 Performance Benchmarking (`comparison.py`)

Run the comparison script to see BFS vs Brute Force on a large 40×40 grid graph:

```bash
python comparison.py
```

Sample output:
```
Graph: 1600 nodes | Cabs: 500

BFS Dispatch:        0.0003s  ← O(V+E), stops at first match
Brute Force:         0.1842s  ← O(C×(V+E)), checks all cabs

Speedup: 614× faster with BFS
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Deep Navy | `#070b14` | Canvas background |
| Surface | `#111827` | Panel backgrounds |
| Accent Cyan | `#38bdf8` | Roads, nodes, highlights |
| Amber | `#fbbf24` | Pickup path glow |
| Green | `#34d399` | Ready state |
| Red | `#f87171` | En Route state |
| Font | Inter + JetBrains Mono | UI + terminal |

---

## 🏆 Built For

**Flash Hack 2.0** — A hackathon demonstrating the real-world application of:
- Graph Theory (adjacency list representation)
- BFS & DFS (Design and Analysis of Algorithms)
- OS Process State Management (Operating Systems)
- Real-time canvas rendering & interactive data visualization

---

*CabGrid — Where algorithms meet the road.* 🚖⚡
