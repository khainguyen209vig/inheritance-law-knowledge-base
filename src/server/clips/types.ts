export type InferenceValue = "true" | "false" | "unknown" | "conflict";

export interface ModuleResult {
  caseId: string;
  subject: string;
  module: string;
  predicate: string;
  value: InferenceValue;
  derivations: string[];
}

export interface MissingRequirement {
  caseId: string;
  subject: string;
  module: string;
  predicate: string;
}

export interface InferenceTrace {
  caseId: string;
  subject: string;
  ruleId: string;
  conclusionPredicate: string;
  conclusionValue: string;
  supports: string[];
}

export interface InferenceOutput {
  results: ModuleResult[];
  missing: MissingRequirement[];
  traces: InferenceTrace[];
}
