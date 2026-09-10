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
}

export type InferenceValue = "true" | "false" | "unknown" | "conflict";

export interface InferenceRun {
  id: string;
  caseId: string;
  knowledgeBaseVersion: string;
  createdAt: string;
  results: Array<{ predicate: string; value: InferenceValue; derivations: string[] }>;
  missing: Array<{ predicate: string }>;
  traces: Array<{
    ruleId: string;
    conclusionPredicate: string;
    conclusionValue: string;
    supports: string[];
  }>;
}

export type InferenceTrace = InferenceRun["traces"][number];
