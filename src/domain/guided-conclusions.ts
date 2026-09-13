import type { AnalysisModuleId } from "@/domain/analysis-modules";
import type { GuidedCaseState, GuidedTopicId } from "@/domain/guided-conversation";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

export interface GuidedConclusionItem {
  id: string;
  title: string;
  statement: string;
  status: "positive" | "negative" | "neutral" | "unknown" | "conflict";
  moduleId: AnalysisModuleId;
  runId?: string;
  ruleIds: string[];
}

export interface GuidedConclusionExplanation {
  facts: Array<{ id: string; statement: string }>;
  steps: Array<{ ruleId: string; statement: string }>;
}

type Result = InferenceRun["results"][number] & { module: AnalysisModuleId };

export function buildGuidedConclusions(state: GuidedCaseState): GuidedConclusionItem[] {
  const results = relevantResults(state);
  const label = labelResolver(state.case.facts);
  if (state.topic.id === "limitation") return limitationConclusions(results, label, state.latestRunIds.limitation);
  if (state.topic.id === "estate-settlement") return estateSettlementConclusions(results, label, state.latestRunIds["estate-settlement"]);
  if (state.topic.id === "compulsory-share") return compulsoryShareConclusions(results, label, state.case.facts, state.latestRunIds["compulsory-share"]);
  return results.flatMap((result) => conclusionForResult(state.topic.id, result, label, state.latestRunIds[result.module as AnalysisModuleId]));
}

export function buildGuidedConclusionExplanation(state: GuidedCaseState, item: GuidedConclusionItem): GuidedConclusionExplanation {
  const traces = state.latestTraces[item.moduleId] ?? [];
  const factsById = new Map(state.case.facts.map((fact) => [fact.id, fact]));
  const tracesByRule = new Map<string, typeof traces>();
  for (const trace of traces) tracesByRule.set(trace.ruleId, [...(tracesByRule.get(trace.ruleId) ?? []), trace]);
  const visited = new Set<string>();
  const ordered: typeof traces = [];
  const factIds = new Set<string>();

  const visit = (ruleId: string, preferredSubject: string) => {
    const key = `${preferredSubject}:${ruleId}`;
    if (visited.has(key)) return;
    visited.add(key);
    const candidates = tracesByRule.get(ruleId) ?? [];
    const trace = candidates.find((entry) => entry.subject === preferredSubject) ?? candidates[0];
    if (!trace) return;
    for (const support of trace.supports) {
      if (factsById.has(support)) factIds.add(support);
      else if (tracesByRule.has(support)) visit(support, trace.subject);
    }
    ordered.push(trace);
  };
  for (const ruleId of item.ruleIds) visit(ruleId, subjectFromConclusionId(item.id));

  return {
    facts: [...factIds].flatMap((id) => {
      const fact = factsById.get(id);
      return fact ? [{ id, statement: describeFact(fact, state.case.facts) }] : [];
    }),
    steps: ordered.map((trace) => ({ ruleId: trace.ruleId, statement: describeConclusion(trace.conclusionPredicate, trace.conclusionValue, trace.subject, state.case.facts) })),
  };
}

function relevantResults(state: GuidedCaseState): Result[] {
  const primaryByTopic: Record<GuidedTopicId, readonly string[]> = {
    "will-validity": ["valid-will"],
    "person-eligibility": ["article-621-status"],
    "who-inherits": ["inheritance-regime", "called-to-inherit", "inherits-by-representation"],
    representation: ["inherits-by-representation"],
    "compulsory-share": ["compulsory-heir", "minimum-compulsory-share", "compulsory-share-shortfall"],
    "estate-settlement": ["payment-priority", "distribution-not-before", "court-deferral-may-be-requested", "court-extension-may-be-requested"],
    limitation: ["limitation-period-years", "limitation-deadline", "post-limitation-recipient"],
  };
  const predicates = new Set(primaryByTopic[state.topic.id]);
  return Object.entries(state.latestResults).flatMap(([moduleId, moduleResults]) => moduleResults?.flatMap((result) => predicates.has(result.predicate) ? [{ ...result, module: moduleId as AnalysisModuleId }] : []) ?? []);
}

