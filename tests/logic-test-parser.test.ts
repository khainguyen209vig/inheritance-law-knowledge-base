import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { POST as parseRoute } from "../src/app/api/logic-tests/parse/route";
import { caseFactPredicates } from "../src/domain/case";
import { logicTestLimits } from "../src/domain/logic-test";
import { parseLogicTestClpBytes, parseLogicTestClpSource } from "../src/server/logic-test/parser";

const fixtureDirectory = path.join(process.cwd(), "knowledge-base/fixtures/logic-test");

test("restricted parser normalizes all Quick Logic Test release fixtures", () => {
  const expected = new Map([
    ["complete.clp", { caseId: "logic-test-complete", facts: 5 }],
    ["unknown-missing.clp", { caseId: "logic-test-unknown", facts: 3 }],
    ["conflict.clp", { caseId: "logic-test-conflict", facts: 6 }],
  ]);
  for (const [fileName, expectation] of expected) {
    const bytes = readFileSync(path.join(fixtureDirectory, fileName));
    const result = parseLogicTestClpBytes(bytes, { fileName });
    assert.equal(result.caseStudy?.caseId, expectation.caseId);
    assert.equal(result.caseStudy?.facts.length, expectation.facts);
    assert.equal(result.summary?.factCount, expectation.facts);
    assert.equal(result.summary?.subjectCount, 1);
    assert.equal(result.diagnostics.some((item) => item.severity === "error"), false);
  }
});

test("predicate allow-list is derived from every module fact contract", () => {
  assert.ok(caseFactPredicates.size > 50);
  for (const predicate of ["will-type", "deceased-person", "eligibility-candidate", "representation-candidate", "inheritance-opening-date"]) {
    assert.ok(caseFactPredicates.has(predicate), `missing ${predicate}`);
  }
});

test("restricted parser rejects executable top-level CLIPS constructs", () => {
  for (const form of [
    "(defrule injected => (assert (owned true)))",
    '(deffunction injected () (system "id"))',
    '(load "foreign.clp")',
    '(load-facts "foreign.clp")',
    '(batch "foreign.clp")',
    '(system "touch /tmp/should-not-exist")',
    "(assert (asserted-fact (fact-id injected)))",
  ]) {
    const result = parseLogicTestClpSource(`${validFactSource()}\n${form}`, { fileName: "attack.clp" });
    assert.equal(result.caseStudy, undefined);
    assert.ok(result.diagnostics.some((item) => item.code === "UNSUPPORTED_TOP_LEVEL_FORM"));
  }
});

test("restricted parser reports malformed input instead of throwing", () => {
  const cases = [
    { source: '(asserted-fact (fact-id x) (case-id case-a) (subject will-a) (predicate will-type) (value "written))', code: "UNTERMINATED_STRING" },
    { source: "(asserted-fact (fact-id x)", code: "UNTERMINATED_FORM" },
    { source: "not-a-form", code: "UNEXPECTED_TOKEN" },
    { source: "(asserted-fact (fact-id x) (case-id case-a))", code: "MISSING_SLOT" },
  ] as const;
  for (const item of cases) {
    const result = parseLogicTestClpSource(item.source, { fileName: "broken.clp" });
    assert.equal(result.caseStudy, undefined);
    assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === item.code), item.code);
  }
});

test("restricted parser preserves diagnostic line and column", () => {
  const result = parseLogicTestClpSource(`${validFactSource()}\n(load "foreign.clp")`, { fileName: "located.clp" });
  const unsupported = result.diagnostics.find((item) => item.code === "UNSUPPORTED_TOP_LEVEL_FORM");
  assert.equal(unsupported?.location.line, 2);
  assert.equal(unsupported?.location.column, 2);
});

test("restricted parser rejects invalid UTF-8, inconsistent cases, duplicate IDs and too many facts", () => {
  const invalidUtf8 = parseLogicTestClpBytes(Uint8Array.from([0xc3, 0x28]), { fileName: "invalid.clp" });
  assert.equal(invalidUtf8.diagnostics[0]?.code, "INVALID_UTF8");

  const inconsistent = parseLogicTestClpSource(`${validFactSource("case-one", "same-id")}\n${validFactSource("case-two", "other-id")}`, { fileName: "cases.clp" });
  assert.ok(inconsistent.diagnostics.some((item) => item.code === "INCONSISTENT_CASE_ID"));

  const duplicate = parseLogicTestClpSource(`${validFactSource("case-one", "same-id")}\n${validFactSource("case-one", "same-id")}`, { fileName: "duplicate.clp" });
  assert.ok(duplicate.diagnostics.some((item) => item.code === "DUPLICATE_FACT_ID"));

  const tooMany = Array.from({ length: logicTestLimits.maxFacts + 1 }, (_, index) => validFactSource("case-many", `fact-${index}`)).join("\n");
  const overflow = parseLogicTestClpSource(tooMany, { fileName: "many.clp" });
  assert.ok(overflow.diagnostics.some((item) => item.code === "TOO_MANY_FACTS"));
  assert.equal(overflow.caseStudy, undefined);
});

test("parse API accepts one multipart CLP file and returns preview data", async () => {
  const formData = new FormData();
  formData.set("file", new File([readFileSync(path.join(fixtureDirectory, "complete.clp"))], "complete.clp", { type: "text/plain" }));
  const response = await parseRoute(new Request("http://localhost/api/logic-tests/parse", { method: "POST", body: formData }));
  assert.equal(response.status, 200);
  const body = await response.json() as { caseStudy?: { caseId: string }; summary?: { factCount: number } };
  assert.equal(body.caseStudy?.caseId, "logic-test-complete");
  assert.equal(body.summary?.factCount, 5);
});

test("parse API returns validation diagnostics and never accepts a non-file request", async () => {
  const invalidForm = new FormData();
  invalidForm.set("file", new File([`${validFactSource()}\n(system "id")`], "unsafe.clp"));
  const invalidResponse = await parseRoute(new Request("http://localhost/api/logic-tests/parse", { method: "POST", body: invalidForm }));
  assert.equal(invalidResponse.status, 422);
  const invalidBody = await invalidResponse.json() as { diagnostics: Array<{ code: string }> };
  assert.ok(invalidBody.diagnostics.some((item) => item.code === "UNSUPPORTED_TOP_LEVEL_FORM"));

  const missingResponse = await parseRoute(new Request("http://localhost/api/logic-tests/parse", { method: "POST", body: new FormData() }));
  assert.equal(missingResponse.status, 400);
});

function validFactSource(caseId = "case-safe", factId = "will-type") {
  return `(asserted-fact (fact-id ${factId}) (case-id ${caseId}) (subject will-main) (predicate will-type) (value written))`;
}
