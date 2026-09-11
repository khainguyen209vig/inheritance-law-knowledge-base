import { inferInheritanceType, inferWillValidity } from "@/server/clips/adapter";
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

export async function runStoredInheritanceType(
  repository: CaseRepository,
  caseId: string,
): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferInheritanceType({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({
    caseId,
    subject: caseId,
    facts,
    output,
    module: "inheritance-type",
    knowledgeBaseVersion: "inheritance-type-ra01-ra06-team-review-v1",
  });
}
