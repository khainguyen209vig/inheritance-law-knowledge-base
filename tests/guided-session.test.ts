import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/server/db/database";
import { CaseRepository } from "../src/server/db/case-repository";
import { GuidedSessionRepository } from "../src/server/db/guided-session-repository";
import { buildGuidedConclusionExplanation, buildGuidedConclusions } from "../src/domain/guided-conclusions";
import { answerGuidedQuestion, createGuidedCase, getGuidedCaseState, runGuidedInference } from "../src/server/guided/service";
import { runStoredCompulsoryShare, runStoredEligibility, runStoredHeirRank, runStoredRefusalAndUnclaimed } from "../src/server/cases/service";

test("guided session persists its topic and resumes from case facts", async () => {
  const database = openDatabase(":memory:");
  try {
    const initial = createGuidedCase(database, { title: "Hồ sơ guided", topicId: "who-inherits" });
    assert.equal(initial.topic.id, "who-inherits");
    assert.equal(initial.next?.requirement.predicate, "guided-deceased-name");
    assert.deepEqual(initial.dependencyPlan.slice(0, 3), [
      { id: "deceased", status: "ready" },
      { id: "conflict-gate", status: "blocked" },
      { id: "will-context", status: "blocked" },
    ]);

    const answered = await answerGuidedQuestion(database, initial.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    assert.ok(answered.completedStepIds.includes("guided-deceased-name"));
    assert.ok(answered.case.facts.some((fact) => fact.predicate === "deceased-person" && fact.value === true));
    assert.ok(answered.case.facts.some((fact) => fact.predicate === "heir-person-label" && fact.value === "Nguyễn Văn A"));
    assert.equal(answered.next?.requirement.predicate, "inheritance-has-will");
    const willAnswered = await answerGuidedQuestion(database, initial.case.id, { questionId: "inheritance-has-will", value: false });
    assert.equal(willAnswered.next?.requirement.predicate, "guided-inheritance-portions");
    assert.equal(willAnswered.next?.resolution?.kind, "interaction");

    const resumed = getGuidedCaseState(database, initial.case.id);
    assert.equal(resumed.topic.id, "who-inherits");
    assert.deepEqual(resumed.completedStepIds, ["guided-deceased-name", "inheritance-has-will"]);
  } finally {
    database.close();
  }
});

test("guided will answer runs CLIPS and plans the next missing requirement", async () => {
  const database = openDatabase(":memory:");
  try {
    const initial = createGuidedCase(database, { title: "Kiểm tra di chúc", topicId: "will-validity" });
    const named = await answerGuidedQuestion(database, initial.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    assert.equal(named.next?.requirement.predicate, "will-type");

    const answered = await answerGuidedQuestion(database, initial.case.id, { questionId: "will-type", value: "written" });
    assert.ok(answered.case.facts.some((fact) => fact.subject === "will-guided" && fact.predicate === "will-type" && fact.value === "written"));
    assert.ok(answered.latestRunIds["will-validity"]);
    assert.notEqual(answered.next?.requirement.predicate, "will-type");
    assert.equal(new CaseRepository(database).listInferenceRuns(initial.case.id).length, 1);
  } finally {
    database.close();
  }
});

test("who-inherits resolves the will dependency before family and eligibility review", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Có di chúc", topicId: "who-inherits" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "inheritance-has-will", value: true });
    assert.equal(state.next?.requirement.predicate, "will-type");

    state = await answerGuidedQuestion(database, state.case.id, { questionId: "will-type", value: "written" });
    assert.equal(state.next?.requirement.predicate, "testator-mental-state");
    assert.ok(state.latestRunIds["will-validity"]);
    assert.notEqual(state.next?.requirement.predicate, "relationship-at-opening");

    state = await answerGuidedQuestion(database, state.case.id, { questionId: "testator-mental-state", value: "lucid" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "undue-influence", value: "none" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "prohibited-content", value: "not-detected" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "formal-defect", value: "not-detected" });
    assert.equal(state.next?.requirement.predicate, "guided-inheritance-portions");
    assert.equal(state.next?.resolution?.kind, "interaction");

    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "testamentary-portion", subject: "portion-testamentary", predicate: "estate-portion", value: true },
      { id: "testamentary-label", subject: "portion-testamentary", predicate: "estate-portion-label", value: "Căn nhà" },
      { id: "testamentary-will", subject: "portion-testamentary", predicate: "applicable-will", value: "will-guided" },
      { id: "testamentary-disposed", subject: "portion-testamentary", predicate: "portion-disposed", value: true },
      { id: "testamentary-beneficiary", subject: "portion-testamentary", predicate: "disposition-beneficiary", value: "beneficiary-one" },
      { id: "testamentary-complete", subject: "portion-testamentary", predicate: "disposition-set-complete", value: true },
      { id: "testamentary-kind", subject: "beneficiary-one", predicate: "beneficiary-kind", value: "person" },
      { id: "testamentary-life", subject: "beneficiary-one", predicate: "beneficiary-life-status", value: "alive" },
      { id: "testamentary-eligibility", subject: "beneficiary-one", predicate: "eligibility-candidate", value: true },
      { id: "testamentary-refusal", subject: "beneficiary-one", predicate: "refusal-assessment-subject", value: true },
    ] });
    state = await runGuidedInference(database, state.case.id);
    assert.equal(state.next?.requirement.subject, "beneficiary-one");
    assert.equal(state.next?.requirement.predicate, "eligibility-review-complete");

    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "testamentary-eligibility-complete", subject: "beneficiary-one", predicate: "eligibility-review-complete", value: true },
    ] });
    state = await runGuidedInference(database, state.case.id);
    assert.equal(state.next?.requirement.subject, "beneficiary-one");
    assert.equal(state.next?.requirement.predicate, "refusal-made");

    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "testamentary-refusal-made", subject: "beneficiary-one", predicate: "refusal-made", value: false },
    ] });
    state = await runGuidedInference(database, state.case.id);
    assert.equal(state.next, undefined);
    assert.ok(state.dependencyPlan.some((node) => node.id === "inheritance-regime" && node.status === "complete"));
    assert.ok(state.dependencyPlan.some((node) => node.id === "family-graph" && node.status === "skipped"));
    assert.ok(state.latestResults["inheritance-type"]?.some((result) => result.subject === "portion-testamentary" && result.predicate === "inheritance-regime" && result.value === "testamentary"));
    assert.equal(state.latestRunIds["heir-rank"], undefined);
  } finally {
    database.close();
  }
});

