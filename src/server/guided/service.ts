import { guidedInferenceGoals, guidedTopics, resolveGuidedRequirement, selectNextGuidedRequirement, type GuidedAnswer, type GuidedCaseState, type GuidedMissingRequirement, type GuidedTopicId } from "@/domain/guided-conversation";
import { replaceCaseFactsSchema, type ReplaceCaseFactsInput } from "@/domain/case";
import type { ApiFact } from "@/modules/contracts";
import type { AppDatabase } from "@/server/db/database";
import { CaseRepository } from "@/server/db/case-repository";
import { GuidedAnswerNotCurrentError, GuidedSessionRepository } from "@/server/db/guided-session-repository";
import { runStoredCompulsoryShare, runStoredEligibility, runStoredEstateSettlement, runStoredHeirRank, runStoredInheritanceType, runStoredLimitation, runStoredRefusalAndUnclaimed, runStoredRepresentation, runStoredWillValidity } from "@/server/cases/service";

export function createGuidedCase(database: AppDatabase, input: { title: string; topicId: GuidedTopicId }): GuidedCaseState {
  const create = database.transaction(() => {
    const storedCase = new CaseRepository(database).createCase({ title: input.title });
    new GuidedSessionRepository(database).create(storedCase.id, input.topicId);
    return storedCase.id;
  });
  return getGuidedCaseState(database, create());
}

export function getGuidedCaseState(database: AppDatabase, caseId: string): GuidedCaseState {
  const caseRepository = new CaseRepository(database);
  const session = new GuidedSessionRepository(database).get(caseId);
  const storedCase = caseRepository.getCase(caseId);
  const topic = guidedTopics[session.topicId];
  const latestRuns = new Map<string, ReturnType<CaseRepository["getInferenceRun"]>>();
  for (const summary of caseRepository.listInferenceRuns(caseId)) {
    if (topic.modules.some((moduleId) => moduleId === summary.module) && !latestRuns.has(summary.module)) {
      latestRuns.set(summary.module, caseRepository.getInferenceRun(caseId, summary.id));
    }
  }
  const hasWill = storedCase.facts.find((fact) => fact.subject === caseId && fact.predicate === "has-will")?.value;
  const willRun = latestRuns.get("will-validity");
  const willConclusionReached = willRun?.results.some((result) => result.predicate === "valid-will" && result.value !== "unknown");
  const runsForPlanning = hasWill === true && willRun && !willConclusionReached
    ? [["will-validity", willRun] as const]
    : [...latestRuns.entries()];
  const requirements = runsForPlanning.flatMap(([moduleId, run]) => moduleId === "will-validity" && hasWill === false ? [] : run.missing.map(({ subject, predicate }) => ({ subject, predicate })));
  const activeCompulsoryHeirs = new Set(latestRuns.get("compulsory-share")?.results.filter((result) => result.predicate === "compulsory-heir" && result.value === "true").map((result) => result.subject) ?? []);
  const estatePortionIds = storedCase.facts.flatMap((fact) => fact.predicate === "estate-portion" && fact.value === true && fact.subject ? [fact.subject] : []);
  const regimeResults = latestRuns.get("inheritance-type")?.results.filter((result) => result.predicate === "inheritance-regime") ?? [];
  const inheritanceGoalComplete = estatePortionIds.length > 0 && estatePortionIds.every((portionId) => regimeResults.some((result) => result.subject === portionId && result.value !== "unknown"));
  const hasStatutoryPortion = regimeResults.some((result) => result.value === "statutory");
  const next = chooseNextStep(caseId, topic.id, storedCase.facts, requirements, new Set(latestRuns.keys()), activeCompulsoryHeirs, hasWill === true && Boolean(willRun) && !willConclusionReached, inheritanceGoalComplete, hasStatutoryPortion);
  return {
    case: storedCase,
    topic,
    completedStepIds: session.completedStepIds,
    latestRunIds: Object.fromEntries([...latestRuns].map(([moduleId, run]) => [moduleId, run.id])),
    latestResults: Object.fromEntries([...latestRuns].map(([moduleId, run]) => [moduleId, run.results])),
    next,
  };
}

