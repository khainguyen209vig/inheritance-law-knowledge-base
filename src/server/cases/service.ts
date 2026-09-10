import { inferWillValidity } from "@/server/clips/adapter";
import { CaseRepository, type StoredInferenceRun } from "@/server/db/case-repository";

export async function runStoredWillValidity(
  repository: CaseRepository,
  caseId: string,
  subject: string,
): Promise<StoredInferenceRun> {
  const facts = repository.getFactsForSubject(caseId, subject);
  const output = await inferWillValidity({ caseId, subject, facts });
  return repository.saveInferenceRun({ caseId, subject, facts, output });
}
