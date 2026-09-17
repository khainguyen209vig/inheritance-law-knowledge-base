import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ruleRegistry from "../knowledge-base/rule-registry.json";
import { buildRuleSourceCatalog, serializeRuleSourceCatalog } from "./lib/extract-rule-sources";

const root = resolve(import.meta.dirname, "..");
const catalog = buildRuleSourceCatalog({
  rulesDirectory: resolve(root, "knowledge-base/rules"),
  knowledgeBaseVersion: ruleRegistry.knowledgeBaseVersion,
  entries: ruleRegistry.entries,
});
writeFileSync(resolve(root, "knowledge-base/rule-source-catalog.json"), serializeRuleSourceCatalog(catalog), "utf8");
console.log("Đã sinh knowledge-base/rule-source-catalog.json từ CLIPS rules và rule registry");
