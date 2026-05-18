import collections
import time
import random

# Reusing basic structures for demonstration
from cabgrid import Cab, CabState

def generate_large_grid(size):
    """Generates an NxN grid graph. size=25 means 625 nodes."""
    graph = {}
    for y in range(size):
        for x in range(size):
            node_id = y * size + x
            neighbors = []
            if x > 0: neighbors.append(node_id - 1)      # Left
            if x < size - 1: neighbors.append(node_id + 1) # Right
            if y > 0: neighbors.append(node_id - size)     # Up
            if y < size - 1: neighbors.append(node_id + size) # Down
            graph[node_id] = neighbors
    return graph

def find_nearest_cab_bfs(graph, pickup_node, cabs):
    """BFS traversal to find the nearest cab."""
    node_to_cabs = collections.defaultdict(list)
    for cab in cabs:
        if cab.state == CabState.READY:
            node_to_cabs[cab.current_node].append(cab)

    visited = set([pickup_node])
    queue = collections.deque([pickup_node])

    while queue:
        current_node = queue.popleft()
        
        if current_node in node_to_cabs and len(node_to_cabs[current_node]) > 0:
            return node_to_cabs[current_node][0]
            
        for neighbor in graph.get(current_node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                
    return None

def get_distance_bfs(graph, start, end):
    """Helper for brute force: finds distance between two specific nodes."""
    if start == end: return 0
    visited = set([start])
    queue = collections.deque([(start, 0)])
    while queue:
        curr, dist = queue.popleft()
        if curr == end: return dist
        for n in graph.get(curr, []):
            if n not in visited:
                visited.add(n)
                queue.append((n, dist + 1))
    return float('inf')

def find_nearest_cab_brute_force(graph, pickup_node, cabs, size):
    """
    Brute force: iterate through ALL cabs, calculate actual path distance in the graph 
    (simulated by running a shortest-path check per cab).
    """
    nearest_cab = None
    min_dist = float('inf')
    
    for cab in cabs:
        if cab.state == CabState.READY:
            # In a true graph, brute force means finding the path distance for EVERY cab.
            # This requires running a pathfinding algorithm for each one.
            dist = get_distance_bfs(graph, pickup_node, cab.current_node)
            
            if dist < min_dist:
                min_dist = dist
                nearest_cab = cab
                
    return nearest_cab

if __name__ == "__main__":
    print("Generating large grid graph...")
    GRID_SIZE = 40  # 40x40 = 1600 nodes
    large_graph = generate_large_grid(GRID_SIZE)
    
    NUM_CABS = 500
    print(f"Spawning {NUM_CABS} cabs...")
    cabs = []
    for i in range(NUM_CABS):
        # Spawn cab at random node
        cabs.append(Cab(cab_id=i, initial_node=random.randint(0, (GRID_SIZE*GRID_SIZE)-1)))

    pickup_node = (GRID_SIZE*GRID_SIZE) // 2 # Center of the grid
    
    print("\n--- Performance Comparison ---")
    
    # 1. Brute Force
    start_time = time.perf_counter()
    # Run multiple times to magnify difference
    for _ in range(100):
        c1 = find_nearest_cab_brute_force(large_graph, pickup_node, cabs, GRID_SIZE)
    bf_time = (time.perf_counter() - start_time) * 1000 # in ms
    print(f"Brute Force Time (100 runs): {bf_time:.2f} ms")
    
    # 2. BFS
    start_time = time.perf_counter()
    for _ in range(100):
        c2 = find_nearest_cab_bfs(large_graph, pickup_node, cabs)
    bfs_time = (time.perf_counter() - start_time) * 1000 # in ms
    print(f"BFS Traversal Time (100 runs): {bfs_time:.2f} ms")
    
    if bfs_time > 0:
        print(f"\nResult: BFS is {bf_time / bfs_time:.2f}x faster than Brute Force.")
    else:
        print("\nResult: BFS is significantly faster.")
