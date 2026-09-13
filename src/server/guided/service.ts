import { guidedTopics, resolveGuidedRequirement, selectNextGuidedRequirement, type GuidedAnswer, type GuidedCaseState, type GuidedMissingRequirement, type GuidedTopicId } from "@/domain/guided-conversation";
import { replaceCaseFactsSchema, type ReplaceCaseFactsInput } from "@/domain/case";
import type { ApiFact } from "@/modules/contracts";
import type { AppDatabase } from "@/server/db/database";
import { CaseRepository } from "@/server/db/case-repository";
import { GuidedAnswerNotCurrentError, GuidedSessionRepository } from "@/server/db/guided-session-repository";
import { runStoredWillValidity } from "@/server/cases/service";

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
  const requirements = [...latestRuns.values()].flatMap((run) => run.missing.map(({ subject, predicate }) => ({ subject, predicate })));
  const next = chooseNextStep(topic.id, storedCase.facts, requirements, latestRuns.size > 0);
  return {
    case: storedCase,
    topic,
    completedStepIds: session.completedStepIds,
    latestRunIds: Object.fromEntries([...latestRuns].map(([moduleId, run]) => [moduleId, run.id])),
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
    if (answer.questionId !== "guided-deceased-name") {
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
  if (answer.questionId !== "guided-deceased-name") await runStoredWillValidity(new CaseRepository(database), caseId, "will-guided");
  return getGuidedCaseState(database, caseId);
}

function chooseNextStep(topicId: GuidedTopicId, facts: ApiFact[], requirements: GuidedMissingRequirement[], hasRelevantRun: boolean): GuidedCaseState["next"] {
  const deceasedId = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  if (!deceasedId) return planned({ subject: "case", predicate: "guided-deceased-name" });
  const fromInference = selectNextGuidedRequirement(requirements);
  if (fromInference) return fromInference;
  if (hasRelevantRun) return undefined;
  const initialByTopic: Record<GuidedTopicId, GuidedMissingRequirement> = {
    "who-inherits": { subject: deceasedId, predicate: "relationship-at-opening" },
    "will-validity": { subject: deceasedId, predicate: "will-type" },
    "person-eligibility": { subject: deceasedId, predicate: "article-621-status" },
    representation: { subject: deceasedId, predicate: "relationship-at-opening" },
    "compulsory-share": { subject: deceasedId, predicate: "relationship-at-opening" },
    "estate-settlement": { subject: deceasedId, predicate: "guided-estate-settlement" },
    limitation: { subject: deceasedId, predicate: "inheritance-opening-date" },
  };
  return planned(initialByTopic[topicId]);
}

function planned(requirement: GuidedMissingRequirement): NonNullable<GuidedCaseState["next"]> {
  return { requirement, resolution: resolveGuidedRequirement(requirement) };
}
