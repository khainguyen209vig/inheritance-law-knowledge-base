import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/server/db/database";
import { CaseNotFoundError, CaseRepository } from "../src/server/db/case-repository";

test("case repository replaces current facts and preserves inference snapshots", () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);

  try {
    repository.createCase({ id: "case-persistence", title: "Vụ việc kiểm thử" });
    repository.replaceFacts("case-persistence", {
      subject: "will-one",
      facts: [{ id: "mental", predicate: "testator-mental-state", value: "lucid" }],
    });

    const run = repository.saveInferenceRun({
      caseId: "case-persistence",
      subject: "will-one",
      facts: [{ id: "mental", predicate: "testator-mental-state", value: "lucid" }],
      output: {
        results: [{
          caseId: "case-persistence",
          subject: "will-one",
          module: "will-validity",
          predicate: "valid-will",
          value: "unknown",
          derivations: ["SYSTEM-INCOMPLETE"],
        }],
        missing: [{
          caseId: "case-persistence",
          subject: "will-one",
          module: "will-validity",
          predicate: "undue-influence",
        }],
        traces: [],
      },
    });

    repository.replaceFacts("case-persistence", {
      subject: "will-one",
      facts: [{ id: "mental", predicate: "testator-mental-state", value: "not-lucid" }],
    });

    assert.equal(repository.getCase("case-persistence").facts[0]?.value, "not-lucid");
    assert.equal(repository.getInferenceRun("case-persistence", run.id).inputSnapshot[0]?.value, "lucid");
    assert.equal(repository.getInferenceRun("case-persistence", run.id).results[0]?.value, "unknown");
    assert.deepEqual(repository.listInferenceRuns("case-persistence").map((item) => item.id), [run.id]);

    const summary = repository.listCases()[0];
    assert.equal(summary?.id, "case-persistence");
    assert.equal(summary?.factCount, 1);
    assert.equal(summary?.runCount, 1);
    assert.equal(summary?.latestRun?.id, run.id);
    assert.equal(summary?.latestRun?.results[0]?.value, "unknown");

    assert.equal(repository.updateCaseTitle("case-persistence", "Tên hồ sơ mới").title, "Tên hồ sơ mới");
  } finally {
    database.close();
  }
});

test("case repository rejects an unknown case", () => {
  const database = openDatabase(":memory:");
  const repository = new CaseRepository(database);
  try {
    assert.throws(() => repository.getCase("case-missing"), CaseNotFoundError);
    assert.throws(() => repository.listInferenceRuns("case-missing"), CaseNotFoundError);
  } finally {
    database.close();
  }
});
