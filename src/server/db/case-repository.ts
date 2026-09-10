import { randomUUID } from "node:crypto";
import type { ReplaceCaseFactsInput } from "@/domain/case";
import { willFactSchema, type WillValidityRequest } from "@/domain/will-validity";
import type { InferenceOutput, InferenceValue } from "@/server/clips/types";
import type { AppDatabase } from "./database";

export const KNOWLEDGE_BASE_VERSION = "will-validity-rb01-rb09-v1";

export class CaseNotFoundError extends Error {}
export class InferenceRunNotFoundError extends Error {}

export interface StoredCase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  facts: Array<WillValidityRequest["facts"][number] & { subject: string }>;
}

export interface StoredInferenceRun extends InferenceOutput {
  id: string;
  caseId: string;
  module: "will-validity";
  subject: string;
  knowledgeBaseVersion: string;
  inputSnapshot: WillValidityRequest["facts"];
  createdAt: string;
}

interface CaseRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface FactRow {
  fact_id: string;
  subject: string;
  predicate: string;
  value_json: string;
}

interface RunRow {
  id: string;
  case_id: string;
  module: string;
  subject: string;
  knowledge_base_version: string;
  input_snapshot_json: string;
  created_at: string;
}

export class CaseRepository {
  constructor(private readonly database: AppDatabase) {}

  createCase(input: { id?: string; title: string }): StoredCase {
    const id = input.id ?? `case-${randomUUID()}`;
    const now = new Date().toISOString();
    this.database
      .prepare("INSERT INTO cases (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run(id, input.title, now, now);
    return { id, title: input.title, createdAt: now, updatedAt: now, facts: [] };
  }

  getCase(caseId: string): StoredCase {
    const row = this.database
      .prepare("SELECT id, title, created_at, updated_at FROM cases WHERE id = ?")
      .get(caseId) as CaseRow | undefined;
    if (!row) throw new CaseNotFoundError(caseId);

    const facts = this.database
      .prepare("SELECT fact_id, subject, predicate, value_json FROM asserted_facts WHERE case_id = ? ORDER BY fact_id")
      .all(caseId) as FactRow[];

    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      facts: facts.map((fact) => ({
        ...willFactSchema.parse({
          id: fact.fact_id,
          predicate: fact.predicate,
          value: JSON.parse(fact.value_json) as unknown,
        }),
        subject: fact.subject,
      })),
    };
  }

  replaceFacts(caseId: string, input: ReplaceCaseFactsInput): StoredCase {
    const replace = this.database.transaction(() => {
      this.assertCaseExists(caseId);
      const now = new Date().toISOString();
      this.database.prepare("DELETE FROM asserted_facts WHERE case_id = ?").run(caseId);
      const insert = this.database.prepare(`
        INSERT INTO asserted_facts
          (case_id, fact_id, subject, predicate, value_json, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'user', ?, ?)
      `);
      for (const fact of input.facts) {
        insert.run(caseId, fact.id, input.subject, fact.predicate, JSON.stringify(fact.value), now, now);
      }
      this.database.prepare("UPDATE cases SET updated_at = ? WHERE id = ?").run(now, caseId);
    });
    replace();
    return this.getCase(caseId);
  }

  getFactsForSubject(caseId: string, subject: string): WillValidityRequest["facts"] {
    this.assertCaseExists(caseId);
    const rows = this.database
      .prepare("SELECT fact_id, subject, predicate, value_json FROM asserted_facts WHERE case_id = ? AND subject = ? ORDER BY fact_id")
      .all(caseId, subject) as FactRow[];
    return rows.map((row) =>
      willFactSchema.parse({
        id: row.fact_id,
        predicate: row.predicate,
        value: JSON.parse(row.value_json) as unknown,
      }),
    );
  }

