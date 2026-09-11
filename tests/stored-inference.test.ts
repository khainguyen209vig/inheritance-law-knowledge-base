import assert from "node:assert/strict";
import test from "node:test";
import { runStoredInheritanceType, runStoredWillValidity } from "../src/server/cases/service";
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