test("person eligibility flow asks for a candidate and never reviews the deceased", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Rà soát quyền hưởng", topicId: "person-eligibility" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Người để lại di sản" });
    const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person")?.subject;
    assert.equal(state.next?.requirement.predicate, "guided-eligibility-person-name");
    assert.notEqual(state.next?.requirement.subject, deceasedId);

    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-eligibility-person-name", value: "Người cần rà soát" });
    assert.equal(state.next?.requirement.predicate, "inheritance-has-will");
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "inheritance-has-will", value: false });
    assert.equal(state.next?.requirement.predicate, "eligibility-review-complete");
    assert.equal(state.next?.requirement.subject, "eligibility-guided-person");
    assert.notEqual(state.next?.requirement.subject, deceasedId);
  } finally {
    database.close();
  }
});

test("guided family graph advances to the candidate legal review after heir-rank inference", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Xác định người thừa kế", topicId: "who-inherits" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person")?.subject;
    assert.ok(deceasedId);
    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      { id: "fg-no-will", subject: state.case.id, predicate: "has-will", value: false },
      { id: "fg-portion", subject: "portion-statutory", predicate: "estate-portion", value: true },
      { id: "fg-portion-label", subject: "portion-statutory", predicate: "estate-portion-label", value: "Di sản" },
      { id: "fg-deceased", subject: deceasedId, predicate: "deceased-person", value: true },
      { id: "fg-deceased-label", subject: deceasedId, predicate: "heir-person-label", value: "Nguyễn Văn A" },
      { id: "fg-spouse-label", subject: "person-spouse", predicate: "heir-person-label", value: "Nguyễn Thị B" },
      { id: "fg-spouse-rank", subject: "person-spouse", predicate: "heir-rank-candidate", value: true },
      { id: "fg-spouse-eligibility", subject: "person-spouse", predicate: "eligibility-candidate", value: true },
      { id: "fg-spouse-life", subject: "person-spouse", predicate: "heir-life-status", value: "alive" },
      { id: "fg-spouse-edge", subject: deceasedId, predicate: "spouse-at-opening", value: "person-spouse" },
      { id: "fg-search-complete", subject: state.case.id, predicate: "heir-search-complete", value: true },
    ] });
    state = await runGuidedInference(database, state.case.id);
    assert.ok(state.latestRunIds["heir-rank"]);
    assert.ok(state.latestRunIds.eligibility);
    assert.ok(state.dependencyPlan.some((node) => node.id === "family-graph" && node.status === "complete"));
    assert.ok(state.dependencyPlan.some((node) => node.id === "inference-requirements" && node.status === "ready"));
    assert.equal(state.next?.requirement.subject, "person-spouse");
    assert.equal(state.next?.requirement.predicate, "article-621-status");
    assert.equal(state.next?.resolution?.kind, "interaction");

    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "person-spouse-review", subject: "person-spouse", predicate: "eligibility-review-complete", value: true },
    ] });
    await runStoredEligibility(repository, state.case.id);
    await runStoredHeirRank(repository, state.case.id);

    state = getGuidedCaseState(database, state.case.id);
    assert.ok(state.latestRunIds.eligibility);
    assert.equal(state.next?.requirement.subject, "person-spouse");
    assert.equal(state.next?.requirement.predicate, "valid-refusal");
    assert.equal(state.next?.resolution?.kind, "interaction");

    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "person-spouse-refusal-scope", subject: "person-spouse", predicate: "refusal-assessment-subject", value: true },
      { id: "person-spouse-refusal-made", subject: "person-spouse", predicate: "refusal-made", value: false },
    ] });
    state = await runGuidedInference(database, state.case.id);
    assert.ok(state.latestRunIds["refusal-and-unclaimed"]);
    assert.equal(state.next, undefined);
    const latestRank = repository.getInferenceRun(state.case.id, state.latestRunIds["heir-rank"]!);
    assert.ok(latestRank.results.some((result) => result.subject === "person-spouse" && result.predicate === "called-to-inherit" && result.value === "true"));
  } finally {
    database.close();
  }
});

