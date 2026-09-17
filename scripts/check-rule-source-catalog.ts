import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ruleRegistry from "../knowledge-base/rule-registry.json";
import { buildRuleSourceCatalog, serializeRuleSourceCatalog } from "./lib/extract-rule-sources";

const root = resolve(import.meta.dirname, "..");
const expected = serializeRuleSourceCatalog(buildRuleSourceCatalog({
  rulesDirectory: resolve(root, "knowledge-base/rules"),
  knowledgeBaseVersion: ruleRegistry.knowledgeBaseVersion,
  entries: ruleRegistry.entries,
}));
const catalogPath = resolve(root, "knowledge-base/rule-source-catalog.json");
const actual = readFileSync(catalogPath, "utf8");
if (actual !== expected) throw new Error("rule-source-catalog.json đã cũ. Chạy npm run kb:sources.");
console.log("Rule source catalog hợp lệ");
