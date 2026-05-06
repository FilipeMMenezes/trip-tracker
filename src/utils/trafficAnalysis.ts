import { Trip } from '../types/trip';
import { Routine, DepartureRecommendation } from '../types/routine';

const UNLOCK_THRESHOLD = 10;
const BUCKET_MINUTES = 15;

export function analyzeRoutine(
  routine: Routine,
  trips: Trip[]
): DepartureRecommendation {
  const routineTrips = trips.filter((t) => t.routineId === routine.id);
  const count = routineTrips.length;

  if (count < UNLOCK_THRESHOLD) {
    return {
      suggestedDepartureTime: routine.arrivalTime,
      avgDurationMinutes: 0,
      confidence: 'low',
      basedOnTrips: count,
      unlocked: false,
      tripsUntilUnlock: UNLOCK_THRESHOLD - count,
    };
  }

  // Group trip durations by 15-minute departure bucket (local time)
  const bucketMap = new Map<number, number[]>();

  for (const trip of routineTrips) {
    const d = new Date(trip.startedAt);
    const totalMinutes = d.getHours() * 60 + d.getMinutes();
    const bucket = Math.round(totalMinutes / BUCKET_MINUTES) * BUCKET_MINUTES;
    const durationMinutes = trip.durationSeconds / 60;

    const existing = bucketMap.get(bucket);
    if (existing) {
      existing.push(durationMinutes);
    } else {
      bucketMap.set(bucket, [durationMinutes]);
    }
  }

  const [ah, am] = routine.arrivalTime.split(':').map(Number);
  const arrivalMinutes = ah * 60 + am;

  // Find the latest bucket whose estimated arrival <= target arrival
  let bestBucket: number | null = null;
  let bestAvgDuration = 0;

  for (const [bucket, durations] of bucketMap.entries()) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const estimatedArrival = bucket + avgDuration;

    if (estimatedArrival <= arrivalMinutes) {
      if (bestBucket === null || bucket > bestBucket) {
        bestBucket = bucket;
        bestAvgDuration = avgDuration;
      }
    }
  }

  // Fallback: if no bucket arrives on time, pick the latest departure bucket overall
  if (bestBucket === null) {
    for (const [bucket, durations] of bucketMap.entries()) {
      if (bestBucket === null || bucket > bestBucket) {
        bestBucket = bucket;
        bestAvgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      }
    }
  }

  const bh = Math.floor(bestBucket! / 60) % 24;
  const bm = bestBucket! % 60;
  const suggestedDepartureTime = `${bh.toString().padStart(2, '0')}:${bm.toString().padStart(2, '0')}`;

  const confidence: DepartureRecommendation['confidence'] =
    count >= 25 ? 'high' : count >= 15 ? 'medium' : 'low';

  return {
    suggestedDepartureTime,
    avgDurationMinutes: bestAvgDuration,
    confidence,
    basedOnTrips: count,
    unlocked: true,
    tripsUntilUnlock: 0,
  };
}
