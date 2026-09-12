export type Answer = string | number | boolean | undefined;
export type Answers = Record<string, Answer>;

export interface Choice {
  label: string;
  value: string | boolean;
  description: string;
}

export interface Question {
  id: string;
  group: string;
  title: string;
  description: string;
  legalSource: string;
  kind: "choice" | "number";
  choices?: Choice[];
  placeholder?: string;
  unit?: string;
}

export interface ApiFact {
  id: string;
  predicate: string;
  value: string | number | boolean;
  subject?: string;
}

export type InferenceValue = "true" | "false" | "unknown" | "conflict";
export type NumericResultValue = `${number}`;
export type IsoDateResultValue = `${number}-${number}-${number}`;
export type ModuleResultValue = InferenceValue | "statutory" | "testamentary" | "excluded" | "not-excluded" | "exception-under-will" | "rank-1" | "rank-2" | "rank-3" | "valid" | "state" | "managing-heir" | "qualified-possessor" | NumericResultValue | IsoDateResultValue;

export interface InferenceRun {
  id: string;
  caseId: string;
  knowledgeBaseVersion: string;
  createdAt: string;
  results: Array<{ subject: string; predicate: string; value: ModuleResultValue; derivations: string[] }>;
  missing: Array<{ subject: string; predicate: string }>;
  traces: Array<{
    subject: string;
    ruleId: string;
    conclusionPredicate: string;
    conclusionValue: string;
    supports: string[];
  }>;
}

export type InferenceTrace = InferenceRun["traces"][number];
