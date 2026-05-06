import { Coordinate } from '../types/trip';
import { Routine } from '../types/routine';
import { haversineDistanceMiles } from './tripUtils';

const MILES_TO_METERS = 1609.34;

export function matchTripToRoutine(
  coordinates: Coordinate[],
  routines: Routine[]
): Routine | null {
  if (coordinates.length === 0 || routines.length === 0) return null;

  // Use centroid of the last 5 coordinates to smooth out GPS drift
  const tail = coordinates.slice(-5);
  const centroid: Coordinate = {
    latitude: tail.reduce((sum, c) => sum + c.latitude, 0) / tail.length,
    longitude: tail.reduce((sum, c) => sum + c.longitude, 0) / tail.length,
  };

  for (const routine of routines) {
    if (!routine.isActive) continue;

    const dest: Coordinate = {
      latitude: routine.destinationLat,
      longitude: routine.destinationLng,
    };

    const distanceMeters = haversineDistanceMiles(centroid, dest) * MILES_TO_METERS;

    if (distanceMeters <= routine.matchRadiusMeters) {
      return routine;
    }
  }

  return null;
}
