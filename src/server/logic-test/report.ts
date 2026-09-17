import ruleSourceCatalogJson from "../../../knowledge-base/rule-source-catalog.json";
import type { AnalysisModuleId } from "@/domain/analysis-modules";
import { guidedInferenceGoals } from "@/domain/guided-conversation";
import {
  type ExplainedMissingRequirement,
  type ExplainedSupport,
  type LegalReasoningGroup,
  type LogicConclusion,
  type LogicReasoningStep,
  type LogicTestModuleExecution,
  type LogicTestReport,
  type LogicTestReportStatus,
  type LogicTestRunRequest,
  type RuleCodeReference,
  getLogicTestTopicPlan,
} from "@/domain/logic-test";
import { getLegalProvision, getRuleExplanation, ruleRegistryMetadata } from "@/domain/legal-knowledge";
import { clipsRulePackages } from "@/server/clips/adapter";
import type { InferenceOutput, InferenceTrace, ModuleResult } from "@/server/clips/types";

interface ModuleOutput { module: AnalysisModuleId; output: InferenceOutput }
interface SourceCatalog { entries: Record<string, Array<{ implementation: string; file: string; source: string }>> }
const sourceCatalog = ruleSourceCatalogJson as SourceCatalog;

export function buildLogicTestReport(request: LogicTestRunRequest, moduleOutputs: readonly ModuleOutput[]): LogicTestReport {
  const goalPredicates = new Map(guidedInferenceGoals[request.topicId]
    .filter((goal) => goal.role === "result")
    .map((goal) => [goal.module, new Set(goal.resultPredicates)]));
  const executions: LogicTestModuleExecution[] = [];
  const conclusions: LogicConclusion[] = [];
  const missing: ExplainedMissingRequirement[] = [];
  const steps: Array<{ module: AnalysisModuleId; step: LogicReasoningStep }> = [];

  for (const { module, output } of moduleOutputs) {
    const predicates = goalPredicates.get(module) ?? new Set<string>();
    const relevantResults = output.results.filter((result) => predicates.has(result.predicate) && (!request.scopeSubject || result.subject === request.scopeSubject));
    const relevantMissing = output.missing.filter((item) => !request.scopeSubject || item.subject === request.scopeSubject);
    const status = moduleStatus(relevantResults, relevantMissing.length);
    executions.push({ module, status });
    for (const result of relevantResults) conclusions.push(toConclusion(module, result, request.caseStudy.facts));
    for (const item of relevantMissing) missing.push({ module, subject: item.subject, predicate: item.predicate, explanation: missingExplanation(item.predicate, item.subject, request.caseStudy.facts) });
    for (const step of orderReasoningSteps(module, relevantResults, output.traces, request.caseStudy.facts)) steps.push({ module, step });
  }

  return {
    query: { topicId: request.topicId, question: getLogicTestTopicPlan(request.topicId).question, ...(request.scopeSubject ? { scopeSubject: request.scopeSubject } : {}) },
    input: request.caseStudy,
    status: overallStatus(executions),
    conclusions,
    reasoningGroups: groupReasoningSteps(steps),
    missing: uniqueMissing(missing),
    executions,
    knowledgeBaseVersion: ruleRegistryMetadata.knowledgeBaseVersion,
  };
}

