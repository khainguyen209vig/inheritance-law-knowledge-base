import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { schemaSql } from "./schema";

export type AppDatabase = Database.Database;

let applicationDatabase: AppDatabase | undefined;

export function getDatabase(): AppDatabase {
  if (applicationDatabase) {
    return applicationDatabase;
  }

  const databasePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "inheritance.db");
  mkdirSync(path.dirname(databasePath), { recursive: true });
  applicationDatabase = openDatabase(databasePath);
  return applicationDatabase;
}

export function openDatabase(databasePath: string): AppDatabase {
  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  database.pragma("journal_mode = WAL");
  database.pragma("busy_timeout = 5000");
  database.exec(schemaSql);
  return database;
}
