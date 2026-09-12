import assert from "node:assert/strict";
import test from "node:test";
import { inferEligibility, inferHeirRank, inferInheritanceType, inferRepresentation, inferWillValidity } from "../src/server/clips/adapter";

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

test("heir-rank adapter derives rank one from directed graph edges", async () => {
  const output = await inferHeirRank({ caseId: "adapter-rank", subject: "deceased-one", facts: [
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "candidate", subject: "person-one", predicate: "heir-rank-candidate", value: true },
    { id: "label", subject: "person-one", predicate: "heir-person-label", value: "Con nuôi A" },
    { id: "edge", subject: "deceased-one", predicate: "adoptive-parent-of", value: "person-one" },
  ] });
  assert.equal(output.results[0]?.subject, "person-one");
  assert.equal(output.results[0]?.value, "rank-1");
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-C01"));
});

test("heir-rank adapter selects the first qualified rank only after an explicit complete search", async () => {
  const output = await inferHeirRank({ caseId: "adapter-rank-two", subject: "adapter-rank-two", facts: [
    { id: "deceased-two", subject: "deceased-two", predicate: "deceased-person", value: true },
    { id: "search-two", subject: "adapter-rank-two", predicate: "heir-search-complete", value: true },
    { id: "first-candidate", subject: "first-person", predicate: "heir-rank-candidate", value: true },
    { id: "first-edge", subject: "first-person", predicate: "spouse-at-opening", value: "deceased-two" },
    { id: "first-eligibility", subject: "first-person", predicate: "eligibility-candidate", value: true },
    { id: "first-review", subject: "first-person", predicate: "eligibility-review-complete", value: true },
    { id: "first-life", subject: "first-person", predicate: "heir-life-status", value: "dead-before-or-same" },
    { id: "first-refusal", subject: "first-person", predicate: "valid-refusal", value: false },
    { id: "second-candidate", subject: "second-person", predicate: "heir-rank-candidate", value: true },
    { id: "second-edge-one", subject: "second-person", predicate: "biological-parent-of", value: "middle-person" },
    { id: "second-edge-two", subject: "middle-person", predicate: "biological-parent-of", value: "deceased-two" },
    { id: "second-eligibility", subject: "second-person", predicate: "eligibility-candidate", value: true },
    { id: "second-review", subject: "second-person", predicate: "eligibility-review-complete", value: true },
    { id: "second-life", subject: "second-person", predicate: "heir-life-status", value: "alive" },
    { id: "second-refusal", subject: "second-person", predicate: "valid-refusal", value: false },
  ] });
  assert.ok(output.results.some((result) => result.predicate === "active-heir-rank" && result.value === "rank-2"));
  assert.ok(output.results.some((result) => result.subject === "first-person" && result.predicate === "called-to-inherit" && result.value === "false"));
  assert.ok(output.results.some((result) => result.subject === "second-person" && result.predicate === "called-to-inherit" && result.value === "true"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-C06"));
});

test("heir-rank adapter does not skip an unresolved earlier-rank candidate", async () => {
  const output = await inferHeirRank({ caseId: "adapter-rank-unresolved", subject: "adapter-rank-unresolved", facts: [
    { id: "unresolved-deceased", subject: "deceased-three", predicate: "deceased-person", value: true },
    { id: "unresolved-search", subject: "adapter-rank-unresolved", predicate: "heir-search-complete", value: true },
    { id: "unresolved-first", subject: "unresolved-first", predicate: "heir-rank-candidate", value: true },
    { id: "unresolved-first-edge", subject: "unresolved-first", predicate: "spouse-at-opening", value: "deceased-three" },
    { id: "unresolved-first-life", subject: "unresolved-first", predicate: "heir-life-status", value: "alive" },
    { id: "unresolved-first-refusal", subject: "unresolved-first", predicate: "valid-refusal", value: false },
    { id: "resolved-second", subject: "resolved-second", predicate: "heir-rank-candidate", value: true },
    { id: "resolved-second-edge-one", subject: "resolved-second", predicate: "biological-parent-of", value: "middle-three" },
    { id: "resolved-second-edge-two", subject: "middle-three", predicate: "biological-parent-of", value: "deceased-three" },
    { id: "resolved-second-eligibility", subject: "resolved-second", predicate: "eligibility-candidate", value: true },
    { id: "resolved-second-review", subject: "resolved-second", predicate: "eligibility-review-complete", value: true },
    { id: "resolved-second-life", subject: "resolved-second", predicate: "heir-life-status", value: "alive" },
    { id: "resolved-second-refusal", subject: "resolved-second", predicate: "valid-refusal", value: false },
  ] });
  assert.ok(output.missing.some((item) => item.subject === "unresolved-first" && item.predicate === "article-621-status"));
  assert.ok(!output.results.some((result) => result.predicate === "active-heir-rank"));
  assert.ok(!output.results.some((result) => result.subject === "resolved-second" && result.predicate === "called-to-inherit" && result.value === "true"));
});

test("representation adapter derives a grandchild result from a multi-step family path", async () => {
  const output = await inferRepresentation({ caseId: "adapter-representation", subject: "adapter-representation", facts: [
    { id: "representation-deceased", subject: "representation-deceased", predicate: "deceased-person", value: true },
    { id: "representation-parent-edge", subject: "representation-deceased", predicate: "biological-parent-of", value: "represented-child" },
    { id: "representation-child-edge", subject: "represented-child", predicate: "biological-parent-of", value: "representation-grandchild" },
    { id: "represented-life", subject: "represented-child", predicate: "heir-life-status", value: "dead-before-or-same" },
    { id: "represented-eligibility", subject: "represented-child", predicate: "eligibility-candidate", value: true },
    { id: "represented-review", subject: "represented-child", predicate: "eligibility-review-complete", value: true },
    { id: "representation-candidate", subject: "representation-grandchild", predicate: "representation-candidate", value: true },
    { id: "representation-life", subject: "representation-grandchild", predicate: "heir-life-status", value: "alive" },
    { id: "representation-refusal", subject: "representation-grandchild", predicate: "valid-refusal", value: false },
    { id: "representation-eligibility", subject: "representation-grandchild", predicate: "eligibility-candidate", value: true },
    { id: "representation-review", subject: "representation-grandchild", predicate: "eligibility-review-complete", value: true },
  ] });
  assert.ok(output.results.some((result) => result.subject === "representation-grandchild" && result.value === "true"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-E01"));
});

test("representation adapter keeps adoptive and biological relationship bases without asserting final entitlement", async () => {
  const output = await inferRepresentation({ caseId: "adapter-adoption", subject: "adapter-adoption", facts: [
    { id: "adoptive-edge", subject: "adoptive-parent", predicate: "adoptive-parent-of", value: "adopted-child" },
    { id: "biological-edge", subject: "biological-parent", predicate: "biological-parent-of", value: "adopted-child" },
  ] });
  assert.ok(output.results.some((result) => result.subject === "adopted-child" && result.predicate === "adoption-inheritance-basis" && result.value === "true"));
  assert.ok(output.results.some((result) => result.subject === "adopted-child" && result.predicate === "dual-parentage-inheritance-basis" && result.value === "true"));
  assert.ok(!output.results.some((result) => result.predicate === "inherits-by-representation"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-E03a"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-E03b"));
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
