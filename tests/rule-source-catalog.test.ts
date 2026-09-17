import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ruleRegistry from "../knowledge-base/rule-registry.json";
import sourceCatalog from "../knowledge-base/rule-source-catalog.json";
import { buildRuleSourceCatalog, extractDefrules, serializeRuleSourceCatalog } from "../scripts/lib/extract-rule-sources";

test("rule source catalog is current and covers every registered implementation", () => {
  const catalogEntries = sourceCatalog.entries as Record<string, Array<{ implementation: string; file: string; source: string }>>;
  const rebuilt = buildRuleSourceCatalog({
    rulesDirectory: path.join(process.cwd(), "knowledge-base/rules"),
    knowledgeBaseVersion: ruleRegistry.knowledgeBaseVersion,
    entries: ruleRegistry.entries,
  });
  assert.equal(serializeRuleSourceCatalog(rebuilt), `${JSON.stringify(sourceCatalog, null, 2)}\n`);
  for (const [ruleId, entry] of Object.entries(ruleRegistry.entries)) {
    assert.equal(catalogEntries[ruleId]?.length, entry.implementations.length, ruleId);
  }
});

test("defrule extraction ignores parentheses in comments and strings", () => {
  const excerpts = extractDefrules(`
    ; ignored comment ( )
    (defrule sample
      (asserted-fact (value "text with ) and ("))
      =>
      ; another ) comment
      (assert (derived-fact (value true))))
  `, "rules/sample.clp");
  assert.equal(excerpts.length, 1);
  assert.equal(excerpts[0]?.implementation, "sample");
  assert.match(excerpts[0]?.source ?? "", /text with \) and \(/u);
});

test("generated source excerpts contain the exact registered defrule", () => {
  const source = readFileSync(path.join(process.cwd(), "knowledge-base/rules/01-will-validity.clp"), "utf8");
  const excerpt = sourceCatalog.entries["R-B03"]?.[0];
  assert.ok(excerpt);
  assert.equal(excerpt.implementation, "R-B03-valid-will");
  assert.ok(source.includes(excerpt.source));
});
