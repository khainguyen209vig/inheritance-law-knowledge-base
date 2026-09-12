export type InferenceValue = "true" | "false" | "unknown" | "conflict";
export type NumericResultValue = `${number}`;
export type ModuleResultValue = InferenceValue | "statutory" | "testamentary" | "excluded" | "not-excluded" | "exception-under-will" | "rank-1" | "rank-2" | "rank-3" | NumericResultValue;

export interface ModuleResult {
  caseId: string;
  subject: string;
  module: string;
  predicate: string;
  value: ModuleResultValue;
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