export async function answerGuidedQuestion(database: AppDatabase, caseId: string, answer: GuidedAnswer): Promise<GuidedCaseState> {
  const currentState = getGuidedCaseState(database, caseId);
  if (currentState.next?.requirement.predicate !== answer.questionId) {
    throw new GuidedAnswerNotCurrentError(answer.questionId);
  }
  const save = database.transaction(() => {
    const caseRepository = new CaseRepository(database);
    const storedCase = caseRepository.getCase(caseId);
    if (answer.questionId === "guided-deceased-name") {
      const existingDeceased = storedCase.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
      const personId = existingDeceased ?? `person-${crypto.randomUUID()}`;
      const retained = storedCase.facts.filter((fact) => fact.id !== "guided-deceased" && fact.id !== "guided-deceased-label");
      const facts: ReplaceCaseFactsInput["facts"] = [...retained,
        ...(existingDeceased ? [] : [{ id: "guided-deceased", subject: personId, predicate: "deceased-person", value: true } as const]),
        { id: "guided-deceased-label", subject: personId, predicate: "heir-person-label", value: answer.value },
      ];
      caseRepository.replaceFacts(caseId, { subject: caseId, facts });
    }
    if (answer.questionId === "guided-eligibility-person-name") {
      const personId = "eligibility-guided-person";
      const retained = storedCase.facts.filter((fact) => fact.subject !== personId);
      caseRepository.replaceFacts(caseId, { subject: caseId, facts: [...retained,
        { id: "guided-eligibility-candidate", subject: personId, predicate: "eligibility-candidate", value: true },
        { id: "guided-eligibility-person-label", subject: personId, predicate: "person-label", value: answer.value },
      ] });
    }
    if (answer.questionId === "inheritance-has-will") {
      const retained = storedCase.facts.filter((fact) => !(fact.subject === caseId && fact.predicate === "has-will"));
      caseRepository.replaceFacts(caseId, { subject: caseId, facts: [...retained,
        { id: "guided-has-will", subject: caseId, predicate: "has-will", value: answer.value },
      ] });
    }
    if (answer.questionId !== "guided-deceased-name" && answer.questionId !== "guided-eligibility-person-name" && answer.questionId !== "inheritance-has-will") {
      const willId = "will-guided";
      const retained = storedCase.facts.filter((fact) => !(fact.subject === willId && fact.predicate === answer.questionId));
      const input = replaceCaseFactsSchema.parse({
        subject: caseId,
        facts: [...retained, { id: `guided-${answer.questionId}`, subject: willId, predicate: answer.questionId, value: answer.value }],
      });
      caseRepository.replaceFacts(caseId, input);
    }
    new GuidedSessionRepository(database).completeStep(caseId, answer.questionId);
  });
  save();
  return runGuidedInference(database, caseId);
}

/** Runs only packages that contribute to the selected topic and have enough scoped facts to start. */
export async function runGuidedInference(database: AppDatabase, caseId: string): Promise<GuidedCaseState> {
  const repository = new CaseRepository(database);
  const facts = repository.getAllFacts(caseId);
  const topic = guidedTopics[new GuidedSessionRepository(database).get(caseId).topicId];
  const goalModules = new Set(guidedInferenceGoals[topic.id].map((goal) => goal.module));
  const includes = (moduleId: typeof topic.modules[number]) => goalModules.has(moduleId);
  const has = (predicate: string, value?: ApiFact["value"]) => facts.some((fact) => fact.predicate === predicate && (value === undefined || fact.value === value));
  const explicitlyHasNoWill = facts.some((fact) => fact.subject === caseId && fact.predicate === "has-will" && fact.value === false);

  if (includes("will-validity") && !(needsWillContext(topic.id) && explicitlyHasNoWill)) {
    const willIds = [...new Set(facts.flatMap((fact) => fact.predicate === "will-type" && fact.subject ? [fact.subject] : []))];
    for (const willId of willIds) await runStoredWillValidity(repository, caseId, willId);
  }
  if (includes("eligibility") && has("eligibility-candidate", true)) await runStoredEligibility(repository, caseId);
  if (includes("refusal-and-unclaimed") && (has("refusal-assessment-subject", true) || has("unclaimed-estate-assessment-subject", true))) await runStoredRefusalAndUnclaimed(repository, caseId);
  if (includes("heir-rank") && has("deceased-person", true) && has("heir-rank-candidate", true)) await runStoredHeirRank(repository, caseId);
  if (includes("representation") && has("representation-candidate", true)) await runStoredRepresentation(repository, caseId);
  if (includes("inheritance-type") && has("estate-portion", true)) await runStoredInheritanceType(repository, caseId);
  if (includes("compulsory-share") && (has("compulsory-share-assessment-subject", true) || has("compulsory-share-calculation", true))) await runStoredCompulsoryShare(repository, caseId);
  if (includes("estate-settlement") && (has("estate-obligation", true) || has("testamentary-distribution-group", true) || has("division-restriction-assessment-subject", true) || has("division-hardship-assessment-subject", true))) await runStoredEstateSettlement(repository, caseId);
  if (includes("limitation") && has("limitation-assessment-subject", true)) await runStoredLimitation(repository, caseId);
  return getGuidedCaseState(database, caseId);
}

