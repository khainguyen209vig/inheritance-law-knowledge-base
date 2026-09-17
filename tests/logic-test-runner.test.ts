import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { POST as runRoute } from "../src/app/api/logic-tests/run/route";
import type { LogicTestRunRequest, NormalizedLogicTestCaseStudy } from "../src/domain/logic-test";
import { parseLogicTestClpBytes } from "../src/server/logic-test/parser";
import { LogicTestScopeNotFoundError, runLogicTest } from "../src/server/logic-test/runner";

const fixtureDirectory = path.join(process.cwd(), "knowledge-base/fixtures/logic-test");

test("Quick Logic Test complete report orders dependencies and groups child clauses by article", async () => {
  const report = await runLogicTest(requestFor("complete.clp"));
  assert.equal(report.status, "complete");
  assert.equal(report.executions[0]?.module, "will-validity");
  assert.equal(report.executions[0]?.status, "complete");
  assert.equal(report.conclusions[0]?.predicate, "valid-will");
  assert.equal(report.conclusions[0]?.value, "true");

  const article630 = report.reasoningGroups.find((group) => group.provisionId === "article-630");
  assert.equal(article630?.title, "Điều 630. Di chúc hợp pháp");
  assert.deepEqual(article630?.steps.map((step) => step.ruleId), ["R-B01", "R-B02", "R-B03"]);
  assert.ok(article630?.steps.every((step) => step.codeReferences.length > 0));
  assert.ok(article630?.steps.find((step) => step.ruleId === "R-B03")?.supports.every((support) => support.kind === "derived"));

  const article627 = report.reasoningGroups.find((group) => group.provisionId === "article-627");
  assert.deepEqual(article627?.steps.map((step) => step.ruleId), ["FORM-ASSESSMENT-ACCEPTED"]);
});

test("Quick Logic Test distinguishes missing facts from an unexplained UNKNOWN", async () => {
  const report = await runLogicTest(requestFor("unknown-missing.clp"));
  assert.equal(report.status, "missing-facts");
  assert.equal(report.conclusions[0]?.value, "unknown");
  assert.deepEqual(report.missing.map((item) => item.predicate).sort(), ["formal-defect", "undue-influence"]);
  const systemStep = report.reasoningGroups.find((group) => group.kind === "system")?.steps[0];
  assert.equal(systemStep?.ruleId, "SYSTEM-INCOMPLETE");
  assert.deepEqual(systemStep?.codeReferences, [{ implementation: "project-unknown-will-validity", file: "rules/99-result-projection.clp" }]);
});

test("Quick Logic Test preserves conflict traces and system consistency rule", async () => {
  const report = await runLogicTest(requestFor("conflict.clp"));
  assert.equal(report.status, "conflict");
  assert.equal(report.conclusions[0]?.value, "conflict");
  assert.ok(report.reasoningGroups.find((group) => group.kind === "system")?.steps.some((step) => step.ruleId === "SYSTEM-CONFLICT"));
  assert.ok(report.reasoningGroups.flatMap((group) => group.steps).every((step) => step.codeReferences.length > 0));
});

test("will-validity runner infers the will subject when analysis-request is absent", async () => {
  const caseStudy = fixture("complete.clp");
  const report = await runLogicTest({ topicId: "will-validity", caseStudy: { ...caseStudy, declaredRequest: undefined } });
  assert.equal(report.status, "complete");
  assert.equal(report.conclusions[0]?.subject, "will-main");
});

test("Quick Logic Test rejects a scope subject outside uploaded facts", async () => {
  await assert.rejects(() => runLogicTest({ ...requestFor("complete.clp"), scopeSubject: "missing-person" }), LogicTestScopeNotFoundError);
});

test("run API validates input and returns the immutable report DTO", async () => {
  const valid = await runRoute(new Request("http://localhost/api/logic-tests/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestFor("complete.clp")),
  }));
  assert.equal(valid.status, 200);
  const report = await valid.json() as { status: string; knowledgeBaseVersion: string; conclusions: unknown[] };
  assert.equal(report.status, "complete");
  assert.equal(report.knowledgeBaseVersion, "inheritance-kb-v20");
  assert.equal(report.conclusions.length, 1);

  const invalid = await runRoute(new Request("http://localhost/api/logic-tests/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topicId: "not-a-topic", caseStudy: fixture("complete.clp") }),
  }));
  assert.equal(invalid.status, 400);
});

function requestFor(fileName: string): LogicTestRunRequest {
  return { topicId: "will-validity", caseStudy: fixture(fileName) };
}

function fixture(fileName: string): NormalizedLogicTestCaseStudy {
  const parsed = parseLogicTestClpBytes(readFileSync(path.join(fixtureDirectory, fileName)), { fileName });
  assert.ok(parsed.caseStudy);
  return parsed.caseStudy;
}
