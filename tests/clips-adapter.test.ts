import assert from "node:assert/strict";
import test from "node:test";
import { inferWillValidity } from "../src/server/clips/adapter";

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
