from services.google_maps import GoogleMapsService

class CheapestInsertionHeuristic:
    def __init__(self):
        self.maps_service = GoogleMapsService()
    
    def calculate_optimal_route(self, depot_location, delivery_locations):
        """
        Calculate optimal delivery route using Cheapest Insertion Heuristic
        
        Args:
            depot_location: Tuple (lat, lng) - starting point (kurir location)
            delivery_locations: List of dicts with 'id', 'lat', 'lng'
        
        Returns:
            Dict with 'route' (ordered list of delivery IDs) and 'total_distance'
        """
        if not delivery_locations:
            return {'route': [], 'total_distance': 0}
        
        # Prepare all locations for distance matrix
        all_locations = [depot_location]
        for loc in delivery_locations:
            all_locations.append((loc['lat'], loc['lng']))
        
        # Get distance matrix from Google Maps
        distance_matrix = self.maps_service.get_distance_matrix(
            all_locations, 
            all_locations
        )
        
        # Initialize route with depot
        route_indices = [0]  # Start at depot (index 0)
        unvisited = list(range(1, len(all_locations)))  # All delivery points
        
        # Find nearest point to depot as first delivery
        if unvisited:
            nearest = min(unvisited, key=lambda i: distance_matrix[0][i])
            route_indices.append(nearest)
            unvisited.remove(nearest)
        
        # Cheapest Insertion Heuristic
        while unvisited:
            best_insertion = None
            min_cost_increase = float('inf')
            
            # For each unvisited location
            for unvisited_idx in unvisited:
                # Try inserting it at each position in the current route
                for insert_pos in range(1, len(route_indices)):
                    # Calculate cost increase
                    prev_idx = route_indices[insert_pos - 1]
                    next_idx = route_indices[insert_pos]
                    
                    # Cost of current edge
                    current_cost = distance_matrix[prev_idx][next_idx]
                    
                    # Cost if we insert the new point
                    new_cost = (distance_matrix[prev_idx][unvisited_idx] + 
                               distance_matrix[unvisited_idx][next_idx])
                    
                    cost_increase = new_cost - current_cost
                    
                    # Track best insertion
                    if cost_increase < min_cost_increase:
                        min_cost_increase = cost_increase
                        best_insertion = (unvisited_idx, insert_pos)
            
            # Also try appending at the end
            if route_indices:
                last_idx = route_indices[-1]
                cost_to_append = distance_matrix[last_idx][unvisited_idx]
                
                for unvisited_idx in unvisited:
                    if cost_to_append < min_cost_increase:
                        min_cost_increase = cost_to_append
                        best_insertion = (unvisited_idx, len(route_indices))
            
            # Insert the best point
            if best_insertion:
                idx_to_insert, position = best_insertion
                route_indices.insert(position, idx_to_insert)
                unvisited.remove(idx_to_insert)
        
        # Add return to depot
        route_indices.append(0)
        
        # Calculate total distance
        total_distance = 0
        for i in range(len(route_indices) - 1):
            total_distance += distance_matrix[route_indices[i]][route_indices[i + 1]]
        
        # Convert route indices to delivery IDs (skip depot indices)
        delivery_route = []
        for idx in route_indices:
            if idx > 0:  # Skip depot (index 0)
                delivery_route.append(delivery_locations[idx - 1]['id'])
        
        return {
            'route': delivery_route,
            'total_distance': round(total_distance, 2),
            'route_with_depot': route_indices
        }
    
    def calculate_route_distance(self, locations):
        """
        Calculate total distance for a given route
        
        Args:
            locations: List of tuples [(lat1, lng1), (lat2, lng2), ...]
        
        Returns:
            Total distance in kilometers
        """
        if len(locations) < 2:
            return 0
        
        distance_matrix = self.maps_service.get_distance_matrix(locations, locations)
        
        total_distance = 0
        for i in range(len(locations) - 1):
            total_distance += distance_matrix[i][i + 1]
        
        return round(total_distance, 2)
