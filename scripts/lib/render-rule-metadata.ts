export interface ClipsMetadataEntry {
  ruleId: string;
  module: string;
  citation: string;
  reasoning: string;
  status: "draft" | "reviewed" | "approved" | "deprecated";
  clipsMetadata: boolean;
}

function escapeClipsString(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n");
}

export function renderRuleMetadata(entries: Record<string, ClipsMetadataEntry>): string {
  const facts = Object.values(entries)
    .filter((entry) => entry.clipsMetadata)
    .map(
      (entry) => `  (rule-metadata
    (rule-id ${entry.ruleId})
    (module ${entry.module})
    (legal-source "${escapeClipsString(entry.citation)}")
    (description "${escapeClipsString(entry.reasoning)}")
    (status ${entry.status}))`,
    )
    .join("\n");

  return `; GENERATED FILE — do not edit directly.
; Source: knowledge-base/rule-registry.json
; Run: npm run kb:generate

(deffacts will-validity-rule-metadata
${facts})
`;
}
