export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  distanceMiles: number;
  maxSpeedMph: number;
  avgSpeedMph: number;
  coordinates: Coordinate[];
  routineId?: string;
  destinationLat?: number;
  destinationLng?: number;
}
