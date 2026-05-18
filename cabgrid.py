import collections
import random
import time
import networkx as nx
import matplotlib.pyplot as plt

# --- OS Process State Enums for Cab ---
class CabState:
    NEW = "New"                 # Initialized
    READY = "Ready"             # Available for dispatch (IDLE)
    WAITING = "Waiting"         # Dispatched, waiting to reach pickup (DISPATCHED)
    RUNNING = "Running"         # Passenger picked up, en route to dropoff (EN_ROUTE)
    TERMINATED = "Terminated"   # Ride complete (COMPLETED, transitioning back to Ready)

class Cab:
    def __init__(self, cab_id, initial_node):
        self.cab_id = cab_id
        self.current_node = initial_node
        self.state = CabState.NEW
        self.log_transition(CabState.READY) # Move immediately to Ready pool
        
    def log_transition(self, new_state):
        print(f"[Cab {self.cab_id}] State Transition: {self.state} -> {new_state}")
        self.state = new_state

# --- City Graph Model ---
# 20 Nodes (0 to 19) representing intersections.
city_graph = {
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
}

# --- Algorithms ---

def find_nearest_cab_bfs(graph, pickup_node, available_cabs):
    """
    Uses BFS to find the nearest available cab starting from pickup_node.
    Returns the nearest Cab object or None if no cab is available.
    """
    # Map nodes to cabs for quick O(1) lookup during BFS
    node_to_cabs = collections.defaultdict(list)
    for cab in available_cabs:
        if cab.state == CabState.READY:
            node_to_cabs[cab.current_node].append(cab)

    visited = set([pickup_node])
    queue = collections.deque([(pickup_node, 0)]) # (node, distance)

    while queue:
        current_node, distance = queue.popleft()
        
        # Check if there's an available cab at this node
        if current_node in node_to_cabs and len(node_to_cabs[current_node]) > 0:
            return node_to_cabs[current_node][0], distance # Return the first available cab
            
        # Explore neighbors
        for neighbor in graph.get(current_node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))
                
    return None, -1

def explore_routes_dfs(graph, start_node, end_node):
    """
    Uses DFS to find multiple paths and selects the shortest one.
    """
    all_paths = []
    
    def dfs(current, target, path, visited):
        if len(all_paths) > 500 or len(path) > 12:
            return
            
        visited.add(current)
        path.append(current)
        
        if current == target:
            all_paths.append(list(path))
        else:
            for neighbor in graph.get(current, []):
                if neighbor not in visited:
                    dfs(neighbor, target, path, visited)
                    
        path.pop()
        visited.remove(current)
        
    dfs(start_node, end_node, [], set())
    
    if not all_paths:
        return None
        
    all_paths.sort(key=len)
    return all_paths[0]

# --- Main Dispatch Logic ---

def request_ride(pickup, dropoff, all_cabs):
    print(f"\n{'='*50}")
    print(f"RIDE REQUEST: Pickup at Node {pickup} -> Dropoff at Node {dropoff}")
    print(f"{'='*50}")
    
    # 1. DAA: Use BFS to find nearest cab
    print("\n[System] Searching for nearest cab using BFS...")
    nearest_cab, distance = find_nearest_cab_bfs(city_graph, pickup, all_cabs)
    
    if not nearest_cab:
        print("[System] No cabs are currently available (Ready). Please wait.")
        return
        
    print(f"[System] Found nearest Cab {nearest_cab.cab_id} at Node {nearest_cab.current_node} (Distance: {distance} hops)")
    
    # 2. OS: Cab transitions from READY -> WAITING (Dispatched to pickup)
    nearest_cab.log_transition(CabState.WAITING)
    
    # 3. DAA: Use DFS to explore route to dropoff
    print("\n[System] Exploring route using DFS...")
    route = explore_routes_dfs(city_graph, pickup, dropoff)
    if route:
        print(f"[System] Proposed Route found: {' -> '.join(map(str, route))}")
    else:
        print("[System] Error: No route found to dropoff.")
        return
        
    # 4. OS: Cab arrives at pickup, transitions from WAITING -> RUNNING
    nearest_cab.current_node = pickup # Simulate moving to pickup
    print(f"[System] Cab {nearest_cab.cab_id} arrived at pickup.")
    nearest_cab.log_transition(CabState.RUNNING)
    
    # Simulate time passing for the ride
    print(f"[System] Cab {nearest_cab.cab_id} is EN ROUTE along path: {route}...")
    time.sleep(1) # brief pause for simulation effect
    
    # 5. OS: Cab reaches dropoff, transitions RUNNING -> TERMINATED -> READY
    nearest_cab.current_node = dropoff
    print(f"[System] Cab {nearest_cab.cab_id} arrived at dropoff (Node {dropoff}).")
    nearest_cab.log_transition(CabState.TERMINATED)
    
    # Reset for next ride
    nearest_cab.log_transition(CabState.READY)
    print(f"[System] Cab {nearest_cab.cab_id} is now available at Node {dropoff}.")


def visualize_graph(graph, all_cabs):
    print("\n[System] Generating graph visualization using NetworkX...")
    G = nx.Graph()
    for node, neighbors in graph.items():
        for neighbor in neighbors:
            G.add_edge(node, neighbor)
            
    cab_nodes = [cab.current_node for cab in all_cabs if cab.state == CabState.READY]
    
    color_map = []
    for node in G:
        if node in cab_nodes:
            color_map.append('lightgreen')
        else:
            color_map.append('lightblue')
            
    plt.figure(figsize=(12, 10))
    pos = nx.spring_layout(G, seed=42) # Consistent layout
    nx.draw(G, pos, with_labels=True, node_color=color_map, node_size=2000, 
            font_size=9, font_weight="bold", edge_color="gray")
    
    plt.title("CabGrid City Map (Green = Available Cabs)")
    # Save the figure so it doesn't block simulation, or we can use plt.show(block=False)
    plt.savefig("cabgrid_map.png")
    print("[System] Visualization saved to 'cabgrid_map.png'.")
    plt.close()


if __name__ == "__main__":
    print("Initializing CabGrid Dispatch System...\n")
    
    # Initialize 5 cabs scattered across the city
    cabs = [
        Cab(cab_id=1, initial_node="Koramangala"),
        Cab(cab_id=2, initial_node="Indiranagar"),
        Cab(cab_id=3, initial_node="Majestic"),
        Cab(cab_id=4, initial_node="Vijayanagar"),
        Cab(cab_id=5, initial_node="Bellandur")
    ]
    
    print("\n--- Starting Simulation ---")
    visualize_graph(city_graph, cabs)
    
    # Simulate Ride 1
    request_ride(pickup="Basavanagudi", dropoff="BTM Layout", all_cabs=cabs)
    
    # Simulate Ride 2 (from a different location)
    request_ride(pickup="Jayanagar", dropoff="Banashankari", all_cabs=cabs)
    
    # Simulate Ride 3
    request_ride(pickup="Electronic City", dropoff="Koramangala", all_cabs=cabs)
    
    print("\nSimulation Complete.")
