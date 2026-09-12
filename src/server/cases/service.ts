import { inferCompulsoryShare, inferEligibility, inferEstateSettlement, inferHeirRank, inferInheritanceType, inferRefusalAndUnclaimed, inferRepresentation, inferSpouseStatus, inferWillValidity } from "@/server/clips/adapter";
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

export async function runStoredEligibility(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferEligibility({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "eligibility", knowledgeBaseVersion: "eligibility-rd01-rd05-draft-v1" });
}

export async function runStoredHeirRank(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferHeirRank({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "heir-rank", knowledgeBaseVersion: "heir-rank-rc01-rc06-refusal-integrated-v2" });
}

export async function runStoredRepresentation(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferRepresentation({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "representation", knowledgeBaseVersion: "representation-re01-re05-refusal-integrated-v2" });
}

export async function runStoredCompulsoryShare(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferCompulsoryShare({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "compulsory-share", knowledgeBaseVersion: "compulsory-share-rf01-rf04-refusal-integrated-v3" });
}

export async function runStoredSpouseStatus(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferSpouseStatus({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "spouse-status", knowledgeBaseVersion: "spouse-status-rg01-rg03-draft-v1" });
}

export async function runStoredRefusalAndUnclaimed(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferRefusalAndUnclaimed({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "refusal-and-unclaimed", knowledgeBaseVersion: "refusal-rh01-rh04-draft-v1" });
}

export async function runStoredEstateSettlement(repository: CaseRepository, caseId: string): Promise<StoredInferenceRun> {
  const facts = repository.getAllFacts(caseId);
  const output = await inferEstateSettlement({ caseId, subject: caseId, facts });
  return repository.saveInferenceRun({ caseId, subject: caseId, facts, output, module: "estate-settlement", knowledgeBaseVersion: "estate-settlement-ri01-ri02-draft-v2" });
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
    knowledgeBaseVersion: "inheritance-type-ra01-ra06-refusal-integrated-v2",
  });
}
