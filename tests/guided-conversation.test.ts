import assert from "node:assert/strict";
import test from "node:test";
import { getGuidedTopic, resolveGuidedRequirement, selectNextGuidedRequirement } from "../src/domain/guided-conversation";

test("guided topics expose user questions without requiring module knowledge", () => {
  const topic = getGuidedTopic("who-inherits");
  assert.equal(topic?.question, "Ai có thể được hưởng di sản?");
  assert.equal(topic?.recommendedStartModule, "heir-rank");
  assert.ok(topic?.modules.includes("representation"));
  assert.equal(getGuidedTopic("unknown-topic"), undefined);
});

test("guided requirement resolver sends derived legal status to a structured review", () => {
  const resolution = resolveGuidedRequirement({ subject: "person-a", predicate: "article-621-status" });
  assert.equal(resolution?.kind, "interaction");
  if (resolution?.kind === "interaction") assert.equal(resolution.interaction, "eligibility-review");
});

test("guided planner prioritizes mapped requirements and removes duplicates", () => {
  const next = selectNextGuidedRequirement([
    { subject: "person-a", predicate: "not-yet-mapped" },
    { subject: "case-a", predicate: "heir-search-complete" },
    { subject: "person-a", predicate: "relationship-at-opening" },
    { subject: "person-a", predicate: "relationship-at-opening" },
  ]);
  assert.equal(next?.requirement.predicate, "relationship-at-opening");
  assert.equal(next?.resolution?.kind, "interaction");
});

