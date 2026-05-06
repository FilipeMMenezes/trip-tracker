export interface Routine {
  id: string;
  name: string;
  destinationLat: number;
  destinationLng: number;
  destinationLabel?: string;
  arrivalTime: string; // "HH:MM" 24h
  matchRadiusMeters: number;
  isActive: boolean;
  createdAt: number;
  tripCount?: number; // computed
  recommendation?: DepartureRecommendation;
}

export interface DepartureRecommendation {
  suggestedDepartureTime: string; // "HH:MM"
  avgDurationMinutes: number;
  confidence: 'low' | 'medium' | 'high';
  basedOnTrips: number;
  unlocked: boolean;
  tripsUntilUnlock: number; // 10 - tripCount when locked
}
