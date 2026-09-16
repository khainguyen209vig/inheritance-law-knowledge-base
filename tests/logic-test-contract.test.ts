import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { analysisModules } from "../src/domain/analysis-modules";
import {
  getLogicTestTopicPlan,
  logicTestLimits,
  logicTestRunRequestSchema,
  logicTestTopicPlans,
} from "../src/domain/logic-test";
import { guidedTopicIds } from "../src/domain/guided-conversation";

test("quick logic test exposes one executable plan for every guided topic", () => {
  assert.deepEqual(Object.keys(logicTestTopicPlans).sort(), [...guidedTopicIds].sort());
  for (const plan of Object.values(logicTestTopicPlans)) {
    assert.ok(plan.goalModules.length > 0);
    assert.equal(new Set(plan.goalModules).size, plan.goalModules.length);
    for (const moduleId of plan.goalModules) assert.equal(analysisModules[moduleId].status, "implemented");
  }
  assert.deepEqual(getLogicTestTopicPlan("who-inherits").goalModules, ["inheritance-type", "heir-rank", "representation"]);
  assert.deepEqual(getLogicTestTopicPlan("will-validity").goalModules, ["will-validity"]);
});

test("quick logic run contract accepts normalized facts and ignores the declared module for planning", () => {
  const parsed = logicTestRunRequestSchema.parse({
    topicId: "will-validity",
    scopeSubject: "will-main",
    caseStudy: {
      fileName: "case-study.clp",
      sizeBytes: 512,
      caseId: "case-study",
      declaredRequest: { subject: "will-main", module: "heir-rank" },
      facts: [
        { id: "will-type", subject: "will-main", predicate: "will-type", value: "written" },
      ],
    },
  });
  assert.equal(parsed.caseStudy.declaredRequest?.module, "heir-rank");
  assert.deepEqual(getLogicTestTopicPlan(parsed.topicId).goalModules, ["will-validity"]);
});

test("quick logic run contract rejects duplicate IDs and resource overflow", () => {
  const duplicateFacts = [
    { id: "same-id", subject: "will-main", predicate: "will-type", value: "written" },
    { id: "same-id", subject: "will-main", predicate: "testator-mental-state", value: "lucid" },
  ];
  const duplicate = logicTestRunRequestSchema.safeParse({
    topicId: "will-validity",
    caseStudy: { fileName: "case.clp", sizeBytes: 10, caseId: "case-study", facts: duplicateFacts },
  });
  assert.equal(duplicate.success, false);

  const oversized = logicTestRunRequestSchema.safeParse({
    topicId: "will-validity",
    caseStudy: { fileName: "case.clp", sizeBytes: logicTestLimits.maxFileBytes + 1, caseId: "case-study", facts: [] },
  });
  assert.equal(oversized.success, false);
});

test("release fixtures declare the three required inference outcomes without executable forms", () => {
  const fixtures = ["complete.clp", "unknown-missing.clp", "conflict.clp"];
  for (const fixture of fixtures) {
    const source = readFileSync(path.join(process.cwd(), "knowledge-base/fixtures/logic-test", fixture), "utf8");
    assert.match(source, /\(analysis-request\b/u);
    assert.match(source, /\(asserted-fact\b/u);
    assert.doesNotMatch(source, /\((?:defrule|deffunction|load|load-facts|batch|system|assert)\b/u);
  }
});