test("guided written-will flow reaches a conclusive CLIPS result without restarting", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Di chúc hợp lệ", topicId: "will-validity" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "will-type", value: "written" });
    assert.equal(state.next?.requirement.predicate, "testator-mental-state");
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "testator-mental-state", value: "lucid" });
    assert.equal(state.next?.requirement.predicate, "undue-influence");
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "undue-influence", value: "none" });
    assert.equal(state.next?.requirement.predicate, "prohibited-content");
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "prohibited-content", value: "not-detected" });
    assert.equal(state.next?.requirement.predicate, "formal-defect");
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "formal-defect", value: "not-detected" });

    assert.equal(state.next, undefined);
    const latest = new CaseRepository(database).listInferenceRuns(state.case.id)[0];
    assert.ok(latest?.results.some((result) => result.predicate === "valid-will" && result.value === "true"));
    const conclusion = buildGuidedConclusions(state)[0];
    assert.match(conclusion?.statement ?? "", /Di chúc đáp ứng/u);
    assert.ok(conclusion?.ruleIds.includes("R-B03"));
  } finally {
    database.close();
  }
});

test("guided planner stops when CLIPS reports a conflicting goal", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Di chúc có dữ kiện mâu thuẫn", topicId: "will-validity" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "conflict-type", subject: "will-guided", predicate: "will-type", value: "written" },
      { id: "conflict-lucid", subject: "will-guided", predicate: "testator-mental-state", value: "lucid" },
      { id: "conflict-not-lucid", subject: "will-guided", predicate: "testator-mental-state", value: "not-lucid" },
      { id: "conflict-influence", subject: "will-guided", predicate: "undue-influence", value: "none" },
      { id: "conflict-content", subject: "will-guided", predicate: "prohibited-content", value: "not-detected" },
      { id: "conflict-form", subject: "will-guided", predicate: "formal-defect", value: "not-detected" },
    ] });

    state = await runGuidedInference(database, state.case.id);
    assert.equal(state.next, undefined);
    assert.equal(state.inferenceStatus.status, "conflict");
    assert.deepEqual(state.inferenceStatus.modules, ["will-validity"]);
    assert.ok(state.dependencyPlan.some((node) => node.id === "conflict-gate" && node.status === "complete"));
    assert.ok(state.dependencyPlan.some((node) => node.id === "will-document" && node.status === "skipped"));
  } finally {
    database.close();
  }
});

