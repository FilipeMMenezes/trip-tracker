import { useEffect, useRef, useState } from 'react';

/**
 * Returns the number of seconds elapsed since tracking started.
 * Resets to 0 whenever isTracking flips from false → true.
 */
export function useTripTimer(isTracking: boolean): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTracking) {
      setElapsedSeconds(0);
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking]);

  return elapsedSeconds;
}
