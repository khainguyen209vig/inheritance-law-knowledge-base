import assert from "node:assert/strict";
import test from "node:test";
import type { AnalysisModuleId } from "../src/domain/analysis-modules";
import type { GuidedCaseState, GuidedTopicId } from "../src/domain/guided-conversation";
import type { ModuleResultValue } from "../src/modules/contracts";
import { CaseRepository, type StoredCase } from "../src/server/db/case-repository";
import { openDatabase, type AppDatabase } from "../src/server/db/database";
import { answerGuidedQuestion, createGuidedCase, getGuidedCaseState } from "../src/server/guided/service";

interface UnknownScenario {
  topicId: GuidedTopicId;
  moduleId: AnalysisModuleId;
  predicate: string;
  contextFacts?: (state: GuidedCaseState) => StoredFact[];
  prerequisiteRun?: { moduleId: AnalysisModuleId; predicate: string; value: ModuleResultValue; subject: string };
}

type StoredFact = StoredCase["facts"][number];

const unknownScenarios: readonly UnknownScenario[] = [
  { topicId: "will-validity", moduleId: "will-validity", predicate: "valid-will", contextFacts: () => [{ id: "matrix-will-type", subject: "will-guided", predicate: "will-type", value: "written" }] },
  { topicId: "person-eligibility", moduleId: "eligibility", predicate: "article-621-status", contextFacts: (state) => [{ id: "matrix-no-will", subject: state.case.id, predicate: "has-will", value: false }, { id: "matrix-candidate", subject: "matrix-person", predicate: "eligibility-candidate", value: true }] },
  { topicId: "representation", moduleId: "representation", predicate: "inherits-by-representation", contextFacts: (state) => commonFamilyContext(state) },
  { topicId: "compulsory-share", moduleId: "compulsory-share", predicate: "compulsory-heir", contextFacts: (state) => commonFamilyContext(state) },
  { topicId: "who-inherits", moduleId: "heir-rank", predicate: "called-to-inherit", contextFacts: (state) => [...commonFamilyContext(state), { id: "matrix-portion", subject: "matrix-portion", predicate: "estate-portion", value: true }], prerequisiteRun: { moduleId: "inheritance-type", predicate: "inheritance-regime", value: "testamentary", subject: "matrix-portion" } },
  { topicId: "estate-settlement", moduleId: "estate-settlement", predicate: "distribution-not-before" },
  { topicId: "limitation", moduleId: "limitation", predicate: "limitation-period-years" },
];

for (const scenario of unknownScenarios) {
  test(`guided topic matrix: ${scenario.topicId} preserves UNKNOWN and invalidates it after an edit`, async () => {
    const database = openDatabase(":memory:");
    try {
      let state = createGuidedCase(database, { title: `Matrix ${scenario.topicId}`, topicId: scenario.topicId });
      assert.equal(state.resolutionStatus.kind, "missing-facts");
      state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Tên ban đầu" });
      const repository = new CaseRepository(database);
      if (scenario.contextFacts) repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [...repository.getAllFacts(state.case.id), ...scenario.contextFacts(state)] });
      const facts = repository.getAllFacts(state.case.id);
      if (scenario.prerequisiteRun) saveSyntheticRun(database, state, scenario.prerequisiteRun.moduleId, scenario.prerequisiteRun.predicate, scenario.prerequisiteRun.value, scenario.prerequisiteRun.subject, facts);
      const staleRunId = saveSyntheticRun(database, state, scenario.moduleId, scenario.predicate, "unknown", "matrix-subject", facts);

      state = getGuidedCaseState(database, state.case.id);
      assert.equal(state.resolutionStatus.kind, "unknown");
      assert.equal(state.inferenceStatus.status, "unknown");

      state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Tên đã sửa" }, { revision: true });
      const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
      assert.equal(state.case.facts.find((fact) => fact.subject === deceasedId && fact.predicate === "heir-person-label")?.value, "Tên đã sửa");
      assert.ok(!Object.values(state.latestRunIds).includes(staleRunId), "snapshot thuộc facts revision cũ không còn là kết quả hiện hành");
      assert.deepEqual(state.completedStepIds, ["guided-deceased-name"]);
    } finally {
      database.close();
    }
  });
}

function commonFamilyContext(state: GuidedCaseState): StoredFact[] {
  return [
    { id: "matrix-no-will", subject: state.case.id, predicate: "has-will", value: false },
    { id: "matrix-family-complete", subject: state.case.id, predicate: "heir-search-complete", value: true },
  ];
}

function saveSyntheticRun(database: AppDatabase, state: GuidedCaseState, moduleId: AnalysisModuleId, predicate: string, value: ModuleResultValue, subject: string, facts: StoredCase["facts"]): string {
  return new CaseRepository(database).saveInferenceRun({
    caseId: state.case.id,
    subject: state.case.id,
    facts,
    module: moduleId,
    output: { results: [{ caseId: state.case.id, subject, module: moduleId, predicate, value, derivations: [] }], missing: [], traces: [] },
  }).id;
}
