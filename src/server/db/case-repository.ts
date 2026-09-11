import { randomUUID } from "node:crypto";
import { caseFactSchema, type ReplaceCaseFactsInput } from "@/domain/case";
import { willFactSchema, type WillValidityRequest } from "@/domain/will-validity";
import type { InferenceOutput, ModuleResultValue } from "@/server/clips/types";
import type { AppDatabase } from "./database";

export const KNOWLEDGE_BASE_VERSION = "will-validity-rb01-rb09-v1";

export class CaseNotFoundError extends Error {}
export class InferenceRunNotFoundError extends Error {}

export interface StoredCase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  facts: Array<ReplaceCaseFactsInput["facts"][number] & { subject: string }>;
}

export interface StoredResultSummary {
  predicate: string;
  value: ModuleResultValue;
}

export interface StoredInferenceRunSummary {
  id: string;
  caseId: string;
  module: string;
  subject: string;
  knowledgeBaseVersion: string;
  createdAt: string;
  results: StoredResultSummary[];
}

export interface StoredCaseSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  factCount: number;
  runCount: number;
  latestRun?: StoredInferenceRunSummary;
}

export interface StoredInferenceRun extends InferenceOutput {
  id: string;
  caseId: string;
  module: string;
  subject: string;
  knowledgeBaseVersion: string;
  inputSnapshot: Array<ReplaceCaseFactsInput["facts"][number] & { subject?: string }>;
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

interface RunSummaryRow extends Omit<RunRow, "input_snapshot_json"> {
  result_predicate: string | null;
  result_value: ModuleResultValue | null;
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

  listCases(): StoredCaseSummary[] {
    const rows = this.database.prepare(`
      SELECT
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        (SELECT COUNT(*) FROM asserted_facts af WHERE af.case_id = c.id) AS fact_count,
        (SELECT COUNT(*) FROM inference_runs ir_count WHERE ir_count.case_id = c.id) AS run_count,
        ir.id AS run_id,
        ir.module AS run_module,
        ir.subject AS run_subject,
        ir.knowledge_base_version AS run_knowledge_base_version,
        ir.created_at AS run_created_at
      FROM cases c
      LEFT JOIN inference_runs ir ON ir.id = (
        SELECT latest.id
        FROM inference_runs latest
        WHERE latest.case_id = c.id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      )
      ORDER BY c.updated_at DESC, c.id
    `).all() as Array<CaseRow & {
      fact_count: number;
      run_count: number;
      run_id: string | null;
      run_module: string | null;
      run_subject: string | null;
      run_knowledge_base_version: string | null;
      run_created_at: string | null;
    }>;

    return rows.map((row) => {
      const latestRun = row.run_id && row.run_module && row.run_subject && row.run_knowledge_base_version && row.run_created_at
        ? {
            id: row.run_id,
            caseId: row.id,
            module: row.run_module,
            subject: row.run_subject,
            knowledgeBaseVersion: row.run_knowledge_base_version,
            createdAt: row.run_created_at,
            results: this.getResultSummaries(row.run_id),
          }
        : undefined;
      return {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        factCount: row.fact_count,
        runCount: row.run_count,
        latestRun,
      };
    });
  }

