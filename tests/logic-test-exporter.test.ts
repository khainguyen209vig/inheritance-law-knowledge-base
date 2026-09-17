import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { POST as exportRoute } from "../src/app/api/logic-tests/export/route";
import type { LogicTestReport, LogicTestRunRequest, NormalizedLogicTestCaseStudy } from "../src/domain/logic-test";
import { exportLogicTestClp, exportLogicTestMarkdown } from "../src/server/logic-test/exporter";
import { parseLogicTestClpBytes, parseLogicTestClpSource } from "../src/server/logic-test/parser";

const goldenDirectory = path.join(process.cwd(), "tests/golden");
const fixtureDirectory = path.join(process.cwd(), "knowledge-base/fixtures/logic-test");

test("Markdown and replayable CLP exporters match reviewed golden files", () => {
  assert.equal(exportLogicTestMarkdown(sampleReport).content, readFileSync(path.join(goldenDirectory, "logic-test-report.md"), "utf8"));
  const clp = exportLogicTestClp(sampleReport).content;
  assert.equal(clp, readFileSync(path.join(goldenDirectory, "logic-test-result.clp"), "utf8"));
  const replay = parseLogicTestClpSource(clp, { fileName: "logic-test-result.clp" });
  assert.ok(replay.caseStudy);
  assert.equal(replay.caseStudy.facts.length, sampleReport.input.facts.length);
});

test("export API reruns inference and returns downloadable Markdown and CLP", async () => {
  for (const format of ["md", "clp"] as const) {
    const response = await exportRoute(new Request("http://localhost/api/logic-tests/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...completeRequest(), format }),
    }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-disposition") ?? "", new RegExp(`report\\.${format}`));
    const content = await response.text();
    assert.ok(content.includes(format === "md" ? "# Báo cáo suy luận" : "; RESULT status=complete"));
    if (format === "clp") assert.ok(parseLogicTestClpSource(content, { fileName: "replay.clp" }).caseStudy);
  }
});

function completeRequest(): LogicTestRunRequest {
  const fileName = "complete.clp";
  const parsed = parseLogicTestClpBytes(readFileSync(path.join(fixtureDirectory, fileName)), { fileName });
  assert.ok(parsed.caseStudy);
  return { topicId: "will-validity", caseStudy: parsed.caseStudy };
}

const sampleReport: LogicTestReport = {
  query: { topicId: "will-validity", question: "Di chúc có hợp pháp không?", scopeSubject: "will-main" },
  input: {
    fileName: "demo.clp",
    sizeBytes: 123,
    caseId: "demo-case",
    declaredRequest: { subject: "will-main", module: "will-validity" },
    facts: [
      { id: "label", subject: "will-main", predicate: "person-label", value: "Ông A" },
      { id: "mental", subject: "will-main", predicate: "testator-mental-state", value: "lucid" },
    ],
  },
  status: "complete",
  conclusions: [{ id: "will-validity:will-main:valid-will", module: "will-validity", subject: "will-main", predicate: "valid-will", value: "true", statement: "Di chúc của Ông A hợp pháp.", ruleIds: ["R-B03"] }],
  reasoningGroups: [{
    id: "legal:article-630",
    provisionId: "article-630",
    citation: "Điều 630 khoản 1 điểm a",
    title: "Điều 630. Di chúc hợp pháp",
    kind: "legal",
    steps: [{
      id: "will-validity:will-main:R-B01",
      plainExplanation: "Người lập di chúc minh mẫn, sáng suốt.",
      conclusion: "Điều kiện về ý chí được đáp ứng.",
      ruleId: "R-B01",
      relevantSections: ["clause-1-a"],
      supports: [{ id: "mental", kind: "asserted", statement: "Trạng thái tinh thần: minh mẫn.", machineExpression: "testator-mental-state=lucid" }],
      codeReferences: [{ implementation: "R-B01-valid-intention", file: "rules/01-will-validity.clp" }],
      diagnostics: [],
    }],
  }],
  missing: [],
  executions: [{ module: "will-validity", status: "complete" }],
  knowledgeBaseVersion: "inheritance-kb-test",
};
