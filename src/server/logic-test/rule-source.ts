import ruleSourceCatalogJson from "../../../knowledge-base/rule-source-catalog.json";

export interface RuleSourceEntry {
  ruleId: string;
  implementation: string;
  file: string;
  source: string;
}

interface SourceCatalog {
  entries: Record<string, Array<Omit<RuleSourceEntry, "ruleId">>>;
}

const entriesByImplementation = new Map<string, RuleSourceEntry>();

for (const [ruleId, entries] of Object.entries((ruleSourceCatalogJson as SourceCatalog).entries)) {
  for (const entry of entries) entriesByImplementation.set(entry.implementation, { ruleId, ...entry });
}

export function getRuleSource(implementation: string): RuleSourceEntry | undefined {
  return entriesByImplementation.get(implementation);
}