  updateCaseTitle(caseId: string, title: string): StoredCase {
    this.assertCaseExists(caseId);
    const now = new Date().toISOString();
    this.database.prepare("UPDATE cases SET title = ?, updated_at = ? WHERE id = ?").run(title, now, caseId);
    return this.getCase(caseId);
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
        ...caseFactSchema.parse({
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
        insert.run(caseId, fact.id, fact.subject ?? input.subject, fact.predicate, JSON.stringify(fact.value), now, now);
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
      caseFactSchema.parse({
        id: row.fact_id,
        predicate: row.predicate,
        value: JSON.parse(row.value_json) as unknown,
      }),
    ).filter((fact): fact is WillValidityRequest["facts"][number] =>
      willFactSchema.safeParse(fact).success,
    );
  }

  getAllFacts(caseId: string): StoredCase["facts"] {
    return this.getCase(caseId).facts;
  }

  saveInferenceRun(input: {
    caseId: string;
    subject: string;
    facts: Array<ReplaceCaseFactsInput["facts"][number] & { subject?: string }>;
    output: InferenceOutput;
    module?: string;
    knowledgeBaseVersion?: string;
  }): StoredInferenceRun {
    const runId = `run-${randomUUID()}`;
    const createdAt = new Date().toISOString();

    const save = this.database.transaction(() => {
      this.assertCaseExists(input.caseId);
      this.database.prepare(`
        INSERT INTO inference_runs
          (id, case_id, module, subject, knowledge_base_version, input_snapshot_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        runId,
        input.caseId,
        input.module ?? "will-validity",
        input.subject,
        input.knowledgeBaseVersion ?? KNOWLEDGE_BASE_VERSION,
        JSON.stringify(input.facts),
        createdAt,
      );

      const insertResult = this.database.prepare(`
        INSERT INTO module_results (run_id, subject, predicate, value, derivations_json)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const result of input.output.results) {
        insertResult.run(runId, result.subject, result.predicate, result.value, JSON.stringify(result.derivations));
      }

      const insertMissing = this.database.prepare(`
        INSERT INTO missing_requirements (run_id, subject, predicate) VALUES (?, ?, ?)
      `);
      for (const missing of input.output.missing) {
        insertMissing.run(runId, missing.subject, missing.predicate);
      }

      const insertTrace = this.database.prepare(`
        INSERT INTO inference_traces
          (run_id, subject, rule_id, conclusion_predicate, conclusion_value, supports_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const trace of input.output.traces) {
        insertTrace.run(
          runId,
          trace.subject,
          trace.ruleId,
          trace.conclusionPredicate,
          trace.conclusionValue,
          JSON.stringify(trace.supports),
        );
      }
      this.database.prepare("UPDATE cases SET updated_at = ? WHERE id = ?").run(createdAt, input.caseId);
    });
    save();
    return this.getInferenceRun(input.caseId, runId);
  }

  getInferenceRun(caseId: string, runId: string): StoredInferenceRun {
    const run = this.database.prepare(`
      SELECT id, case_id, module, subject, knowledge_base_version, input_snapshot_json, created_at
      FROM inference_runs WHERE id = ? AND case_id = ?
    `).get(runId, caseId) as RunRow | undefined;
    if (!run) throw new InferenceRunNotFoundError(runId);

    const results = this.database.prepare(`
      SELECT subject, predicate, value, derivations_json FROM module_results WHERE run_id = ? ORDER BY id
    `).all(runId) as Array<{ subject: string; predicate: string; value: ModuleResultValue; derivations_json: string }>;
    const missing = this.database.prepare(`
      SELECT subject, predicate FROM missing_requirements WHERE run_id = ? ORDER BY id
    `).all(runId) as Array<{ subject: string; predicate: string }>;
    const traces = this.database.prepare(`
      SELECT subject, rule_id, conclusion_predicate, conclusion_value, supports_json
      FROM inference_traces WHERE run_id = ? ORDER BY id
    `).all(runId) as Array<{
      subject: string;
      rule_id: string;
      conclusion_predicate: string;
      conclusion_value: string;
      supports_json: string;
    }>;

    return {
      id: run.id,
      caseId: run.case_id,
      module: run.module,
      subject: run.subject,
      knowledgeBaseVersion: run.knowledge_base_version,
      inputSnapshot: (JSON.parse(run.input_snapshot_json) as Array<Record<string, unknown>>).map((fact) => ({
        ...caseFactSchema.parse(fact),
        ...(typeof fact.subject === "string" ? { subject: fact.subject } : {}),
      })),
      createdAt: run.created_at,
      results: results.map((result) => ({
        caseId: run.case_id,
        subject: result.subject || run.subject,
        module: run.module,
        predicate: result.predicate,
        value: result.value,
        derivations: JSON.parse(result.derivations_json) as string[],
      })),
      missing: missing.map((item) => ({
        caseId: run.case_id,
        subject: item.subject || run.subject,
        module: run.module,
        predicate: item.predicate,
      })),
      traces: traces.map((trace) => ({
        caseId: run.case_id,
        subject: trace.subject || run.subject,
        ruleId: trace.rule_id,
        conclusionPredicate: trace.conclusion_predicate,
        conclusionValue: trace.conclusion_value,
        supports: JSON.parse(trace.supports_json) as string[],
      })),
    };
  }

  listInferenceRuns(caseId: string): StoredInferenceRunSummary[] {
    this.assertCaseExists(caseId);
    const rows = this.database.prepare(`
      SELECT
        ir.id,
        ir.case_id,
        ir.module,
        ir.subject,
        ir.knowledge_base_version,
        ir.created_at,
        mr.predicate AS result_predicate,
        mr.value AS result_value
      FROM inference_runs ir
      LEFT JOIN module_results mr ON mr.run_id = ir.id
      WHERE ir.case_id = ?
      ORDER BY ir.created_at DESC, ir.id DESC, mr.id
    `).all(caseId) as RunSummaryRow[];

    const summaries = new Map<string, StoredInferenceRunSummary>();
    for (const row of rows) {
      let summary = summaries.get(row.id);
      if (!summary) {
        summary = {
          id: row.id,
          caseId: row.case_id,
          module: row.module,
          subject: row.subject,
          knowledgeBaseVersion: row.knowledge_base_version,
          createdAt: row.created_at,
          results: [],
        };
        summaries.set(row.id, summary);
      }
      if (row.result_predicate && row.result_value) {
        summary.results.push({ predicate: row.result_predicate, value: row.result_value });
      }
    }
    return [...summaries.values()];
  }

  private getResultSummaries(runId: string): StoredResultSummary[] {
    return this.database.prepare(`
      SELECT predicate, value FROM module_results WHERE run_id = ? ORDER BY id
    `).all(runId) as StoredResultSummary[];
  }

  private assertCaseExists(caseId: string): void {
    const exists = this.database.prepare("SELECT 1 FROM cases WHERE id = ?").get(caseId);
    if (!exists) throw new CaseNotFoundError(caseId);
  }
}
