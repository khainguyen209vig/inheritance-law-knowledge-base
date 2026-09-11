import legalCatalog from "../../knowledge-base/legal-sources/civil-code-2015.inheritance.json";
import ruleRegistry from "../../knowledge-base/rule-registry.json";

export interface LegalSection {
  id: string;
  label: string;
  text: string;
}

export interface LegalProvision {
  id: string;
  number: string;
  title: string;
  sections: LegalSection[];
  sourceDocument: string;
  officialUrl: string;
}

export const legalProvisions = legalCatalog.provisions satisfies Record<string, LegalProvision>;
export const legalCatalogMetadata = legalCatalog.document;

export type LegalProvisionId = keyof typeof legalProvisions;

export interface RuleExplanation {
  ruleId: string;
  title: string;
  reasoning: string;
  conclusion: string;
  citation: string;
  provisionId?: LegalProvisionId;
  relevantSections: string[];
  kind: "legal" | "internal" | "system";
}

export interface RuleRegistryEntry extends RuleExplanation {
  module: string;
  status: "draft" | "reviewed" | "approved" | "deprecated";
  clipsMetadata: boolean;
  implementations: string[];
  reviewState?: "MODEL_READY" | "TEAM_REVIEW";
}

export const ruleRegistryMetadata = {
  schemaVersion: ruleRegistry.schemaVersion,
  knowledgeBaseVersion: ruleRegistry.knowledgeBaseVersion,
};

export const ruleExplanations = ruleRegistry.entries as Record<string, RuleRegistryEntry>;

export function getRuleExplanation(ruleId: string): RuleRegistryEntry | undefined {
  return ruleExplanations[ruleId];
}

export function getLegalProvision(provisionId: LegalProvisionId): LegalProvision {
  return legalProvisions[provisionId];
}

export function getLegalSection(provisionId: LegalProvisionId, sectionId: string): LegalSection | undefined {
  return getLegalProvision(provisionId).sections.find((section) => section.id === sectionId);
}
