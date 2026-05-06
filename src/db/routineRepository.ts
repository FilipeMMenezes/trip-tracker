import { getDatabase } from './database';
import { Routine } from '../types/routine';

interface RoutineRow {
  id: string;
  name: string;
  destinationLat: number;
  destinationLng: number;
  destinationLabel: string | null;
  arrivalTime: string;
  matchRadiusMeters: number;
  isActive: number;
  createdAt: number;
}

function rowToRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    name: row.name,
    destinationLat: row.destinationLat,
    destinationLng: row.destinationLng,
    destinationLabel: row.destinationLabel ?? undefined,
    arrivalTime: row.arrivalTime,
    matchRadiusMeters: row.matchRadiusMeters,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  };
}

export async function saveRoutine(routine: Routine): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO routines
       (id, name, destinationLat, destinationLng, destinationLabel,
        arrivalTime, matchRadiusMeters, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    routine.id,
    routine.name,
    routine.destinationLat,
    routine.destinationLng,
    routine.destinationLabel ?? null,
    routine.arrivalTime,
    routine.matchRadiusMeters,
    routine.isActive ? 1 : 0,
    routine.createdAt
  );
}

export async function getAllRoutines(): Promise<Routine[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RoutineRow>(
    'SELECT * FROM routines ORDER BY createdAt DESC'
  );
  return rows.map(rowToRoutine);
}

export async function getRoutineById(id: string): Promise<Routine | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RoutineRow>(
    'SELECT * FROM routines WHERE id = ?',
    id
  );
  return row ? rowToRoutine(row) : null;
}

export async function updateRoutine(
  id: string,
  updates: Partial<Omit<Routine, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.destinationLat !== undefined) { fields.push('destinationLat = ?'); values.push(updates.destinationLat); }
  if (updates.destinationLng !== undefined) { fields.push('destinationLng = ?'); values.push(updates.destinationLng); }
  if (updates.destinationLabel !== undefined) { fields.push('destinationLabel = ?'); values.push(updates.destinationLabel ?? null); }
  if (updates.arrivalTime !== undefined) { fields.push('arrivalTime = ?'); values.push(updates.arrivalTime); }
  if (updates.matchRadiusMeters !== undefined) { fields.push('matchRadiusMeters = ?'); values.push(updates.matchRadiusMeters); }
  if (updates.isActive !== undefined) { fields.push('isActive = ?'); values.push(updates.isActive ? 1 : 0); }

  if (fields.length === 0) return;

  await db.runAsync(
    `UPDATE routines SET ${fields.join(', ')} WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteRoutine(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM routines WHERE id = ?', id);
}