function conclusionForResult(topicId: GuidedTopicId, result: Result, label: (subject: string) => string, runId?: string): GuidedConclusionItem[] {
  const subject = label(result.subject);
  const common = { id: `${result.module}:${result.subject}:${result.predicate}`, moduleId: result.module as AnalysisModuleId, runId, ruleIds: unique(result.derivations) };
  if (result.value === "conflict") return [{ ...common, title: "Dữ kiện mâu thuẫn", statement: `${subject} đang có các kết luận không tương thích. Cần kiểm tra lại facts trước khi sử dụng kết quả.`, status: "conflict" }];
  if (result.value === "unknown") return [{ ...common, title: "Chưa đủ căn cứ", statement: `Chưa thể kết luận đối với ${subject} từ các dữ kiện đã xác nhận.`, status: "unknown" }];
  if (result.predicate === "valid-will") return [{ ...common, title: "Hiệu lực di chúc", statement: result.value === "true" ? "Di chúc đáp ứng các điều kiện đã được mô hình hóa trong phạm vi rà soát." : "Di chúc không đáp ứng điều kiện hợp pháp theo nhánh suy luận đã kích hoạt.", status: result.value === "true" ? "positive" : "negative" }];
  if (result.predicate === "article-621-status") {
    const statements = { excluded: `${subject} thuộc trường hợp không được quyền hưởng di sản.`, "not-excluded": `Không phát hiện căn cứ loại trừ quyền hưởng của ${subject} trong phạm vi đã rà soát.`, "exception-under-will": `${subject} có thể hưởng theo di chúc do ngoại lệ tại khoản 2 Điều 621.` } as const;
    return [{ ...common, title: "Quyền hưởng di sản", statement: statements[result.value as keyof typeof statements] ?? `${subject}: ${result.value}.`, status: result.value === "excluded" ? "negative" : "positive" }];
  }
  if (result.predicate === "inheritance-regime") return [{ ...common, title: subject, statement: result.value === "testamentary" ? "Phần di sản này được xác định chia theo di chúc." : "Phần di sản này được xác định chia theo pháp luật.", status: "neutral" }];
  if (result.predicate === "called-to-inherit") return [{ ...common, title: subject, statement: result.value === "true" ? `${subject} thuộc hàng thừa kế đang được gọi hưởng.` : `${subject} chưa được gọi hưởng trong hàng thừa kế đang áp dụng.`, status: result.value === "true" ? "positive" : "negative" }];
  if (result.predicate === "inherits-by-representation") return [{ ...common, title: "Thừa kế thế vị", statement: result.value === "true" ? `${subject} đủ điều kiện hưởng thừa kế thế vị trong nhánh đã xét.` : `${subject} không đủ điều kiện hưởng thế vị theo các facts hiện tại.`, status: result.value === "true" ? "positive" : "negative" }];
  if (topicId === "compulsory-share" && result.predicate === "compulsory-heir") return [{ ...common, title: subject, statement: result.value === "true" ? `${subject} thuộc diện người thừa kế không phụ thuộc nội dung di chúc.` : `${subject} không thuộc diện hưởng suất bắt buộc trong nhánh đã xét.`, status: result.value === "true" ? "positive" : "negative" }];
  return [];
}

function limitationConclusions(results: Result[], label: (subject: string) => string, runId?: string): GuidedConclusionItem[] {
  const bySubject = groupBySubject(results);
  return [...bySubject].map(([subjectId, subjectResults]) => {
    const period = subjectResults.find((result) => result.predicate === "limitation-period-years");
    const deadline = subjectResults.find((result) => result.predicate === "limitation-deadline");
    const recipient = subjectResults.find((result) => result.predicate === "post-limitation-recipient");
    const base = { id: `limitation:${subjectId}`, moduleId: "limitation" as const, runId, ruleIds: unique(subjectResults.flatMap((result) => result.derivations)) };
    if (period?.value === "unknown" || recipient?.value === "unknown") return { ...base, title: label(subjectId), statement: "Chưa đủ căn cứ để xác định kết quả thời hiệu cho yêu cầu này.", status: "unknown" as const };
    if (period) return { ...base, title: label(subjectId), statement: `Thời hiệu áp dụng là ${period.value} năm${deadline ? `; mốc kết thúc được tính là ngày ${formatDate(deadline.value)}` : ""}.`, status: "neutral" as const };
    const recipients = { "managing-heir": "người thừa kế đang quản lý di sản", "qualified-possessor": "người chiếm hữu đáp ứng điều kiện đã được xác nhận theo Điều 236", state: "Nhà nước" } as const;
    return { ...base, title: label(subjectId), statement: `Sau khi hết thời hiệu, đối tượng nhận được xác định là ${recipients[recipient?.value as keyof typeof recipients] ?? recipient?.value}.`, status: "neutral" as const };
  });
}

