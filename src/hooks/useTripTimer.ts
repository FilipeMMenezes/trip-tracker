import { useEffect, useRef } from 'react';
import { useTripStore } from '../store/tripStore';

export function useTripTimer(): void {
  const isTracking = useTripStore((s) => s.isTracking);
  const tick = useTripStore((s) => s.tick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking, tick]);
}
