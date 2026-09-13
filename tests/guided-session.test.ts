import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/server/db/database";
import { CaseRepository } from "../src/server/db/case-repository";
import { GuidedSessionRepository } from "../src/server/db/guided-session-repository";
import { answerGuidedQuestion, createGuidedCase, getGuidedCaseState } from "../src/server/guided/service";
import { runStoredCompulsoryShare, runStoredEligibility, runStoredHeirRank, runStoredRefusalAndUnclaimed } from "../src/server/cases/service";

test("guided session persists its topic and resumes from case facts", async () => {
  const database = openDatabase(":memory:");
  try {
    const initial = createGuidedCase(database, { title: "Hồ sơ guided", topicId: "who-inherits" });
    assert.equal(initial.topic.id, "who-inherits");
    assert.equal(initial.next?.requirement.predicate, "guided-deceased-name");

    const answered = await answerGuidedQuestion(database, initial.case.id, { questionId: "guided-deceased-name", value: "Nguyễn Văn A" });
    assert.ok(answered.completedStepIds.includes("guided-deceased-name"));
    assert.ok(answered.case.facts.some((fact) => fact.predicate === "deceased-person" && fact.value === true));
    assert.ok(answered.case.facts.some((fact) => fact.predicate === "heir-person-label" && fact.value === "Nguyễn Văn A"));
    assert.equal(answered.next?.requirement.predicate, "relationship-at-opening");
    assert.equal(answered.next?.resolution?.kind, "interaction");

    const resumed = getGuidedCaseState(database, initial.case.id);
    assert.equal(resumed.topic.id, "who-inherits");
    assert.deepEqual(resumed.completedStepIds, ["guided-deceased-name"]);
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

test("person eligibility flow asks for a candidate and never reviews the deceased", async () => {
  const database = openDatabase(":memory:");
  try {
    let state = createGuidedCase(database, { title: "Rà soát quyền hưởng", topicId: "person-eligibility" });
    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-deceased-name", value: "Người để lại di sản" });
    const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person")?.subject;
    assert.equal(state.next?.requirement.predicate, "guided-eligibility-person-name");
    assert.notEqual(state.next?.requirement.subject, deceasedId);

    state = await answerGuidedQuestion(database, state.case.id, { questionId: "guided-eligibility-person-name", value: "Người cần rà soát" });
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
      { id: "fg-deceased", subject: deceasedId, predicate: "deceased-person", value: true },
      { id: "fg-deceased-label", subject: deceasedId, predicate: "heir-person-label", value: "Nguyễn Văn A" },
      { id: "fg-spouse-label", subject: "person-spouse", predicate: "heir-person-label", value: "Nguyễn Thị B" },
      { id: "fg-spouse-rank", subject: "person-spouse", predicate: "heir-rank-candidate", value: true },
      { id: "fg-spouse-eligibility", subject: "person-spouse", predicate: "eligibility-candidate", value: true },
      { id: "fg-spouse-life", subject: "person-spouse", predicate: "heir-life-status", value: "alive" },
      { id: "fg-spouse-edge", subject: deceasedId, predicate: "spouse-at-opening", value: "person-spouse" },
      { id: "fg-search-complete", subject: state.case.id, predicate: "heir-search-complete", value: true },
    ] });
    await runStoredHeirRank(repository, state.case.id);

    state = getGuidedCaseState(database, state.case.id);
    assert.ok(state.latestRunIds["heir-rank"]);
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
    await runStoredRefusalAndUnclaimed(repository, state.case.id);
    await runStoredHeirRank(repository, state.case.id);

    state = getGuidedCaseState(database, state.case.id);
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
    assert.equal(state.next, undefined);
    assert.ok(compulsoryRun.results.some((result) => result.subject === "person-child" && result.predicate === "compulsory-heir" && result.value === "true"));
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
