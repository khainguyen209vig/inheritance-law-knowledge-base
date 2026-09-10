import assert from "node:assert/strict";
import test from "node:test";
import { legalProvisions, ruleExplanations } from "../src/domain/legal-knowledge";

test("every legal rule references existing sections of a provision", () => {
  const legalRules = Object.values(ruleExplanations).filter((rule) => rule.kind === "legal");
  assert.ok(legalRules.length > 0);

  for (const rule of legalRules) {
    assert.ok(rule.provisionId, `${rule.ruleId} must reference a legal provision`);
    const provision = legalProvisions[rule.provisionId];
    const sectionIds = new Set<string>(provision.sections.map((section) => section.id));
    assert.ok(rule.relevantSections.length > 0, `${rule.ruleId} must identify the relevant clause`);
    for (const relevantSection of rule.relevantSections) {
      assert.ok(sectionIds.has(relevantSection), `${rule.ruleId} references missing section ${relevantSection}`);
    }
  }
});

test("all implemented domain rule IDs have a human-readable explanation", () => {
  for (const ruleId of ["R-B01", "R-B02", "R-B03", "R-B04", "R-B05", "R-B06", "R-B07", "R-B08", "R-B09"]) {
    assert.ok(ruleExplanations[ruleId], `${ruleId} is missing an explanation`);
  }
});
