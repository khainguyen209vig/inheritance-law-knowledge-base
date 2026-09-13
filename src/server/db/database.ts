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
  migrateModuleResultValues(database);
  migrateInferenceSubjects(database);
  database.prepare("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (4, ?)")
    .run(new Date().toISOString());
  migrateFactRevisions(database);
  return database;
}

function migrateFactRevisions(database: AppDatabase): void {
  const caseColumns = database.pragma("table_info(cases)") as Array<{ name: string }>;
  if (!caseColumns.some((column) => column.name === "facts_revision")) {
    database.exec("ALTER TABLE cases ADD COLUMN facts_revision INTEGER NOT NULL DEFAULT 0");
  }
  const runColumns = database.pragma("table_info(inference_runs)") as Array<{ name: string }>;
  if (!runColumns.some((column) => column.name === "facts_revision")) {
    database.exec("ALTER TABLE inference_runs ADD COLUMN facts_revision INTEGER NOT NULL DEFAULT 0");
  }
  database.prepare("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (5, ?)")
    .run(new Date().toISOString());
}

function migrateModuleResultValues(database: AppDatabase): void {
  const row = database.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'module_results'").get() as
    | { sql: string }
    | undefined;
  if (row?.sql.includes("CHECK (value IN")) {
    database.pragma("foreign_keys = OFF");
    try {
      database.exec(`
        BEGIN;
        ALTER TABLE module_results RENAME TO module_results_v1;
        CREATE TABLE module_results (
          id INTEGER PRIMARY KEY,
          run_id TEXT NOT NULL REFERENCES inference_runs(id) ON DELETE CASCADE,
          subject TEXT NOT NULL DEFAULT '',
          predicate TEXT NOT NULL,
          value TEXT NOT NULL,
          derivations_json TEXT NOT NULL
        ) STRICT;
        INSERT INTO module_results (id, run_id, predicate, value, derivations_json)
          SELECT id, run_id, predicate, value, derivations_json FROM module_results_v1;
        DROP TABLE module_results_v1;
        COMMIT;
      `);
    } catch (error) {
      if (database.inTransaction) database.exec("ROLLBACK");
      throw error;
    } finally {
      database.pragma("foreign_keys = ON");
    }
  }
  database.prepare("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (2, ?)")
    .run(new Date().toISOString());
}

function migrateInferenceSubjects(database: AppDatabase): void {
  for (const table of ["module_results", "missing_requirements", "inference_traces"] as const) {
    const columns = database.pragma(`table_info(${table})`) as Array<{ name: string }>;
    if (!columns.some((column) => column.name === "subject")) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN subject TEXT NOT NULL DEFAULT ''`);
    }
  }
  database.prepare("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (3, ?)")
    .run(new Date().toISOString());
}
