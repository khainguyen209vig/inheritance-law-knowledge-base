import assert from "node:assert/strict";
import test from "node:test";
import { inferEligibility, inferInheritanceType, inferWillValidity } from "../src/server/clips/adapter";

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

test("inheritance adapter keeps statutory and testamentary results separate by portion", async () => {
  const output = await inferInheritanceType({
    caseId: "adapter-mixed", subject: "adapter-mixed",
    facts: [
      { id: "has-will", subject: "adapter-mixed", predicate: "has-will", value: true },
      { id: "p-one", subject: "portion-one", predicate: "estate-portion", value: true },
      { id: "p-one-will", subject: "portion-one", predicate: "applicable-will", value: "will-one" },
      { id: "p-one-disposed", subject: "portion-one", predicate: "portion-disposed", value: true },
      { id: "p-one-beneficiary", subject: "portion-one", predicate: "disposition-beneficiary", value: "person-one" },
      { id: "p-one-status", subject: "portion-one", predicate: "disposition-status", value: "effective" },
      { id: "p-two", subject: "portion-two", predicate: "estate-portion", value: true },
      { id: "p-two-will", subject: "portion-two", predicate: "applicable-will", value: "will-one" },
      { id: "p-two-complete", subject: "portion-two", predicate: "disposition-set-complete", value: true },
      { id: "p-two-disposed", subject: "portion-two", predicate: "portion-disposed", value: false },
      { id: "mental", subject: "will-one", predicate: "testator-mental-state", value: "lucid" },
      { id: "influence", subject: "will-one", predicate: "undue-influence", value: "none" },
      { id: "type", subject: "will-one", predicate: "will-type", value: "written" },
      { id: "form", subject: "will-one", predicate: "formal-defect", value: "not-detected" },
      { id: "content", subject: "will-one", predicate: "prohibited-content", value: "not-detected" },
    ],
  });
  assert.deepEqual(Object.fromEntries(output.results.map((item) => [item.subject, item.value])), {
    "portion-one": "testamentary", "portion-two": "statutory",
  });
});

test("eligibility adapter evaluates multiple people and safely serializes labels", async () => {
  const output = await inferEligibility({
    caseId: "adapter-eligibility", subject: "adapter-eligibility",
    facts: [
      { id: "one-candidate", subject: "person-one", predicate: "eligibility-candidate", value: true },
      { id: "one-label", subject: "person-one", predicate: "person-label", value: "Nguyễn Văn A" },
      { id: "one-complete", subject: "person-one", predicate: "eligibility-review-complete", value: true },
      { id: "two-candidate", subject: "person-two", predicate: "eligibility-candidate", value: true },
      { id: "two-complete", subject: "person-two", predicate: "eligibility-review-complete", value: true },
      { id: "two-support", subject: "person-two", predicate: "serious-support-duty-violation", value: true },
    ],
  });
  assert.deepEqual(Object.fromEntries(output.results.map((item) => [item.subject, item.value])), { "person-one": "not-excluded", "person-two": "excluded" });
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-D02"));
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
