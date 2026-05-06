import * as SQLite from 'expo-sqlite';

const DB_VERSION = 2;

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('triptracker.db');
  await migrate(db);
  return db;
}

async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        started_at INTEGER NOT NULL,
        ended_at INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        distance_miles REAL NOT NULL,
        max_speed_mph REAL NOT NULL,
        avg_speed_mph REAL NOT NULL,
        coordinates TEXT NOT NULL
      );
    `);
  }

  if (currentVersion < 2) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        destinationLat REAL NOT NULL,
        destinationLng REAL NOT NULL,
        destinationLabel TEXT,
        arrivalTime TEXT NOT NULL,
        matchRadiusMeters INTEGER DEFAULT 500,
        isActive INTEGER DEFAULT 1,
        createdAt INTEGER NOT NULL
      );
    `);

    // ALTER TABLE fails if columns already exist (crash-recovery case) — ignore each error
    const addColumns = [
      'ALTER TABLE trips ADD COLUMN routineId TEXT',
      'ALTER TABLE trips ADD COLUMN destinationLat REAL',
      'ALTER TABLE trips ADD COLUMN destinationLng REAL',
    ];
    for (const sql of addColumns) {
      try {
        await database.execAsync(sql);
      } catch {
        // column already exists — safe to ignore
      }
    }
  }

  if (currentVersion < DB_VERSION) {
    await database.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
  }
}