function estateSettlementConclusions(results: Result[], label: (subject: string) => string, runId?: string): GuidedConclusionItem[] {
  return results.flatMap((result): GuidedConclusionItem[] => {
    const common = { id: `estate-settlement:${result.subject}:${result.predicate}`, moduleId: "estate-settlement" as const, runId, ruleIds: unique(result.derivations) };
    if (result.value === "unknown") return [{ ...common, title: label(result.subject), statement: "Chưa đủ facts để kết luận cho vấn đề phân chia này.", status: "unknown" as const }];
    if (result.predicate === "distribution-not-before") return [{ ...common, title: "Mốc được phép phân chia", statement: `Di sản không được phân chia trước ngày ${formatDate(result.value)}.`, status: "neutral" as const }];
    if (result.predicate === "court-deferral-may-be-requested") return [{ ...common, title: label(result.subject), statement: `${label(result.subject)} có quyền yêu cầu Tòa án xác định phần di sản được hưởng nhưng chưa cho chia trong thời hạn luật định. Đây không phải kết luận Tòa án đã chấp thuận.`, status: "positive" as const }];
    if (result.predicate === "court-extension-may-be-requested") return [{ ...common, title: "Yêu cầu gia hạn", statement: `${label(result.subject)} có thể yêu cầu gia hạn một lần theo điều kiện đã xác nhận.`, status: "positive" as const }];
    if (result.predicate === "payment-priority") return [{ ...common, title: label(result.subject), statement: `Nghĩa vụ này có thứ tự ưu tiên thanh toán số ${result.value}.`, status: "neutral" as const }];
    return [];
  });
}

function compulsoryShareConclusions(results: Result[], label: (subject: string) => string, facts: readonly ApiFact[], runId?: string): GuidedConclusionItem[] {
  return results.flatMap((result): GuidedConclusionItem[] => {
    const calculationPerson = facts.find((fact) => fact.subject === result.subject && fact.predicate === "calculation-person")?.value;
    const calculationPortion = facts.find((fact) => fact.subject === result.subject && fact.predicate === "calculation-estate-portion")?.value;
    const subject = typeof calculationPerson === "string" ? `${label(calculationPerson)} · ${typeof calculationPortion === "string" ? label(calculationPortion) : "phần di sản"}` : label(result.subject);
    const common = { id: `compulsory:${result.subject}:${result.predicate}`, moduleId: "compulsory-share" as const, runId, ruleIds: unique(result.derivations) };
    if (result.predicate === "compulsory-heir") return conclusionForResult("compulsory-share", result, label, runId);
    if (result.predicate === "minimum-compulsory-share") return [{ ...common, title: subject, statement: `Mức suất bắt buộc tối thiểu được tính là ${formatNumber(result.value)}.`, status: "neutral" as const }];
    if (result.predicate === "compulsory-share-shortfall") return [{ ...common, title: subject, statement: `Phần còn thiếu so với mức tối thiểu là ${formatNumber(result.value)}.`, status: Number(result.value) > 0 ? "negative" as const : "positive" as const }];
    return [];
  });
}

function labelResolver(facts: readonly ApiFact[]): (subject: string) => string {
  const labels = new Map<string, string>();
  const labelPredicates = new Set(["person-label", "heir-person-label", "estate-portion-label", "limitation-request-label", "obligation-label", "estate-asset-label", "distribution-group-label"]);
  for (const fact of facts) if (fact.subject && labelPredicates.has(fact.predicate) && typeof fact.value === "string") labels.set(fact.subject, fact.value);
  return (subject) => labels.get(subject) ?? fallbackLabel(subject);
}

function fallbackLabel(subject: string): string {
  if (subject.includes("limitation")) return "Yêu cầu thời hiệu";
  if (subject.includes("restriction")) return "Phần di sản đang bị hạn chế phân chia";
  if (subject.includes("spouse")) return "Người vợ/chồng còn sống";
  return "Đối tượng đang được đánh giá";
}

function groupBySubject(results: readonly Result[]): Map<string, Result[]> {
  const groups = new Map<string, Result[]>();
  for (const result of results) groups.set(result.subject, [...(groups.get(result.subject) ?? []), result]);
  return groups;
}

function unique(values: readonly string[]): string[] { return [...new Set(values.filter(Boolean))]; }
function formatDate(value: string): string { const [year, month, day] = value.split("-"); return year && month && day ? `${day}/${month}/${year}` : value; }
function formatNumber(value: string): string { const number = Number(value); return Number.isFinite(number) ? new Intl.NumberFormat("vi-VN").format(number) : value; }

