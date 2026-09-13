export const schemaSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS asserted_facts (
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fact_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL,
  value_json TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (case_id, fact_id)
) STRICT;

CREATE INDEX IF NOT EXISTS asserted_facts_case_subject_idx
  ON asserted_facts(case_id, subject);

CREATE TABLE IF NOT EXISTS inference_runs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  module TEXT NOT NULL,
  subject TEXT NOT NULL,
  knowledge_base_version TEXT NOT NULL,
  input_snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS inference_runs_case_idx
  ON inference_runs(case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS module_results (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES inference_runs(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL,
  value TEXT NOT NULL,
  derivations_json TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS missing_requirements (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES inference_runs(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS inference_traces (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES inference_runs(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  conclusion_predicate TEXT NOT NULL,
  conclusion_value TEXT NOT NULL,
  supports_json TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS guided_sessions (
  case_id TEXT PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  completed_step_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

INSERT OR IGNORE INTO schema_migrations (version, applied_at)
VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
`;
