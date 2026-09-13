import type { AnalysisModuleId, InteractionMode } from "./analysis-modules";
import { z } from "zod";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

export const guidedTopicIds = ["who-inherits", "will-validity", "person-eligibility", "representation", "compulsory-share", "estate-settlement", "limitation"] as const;
export type GuidedTopicId = (typeof guidedTopicIds)[number];
export const guidedTopicIdSchema = z.enum(guidedTopicIds);
export const createGuidedSessionSchema = z.object({ title: z.string().trim().min(1).max(200), topicId: guidedTopicIdSchema });
export const guidedAnswerSchema = z.discriminatedUnion("questionId", [
  z.object({ questionId: z.literal("guided-deceased-name"), value: z.string().trim().min(1).max(80) }),
  z.object({ questionId: z.literal("guided-eligibility-person-name"), value: z.string().trim().min(1).max(80) }),
  z.object({ questionId: z.literal("inheritance-has-will"), value: z.boolean() }),
  z.object({ questionId: z.literal("will-type"), value: z.enum(["written", "oral"]) }),
  z.object({ questionId: z.literal("testator-mental-state"), value: z.enum(["lucid", "not-lucid"]) }),
  z.object({ questionId: z.literal("undue-influence"), value: z.enum(["none", "deception", "threat"]) }),
  z.object({ questionId: z.literal("prohibited-content"), value: z.enum(["detected", "not-detected"]) }),
  z.object({ questionId: z.literal("formal-defect"), value: z.enum(["detected", "not-detected"]) }),
  z.object({ questionId: z.literal("guardian-consent"), value: z.boolean() }),
  z.object({ questionId: z.literal("prepared-by-witness"), value: z.boolean() }),
  z.object({ questionId: z.literal("notarized-or-certified"), value: z.boolean() }),
  z.object({ questionId: z.literal("witness-count"), value: z.number().int().min(0).max(100) }),
  z.object({ questionId: z.literal("witnesses-recorded"), value: z.boolean() }),
  z.object({ questionId: z.literal("witnesses-signed"), value: z.boolean() }),
  z.object({ questionId: z.literal("certified-within-days"), value: z.number().int().min(0).max(36500) }),
]);
export type GuidedAnswer = z.infer<typeof guidedAnswerSchema>;
export const guidedAnswerQuestionIds = ["guided-deceased-name", "guided-eligibility-person-name", "inheritance-has-will", "will-type", "testator-mental-state", "undue-influence", "prohibited-content", "formal-defect", "guardian-consent", "prepared-by-witness", "notarized-or-certified", "witness-count", "witnesses-recorded", "witnesses-signed", "certified-within-days"] as const;

export function isGuidedAnswerQuestionId(value: string): value is GuidedAnswer["questionId"] {
  return (guidedAnswerQuestionIds as readonly string[]).includes(value);
}

export interface GuidedTopicDefinition {
  id: GuidedTopicId;
  question: string;
  description: string;
  modules: readonly AnalysisModuleId[];
  recommendedStartModule: AnalysisModuleId;
}

export const guidedTopics: Record<GuidedTopicId, GuidedTopicDefinition> = {
  "who-inherits": { id: "who-inherits", question: "Ai có thể được hưởng di sản?", description: "Xác định người liên quan, hàng thừa kế và trường hợp thế vị.", modules: ["will-validity", "inheritance-type", "eligibility", "refusal-and-unclaimed", "heir-rank", "representation"], recommendedStartModule: "heir-rank" },
  "will-validity": { id: "will-validity", question: "Di chúc có hợp pháp không?", description: "Rà soát ý chí, nội dung, hình thức và trường hợp đặc biệt.", modules: ["will-validity"], recommendedStartModule: "will-validity" },
  "person-eligibility": { id: "person-eligibility", question: "Một người có bị mất quyền hưởng không?", description: "Rà soát các căn cứ tại Điều 621 và ngoại lệ theo di chúc.", modules: ["will-validity", "eligibility"], recommendedStartModule: "eligibility" },
  representation: { id: "representation", question: "Con hoặc cháu có được hưởng thế vị không?", description: "Dựng nhánh gia đình và kiểm tra điều kiện thừa kế thế vị.", modules: ["will-validity", "heir-rank", "eligibility", "refusal-and-unclaimed", "representation"], recommendedStartModule: "heir-rank" },
  "compulsory-share": { id: "compulsory-share", question: "Ai vẫn được hưởng dù di chúc không cho hưởng?", description: "Xác định người thuộc diện hưởng suất bắt buộc.", modules: ["heir-rank", "will-validity", "eligibility", "compulsory-share"], recommendedStartModule: "heir-rank" },
  "estate-settlement": { id: "estate-settlement", question: "Di sản và nghĩa vụ được thanh toán hoặc chia thế nào?", description: "Rà soát thứ tự thanh toán, nguyên tắc và hạn chế phân chia.", modules: ["estate-settlement"], recommendedStartModule: "estate-settlement" },
  limitation: { id: "limitation", question: "Còn thời hiệu yêu cầu về thừa kế không?", description: "Xác định mốc thời hiệu và hậu quả sau thời hiệu.", modules: ["limitation"], recommendedStartModule: "limitation" },
};

