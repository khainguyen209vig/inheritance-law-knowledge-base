import type { GuidedTopicId } from "@/domain/guided-conversation";
import type { AppDatabase } from "./database";

export class GuidedSessionNotFoundError extends Error {}
export class GuidedAnswerNotCurrentError extends Error {}

export interface StoredGuidedSession {
  caseId: string;
  topicId: GuidedTopicId;
  completedStepIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface GuidedSessionRow {
  case_id: string;
  topic_id: GuidedTopicId;
  completed_step_ids_json: string;
  created_at: string;
  updated_at: string;
}

export class GuidedSessionRepository {
  constructor(private readonly database: AppDatabase) {}

  create(caseId: string, topicId: GuidedTopicId): StoredGuidedSession {
    const now = new Date().toISOString();
    this.database.prepare(`
      INSERT INTO guided_sessions (case_id, topic_id, completed_step_ids_json, created_at, updated_at)
      VALUES (?, ?, '[]', ?, ?)
    `).run(caseId, topicId, now, now);
    return this.get(caseId);
  }

  get(caseId: string): StoredGuidedSession {
    const row = this.database.prepare(`
      SELECT case_id, topic_id, completed_step_ids_json, created_at, updated_at
      FROM guided_sessions WHERE case_id = ?
    `).get(caseId) as GuidedSessionRow | undefined;
    if (!row) throw new GuidedSessionNotFoundError(caseId);
    return {
      caseId: row.case_id,
      topicId: row.topic_id,
      completedStepIds: JSON.parse(row.completed_step_ids_json) as string[],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  completeStep(caseId: string, stepId: string): StoredGuidedSession {
    const session = this.get(caseId);
    const completedStepIds = [...new Set([...session.completedStepIds, stepId])];
    const now = new Date().toISOString();
    this.database.prepare(`
      UPDATE guided_sessions SET completed_step_ids_json = ?, updated_at = ? WHERE case_id = ?
    `).run(JSON.stringify(completedStepIds), now, caseId);
    return this.get(caseId);
  }

  rewindAfter(caseId: string, stepId: string): StoredGuidedSession {
    const session = this.get(caseId);
    const index = session.completedStepIds.indexOf(stepId);
    if (index < 0) throw new GuidedAnswerNotCurrentError(stepId);
    const now = new Date().toISOString();
    this.database.prepare(`
      UPDATE guided_sessions SET completed_step_ids_json = ?, updated_at = ? WHERE case_id = ?
    `).run(JSON.stringify(session.completedStepIds.slice(0, index + 1)), now, caseId);
    return this.get(caseId);
  }
}