test("guided state ignores inference snapshots created from older facts", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Sửa dữ kiện", topicId: "will-validity" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "will-type", value: "written" });
    assert.ok(state.latestRunIds["will-validity"]);

    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: repository.getCase(state.case.id).facts.map((fact) => fact.predicate === "will-type" ? { ...fact, value: "oral" } : fact) });
    state = getGuidedCaseState(database, state.case.id);

    assert.equal(state.latestRunIds["will-validity"], undefined);
    assert.equal(state.inferenceStatus.status, "collecting");
    assert.equal(repository.listInferenceRuns(state.case.id).length, 1, "stale snapshot remains available as immutable history");
  } finally {
    database.close();
  }
});

test("guided state distinguishes a missing presenter from an UNKNOWN conclusion", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Thiếu presenter", topicId: "limitation" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const repository = new CaseRepository(database);
    const facts = repository.getAllFacts(state.case.id);
    repository.saveInferenceRun({ caseId: state.case.id, subject: state.case.id, facts, module: "limitation", output: {
      results: [{ caseId: state.case.id, subject: "request-one", module: "limitation", predicate: "limitation-period-years", value: "unknown", derivations: [] }],
      missing: [{ caseId: state.case.id, subject: "request-one", module: "limitation", predicate: "unmapped-observation" }],
      traces: [],
    } });

    state = getGuidedCaseState(database, state.case.id);
    assert.equal(state.resolutionStatus.kind, "missing-presenter");
    assert.equal(state.inferenceStatus.status, "collecting");
    assert.deepEqual(state.unresolvedRequirements, [{ subject: "request-one", predicate: "unmapped-observation", module: "limitation" }]);
  } finally {
    database.close();
  }
});