function chooseNextStep(caseId: string, topicId: GuidedTopicId, facts: ApiFact[], requirements: GuidedMissingRequirement[], completedModules: ReadonlySet<string>, activeCompulsoryHeirs: ReadonlySet<string>, willDependencyPending: boolean, inheritanceGoalComplete: boolean, hasStatutoryPortion: boolean): GuidedCaseState["next"] {
  const deceasedId = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  if (!deceasedId) return planned({ subject: "case", predicate: "guided-deceased-name" });
  if (topicId === "person-eligibility" && !facts.some((fact) => fact.predicate === "eligibility-candidate" && fact.value === true && fact.subject !== deceasedId)) {
    return planned({ subject: "eligibility-guided-person", predicate: "guided-eligibility-person-name" });
  }
  if (needsWillContext(topicId)) {
    const hasWill = facts.find((fact) => fact.subject === caseId && fact.predicate === "has-will")?.value;
    if (typeof hasWill !== "boolean") return planned({ subject: caseId, predicate: "inheritance-has-will" });
    if (hasWill && !facts.some((fact) => fact.predicate === "will-type")) return planned({ subject: "will-guided", predicate: "will-type" });
  }
  if (willDependencyPending) {
    const nextWillRequirement = selectNextGuidedRequirement(requirements);
    if (nextWillRequirement) return nextWillRequirement;
  }
  if (topicId === "who-inherits") {
    if (!inheritanceGoalComplete) return planned({ subject: caseId, predicate: "guided-inheritance-portions" });
    if (!hasStatutoryPortion) return undefined;
  }
  if (needsFamilyGraph(topicId) && !facts.some((fact) => fact.predicate === "heir-search-complete" && fact.value === true)) {
    return planned({ subject: deceasedId, predicate: "relationship-at-opening" });
  }
  const fromInference = selectNextGuidedRequirement(requirements.filter((requirement) => !isEligibilityRequirement(requirement.predicate) || requirement.subject !== deceasedId));
  if (fromInference) return fromInference;
  if (topicId === "compulsory-share" && completedModules.has("heir-rank") && !completedModules.has("compulsory-share")) {
    return planned({ subject: deceasedId, predicate: "guided-compulsory-share-review" });
  }
  if (topicId === "compulsory-share" && completedModules.has("compulsory-share") && activeCompulsoryHeirs.size > 0 && compulsoryCalculationsIncomplete(facts, activeCompulsoryHeirs)) {
    return planned({ subject: deceasedId, predicate: "guided-compulsory-share-portions" });
  }
  if (completedModules.size > 0) return undefined;
  const initialByTopic: Record<GuidedTopicId, GuidedMissingRequirement> = {
    "who-inherits": { subject: deceasedId, predicate: "relationship-at-opening" },
    "will-validity": { subject: deceasedId, predicate: "will-type" },
    "person-eligibility": { subject: "eligibility-guided-person", predicate: "guided-eligibility-person-name" },
    representation: { subject: deceasedId, predicate: "relationship-at-opening" },
    "compulsory-share": { subject: deceasedId, predicate: "relationship-at-opening" },
    "estate-settlement": { subject: deceasedId, predicate: "guided-estate-settlement" },
    limitation: { subject: deceasedId, predicate: "inheritance-opening-date" },
  };
  return planned(initialByTopic[topicId]);
}

function needsWillContext(topicId: GuidedTopicId): boolean {
  return topicId === "who-inherits" || topicId === "person-eligibility" || topicId === "representation" || topicId === "compulsory-share";
}

function needsFamilyGraph(topicId: GuidedTopicId): boolean {
  return topicId === "who-inherits" || topicId === "representation" || topicId === "compulsory-share";
}

function compulsoryCalculationsIncomplete(facts: readonly ApiFact[], activePeople: ReadonlySet<string>): boolean {
  const portions = facts.flatMap((fact) => fact.predicate === "estate-portion" && fact.value === true && fact.subject ? [fact.subject] : []);
  if (portions.length === 0) return true;
  const calculations = facts.flatMap((fact) => fact.predicate === "compulsory-share-calculation" && fact.value === true && fact.subject ? [fact.subject] : []);
  return [...activePeople].some((personId) => portions.some((portionId) => !calculations.some((calculationId) =>
    facts.some((fact) => fact.subject === calculationId && fact.predicate === "calculation-person" && fact.value === personId)
    && facts.some((fact) => fact.subject === calculationId && fact.predicate === "calculation-estate-portion" && fact.value === portionId)
    && facts.some((fact) => fact.subject === calculationId && fact.predicate === "hypothetical-statutory-share")
    && facts.some((fact) => fact.subject === calculationId && fact.predicate === "testamentary-share-received"))));
}

function isEligibilityRequirement(predicate: string): boolean {
  return predicate === "article-621-status" || predicate === "eligibility-review-complete";
}

function planned(requirement: GuidedMissingRequirement): NonNullable<GuidedCaseState["next"]> {
  return { requirement, resolution: resolveGuidedRequirement(requirement) };
}
