import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { POST as exportRoute } from "../src/app/api/logic-tests/export/route";
import { POST as parseRoute } from "../src/app/api/logic-tests/parse/route";
import { GET as ruleSourceRoute } from "../src/app/api/logic-tests/rules/[implementation]/route";
import { POST as runRoute } from "../src/app/api/logic-tests/run/route";
import { guidedTopicIds, type GuidedTopicId } from "../src/domain/guided-conversation";
import { getLogicTestTopicPlan, logicTestLimits, type LogicTestParseResult, type LogicTestReport } from "../src/domain/logic-test";
import { clipsExecutionLimits } from "../src/server/clips/adapter";
import { logicTestRunErrorResponse } from "../src/server/logic-test/http-error";
import { parseLogicTestClpBytes } from "../src/server/logic-test/parser";
import { runLogicTest } from "../src/server/logic-test/runner";

const fixtureRoot = path.join(process.cwd(), "knowledge-base/fixtures");

test("release integration: upload, select question, run, explore and export", async () => {
  const bytes = readFileSync(path.join(fixtureRoot, "logic-test/complete.clp"));
  const formData = new FormData();
  formData.set("file", new File([bytes], "complete.clp", { type: "text/plain" }));
  const parsedResponse = await parseRoute(new Request("http://localhost/api/logic-tests/parse", { method: "POST", body: formData }));
  assert.equal(parsedResponse.status, 200);
  const parsed = await parsedResponse.json() as LogicTestParseResult;
  assert.ok(parsed.caseStudy);

  const request = { topicId: "will-validity" as const, caseStudy: parsed.caseStudy };
  const runResponse = await runRoute(jsonRequest("/api/logic-tests/run", request));
  assert.equal(runResponse.status, 200);
  const report = await runResponse.json() as LogicTestReport;
  assert.equal(report.status, "complete");
  const codeReference = report.reasoningGroups.flatMap((group) => group.steps).flatMap((step) => step.codeReferences)[0];
  assert.ok(codeReference);

  const sourceResponse = await ruleSourceRoute(new Request("http://localhost"), { params: Promise.resolve({ implementation: codeReference.implementation }) });
  assert.equal(sourceResponse.status, 200);
  assert.match((await sourceResponse.json() as { source: string }).source, /^\(defrule /u);

  const exportResponse = await exportRoute(jsonRequest("/api/logic-tests/export", { ...request, format: "md" }));
  assert.equal(exportResponse.status, 200);
  assert.match(await exportResponse.text(), /## Quá trình suy luận/u);
});

test("all seven Quick Logic Test topics execute with representative facts", async () => {
  const fixtures: Record<GuidedTopicId, string> = {
    "who-inherits": "heir-rank-first.clp",
    "will-validity": "logic-test/complete.clp",
    "person-eligibility": "eligibility-clear.clp",
    representation: "representation.clp",
    "compulsory-share": "compulsory-share.clp",
    "estate-settlement": "estate-settlement.clp",
    limitation: "limitation.clp",
  };
  for (const topicId of guidedTopicIds) {
    const fileName = fixtures[topicId];
    const parsed = parseLogicTestClpBytes(readFileSync(path.join(fixtureRoot, fileName)), { fileName: path.basename(fileName) });
    assert.ok(parsed.caseStudy, `${topicId} fixture must parse`);
    const report = await runLogicTest({ topicId, caseStudy: parsed.caseStudy });
    assert.equal(report.executions.length, getLogicTestTopicPlan(topicId).goalModules.length, topicId);
    assert.ok(["complete", "unknown", "missing-facts", "conflict"].includes(report.status), topicId);
  }
});

test("release security limits oversized uploads, native error disclosure and CLIPS execution", async () => {
  const oversized = new File([new Uint8Array(logicTestLimits.maxFileBytes + 1)], "oversized.clp");
  const formData = new FormData();
  formData.set("file", oversized);
  const oversizedResponse = await parseRoute(new Request("http://localhost/api/logic-tests/parse", { method: "POST", body: formData }));
  assert.equal(oversizedResponse.status, 413);
  assert.equal((await oversizedResponse.json() as { diagnostics: Array<{ code: string }> }).diagnostics[0]?.code, "FILE_TOO_LARGE");

  const secret = "CLIPS stderr: private-machine-path";
  const sanitized = logicTestRunErrorResponse(new Error(secret));
  assert.equal(sanitized.status, 500);
  assert.equal((await sanitized.text()).includes(secret), false);
  assert.ok(clipsExecutionLimits.timeoutMs <= 10_000);
  assert.ok(clipsExecutionLimits.maxBufferBytes <= 2 * 1024 * 1024);
});

function jsonRequest(pathname: string, body: unknown): Request {
  return new Request(`http://localhost${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