function orderReasoningSteps(module: AnalysisModuleId, results: readonly ModuleResult[], traces: readonly InferenceTrace[], facts: LogicTestRunRequest["caseStudy"]["facts"]): LogicReasoningStep[] {
  const factsById = new Map(facts.map((fact) => [fact.id, fact]));
  const byRule = indexTraces(traces, (trace) => trace.ruleId);
  const byDerived = indexTraces(traces, (trace) => `${trace.conclusionPredicate}=${trace.conclusionValue}`);
  const visited = new Set<string>();
  const active = new Set<string>();
  const ordered: LogicReasoningStep[] = [];

  const visitTrace = (trace: InferenceTrace) => {
    const key = traceKey(trace);
    if (visited.has(key)) return;
    if (active.has(key)) return;
    active.add(key);
    const supports: ExplainedSupport[] = [];
    const diagnostics: string[] = [];
    for (const support of trace.supports) {
      const fact = factsById.get(support);
      if (fact) {
        supports.push({ id: support, kind: "asserted", statement: describeFact(fact, facts), machineExpression: `${fact.predicate}=${String(fact.value)}` });
        continue;
      }
      const dependency = chooseTrace(byRule.get(support) ?? byDerived.get(support), trace.subject);
      if (dependency) {
        if (active.has(traceKey(dependency))) diagnostics.push(`Phát hiện vòng phụ thuộc qua ${support}.`);
        else visitTrace(dependency);
        supports.push({ id: support, kind: "derived", statement: describeDerived(dependency, facts), machineExpression: support });
      } else supports.push({ id: support, kind: "unresolved", statement: `Không tìm thấy chi tiết support ${support} trong trace.`, machineExpression: support });
    }
    active.delete(key);
    visited.add(key);
    ordered.push(stepFromTrace(module, trace, supports, diagnostics));
  };

  for (const result of results) {
    for (const ruleId of result.derivations) {
      const trace = chooseTrace(byRule.get(ruleId), result.subject);
      if (trace) visitTrace(trace);
      else {
        const syntheticKey = `${module}:${result.subject}:${ruleId}:${result.predicate}:${result.value}`;
        if (!visited.has(syntheticKey)) {
          visited.add(syntheticKey);
          ordered.push(stepWithoutTrace(module, ruleId, result));
        }
      }
    }
  }
  return ordered;
}

function stepFromTrace(module: AnalysisModuleId, trace: InferenceTrace, supports: ExplainedSupport[], diagnostics: string[]): LogicReasoningStep {
  const explanation = getRuleExplanation(trace.ruleId);
  return {
    id: `${module}:${trace.subject}:${trace.ruleId}:${trace.conclusionPredicate}:${trace.conclusionValue}`,
    plainExplanation: explanation?.reasoning ?? `Áp dụng ${trace.ruleId} cho ${trace.subject}.`,
    conclusion: explanation?.conclusion ?? describeDerived(trace, []),
    ruleId: trace.ruleId,
    relevantSections: explanation?.relevantSections ?? [],
    supports,
    codeReferences: codeReferences(trace.ruleId, module),
    diagnostics,
  };
}

function stepWithoutTrace(module: AnalysisModuleId, ruleId: string, result: ModuleResult): LogicReasoningStep {
  const explanation = getRuleExplanation(ruleId);
  return {
    id: `${module}:${result.subject}:${ruleId}:${result.predicate}:${result.value}`,
    plainExplanation: explanation?.reasoning ?? `Kết quả được chiếu bởi ${ruleId}.`,
    conclusion: explanation?.conclusion ?? `${humanize(result.predicate)}: ${humanizeValue(result.value)}`,
    ruleId,
    relevantSections: explanation?.relevantSections ?? [],
    supports: [],
    codeReferences: codeReferences(ruleId, module),
    diagnostics: ["Kết quả không có inference-trace riêng; bước được dựng từ derivation của module-result."],
  };
}

function groupReasoningSteps(items: Array<{ module: AnalysisModuleId; step: LogicReasoningStep }>): LegalReasoningGroup[] {
  const groups = new Map<string, LegalReasoningGroup>();
  for (const { step } of items) {
    const explanation = getRuleExplanation(step.ruleId);
    const provisionId = explanation?.provisionId;
    const key = provisionId ? `legal:${provisionId}` : explanation?.kind === "system" ? "system" : "internal";
    let group = groups.get(key);
    if (!group) {
      const provision = provisionId ? getLegalProvision(provisionId) : undefined;
      group = provision
        ? { id: key, provisionId, citation: explanation?.citation ?? provision.number, title: `${provision.number}. ${provision.title}`, kind: "legal", steps: [] }
        : explanation?.kind === "system"
          ? { id: key, citation: "Quy tắc kiểm soát nhất quán và tính đầy đủ", title: "Kiểm tra của hệ thống", kind: "system", steps: [] }
          : { id: key, citation: "Quy tắc kết nối nội bộ", title: "Bước kết nối của hệ thống", kind: "internal", steps: [] };
      groups.set(key, group);
    }
    if (!group.steps.some((existing) => existing.id === step.id)) group.steps.push(step);
  }
  return [...groups.values()];
}

