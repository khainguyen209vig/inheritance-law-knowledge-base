import assert from "node:assert/strict";
import test from "node:test";
import { inferInheritanceType, inferWillValidity } from "../src/server/clips/adapter";

test("CLIPS adapter returns a valid-will result and trace", async () => {
  const output = await inferWillValidity({
    caseId: "adapter-valid",
    subject: "adapter-will",
    facts: [
      { id: "will-type", predicate: "will-type", value: "written" },
      { id: "mental-state", predicate: "testator-mental-state", value: "lucid" },
      { id: "influence", predicate: "undue-influence", value: "none" },
      { id: "content", predicate: "prohibited-content", value: "not-detected" },
      { id: "form", predicate: "formal-defect", value: "not-detected" },
    ],
  });

  assert.ok(output.results.some((result) => result.predicate === "valid-will" && result.value === "true"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-B03"));
});

test("inheritance adapter derives one statutory result per estate portion", async () => {
  const output = await inferInheritanceType({
    caseId: "adapter-inheritance",
    subject: "adapter-inheritance",
    facts: [
      { id: "has-will", subject: "adapter-inheritance", predicate: "has-will", value: false },
      { id: "portion-one", subject: "portion-one", predicate: "estate-portion", value: true },
      { id: "portion-two", subject: "portion-two", predicate: "estate-portion", value: true },
    ],
  });

  assert.deepEqual(output.results.map((result) => result.subject).sort(), ["portion-one", "portion-two"]);
  assert.ok(output.results.every((result) => result.value === "statutory"));
  assert.ok(output.traces.every((trace) => trace.ruleId === "R-A01"));
});

test("CLIPS adapter preserves unknown and missing facts", async () => {
  const output = await inferWillValidity({
    caseId: "adapter-unknown",
    subject: "adapter-will",
    facts: [
      { id: "will-type", predicate: "will-type", value: "written" },
      { id: "mental-state", predicate: "testator-mental-state", value: "lucid" },
      { id: "content", predicate: "prohibited-content", value: "not-detected" },
    ],
  });

  assert.ok(output.results.some((result) => result.predicate === "valid-will" && result.value === "unknown"));
  assert.ok(output.missing.some((missing) => missing.predicate === "undue-influence"));
  assert.ok(output.missing.some((missing) => missing.predicate === "formal-defect"));
});
