import { z } from "zod";
import type { AnalysisModuleId } from "./analysis-modules";
import { caseFactSchema, caseIdSchema } from "./case";
import { guidedInferenceGoals, guidedTopicIdSchema, guidedTopics, type GuidedTopicId } from "./guided-conversation";
import type { ModuleResultValue } from "@/server/clips/types";

export const logicTestLimits = {
  maxFileBytes: 1024 * 1024,
  maxFacts: 500,
} as const;

export const logicTestDiagnosticCodes = [
  "INVALID_UTF8",
  "INVALID_FILE_NAME",
  "FILE_TOO_LARGE",
  "TOO_MANY_FACTS",
  "NO_ASSERTED_FACT",
  "UNEXPECTED_TOKEN",
  "UNTERMINATED_STRING",
  "UNTERMINATED_FORM",
  "UNSUPPORTED_TOP_LEVEL_FORM",
  "INVALID_SLOT",
  "MISSING_SLOT",
  "DUPLICATE_SLOT",
  "INVALID_SLOT_VALUE",
  "DUPLICATE_FACT_ID",
  "DUPLICATE_ANALYSIS_REQUEST",
  "INCONSISTENT_CASE_ID",
  "UNSUPPORTED_PREDICATE",
  "MISSING_LABEL",
] as const;

export type LogicTestDiagnosticCode = (typeof logicTestDiagnosticCodes)[number];

export interface LogicTestSourceLocation {
  line: number;
  column: number;
  offset: number;
}

export interface LogicTestDiagnostic {
  code: LogicTestDiagnosticCode;
  severity: "error" | "warning";
  message: string;
  location: LogicTestSourceLocation;
  endLocation?: LogicTestSourceLocation;
}

export interface LogicTestParseSummary {
  factCount: number;
  subjectCount: number;
  subjects: Array<{ id: string; label?: string; factCount: number }>;
}

export interface LogicTestParseResult {
  caseStudy?: NormalizedLogicTestCaseStudy;
  diagnostics: LogicTestDiagnostic[];
  summary?: LogicTestParseSummary;
}

export const normalizedLogicTestFactSchema = caseFactSchema.and(z.object({ subject: caseIdSchema }));
export type NormalizedLogicTestFact = z.infer<typeof normalizedLogicTestFactSchema>;

export const normalizedLogicTestCaseStudySchema = z.object({
  fileName: z.string().trim().min(1).max(255).refine((value) => value.toLowerCase().endsWith(".clp"), "File phải có phần mở rộng .clp."),
  sizeBytes: z.number().int().nonnegative().max(logicTestLimits.maxFileBytes),
  caseId: caseIdSchema,
  declaredRequest: z.object({ subject: caseIdSchema, module: z.string().min(1) }).optional(),
  facts: z.array(normalizedLogicTestFactSchema).max(logicTestLimits.maxFacts),
}).superRefine(({ facts }, context) => {
  const ids = new Set<string>();
  for (const [index, fact] of facts.entries()) {
    if (ids.has(fact.id)) context.addIssue({ code: "custom", message: `Fact ID bị trùng: ${fact.id}`, path: ["facts", index, "id"] });
    ids.add(fact.id);
  }
});

export type NormalizedLogicTestCaseStudy = z.infer<typeof normalizedLogicTestCaseStudySchema>;

export interface LogicTestTopicPlan {
  topicId: GuidedTopicId;
  question: string;
  goalModules: readonly AnalysisModuleId[];
}

function buildTopicPlan(topicId: GuidedTopicId): LogicTestTopicPlan {
  return {
    topicId,
    question: guidedTopics[topicId].question,
    goalModules: guidedInferenceGoals[topicId]
      .filter((goal) => goal.role === "result")
      .map((goal) => goal.module),
  };
}

export const logicTestTopicPlans = {
  "who-inherits": buildTopicPlan("who-inherits"),
  "will-validity": buildTopicPlan("will-validity"),
  "person-eligibility": buildTopicPlan("person-eligibility"),
  representation: buildTopicPlan("representation"),
  "compulsory-share": buildTopicPlan("compulsory-share"),
  "estate-settlement": buildTopicPlan("estate-settlement"),
  limitation: buildTopicPlan("limitation"),
} satisfies Record<GuidedTopicId, LogicTestTopicPlan>;

export function getLogicTestTopicPlan(topicId: GuidedTopicId): LogicTestTopicPlan {
  return logicTestTopicPlans[topicId];
}

export const logicTestRunRequestSchema = z.object({
  topicId: guidedTopicIdSchema,
  scopeSubject: caseIdSchema.optional(),
  caseStudy: normalizedLogicTestCaseStudySchema,
}).strict();

export type LogicTestRunRequest = z.infer<typeof logicTestRunRequestSchema>;
export type LogicTestReportStatus = "complete" | "unknown" | "conflict" | "missing-facts";

export interface LogicConclusion {
  id: string;
  module: AnalysisModuleId;
  subject: string;
  predicate: string;
  value: ModuleResultValue;
  statement: string;
  ruleIds: string[];
}

export interface ExplainedSupport {
  id: string;
  kind: "asserted" | "derived" | "unresolved";
  statement: string;
  machineExpression: string;
}

export interface RuleCodeReference {
  implementation: string;
  file: string;
}

export interface LogicReasoningStep {
  id: string;
  plainExplanation: string;
  conclusion: string;
  ruleId: string;
  relevantSections: string[];
  supports: ExplainedSupport[];
  codeReferences: RuleCodeReference[];
  diagnostics: string[];
}

export interface LegalReasoningGroup {
  id: string;
  provisionId?: string;
  citation: string;
  title: string;
  kind: "legal" | "internal" | "system";
  steps: LogicReasoningStep[];
}

export interface ExplainedMissingRequirement {
  module: AnalysisModuleId;
  subject: string;
  predicate: string;
  explanation: string;
}

export interface LogicTestModuleExecution {
  module: AnalysisModuleId;
  status: "complete" | "unknown" | "conflict" | "missing-facts";
}

export interface LogicTestReport {
  query: { topicId: GuidedTopicId; question: string; scopeSubject?: string };
  input: NormalizedLogicTestCaseStudy;
  status: LogicTestReportStatus;
  conclusions: LogicConclusion[];
  reasoningGroups: LegalReasoningGroup[];
  missing: ExplainedMissingRequirement[];
  executions: LogicTestModuleExecution[];
  knowledgeBaseVersion: string;
}