test("guided state distinguishes UNKNOWN from an unmodeled result path", async () => {
  const unknownDatabase = openDatabase(":memory:");
  try {
    let state = createGuidedCase(unknownDatabase, { title: "Kết quả unknown", topicId: "limitation" });
    state = await answerGuidedQuestion(unknownDatabase, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const repository = new CaseRepository(unknownDatabase);
    const facts = repository.getAllFacts(state.case.id);
    repository.saveInferenceRun({ caseId: state.case.id, subject: state.case.id, facts, module: "limitation", output: {
      results: [{ caseId: state.case.id, subject: "request-one", module: "limitation", predicate: "limitation-period-years", value: "unknown", derivations: [] }],
      missing: [], traces: [],
    } });
    state = getGuidedCaseState(unknownDatabase, state.case.id);
    assert.equal(state.resolutionStatus.kind, "unknown");
    assert.equal(state.inferenceStatus.status, "unknown");
  } finally {
    unknownDatabase.close();
  }

  const unmodeledDatabase = openDatabase(":memory:");
  try {
    let state = createGuidedCase(unmodeledDatabase, { title: "Ngoài phạm vi", topicId: "limitation" });
    state = await answerGuidedQuestion(unmodeledDatabase, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const repository = new CaseRepository(unmodeledDatabase);
    const facts = repository.getAllFacts(state.case.id);
    repository.saveInferenceRun({ caseId: state.case.id, subject: state.case.id, facts, module: "limitation", output: { results: [], missing: [], traces: [] } });
    state = getGuidedCaseState(unmodeledDatabase, state.case.id);
    assert.equal(state.resolutionStatus.kind, "unmodeled");
    assert.equal(state.inferenceStatus.status, "unknown");
  } finally {
    unmodeledDatabase.close();
  }
});

test("revising a guided answer removes dependent answers and reruns on the new facts revision", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Sửa loại di chúc", topicId: "will-validity" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "will-type", value: "written" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "testator-mental-state", value: "lucid" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "undue-influence", value: "none" });
    const runCountBeforeRevision = new CaseRepository(database).listInferenceRuns(state.case.id).length;

    state = await answerGuidedQuestion(database, state.case.id, { questionId: "will-type", value: "oral" }, { revision: true });

    assert.deepEqual(state.completedStepIds, ["guided-deceased-name", "will-type"]);
    assert.equal(state.case.facts.find((fact) => fact.subject === "will-guided" && fact.predicate === "will-type")?.value, "oral");
    assert.equal(state.case.facts.some((fact) => fact.subject === "will-guided" && fact.predicate === "testator-mental-state"), false);
    assert.equal(state.case.facts.some((fact) => fact.subject === "will-guided" && fact.predicate === "undue-influence"), false);
    assert.equal(state.next?.requirement.predicate, "testator-mental-state");
    assert.ok(state.latestRunIds["will-validity"]);
    assert.ok(new CaseRepository(database).listInferenceRuns(state.case.id).length > runCountBeforeRevision, "old runs remain in the audit history");
  } finally {
    database.close();
  }
});