function toConclusion(module: AnalysisModuleId, result: ModuleResult, facts: LogicTestRunRequest["caseStudy"]["facts"]): LogicConclusion {
  return {
    id: `${module}:${result.subject}:${result.predicate}`,
    module,
    subject: result.subject,
    predicate: result.predicate,
    value: result.value,
    statement: conclusionStatement(result, facts),
    ruleIds: [...new Set(result.derivations)],
  };
}

function conclusionStatement(result: ModuleResult, facts: LogicTestRunRequest["caseStudy"]["facts"]): string {
  const subject = labelFor(result.subject, facts);
  if (result.value === "unknown") return `Chưa đủ căn cứ để kết luận ${humanize(result.predicate)} đối với ${subject}.`;
  if (result.value === "conflict") return `Có các kết luận mâu thuẫn về ${humanize(result.predicate)} đối với ${subject}.`;
  const predicates: Record<string, string> = {
    "valid-will": "Tính hợp pháp của di chúc",
    "inheritance-regime": "Chế độ phân chia",
    "article-621-status": "Quyền hưởng di sản",
    "called-to-inherit": "Việc được gọi hưởng",
    "candidate-heir-rank": "Hàng thừa kế",
    "inherits-by-representation": "Quyền hưởng thế vị",
    "compulsory-heir": "Diện hưởng suất bắt buộc",
    "minimum-compulsory-share": "Suất bắt buộc tối thiểu",
    "compulsory-share-shortfall": "Phần suất bắt buộc còn thiếu",
    "estate-owned-value-vnd": "Giá trị thuộc di sản (VNĐ)",
    "gross-estate-vnd": "Tổng di sản gộp (VNĐ)",
    "total-obligations-vnd": "Tổng nghĩa vụ (VNĐ)",
    "distributable-estate-vnd": "Di sản có thể phân chia (VNĐ)",
    "uncovered-obligations-vnd": "Nghĩa vụ chưa được bù đắp (VNĐ)",
    "statutory-heir-count": "Số người trong hàng được gọi hưởng",
    "hypothetical-statutory-share-vnd": "Suất pháp luật giả định (VNĐ)",
    "statutory-division-remainder-vnd": "Phần dư chưa phân bổ (VNĐ)",
    "minimum-compulsory-share-vnd": "Ngưỡng suất bắt buộc (VNĐ)",
    "compulsory-share-shortfall-vnd": "Phần suất bắt buộc còn thiếu (VNĐ)",
    "payment-priority": "Thứ tự thanh toán",
    "distribution-not-before": "Mốc chưa được phân chia",
    "court-deferral-may-be-requested": "Quyền yêu cầu trì hoãn",
    "court-extension-may-be-requested": "Quyền yêu cầu gia hạn",
    "limitation-period-years": "Thời hiệu áp dụng",
    "limitation-deadline": "Ngày kết thúc thời hiệu",
    "post-limitation-recipient": "Chủ thể nhận sau thời hiệu",
  };
  return `${predicates[result.predicate] ?? humanize(result.predicate)} đối với ${subject}: ${humanizeValue(result.value)}.`;
}

function moduleStatus(results: readonly ModuleResult[], missingCount: number): LogicTestReportStatus {
  if (results.some((result) => result.value === "conflict")) return "conflict";
  if (missingCount > 0) return "missing-facts";
  if (results.length === 0 || results.some((result) => result.value === "unknown")) return "unknown";
  return "complete";
}

