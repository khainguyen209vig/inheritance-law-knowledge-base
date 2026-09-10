import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ruleRegistry from "../knowledge-base/rule-registry.json";
import { type ClipsMetadataEntry, renderRuleMetadata } from "./lib/render-rule-metadata";

const outputPath = resolve(import.meta.dirname, "../knowledge-base/rule-metadata.clp");
writeFileSync(
  outputPath,
  renderRuleMetadata(ruleRegistry.entries as Record<string, ClipsMetadataEntry>),
  "utf8",
);
console.log("Đã sinh knowledge-base/rule-metadata.clp từ knowledge-base/rule-registry.json");