export interface GuidedInferenceGoal {
  module: AnalysisModuleId;
  resultPredicates: readonly string[];
  role: "result" | "dependency";
}

/** Legal outcomes drive orchestration; UI presenter order does not. */
export const guidedInferenceGoals: Record<GuidedTopicId, readonly GuidedInferenceGoal[]> = {
  "who-inherits": [
    { module: "inheritance-type", resultPredicates: ["inheritance-regime"], role: "result" },
    { module: "heir-rank", resultPredicates: ["called-to-inherit", "candidate-heir-rank"], role: "result" },
    { module: "representation", resultPredicates: ["inherits-by-representation"], role: "result" },
    { module: "will-validity", resultPredicates: ["valid-will"], role: "dependency" },
    { module: "eligibility", resultPredicates: ["article-621-status"], role: "dependency" },
    { module: "refusal-and-unclaimed", resultPredicates: ["valid-refusal"], role: "dependency" },
  ],
  "will-validity": [{ module: "will-validity", resultPredicates: ["valid-will"], role: "result" }],
  "person-eligibility": [
    { module: "eligibility", resultPredicates: ["article-621-status"], role: "result" },
    { module: "will-validity", resultPredicates: ["valid-will"], role: "dependency" },
  ],
  representation: [
    { module: "representation", resultPredicates: ["inherits-by-representation"], role: "result" },
    { module: "heir-rank", resultPredicates: ["candidate-heir-rank"], role: "dependency" },
    { module: "eligibility", resultPredicates: ["article-621-status"], role: "dependency" },
    { module: "refusal-and-unclaimed", resultPredicates: ["valid-refusal"], role: "dependency" },
    { module: "will-validity", resultPredicates: ["valid-will"], role: "dependency" },
  ],
  "compulsory-share": [
    { module: "compulsory-share", resultPredicates: ["compulsory-heir", "minimum-compulsory-share", "compulsory-share-shortfall"], role: "result" },
    { module: "heir-rank", resultPredicates: ["candidate-heir-rank"], role: "dependency" },
    { module: "eligibility", resultPredicates: ["article-621-status"], role: "dependency" },
    { module: "will-validity", resultPredicates: ["valid-will"], role: "dependency" },
  ],
  "estate-settlement": [{ module: "estate-settlement", resultPredicates: ["payment-priority", "distribution-not-before", "court-deferral-may-be-requested", "court-extension-may-be-requested"], role: "result" }],
  limitation: [{ module: "limitation", resultPredicates: ["limitation-period-years", "limitation-deadline", "post-limitation-recipient"], role: "result" }],
};

export type GuidedAnswerKind = "single-choice" | "boolean-unknown" | "date" | "number" | "text";
export type GuidedInteraction = InteractionMode | "eligibility-review" | "refusal-review" | "compulsory-share-review" | "estate-portions" | "inheritance-portions";
export interface GuidedChoice { label: string; value: string | boolean; description?: string }

type GuidedRequirementTemplate =
  | { kind: "question"; prompt: string; answerKind: GuidedAnswerKind; priority: number; choices?: readonly GuidedChoice[]; min?: number; max?: number; placeholder?: string }
  | { kind: "interaction"; prompt: string; interaction: GuidedInteraction; priority: number };