test("guided compulsory-share topic advances from dependencies to Article 644 review", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Suất bắt buộc", topicId: "compulsory-share" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person")?.subject;
    assert.ok(deceasedId);
    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      { id: "cs-no-will", subject: state.case.id, predicate: "has-will", value: false },
      { id: "cs-deceased", subject: deceasedId, predicate: "deceased-person", value: true },
      { id: "cs-deceased-label", subject: deceasedId, predicate: "heir-person-label", value: "Nguyễn Văn A" },
      { id: "cs-child-label", subject: "person-child", predicate: "heir-person-label", value: "Nguyễn Văn B" },
      { id: "cs-child-rank", subject: "person-child", predicate: "heir-rank-candidate", value: true },
      { id: "cs-child-eligibility", subject: "person-child", predicate: "eligibility-candidate", value: true },
      { id: "cs-child-life", subject: "person-child", predicate: "heir-life-status", value: "alive" },
      { id: "cs-child-edge", subject: deceasedId, predicate: "biological-parent-of", value: "person-child" },
      { id: "cs-search-complete", subject: state.case.id, predicate: "heir-search-complete", value: true },
      { id: "cs-child-review", subject: "person-child", predicate: "eligibility-review-complete", value: true },
      { id: "cs-child-refusal-scope", subject: "person-child", predicate: "refusal-assessment-subject", value: true },
      { id: "cs-child-refusal-made", subject: "person-child", predicate: "refusal-made", value: false },
    ] });
    await runStoredEligibility(repository, state.case.id);
    await runStoredRefusalAndUnclaimed(repository, state.case.id);
    await runStoredHeirRank(repository, state.case.id);

    state = getGuidedCaseState(database, state.case.id);
    assert.equal(state.next?.requirement.predicate, "guided-compulsory-share-review");
    assert.equal(state.next?.resolution?.kind, "interaction");

    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "cs-child-scope", subject: "person-child", predicate: "compulsory-share-assessment-subject", value: true },
      { id: "cs-child-age", subject: "person-child", predicate: "age-group", value: "minor" },
    ] });
    const compulsoryRun = await runStoredCompulsoryShare(repository, state.case.id);
    state = getGuidedCaseState(database, state.case.id);
    assert.equal(state.next?.requirement.predicate, "guided-compulsory-share-portions");
    assert.equal(state.next?.resolution?.kind, "interaction");
    assert.ok(compulsoryRun.results.some((result) => result.subject === "person-child" && result.predicate === "compulsory-heir" && result.value === "true"));

    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "cs-portion", subject: "portion-house", predicate: "estate-portion", value: true },
      { id: "cs-portion-label", subject: "portion-house", predicate: "estate-portion-label", value: "Căn nhà" },
      { id: "cs-calculation", subject: "calculation-child-house", predicate: "compulsory-share-calculation", value: true },
      { id: "cs-calculation-person", subject: "calculation-child-house", predicate: "calculation-person", value: "person-child" },
      { id: "cs-calculation-portion", subject: "calculation-child-house", predicate: "calculation-estate-portion", value: "portion-house" },
      { id: "cs-calculation-statutory", subject: "calculation-child-house", predicate: "hypothetical-statutory-share", value: 300 },
      { id: "cs-calculation-testamentary", subject: "calculation-child-house", predicate: "testamentary-share-received", value: 100 },
    ] });
    const calculatedRun = await runStoredCompulsoryShare(repository, state.case.id);
    state = getGuidedCaseState(database, state.case.id);
    assert.equal(state.next, undefined);
    assert.ok(calculatedRun.results.some((result) => result.subject === "calculation-child-house" && result.predicate === "minimum-compulsory-share" && Number(result.value) === 200));
    assert.ok(calculatedRun.results.some((result) => result.subject === "calculation-child-house" && result.predicate === "compulsory-share-shortfall" && Number(result.value) === 100));
  } finally {
    database.close();
  }
});

test("guided limitation timeline derives the Article 623 period and calendar deadline", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Thời hiệu chia nhà", topicId: "limitation" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    assert.equal(state.next?.requirement.predicate, "guided-limitation-timeline");
    assert.equal(state.next?.resolution?.kind, "interaction");
    if (state.next?.resolution?.kind === "interaction") assert.equal(state.next.resolution.interaction, "timeline");

    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "glt-scope", subject: "limitation-guided", predicate: "limitation-assessment-subject", value: true },
      { id: "glt-type", subject: "limitation-guided", predicate: "request-type", value: "divide-estate" },
      { id: "glt-asset", subject: "limitation-guided", predicate: "asset-type", value: "immovable" },
      { id: "glt-date", subject: "limitation-guided", predicate: "inheritance-opening-date", value: "2020-02-29" },
    ] });
    state = await runGuidedInference(database, state.case.id);

    assert.equal(state.next, undefined);
    assert.equal(state.inferenceStatus.status, "complete");
    assert.ok(state.latestResults.limitation?.some((result) => result.subject === "limitation-guided" && result.predicate === "limitation-period-years" && result.value === "30"));
    assert.ok(state.latestResults.limitation?.some((result) => result.subject === "limitation-guided" && result.predicate === "limitation-deadline" && result.value === "2050-02-28"));
    const conclusion = buildGuidedConclusions(state)[0];
    assert.match(conclusion?.statement ?? "", /30 năm.*28\/02\/2050/u);
    assert.deepEqual(conclusion?.ruleIds, ["R-J01"]);
    const explanation = buildGuidedConclusionExplanation(state, conclusion!);
    assert.ok(explanation.facts.some((fact) => fact.id === "glt-type" && fact.statement.includes("Yêu cầu chia di sản")));
    assert.ok(explanation.steps.some((step) => step.ruleId === "R-J01" && step.statement.includes("30")));
  } finally {
    database.close();
  }
});

