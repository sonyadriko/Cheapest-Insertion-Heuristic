import requests
from config import Config

class GoogleMapsService:
    def __init__(self):
        self.api_key = Config.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api"
    
    def get_distance_matrix(self, origins, destinations):
        """
        Get distance matrix from Google Maps API
        
        Args:
            origins: List of tuples [(lat1, lng1), (lat2, lng2), ...]
            destinations: List of tuples [(lat1, lng1), (lat2, lng2), ...]
        
        Returns:
            Distance matrix in kilometers
        """
        if not self.api_key:
            raise ValueError("Google Maps API key not configured")
        
        # Format origins and destinations
        origins_str = '|'.join([f"{lat},{lng}" for lat, lng in origins])
        destinations_str = '|'.join([f"{lat},{lng}" for lat, lng in destinations])
        
        url = f"{self.base_url}/distancematrix/json"
        params = {
            'origins': origins_str,
            'destinations': destinations_str,
            'key': self.api_key,
            'mode': 'driving'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] != 'OK':
                raise Exception(f"Google Maps API error: {data['status']}")
            
            # Parse distance matrix
            matrix = []
            for row in data['rows']:
                distances = []
                for element in row['elements']:
                    if element['status'] == 'OK':
                        # Convert meters to kilometers
                        distance_km = element['distance']['value'] / 1000
                        distances.append(distance_km)
                    else:
                        distances.append(float('inf'))
                matrix.append(distances)
            
            return matrix
        
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch distance matrix: {str(e)}")
    
    def geocode_address(self, address):
        """
        Convert address to coordinates
        
        Args:
            address: String address
        
        Returns:
            Tuple (latitude, longitude)
        """
        if not self.api_key:
            raise ValueError("Google Maps API key not configured")
        
        url = f"{self.base_url}/geocode/json"
        params = {
            'address': address,
            'key': self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] != 'OK':
                raise Exception(f"Geocoding error: {data['status']}")
            
            location = data['results'][0]['geometry']['location']
            return (location['lat'], location['lng'])
        
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to geocode address: {str(e)}")