function overallStatus(executions: readonly LogicTestModuleExecution[]): LogicTestReportStatus {
  const statuses = new Set(executions.map((item) => item.status));
  if (statuses.has("conflict")) return "conflict";
  if (statuses.has("missing-facts")) return "missing-facts";
  if (statuses.has("unknown")) return "unknown";
  return "complete";
}

function codeReferences(ruleId: string, module: AnalysisModuleId): RuleCodeReference[] {
  const packageFiles = new Set(clipsRulePackages[module]);
  return (sourceCatalog.entries[ruleId] ?? [])
    .filter((entry) => packageFiles.has(entry.file))
    .map(({ implementation, file }) => ({ implementation, file }));
}

function indexTraces(traces: readonly InferenceTrace[], key: (trace: InferenceTrace) => string): Map<string, InferenceTrace[]> {
  const index = new Map<string, InferenceTrace[]>();
  for (const trace of traces) index.set(key(trace), [...(index.get(key(trace)) ?? []), trace]);
  return index;
}

function chooseTrace(candidates: readonly InferenceTrace[] | undefined, subject: string): InferenceTrace | undefined {
  return candidates?.find((trace) => trace.subject === subject) ?? candidates?.[0];
}

function traceKey(trace: InferenceTrace): string { return `${trace.subject}:${trace.ruleId}:${trace.conclusionPredicate}:${trace.conclusionValue}`; }

function describeFact(fact: LogicTestRunRequest["caseStudy"]["facts"][number], facts: LogicTestRunRequest["caseStudy"]["facts"]): string {
  return `${humanize(fact.predicate)} của ${labelFor(fact.subject, facts)}: ${humanizeValue(fact.value)}`;
}

function describeDerived(trace: InferenceTrace, facts: LogicTestRunRequest["caseStudy"]["facts"]): string {
  const explanation = getRuleExplanation(trace.ruleId);
  return `${explanation?.conclusion ?? humanize(trace.conclusionPredicate)} đối với ${labelFor(trace.subject, facts)}: ${humanizeValue(trace.conclusionValue)}`;
}

function missingExplanation(predicate: string, subject: string, facts: LogicTestRunRequest["caseStudy"]["facts"]): string {
  return `Cần bổ sung ${humanize(predicate)} cho ${labelFor(subject, facts)}.`;
}

function labelFor(subject: string, facts: LogicTestRunRequest["caseStudy"]["facts"]): string {
  const labelPredicates = new Set(["person-label", "heir-person-label", "estate-portion-label", "obligation-label", "distribution-group-label", "distribution-beneficiary-label", "limitation-request-label", "estate-asset-label"]);
  const label = facts.find((fact) => fact.subject === subject && labelPredicates.has(fact.predicate) && typeof fact.value === "string")?.value;
  return typeof label === "string" ? label : subject;
}

function humanize(value: string): string { return value.replaceAll("-", " "); }
function humanizeValue(value: string | number | boolean): string {
  if (value === true || value === "true") return "Có";
  if (value === false || value === "false") return "Không";
  const labels: Record<string, string> = { written: "bằng văn bản", oral: "bằng miệng", statutory: "chia theo pháp luật", testamentary: "chia theo di chúc", excluded: "không được quyền hưởng", "not-excluded": "không bị loại trừ", "exception-under-will": "ngoại lệ theo di chúc", "rank-1": "hàng thứ nhất", "rank-2": "hàng thứ hai", "rank-3": "hàng thứ ba" };
  return labels[String(value)] ?? String(value);
}

function uniqueMissing(items: ExplainedMissingRequirement[]): ExplainedMissingRequirement[] {
  const seen = new Set<string>();
  return items.filter((item) => { const key = `${item.module}:${item.subject}:${item.predicate}`; if (seen.has(key)) return false; seen.add(key); return true; });
}
