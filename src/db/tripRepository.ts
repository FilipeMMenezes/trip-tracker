import { getDatabase } from './database';
import { Trip, Coordinate } from '../types/trip';

interface TripRow {
  id: string;
  started_at: number;
  ended_at: number;
  duration_seconds: number;
  distance_miles: number;
  max_speed_mph: number;
  avg_speed_mph: number;
  coordinates: string;
}

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    distanceMiles: row.distance_miles,
    maxSpeedMph: row.max_speed_mph,
    avgSpeedMph: row.avg_speed_mph,
    coordinates: JSON.parse(row.coordinates) as Coordinate[],
  };
}

export async function saveTrip(trip: Trip): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO trips
       (id, started_at, ended_at, duration_seconds, distance_miles, max_speed_mph, avg_speed_mph, coordinates)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    trip.id,
    trip.startedAt,
    trip.endedAt,
    trip.durationSeconds,
    trip.distanceMiles,
    trip.maxSpeedMph,
    trip.avgSpeedMph,
    JSON.stringify(trip.coordinates)
  );
}

export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripRow>(
    'SELECT * FROM trips ORDER BY started_at DESC'
  );
  return rows.map(rowToTrip);
}

export async function getTripById(id: string): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>(
    'SELECT * FROM trips WHERE id = ?',
    id
  );
  return row ? rowToTrip(row) : null;
}

export async function deleteTrip(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM trips WHERE id = ?', id);
}
