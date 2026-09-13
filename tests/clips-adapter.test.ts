import assert from "node:assert/strict";
import test from "node:test";
import { inferCompulsoryShare, inferEligibility, inferEstateSettlement, inferHeirRank, inferInheritanceType, inferLimitation, inferRefusalAndUnclaimed, inferRepresentation, inferSpouseStatus, inferWillValidity } from "../src/server/clips/adapter";

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

test("detailed Group H facts override a contradictory legacy refusal result downstream", async () => {
  const output = await inferHeirRank({ caseId: "adapter-rank-refusal-h", subject: "adapter-rank-refusal-h", facts: [
    { id: "deceased-h", subject: "deceased-h", predicate: "deceased-person", value: true },
    { id: "search-h", subject: "adapter-rank-refusal-h", predicate: "heir-search-complete", value: true },
    { id: "candidate-h", subject: "person-h", predicate: "heir-rank-candidate", value: true },
    { id: "edge-h", subject: "deceased-h", predicate: "biological-parent-of", value: "person-h" },
    { id: "eligibility-h", subject: "person-h", predicate: "eligibility-candidate", value: true },
    { id: "review-h", subject: "person-h", predicate: "eligibility-review-complete", value: true },
    { id: "life-h", subject: "person-h", predicate: "heir-life-status", value: "alive" },
    { id: "legacy-refusal-h", subject: "person-h", predicate: "valid-refusal", value: false },
    { id: "scope-h", subject: "person-h", predicate: "refusal-assessment-subject", value: true },
    { id: "made-h", subject: "person-h", predicate: "refusal-made", value: true },
    { id: "intent-h", subject: "person-h", predicate: "refusal-intent", value: "ordinary" },
    { id: "written-h", subject: "person-h", predicate: "refusal-written", value: true },
    { id: "recipient-h", subject: "person-h", predicate: "refusal-notice-recipient", value: "other-heir" },
    { id: "timing-h", subject: "person-h", predicate: "refusal-before-estate-distribution", value: true },
  ] });
  assert.ok(output.results.some((result) => result.subject === "person-h" && result.predicate === "called-to-inherit" && result.value === "false"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "VALID-REFUSAL-COMPOSED"));
  assert.ok(!output.results.some((result) => result.subject === "person-h" && result.predicate === "called-to-inherit" && result.value === "true"));
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

test("representation adapter requires explicit step-family care assessment", async () => {
  const output = await inferRepresentation({ caseId: "adapter-step-family", subject: "adapter-step-family", facts: [
    { id: "positive-edge", subject: "step-parent-positive", predicate: "step-parent-of", value: "step-child-positive" },
    { id: "positive-care", subject: "positive-edge", predicate: "step-care-status", value: "established" },
    { id: "negative-edge", subject: "step-parent-negative", predicate: "step-parent-of", value: "step-child-negative" },
    { id: "negative-care", subject: "negative-edge", predicate: "step-care-status", value: "not-established" },
    { id: "unknown-edge", subject: "step-parent-unknown", predicate: "step-parent-of", value: "step-child-unknown" },
  ] });
  assert.ok(output.results.some((result) => result.subject === "step-child-positive" && result.predicate === "step-relationship-inheritance-basis" && result.value === "true"));
  assert.ok(output.results.some((result) => result.subject === "step-child-negative" && result.predicate === "eligible-by-step-relationship" && result.value === "false"));
  assert.ok(output.missing.some((item) => item.subject === "step-child-unknown" && item.predicate === "step-care-status"));
  assert.ok(!output.results.some((result) => result.subject === "step-child-unknown"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-E04"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-E05"));
});

test("representation adapter implies step-parent relations from spouse and separate biological-child facts", async () => {
  const output = await inferRepresentation({ caseId: "adapter-implied-step", subject: "adapter-implied-step", facts: [
    { id: "spouses", subject: "parent-a", predicate: "spouse-at-opening", value: "parent-b" },
    { id: "separate-child", subject: "parent-a", predicate: "biological-parent-of", value: "child-separate" },
    { id: "joint-child-a", subject: "parent-a", predicate: "biological-parent-of", value: "child-joint" },
    { id: "joint-child-b", subject: "parent-b", predicate: "biological-parent-of", value: "child-joint" },
  ] });
  assert.ok(output.traces.some((trace) => trace.ruleId === "SYSTEM-IMPLY-STEP-RELATIONSHIP" && trace.subject === "parent-b" && trace.conclusionPredicate === "step-parent-of" && trace.conclusionValue === "child-separate"));
  assert.ok(!output.traces.some((trace) => trace.ruleId === "SYSTEM-IMPLY-STEP-RELATIONSHIP" && trace.conclusionValue === "child-joint"));
});

test("representation adapter blocks contradictory step-family care assessments", async () => {
  const output = await inferRepresentation({ caseId: "adapter-step-conflict", subject: "adapter-step-conflict", facts: [
    { id: "conflict-edge", subject: "step-parent", predicate: "step-parent-of", value: "step-child" },
    { id: "conflict-positive", subject: "conflict-edge", predicate: "step-care-status", value: "established" },
    { id: "conflict-negative", subject: "conflict-edge", predicate: "step-care-status", value: "not-established" },
  ] });
  assert.ok(output.results.some((result) => result.subject === "step-child" && result.predicate === "step-care-assessment" && result.value === "conflict"));
  assert.ok(!output.results.some((result) => result.predicate === "step-relationship-inheritance-basis" || result.predicate === "eligible-by-step-relationship"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "SYSTEM-STEP-CARE-CONFLICT"));
});

test("compulsory-share adapter separates protected-class classification from active status", async () => {
  const output = await inferCompulsoryShare({ caseId: "adapter-compulsory", subject: "adapter-compulsory", facts: [
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "complete", subject: "adapter-compulsory", predicate: "heir-search-complete", value: true },
    { id: "scope", subject: "minor-child", predicate: "compulsory-share-assessment-subject", value: true },
    { id: "edge", subject: "deceased-one", predicate: "biological-parent-of", value: "minor-child" },
    { id: "age", subject: "minor-child", predicate: "age-group", value: "minor" },
    { id: "refusal", subject: "minor-child", predicate: "valid-refusal", value: false },
    { id: "eligibility", subject: "minor-child", predicate: "eligibility-candidate", value: true },
    { id: "review", subject: "minor-child", predicate: "eligibility-review-complete", value: true },
    { id: "portion", subject: "portion-one", predicate: "estate-portion", value: true },
    { id: "calculation", subject: "calc-one", predicate: "compulsory-share-calculation", value: true },
    { id: "calculation-person", subject: "calc-one", predicate: "calculation-person", value: "minor-child" },
    { id: "calculation-portion", subject: "calc-one", predicate: "calculation-estate-portion", value: "portion-one" },
    { id: "statutory-share", subject: "calc-one", predicate: "hypothetical-statutory-share", value: 300 },
    { id: "testamentary-share", subject: "calc-one", predicate: "testamentary-share-received", value: 100 },
  ] });
  assert.ok(output.results.some((result) => result.predicate === "compulsory-heir-candidate" && result.value === "true"));
  assert.ok(output.results.some((result) => result.predicate === "compulsory-heir" && result.value === "true"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-F01a"));
  assert.ok(output.results.some((result) => result.subject === "calc-one" && result.predicate === "minimum-compulsory-share" && Number(result.value) === 200));
  assert.ok(output.results.some((result) => result.subject === "calc-one" && result.predicate === "compulsory-share-shortfall" && Number(result.value) === 100));
});

test("spouse-status adapter preserves marital status for a pending non-effective divorce", async () => {
  const output = await inferSpouseStatus({ caseId: "adapter-spouse", subject: "adapter-spouse", facts: [
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "scope", subject: "spouse-one", predicate: "spouse-status-assessment-subject", value: true },
    { id: "marriage", subject: "deceased-one", predicate: "spouse-at-opening", value: "spouse-one" },
    { id: "property", subject: "spouse-one", predicate: "joint-property-divided", value: false },
    { id: "petition", subject: "spouse-one", predicate: "divorce-petition-pending-at-opening", value: true },
    { id: "decision", subject: "spouse-one", predicate: "divorce-decision-effective-at-opening", value: false },
    { id: "remarriage", subject: "spouse-one", predicate: "remarried-after-opening", value: false },
  ] });
  assert.ok(output.results.some((result) => result.subject === "spouse-one" && result.predicate === "spouse-status-at-opening" && result.value === "valid"));
  assert.ok(output.traces.some((trace) => trace.subject === "spouse-one" && trace.ruleId === "R-G02"));
});

test("refusal adapter composes validity and closes unclaimed-estate search", async () => {
  const output = await inferRefusalAndUnclaimed({ caseId: "adapter-refusal", subject: "adapter-refusal", facts: [
    { id: "heir-search", subject: "adapter-refusal", predicate: "heir-search-complete", value: true },
    { id: "scope", subject: "person-one", predicate: "refusal-assessment-subject", value: true },
    { id: "made", subject: "person-one", predicate: "refusal-made", value: true },
    { id: "intent", subject: "person-one", predicate: "refusal-intent", value: "ordinary" },
    { id: "written", subject: "person-one", predicate: "refusal-written", value: true },
    { id: "recipient", subject: "person-one", predicate: "refusal-notice-recipient", value: "distribution-assignee" },
    { id: "timing", subject: "person-one", predicate: "refusal-before-estate-distribution", value: true },
    { id: "portion", subject: "portion-one", predicate: "estate-portion", value: true },
    { id: "portion-scope", subject: "portion-one", predicate: "unclaimed-estate-assessment-subject", value: true },
    { id: "testamentary-search", subject: "portion-one", predicate: "testamentary-beneficiary-search-complete", value: true },
    { id: "remaining", subject: "portion-one", predicate: "remaining-estate-after-obligations", value: true },
  ] });
  assert.ok(output.results.some((result) => result.subject === "person-one" && result.predicate === "valid-refusal" && result.value === "true"));
  assert.ok(output.results.some((result) => result.subject === "portion-one" && result.predicate === "unclaimed-estate-recipient" && result.value === "state"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-H01"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-H03"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-H04"));
});

test("estate settlement adapter joins obligations with Article 658 knowledge facts", async () => {
  const output = await inferEstateSettlement({ caseId: "adapter-settlement", subject: "adapter-settlement", facts: [
    { id: "debt-entity", subject: "debt-one", predicate: "estate-obligation", value: true },
    { id: "debt-type", subject: "debt-one", predicate: "obligation-type", value: "other-debt" },
    { id: "funeral-entity", subject: "funeral-one", predicate: "estate-obligation", value: true },
    { id: "funeral-type", subject: "funeral-one", predicate: "obligation-type", value: "funeral-expense" },
    { id: "missing-entity", subject: "missing-one", predicate: "estate-obligation", value: true },
  ] });
  assert.equal(output.results.find((item) => item.subject === "funeral-one")?.value, "1");
  assert.equal(output.results.find((item) => item.subject === "debt-one")?.value, "8");
  assert.equal(output.results.find((item) => item.subject === "missing-one")?.value, "unknown");
  assert.ok(output.missing.some((item) => item.subject === "missing-one" && item.predicate === "obligation-type"));
  assert.ok(output.traces.some((trace) => trace.subject === "funeral-one" && trace.ruleId === "R-I01"));
});

test("estate settlement adapter identifies the Article 659 equal-share default", async () => {
  const output = await inferEstateSettlement({ caseId: "adapter-equal-share", subject: "adapter-equal-share", facts: [
    { id: "group", subject: "group-one", predicate: "testamentary-distribution-group", value: true },
    { id: "complete", subject: "group-one", predicate: "distribution-beneficiary-set-complete", value: true },
    { id: "person-one", subject: "group-one", predicate: "distribution-beneficiary", value: "person-one" },
    { id: "person-two", subject: "group-one", predicate: "distribution-beneficiary", value: "person-two" },
    { id: "shares", subject: "group-one", predicate: "testamentary-shares-specified", value: false },
    { id: "agreement", subject: "group-one", predicate: "alternative-share-agreement", value: false },
  ] });
  assert.ok(output.results.some((item) => item.subject === "group-one" && item.predicate === "equal-testamentary-share-principle-applies" && item.value === "true"));
  assert.ok(output.traces.some((trace) => trace.subject === "group-one" && trace.ruleId === "R-I02"));
});

test("estate settlement adapter reuses derived heir ranks for the prenatal share", async () => {
  const output = await inferEstateSettlement({ caseId: "adapter-prenatal", subject: "adapter-prenatal", facts: [
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "search", subject: "adapter-prenatal", predicate: "heir-search-complete", value: true },
    { id: "living-candidate", subject: "living-child", predicate: "heir-rank-candidate", value: true },
    { id: "living-edge", subject: "deceased-one", predicate: "biological-parent-of", value: "living-child" },
    { id: "living-eligibility", subject: "living-child", predicate: "eligibility-candidate", value: true },
    { id: "living-review", subject: "living-child", predicate: "eligibility-review-complete", value: true },
    { id: "living-life", subject: "living-child", predicate: "heir-life-status", value: "alive" },
    { id: "living-refusal", subject: "living-child", predicate: "valid-refusal", value: false },
    { id: "prenatal-candidate", subject: "prenatal-child", predicate: "heir-rank-candidate", value: true },
    { id: "prenatal-edge", subject: "deceased-one", predicate: "biological-parent-of", value: "prenatal-child" },
    { id: "prenatal-scope", subject: "prenatal-child", predicate: "prenatal-share-assessment-subject", value: true },
    { id: "prenatal-status", subject: "prenatal-child", predicate: "prenatal-status-at-distribution", value: "conceived-not-born" },
    { id: "prenatal-outcome", subject: "prenatal-child", predicate: "prenatal-birth-outcome", value: "born-alive" },
  ] });
  assert.ok(output.results.some((item) => item.subject === "prenatal-child" && item.predicate === "reserve-equal-share" && item.value === "true"));
  assert.ok(output.results.some((item) => item.subject === "prenatal-child" && item.predicate === "reserved-share-vests-in-child" && item.value === "true"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-I03a"));
  assert.ok(output.traces.some((trace) => trace.ruleId === "R-I03b"));
});

test("estate settlement adapter preserves the Article 661 date and court-request boundary", async () => {
  const output = await inferEstateSettlement({ caseId: "adapter-restriction", subject: "adapter-restriction", facts: [
    { id: "restriction", subject: "restriction-one", predicate: "division-restriction-assessment-subject", value: true },
    { id: "basis", subject: "restriction-one", predicate: "division-restriction-basis", value: "will-instruction" },
    { id: "date", subject: "restriction-one", predicate: "specified-division-date", value: "2030-01-01" },
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "spouse-edge", subject: "spouse-one", predicate: "spouse-at-opening", value: "deceased-one" },
    { id: "spouse-life", subject: "spouse-one", predicate: "heir-life-status", value: "alive" },
    { id: "hardship", subject: "spouse-one", predicate: "division-hardship-assessment-subject", value: true },
    { id: "request", subject: "spouse-one", predicate: "estate-division-requested", value: true },
    { id: "impact", subject: "spouse-one", predicate: "serious-division-impact", value: true },
  ] });
  assert.ok(output.results.some((item) => item.subject === "restriction-one" && item.predicate === "distribution-not-before" && item.value === "2030-01-01"));
  assert.ok(output.results.some((item) => item.subject === "spouse-one" && item.predicate === "court-deferral-may-be-requested" && item.value === "true"));
  assert.ok(output.results.some((item) => item.subject === "spouse-one" && item.predicate === "initial-deferral-maximum-years" && item.value === "3"));
  assert.ok(!output.results.some((item) => item.subject === "spouse-one" && item.predicate === "court-deferral-granted"));
});

test("limitation adapter selects Article 623 periods and calculates calendar deadlines", async () => {
  const output = await inferLimitation({ caseId: "adapter-limitation", subject: "adapter-limitation", facts: [
    { id: "immovable-scope", subject: "immovable-request", predicate: "limitation-assessment-subject", value: true },
    { id: "immovable-type", subject: "immovable-request", predicate: "request-type", value: "divide-estate" },
    { id: "immovable-asset", subject: "immovable-request", predicate: "asset-type", value: "immovable" },
    { id: "immovable-opening", subject: "immovable-request", predicate: "inheritance-opening-date", value: "2020-02-29" },
    { id: "obligation-scope", subject: "obligation-request", predicate: "limitation-assessment-subject", value: true },
    { id: "obligation-type", subject: "obligation-request", predicate: "request-type", value: "perform-estate-obligation" },
    { id: "obligation-opening", subject: "obligation-request", predicate: "inheritance-opening-date", value: "2020-06-30" },
  ] });
  assert.ok(output.results.some((item) => item.subject === "immovable-request" && item.predicate === "limitation-period-years" && item.value === "30"));
  assert.ok(output.results.some((item) => item.subject === "immovable-request" && item.predicate === "limitation-deadline" && item.value === "2050-02-28"));
  assert.ok(output.results.some((item) => item.subject === "obligation-request" && item.predicate === "limitation-deadline" && item.value === "2023-06-30"));
  assert.ok(output.traces.some((item) => item.subject === "immovable-request" && item.ruleId === "R-J01"));
  assert.ok(output.traces.some((item) => item.subject === "obligation-request" && item.ruleId === "R-J04"));
});

test("limitation adapter keeps post-limitation recipient branches mutually ordered", async () => {
  const output = await inferLimitation({ caseId: "adapter-post-limitation", subject: "adapter-post-limitation", facts: [
    { id: "managed-scope", subject: "managed-asset", predicate: "post-limitation-assessment-subject", value: true },
    { id: "managed-expired", subject: "managed-asset", predicate: "limitation-expiry-confirmed", value: true },
    { id: "managed-person", subject: "managed-asset", predicate: "estate-managing-heir", value: "heir-one" },
    { id: "possessed-scope", subject: "possessed-asset", predicate: "post-limitation-assessment-subject", value: true },
    { id: "possessed-expired", subject: "possessed-asset", predicate: "limitation-expiry-confirmed", value: true },
    { id: "possessed-heir-search", subject: "possessed-asset", predicate: "managing-heir-search-complete", value: true },
    { id: "possessed-person", subject: "possessed-asset", predicate: "article-236-qualified-possessor", value: "possessor-one" },
    { id: "state-scope", subject: "state-asset", predicate: "post-limitation-assessment-subject", value: true },
    { id: "state-expired", subject: "state-asset", predicate: "limitation-expiry-confirmed", value: true },
    { id: "state-heir-search", subject: "state-asset", predicate: "managing-heir-search-complete", value: true },
    { id: "state-possessor-search", subject: "state-asset", predicate: "qualified-possessor-search-complete", value: true },
  ] });
  assert.deepEqual(Object.fromEntries(output.results.filter((item) => item.predicate === "post-limitation-recipient").map((item) => [item.subject, item.value])), {
    "managed-asset": "managing-heir", "possessed-asset": "qualified-possessor", "state-asset": "state",
  });
  assert.ok(output.traces.some((item) => item.subject === "managed-asset" && item.ruleId === "R-J05"));
  assert.ok(output.traces.some((item) => item.subject === "possessed-asset" && item.ruleId === "R-J06"));
  assert.ok(output.traces.some((item) => item.subject === "state-asset" && item.ruleId === "R-J07"));
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
