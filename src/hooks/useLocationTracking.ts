import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types/trip';

interface Options {
  isTracking: boolean;
  onUpdate: (coord: Coordinate, speedMph: number) => void;
}

interface LocationTracking {
  currentLocation: Location.LocationObject | null;
  hasPermission: boolean;
}

export function useLocationTracking({ isTracking, onUpdate }: Options): LocationTracking {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isTracking && hasPermission) {
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
        timeInterval: 1000,
        distanceInterval: 3,
      },
      (location) => {
        setCurrentLocation(location);
        const coord: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        const rawSpeed = location.coords.speed ?? 0;
        onUpdateRef.current(coord, Math.max(0, rawSpeed) * 2.237);
      }
    );
  }

  function stopTracking() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }

  return { currentLocation, hasPermission };
}