  saveInferenceRun(input: {
    caseId: string;
    subject: string;
    facts: WillValidityRequest["facts"];
    output: InferenceOutput;
  }): StoredInferenceRun {
    const runId = `run-${randomUUID()}`;
    const createdAt = new Date().toISOString();

    const save = this.database.transaction(() => {
      this.assertCaseExists(input.caseId);
      this.database.prepare(`
        INSERT INTO inference_runs
          (id, case_id, module, subject, knowledge_base_version, input_snapshot_json, created_at)
        VALUES (?, ?, 'will-validity', ?, ?, ?, ?)
      `).run(
        runId,
        input.caseId,
        input.subject,
        KNOWLEDGE_BASE_VERSION,
        JSON.stringify(input.facts),
        createdAt,
      );

      const insertResult = this.database.prepare(`
        INSERT INTO module_results (run_id, predicate, value, derivations_json)
        VALUES (?, ?, ?, ?)
      `);
      for (const result of input.output.results) {
        insertResult.run(runId, result.predicate, result.value, JSON.stringify(result.derivations));
      }

      const insertMissing = this.database.prepare(`
        INSERT INTO missing_requirements (run_id, predicate) VALUES (?, ?)
      `);
      for (const missing of input.output.missing) {
        insertMissing.run(runId, missing.predicate);
      }

      const insertTrace = this.database.prepare(`
        INSERT INTO inference_traces
          (run_id, rule_id, conclusion_predicate, conclusion_value, supports_json)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const trace of input.output.traces) {
        insertTrace.run(
          runId,
          trace.ruleId,
          trace.conclusionPredicate,
          trace.conclusionValue,
          JSON.stringify(trace.supports),
        );
      }
    });
    save();
    return this.getInferenceRun(input.caseId, runId);
  }

  getInferenceRun(caseId: string, runId: string): StoredInferenceRun {
    const run = this.database.prepare(`
      SELECT id, case_id, module, subject, knowledge_base_version, input_snapshot_json, created_at
      FROM inference_runs WHERE id = ? AND case_id = ?
    `).get(runId, caseId) as RunRow | undefined;
    if (!run || run.module !== "will-validity") throw new InferenceRunNotFoundError(runId);

    const results = this.database.prepare(`
      SELECT predicate, value, derivations_json FROM module_results WHERE run_id = ? ORDER BY id
    `).all(runId) as Array<{ predicate: string; value: InferenceValue; derivations_json: string }>;
    const missing = this.database.prepare(`
      SELECT predicate FROM missing_requirements WHERE run_id = ? ORDER BY id
    `).all(runId) as Array<{ predicate: string }>;
    const traces = this.database.prepare(`
      SELECT rule_id, conclusion_predicate, conclusion_value, supports_json
      FROM inference_traces WHERE run_id = ? ORDER BY id
    `).all(runId) as Array<{
      rule_id: string;
      conclusion_predicate: string;
      conclusion_value: string;
      supports_json: string;
    }>;

    return {
      id: run.id,
      caseId: run.case_id,
      module: "will-validity",
      subject: run.subject,
      knowledgeBaseVersion: run.knowledge_base_version,
      inputSnapshot: JSON.parse(run.input_snapshot_json) as WillValidityRequest["facts"],
      createdAt: run.created_at,
      results: results.map((result) => ({
        caseId: run.case_id,
        subject: run.subject,
        module: "will-validity",
        predicate: result.predicate,
        value: result.value,
        derivations: JSON.parse(result.derivations_json) as string[],
      })),
      missing: missing.map((item) => ({
        caseId: run.case_id,
        subject: run.subject,
        module: "will-validity",
        predicate: item.predicate,
      })),
      traces: traces.map((trace) => ({
        caseId: run.case_id,
        subject: run.subject,
        ruleId: trace.rule_id,
        conclusionPredicate: trace.conclusion_predicate,
        conclusionValue: trace.conclusion_value,
        supports: JSON.parse(trace.supports_json) as string[],
      })),
    };
  }

  private assertCaseExists(caseId: string): void {
    const exists = this.database.prepare("SELECT 1 FROM cases WHERE id = ?").get(caseId);
    if (!exists) throw new CaseNotFoundError(caseId);
  }
}