function subjectFromConclusionId(id: string): string {
  const parts = id.split(":");
  return parts.length > 1 ? parts[1]! : "";
}

function describeFact(fact: ApiFact, allFacts: readonly ApiFact[]): string {
  const subject = labelResolver(allFacts)(fact.subject ?? "");
  const predicates: Record<string, string> = {
    "will-type": "Hình thức di chúc",
    "testator-mental-state": "Trạng thái nhận thức khi lập di chúc",
    "undue-influence": "Lừa dối, đe dọa hoặc cưỡng ép",
    "prohibited-content": "Nội dung vi phạm điều cấm",
    "formal-defect": "Vi phạm hình thức",
    "request-type": "Loại yêu cầu",
    "asset-type": "Loại tài sản",
    "inheritance-opening-date": "Ngày mở thừa kế",
    "division-restriction-basis": "Căn cứ hạn chế phân chia",
    "specified-division-date": "Ngày được chỉ định",
    "all-heirs-agreed": "Tất cả người thừa kế đồng ý",
    "estate-division-requested": "Đã có yêu cầu chia di sản",
    "serious-division-impact": "Việc chia gây ảnh hưởng nghiêm trọng",
    "prior-court-deferral-expired": "Thời hạn trì hoãn trước đã hết",
    "serious-impact-still-exists": "Ảnh hưởng nghiêm trọng vẫn còn",
    "heir-life-status": "Tình trạng sống",
    "spouse-at-opening": "Quan hệ vợ/chồng khi mở thừa kế",
    "age-group": "Nhóm tuổi",
    "work-capacity": "Khả năng lao động",
  };
  return `${predicates[fact.predicate] ?? humanizePredicate(fact.predicate)} của ${subject}: ${humanizeValue(fact.value, allFacts)}`;
}

function describeConclusion(predicate: string, value: string, subjectId: string, facts: readonly ApiFact[]): string {
  const subject = labelResolver(facts)(subjectId);
  const predicates: Record<string, string> = {
    "valid-intention": "Ý chí lập di chúc hợp lệ",
    "valid-content-and-form": "Nội dung và hình thức hợp lệ",
    "valid-will": "Di chúc hợp pháp",
    "article-621-status": "Trạng thái quyền hưởng",
    "inheritance-regime": "Cách thức chia di sản",
    "called-to-inherit": "Được gọi hưởng thừa kế",
    "inherits-by-representation": "Được hưởng thế vị",
    "compulsory-heir": "Thuộc diện hưởng suất bắt buộc",
    "limitation-period-years": "Thời hiệu áp dụng",
    "distribution-not-before": "Mốc chưa được phân chia",
    "court-deferral-may-be-requested": "Có quyền yêu cầu trì hoãn",
    "court-extension-may-be-requested": "Có quyền yêu cầu gia hạn",
  };
  return `${predicates[predicate] ?? humanizePredicate(predicate)} đối với ${subject}: ${humanizeValue(value, facts)}`;
}

function humanizePredicate(predicate: string): string { return predicate.replaceAll("-", " "); }
function humanizeValue(value: ApiFact["value"] | string, facts: readonly ApiFact[]): string {
  if (typeof value === "boolean" || value === "true" || value === "false") return value === true || value === "true" ? "Có" : "Không";
  const values: Record<string, string> = { written: "Bằng văn bản", oral: "Bằng miệng", lucid: "Minh mẫn, sáng suốt", "not-lucid": "Không minh mẫn", none: "Không phát hiện", detected: "Có phát hiện", "not-detected": "Không phát hiện", "divide-estate": "Yêu cầu chia di sản", "confirm-or-deny-inheritance-right": "Xác nhận hoặc bác bỏ quyền thừa kế", "perform-estate-obligation": "Yêu cầu thực hiện nghĩa vụ về di sản", immovable: "Bất động sản", movable: "Động sản", alive: "Còn sống", "will-instruction": "Ý chí trong di chúc", "all-heirs-agreement": "Thỏa thuận của tất cả người thừa kế", statutory: "Chia theo pháp luật", testamentary: "Chia theo di chúc", excluded: "Không được quyền hưởng", "not-excluded": "Không bị loại trừ", "exception-under-will": "Ngoại lệ theo di chúc" };
  if (values[String(value)]) return values[String(value)]!;
  const relatedLabel = facts.find((fact) => fact.subject === String(value) && (fact.predicate === "person-label" || fact.predicate === "heir-person-label"))?.value;
  return typeof relatedLabel === "string" ? relatedLabel : String(value);
}
