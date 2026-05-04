import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types/trip';

interface LocationTracking {
  coordinates: Coordinate[];
  currentLocation: Location.LocationObject | null;
  currentSpeed: number; // mph
  hasPermission: boolean;
}

export function useLocationTracking(isTracking: boolean): LocationTracking {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Ask for foreground location permission once on mount.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Start/stop the GPS subscription whenever the tracking flag or permission changes.
  useEffect(() => {
    if (isTracking && hasPermission) {
      setCoordinates([]);
      setCurrentSpeed(0);
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isTracking, hasPermission]);

  async function startTracking() {
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,   // at most one update per second
        distanceInterval: 3,  // or every 3 meters, whichever comes first
      },
      (location) => {
        const coord: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentLocation(location);
        setCoordinates((prev) => [...prev, coord]);

        // expo-location reports speed in m/s (null when unavailable).
        const rawSpeed = location.coords.speed ?? 0;
        setCurrentSpeed(Math.max(0, rawSpeed) * 2.237); // m/s → mph
      }
    );
  }

  function stopTracking() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setCurrentSpeed(0);
  }

  return { coordinates, currentLocation, currentSpeed, hasPermission };
}
