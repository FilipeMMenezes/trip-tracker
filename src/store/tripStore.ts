import { create } from 'zustand';
import { Coordinate } from '../types/trip';

interface ActiveTrip {
  startedAt: number;
  coordinates: Coordinate[];
  maxSpeedMph: number;
  speedSamples: number[];
}

interface TripStore {
  isTracking: boolean;
  activeTrip: ActiveTrip | null;
  currentSpeedMph: number;
  elapsedSeconds: number;

  startTrip: () => void;
  stopTrip: () => ActiveTrip | null;
  addLocation: (coord: Coordinate, speedMph: number) => void;
  tick: () => void;
}

export const useTripStore = create<TripStore>((set, get) => ({
  isTracking: false,
  activeTrip: null,
  currentSpeedMph: 0,
  elapsedSeconds: 0,

  startTrip: () => {
    set({
      isTracking: true,
      activeTrip: {
        startedAt: Date.now(),
        coordinates: [],
        maxSpeedMph: 0,
        speedSamples: [],
      },
      currentSpeedMph: 0,
      elapsedSeconds: 0,
    });
  },

  stopTrip: () => {
    const { activeTrip } = get();
    set({ isTracking: false, activeTrip: null, currentSpeedMph: 0 });
    return activeTrip;
  },

  addLocation: (coord, speedMph) => {
    set((state) => {
      if (!state.activeTrip) return state;
      return {
        currentSpeedMph: speedMph,
        activeTrip: {
          ...state.activeTrip,
          coordinates: [...state.activeTrip.coordinates, coord],
          maxSpeedMph: Math.max(state.activeTrip.maxSpeedMph, speedMph),
          speedSamples: [...state.activeTrip.speedSamples, speedMph],
        },
      };
    });
  },

  tick: () => {
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
  },
}));
