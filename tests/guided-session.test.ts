import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/server/db/database";
import { CaseRepository } from "../src/server/db/case-repository";
import { GuidedSessionRepository } from "../src/server/db/guided-session-repository";
import { answerGuidedQuestion, createGuidedCase, getGuidedCaseState } from "../src/server/guided/service";

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
