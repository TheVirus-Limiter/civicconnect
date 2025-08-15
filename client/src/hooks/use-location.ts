import { useState, useEffect } from "react";

export interface UserLocation {
  city?: string;
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>({});
  const [loading, setLoading] = useState(false);

  const detectLocation = async () => {
    setLoading(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Use a reverse geocoding service to get location details
      // For now, we'll use a mock implementation
      const locationData = await reverseGeocode(latitude, longitude);
      
      const newLocation: UserLocation = {
        latitude,
        longitude,
        ...locationData,
      };

      setLocation(newLocation);
      
      // Store in localStorage for persistence
      localStorage.setItem("userLocation", JSON.stringify(newLocation));
      
    } catch (error) {
      console.error("Error detecting location:", error);
      setLocation({
        error: error instanceof Error ? error.message : "Failed to detect location"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = (newLocation: Partial<UserLocation>) => {
    const updatedLocation = { ...location, ...newLocation };
    setLocation(updatedLocation);
    localStorage.setItem("userLocation", JSON.stringify(updatedLocation));
  };

  const clearLocation = () => {
    setLocation({});
    localStorage.removeItem("userLocation");
  };

  useEffect(() => {
    // Load location from localStorage on mount
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error("Error parsing saved location:", error);
        localStorage.removeItem("userLocation");
      }
    }
  }, []);

  return {
    location,
    loading,
    detectLocation,
    updateLocation,
    clearLocation,
  };
}

// Mock reverse geocoding function
// In a real implementation, you would use a service like Google Maps Geocoding API
async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<UserLocation>> {
  // Mock implementation for demonstration
  // This would typically make an API call to a geocoding service
  
  // For demo purposes, return San Francisco data if coordinates are in that area
  if (latitude >= 37.7 && latitude <= 37.8 && longitude >= -122.5 && longitude <= -122.4) {
    return {
      city: "San Francisco",
      state: "CA",
      district: "11",
    };
  }

  // For other locations, return a generic response
  return {
    city: "Unknown City",
    state: "Unknown State",
    district: "Unknown District",
  };
}