test("guided Article 661 restriction timeline reaches a dated conclusion", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Hạn chế phân chia", topicId: "estate-settlement" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    assert.equal(state.next?.requirement.predicate, "guided-estate-settlement");
    assert.equal(state.next?.resolution?.kind, "interaction");
    if (state.next?.resolution?.kind === "interaction") assert.equal(state.next.resolution.interaction, "timeline");

    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "gdt-restriction-scope", subject: "restriction-guided", predicate: "division-restriction-assessment-subject", value: true },
      { id: "gdt-restriction-basis", subject: "restriction-guided", predicate: "division-restriction-basis", value: "will-instruction" },
      { id: "gdt-restriction-date", subject: "restriction-guided", predicate: "specified-division-date", value: "2030-01-01" },
    ] });
    state = await runGuidedInference(database, state.case.id);

    assert.equal(state.next, undefined);
    assert.equal(state.inferenceStatus.status, "complete");
    assert.ok(state.latestResults["estate-settlement"]?.some((result) => result.subject === "restriction-guided" && result.predicate === "distribution-not-before" && result.value === "2030-01-01"));
    const conclusion = buildGuidedConclusions(state)[0];
    assert.match(conclusion?.statement ?? "", /không được phân chia trước ngày 01\/01\/2030/u);
    assert.deepEqual(conclusion?.ruleIds, ["R-I04"]);
  } finally {
    database.close();
  }
});

test("guided Article 661 hardship timeline derives the surviving spouse request right", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Trì hoãn phân chia", topicId: "estate-settlement" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
    assert.ok(deceasedId);

    const repository = new CaseRepository(database);
    repository.replaceFacts(state.case.id, { subject: state.case.id, facts: [
      ...repository.getCase(state.case.id).facts,
      { id: "gdt-hardship-scope", subject: "person-spouse", predicate: "division-hardship-assessment-subject", value: true },
      { id: "gdt-spouse-edge", subject: deceasedId, predicate: "spouse-at-opening", value: "person-spouse" },
      { id: "gdt-spouse-life", subject: "person-spouse", predicate: "heir-life-status", value: "alive" },
      { id: "gdt-requested", subject: "person-spouse", predicate: "estate-division-requested", value: true },
      { id: "gdt-impact", subject: "person-spouse", predicate: "serious-division-impact", value: true },
      { id: "gdt-prior-expired", subject: "person-spouse", predicate: "prior-court-deferral-expired", value: false },
    ] });
    state = await runGuidedInference(database, state.case.id);

    assert.equal(state.next, undefined);
    assert.equal(state.inferenceStatus.status, "complete");
    assert.ok(state.latestResults["estate-settlement"]?.some((result) => result.subject === "person-spouse" && result.predicate === "court-deferral-may-be-requested" && result.value === "true"));
  } finally {
    database.close();
  }
});

test("deleting a case cascades to its guided session", () => {
  const database = openDatabase(":memory:");
  try {
    const state = createGuidedCase(database, { title: "Hồ sơ tạm", topicId: "limitation" });
    new CaseRepository(database).deleteCase(state.case.id);
    assert.equal((database.prepare("SELECT COUNT(*) AS count FROM guided_sessions").get() as { count: number }).count, 0);
  } finally {
    database.close();
  }
});

test("guided session repository records each completed step once", () => {
  const database = openDatabase(":memory:");
  try {
    const state = createGuidedCase(database, { title: "Hồ sơ bước", topicId: "will-validity" });
    const repository = new GuidedSessionRepository(database);
    repository.completeStep(state.case.id, "step-a");
    const session = repository.completeStep(state.case.id, "step-a");
    assert.deepEqual(session.completedStepIds, ["step-a"]);
  } finally {
    database.close();
  }
});