export type GuidedRequirementResolution = GuidedRequirementTemplate & { predicate: string };

export interface GuidedMissingRequirement {
  subject: string;
  predicate: string;
}

export interface GuidedCaseState {
  case: { id: string; title: string; facts: ApiFact[] };
  topic: GuidedTopicDefinition;
  completedStepIds: string[];
  latestRunIds: Partial<Record<AnalysisModuleId, string>>;
  latestResults: Partial<Record<AnalysisModuleId, InferenceRun["results"]>>;
  dependencyPlan: Array<{ id: string; status: "complete" | "ready" | "skipped" | "blocked" }>;
  inferenceStatus: { status: "collecting" | "complete" | "unknown" | "conflict"; modules: AnalysisModuleId[] };
  next?: { requirement: GuidedMissingRequirement; resolution?: GuidedRequirementResolution };
}

const requirementCatalog: Record<string, GuidedRequirementTemplate> = {
  "guided-deceased-name": { kind: "question", prompt: "Trước hết, người để lại di sản là ai?", answerKind: "text", priority: 0 },
  "guided-eligibility-person-name": { kind: "question", prompt: "Bạn muốn rà soát quyền hưởng của người nào?", answerKind: "text", priority: 5, placeholder: "Nhập tên người cần rà soát" },
  "will-type": { kind: "question", prompt: "Di chúc được lập dưới hình thức nào?", answerKind: "single-choice", priority: 20, choices: [{ label: "Bằng văn bản", value: "written" }, { label: "Bằng miệng", value: "oral" }] },
  "testator-mental-state": { kind: "question", prompt: "Khi lập di chúc, người lập có minh mẫn và sáng suốt không?", answerKind: "single-choice", priority: 30, choices: [{ label: "Minh mẫn, sáng suốt", value: "lucid" }, { label: "Không minh mẫn", value: "not-lucid" }] },
  "undue-influence": { kind: "question", prompt: "Có dấu hiệu lừa dối, đe dọa hoặc cưỡng ép khi lập di chúc không?", answerKind: "single-choice", priority: 40, choices: [{ label: "Không phát hiện", value: "none" }, { label: "Có dấu hiệu lừa dối", value: "deception" }, { label: "Có dấu hiệu đe dọa", value: "threat" }] },
  "prohibited-content": { kind: "question", prompt: "Có phát hiện nội dung của di chúc vi phạm điều cấm không?", answerKind: "single-choice", priority: 50, choices: [{ label: "Không phát hiện", value: "not-detected" }, { label: "Có phát hiện", value: "detected" }] },
  "formal-defect": { kind: "question", prompt: "Có phát hiện vi phạm về hình thức của di chúc không?", answerKind: "single-choice", priority: 60, choices: [{ label: "Không phát hiện", value: "not-detected" }, { label: "Có phát hiện", value: "detected" }] },
  "guardian-consent": { kind: "question", prompt: "Cha, mẹ hoặc người giám hộ có đồng ý việc lập di chúc không?", answerKind: "single-choice", priority: 60, choices: [{ label: "Có", value: true }, { label: "Không", value: false }] },
  "prepared-by-witness": { kind: "question", prompt: "Di chúc có được người làm chứng lập thành văn bản không?", answerKind: "single-choice", priority: 60, choices: [{ label: "Có", value: true }, { label: "Không", value: false }] },
  "notarized-or-certified": { kind: "question", prompt: "Di chúc đã được công chứng hoặc chứng thực chưa?", answerKind: "single-choice", priority: 70, choices: [{ label: "Có", value: true }, { label: "Không", value: false }] },
  "witness-count": { kind: "question", prompt: "Có bao nhiêu người làm chứng cho di chúc miệng?", answerKind: "number", priority: 60, min: 0, max: 100, placeholder: "Ví dụ: 2" },
  "witnesses-recorded": { kind: "question", prompt: "Ý chí cuối cùng đã được người làm chứng ghi chép lại chưa?", answerKind: "single-choice", priority: 70, choices: [{ label: "Đã ghi chép", value: true }, { label: "Chưa ghi chép", value: false }] },
  "witnesses-signed": { kind: "question", prompt: "Những người làm chứng đã ký tên hoặc điểm chỉ chưa?", answerKind: "single-choice", priority: 80, choices: [{ label: "Đã ký hoặc điểm chỉ", value: true }, { label: "Chưa", value: false }] },
  "certified-within-days": { kind: "question", prompt: "Sau bao nhiêu ngày lời di chúc được công chứng hoặc chứng thực?", answerKind: "number", priority: 90, min: 0, max: 36500, placeholder: "Số ngày" },
  "inheritance-has-will": { kind: "question", prompt: "Có di chúc liên quan đến hồ sơ này không?", answerKind: "single-choice", priority: 10, choices: [{ label: "Có di chúc", value: true }, { label: "Không có di chúc", value: false }] },
  "relationship-at-opening": { kind: "interaction", prompt: "Hãy bổ sung quan hệ gia đình của những người liên quan.", interaction: "family-tree", priority: 10 },
  "heir-life-status": { kind: "question", prompt: "Người này còn sống tại thời điểm mở thừa kế không?", answerKind: "single-choice", priority: 20 },
  "article-621-status": { kind: "interaction", prompt: "Cần rà soát các căn cứ về quyền hưởng của người này.", interaction: "eligibility-review", priority: 30 },
  "eligibility-review-complete": { kind: "interaction", prompt: "Cần rà soát các căn cứ về quyền hưởng của người này.", interaction: "eligibility-review", priority: 30 },
  "valid-refusal": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "refusal-made": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "refusal-intent": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "refusal-written": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "refusal-notice-recipient": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "refusal-before-estate-distribution": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "heir-search-complete": { kind: "interaction", prompt: "Hãy kiểm tra cây gia đình và xác nhận đã nhập đủ ứng viên.", interaction: "family-tree", priority: 50 },
  "guided-compulsory-share-review": { kind: "interaction", prompt: "Hãy rà soát những người có thể thuộc diện hưởng di sản bắt buộc.", interaction: "compulsory-share-review", priority: 60 },
  "guided-compulsory-share-portions": { kind: "interaction", prompt: "Hãy khai các phần di sản cần đối chiếu với ngưỡng hưởng bắt buộc.", interaction: "estate-portions", priority: 70 },
  "guided-inheritance-portions": { kind: "interaction", prompt: "Hãy mô tả từng phần di sản và việc định đoạt theo di chúc.", interaction: "inheritance-portions", priority: 15 },
  "inheritance-opening-date": { kind: "question", prompt: "Ngày mở thừa kế là ngày nào?", answerKind: "date", priority: 10 },
  "limitation-request-type": { kind: "question", prompt: "Bạn đang muốn thực hiện loại yêu cầu nào?", answerKind: "single-choice", priority: 20 },
  "guided-estate-settlement": { kind: "interaction", prompt: "Hãy chọn vấn đề hạn chế hoặc trì hoãn phân chia di sản cần đánh giá theo Điều 661.", interaction: "timeline", priority: 10 },
  "guided-limitation-timeline": { kind: "interaction", prompt: "Hãy mô tả yêu cầu và ngày mở thừa kế để xác định mốc thời hiệu.", interaction: "timeline", priority: 10 },
};

export function getGuidedTopic(topicId: string | undefined): GuidedTopicDefinition | undefined {
  return topicId ? guidedTopics[topicId as GuidedTopicId] : undefined;
}

export function resolveGuidedRequirement(requirement: GuidedMissingRequirement): GuidedRequirementResolution | undefined {
  const resolution = requirementCatalog[requirement.predicate];
  return resolution ? { ...resolution, predicate: requirement.predicate } : undefined;
}

export function selectNextGuidedRequirement(requirements: readonly GuidedMissingRequirement[]): {
  requirement: GuidedMissingRequirement;
  resolution?: GuidedRequirementResolution;
} | undefined {
  const unique = new Map(requirements.map((item) => [`${item.subject}:${item.predicate}`, item]));
  return [...unique.values()]
    .map((requirement) => ({ requirement, resolution: resolveGuidedRequirement(requirement) }))
    .sort((left, right) => {
      if (left.resolution && !right.resolution) return -1;
      if (!left.resolution && right.resolution) return 1;
      return (left.resolution?.priority ?? Number.MAX_SAFE_INTEGER) - (right.resolution?.priority ?? Number.MAX_SAFE_INTEGER);
    })[0];
}
