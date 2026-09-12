import assert from "node:assert/strict";
import test from "node:test";
import { runStoredEligibility, runStoredHeirRank, runStoredInheritanceType, runStoredRepresentation, runStoredWillValidity } from "../src/server/cases/service";
import { CaseRepository } from "../src/server/db/case-repository";
import { openDatabase } from "../src/server/db/database";

test("stored inference reads current facts and persists CLIPS output", async () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);

  try {
    repository.createCase({ id: "case-stored", title: "Di chúc mẫu" });
    repository.replaceFacts("case-stored", {
      subject: "will-stored",
      facts: [
        { id: "type", predicate: "will-type", value: "written" },
        { id: "mental", predicate: "testator-mental-state", value: "lucid" },
        { id: "influence", predicate: "undue-influence", value: "none" },
        { id: "content", predicate: "prohibited-content", value: "not-detected" },
        { id: "form", predicate: "formal-defect", value: "not-detected" },
      ],
    });

    const run = await runStoredWillValidity(repository, "case-stored", "will-stored");

    assert.ok(run.results.some((result) => result.value === "true"));
    assert.ok(run.traces.some((trace) => trace.ruleId === "R-B03"));
    assert.equal(repository.getInferenceRun("case-stored", run.id).knowledgeBaseVersion, "will-validity-rb01-rb09-v1");
  } finally {
    database.close();
  }
});

test("stored eligibility inference persists one result per person", async () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);
  try {
    repository.createCase({ id: "case-eligibility", title: "Ứng viên" });
    repository.replaceFacts("case-eligibility", { subject: "case-eligibility", facts: [
      { id: "candidate", subject: "person-one", predicate: "eligibility-candidate", value: true },
      { id: "complete", subject: "person-one", predicate: "eligibility-review-complete", value: true },
      { id: "violation", subject: "person-one", predicate: "serious-support-duty-violation", value: true },
    ] });
    const run = await runStoredEligibility(repository, "case-eligibility");
    assert.equal(run.module, "eligibility");
    assert.equal(run.results[0]?.subject, "person-one");
    assert.equal(run.results[0]?.value, "excluded");
  } finally { database.close(); }
});

test("stored heir-rank inference persists graph classification", async () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);
  try {
    repository.createCase({ id: "case-rank", title: "Graph gia đình" });
    repository.replaceFacts("case-rank", { subject: "case-rank", facts: [
      { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
      { id: "candidate", subject: "person-one", predicate: "heir-rank-candidate", value: true },
      { id: "edge", subject: "person-one", predicate: "spouse-at-opening", value: "deceased-one" },
    ] });
    const run = await runStoredHeirRank(repository, "case-rank");
    assert.equal(run.module, "heir-rank");
    assert.ok(run.results.some((result) => result.predicate === "candidate-heir-rank" && result.value === "rank-1"));
  } finally { database.close(); }
});

test("stored representation inference persists its candidate subject", async () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);
  try {
    repository.createCase({ id: "case-representation", title: "Nhánh thế vị" });
    repository.replaceFacts("case-representation", { subject: "case-representation", facts: [
      { id: "rep-deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
      { id: "rep-edge-one", subject: "deceased-one", predicate: "biological-parent-of", value: "represented-one" },
      { id: "rep-edge-two", subject: "represented-one", predicate: "biological-parent-of", value: "candidate-one" },
      { id: "rep-parent-life", subject: "represented-one", predicate: "heir-life-status", value: "dead-before-or-same" },
      { id: "rep-parent-eligibility", subject: "represented-one", predicate: "eligibility-candidate", value: true },
      { id: "rep-parent-review", subject: "represented-one", predicate: "eligibility-review-complete", value: true },
      { id: "rep-candidate", subject: "candidate-one", predicate: "representation-candidate", value: true },
      { id: "rep-life", subject: "candidate-one", predicate: "heir-life-status", value: "alive" },
      { id: "rep-refusal", subject: "candidate-one", predicate: "valid-refusal", value: false },
      { id: "rep-eligibility", subject: "candidate-one", predicate: "eligibility-candidate", value: true },
      { id: "rep-review", subject: "candidate-one", predicate: "eligibility-review-complete", value: true },
    ] });
    const run = await runStoredRepresentation(repository, "case-representation");
    assert.equal(run.module, "representation");
    assert.ok(run.results.some((result) => result.subject === "candidate-one" && result.value === "true"));
  } finally { database.close(); }
});

test("stored inheritance inference preserves result subjects and classification values", async () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);
  try {
    repository.createCase({ id: "case-regime", title: "Hai phần di sản" });
    repository.replaceFacts("case-regime", {
      subject: "case-regime",
      facts: [
        { id: "has-will", subject: "case-regime", predicate: "has-will", value: false },
        { id: "first-portion", subject: "portion-first", predicate: "estate-portion", value: true },
        { id: "second-portion", subject: "portion-second", predicate: "estate-portion", value: true },
      ],
    });

    const run = await runStoredInheritanceType(repository, "case-regime");
    assert.equal(run.module, "inheritance-type");
    assert.deepEqual(run.results.map((result) => result.subject).sort(), ["portion-first", "portion-second"]);
    assert.ok(run.results.every((result) => result.value === "statutory"));
  } finally {
    database.close();
  }
});
