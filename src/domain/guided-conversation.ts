import type { AnalysisModuleId, InteractionMode } from "./analysis-modules";
import { z } from "zod";
import type { ApiFact } from "@/modules/contracts";

export const guidedTopicIds = ["who-inherits", "will-validity", "person-eligibility", "representation", "compulsory-share", "estate-settlement", "limitation"] as const;
export type GuidedTopicId = (typeof guidedTopicIds)[number];
export const guidedTopicIdSchema = z.enum(guidedTopicIds);
export const createGuidedSessionSchema = z.object({ title: z.string().trim().min(1).max(200), topicId: guidedTopicIdSchema });
export const guidedAnswerSchema = z.discriminatedUnion("questionId", [
  z.object({ questionId: z.literal("guided-deceased-name"), value: z.string().trim().min(1).max(80) }),
  z.object({ questionId: z.literal("will-type"), value: z.enum(["written", "oral"]) }),
]);
export type GuidedAnswer = z.infer<typeof guidedAnswerSchema>;

export interface GuidedTopicDefinition {
  id: GuidedTopicId;
  question: string;
  description: string;
  modules: readonly AnalysisModuleId[];
  recommendedStartModule: AnalysisModuleId;
}

export const guidedTopics: Record<GuidedTopicId, GuidedTopicDefinition> = {
  "who-inherits": { id: "who-inherits", question: "Ai có thể được hưởng di sản?", description: "Xác định người liên quan, hàng thừa kế và trường hợp thế vị.", modules: ["inheritance-type", "eligibility", "refusal-and-unclaimed", "heir-rank", "representation"], recommendedStartModule: "heir-rank" },
  "will-validity": { id: "will-validity", question: "Di chúc có hợp pháp không?", description: "Rà soát ý chí, nội dung, hình thức và trường hợp đặc biệt.", modules: ["will-validity"], recommendedStartModule: "will-validity" },
  "person-eligibility": { id: "person-eligibility", question: "Một người có bị mất quyền hưởng không?", description: "Rà soát các căn cứ tại Điều 621 và ngoại lệ theo di chúc.", modules: ["eligibility"], recommendedStartModule: "eligibility" },
  representation: { id: "representation", question: "Con hoặc cháu có được hưởng thế vị không?", description: "Dựng nhánh gia đình và kiểm tra điều kiện thừa kế thế vị.", modules: ["heir-rank", "eligibility", "refusal-and-unclaimed", "representation"], recommendedStartModule: "heir-rank" },
  "compulsory-share": { id: "compulsory-share", question: "Ai vẫn được hưởng dù di chúc không cho hưởng?", description: "Xác định người thuộc diện hưởng suất bắt buộc.", modules: ["heir-rank", "will-validity", "eligibility", "compulsory-share"], recommendedStartModule: "heir-rank" },
  "estate-settlement": { id: "estate-settlement", question: "Di sản và nghĩa vụ được thanh toán hoặc chia thế nào?", description: "Rà soát thứ tự thanh toán, nguyên tắc và hạn chế phân chia.", modules: ["estate-settlement"], recommendedStartModule: "estate-settlement" },
  limitation: { id: "limitation", question: "Còn thời hiệu yêu cầu về thừa kế không?", description: "Xác định mốc thời hiệu và hậu quả sau thời hiệu.", modules: ["limitation"], recommendedStartModule: "limitation" },
};

export type GuidedAnswerKind = "single-choice" | "boolean-unknown" | "date" | "number" | "text";
export type GuidedInteraction = InteractionMode | "eligibility-review" | "refusal-review";

type GuidedRequirementTemplate =
  | { kind: "question"; prompt: string; answerKind: GuidedAnswerKind; priority: number }
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
  next?: { requirement: GuidedMissingRequirement; resolution?: GuidedRequirementResolution };
}

const requirementCatalog: Record<string, GuidedRequirementTemplate> = {
  "guided-deceased-name": { kind: "question", prompt: "Trước hết, người để lại di sản là ai?", answerKind: "text", priority: 0 },
  "will-type": { kind: "question", prompt: "Di chúc được lập dưới hình thức nào?", answerKind: "single-choice", priority: 20 },
  "testator-mental-state": { kind: "question", prompt: "Khi lập di chúc, người lập có minh mẫn và sáng suốt không?", answerKind: "single-choice", priority: 30 },
  "undue-influence": { kind: "question", prompt: "Có dấu hiệu lừa dối, đe dọa hoặc cưỡng ép khi lập di chúc không?", answerKind: "boolean-unknown", priority: 40 },
  "inheritance-has-will": { kind: "question", prompt: "Người để lại di sản có lập di chúc không?", answerKind: "boolean-unknown", priority: 10 },
  "relationship-at-opening": { kind: "interaction", prompt: "Hãy bổ sung quan hệ gia đình của những người liên quan.", interaction: "family-tree", priority: 10 },
  "heir-life-status": { kind: "question", prompt: "Người này còn sống tại thời điểm mở thừa kế không?", answerKind: "single-choice", priority: 20 },
  "article-621-status": { kind: "interaction", prompt: "Cần rà soát các căn cứ về quyền hưởng của người này.", interaction: "eligibility-review", priority: 30 },
  "valid-refusal": { kind: "interaction", prompt: "Cần rà soát việc từ chối nhận di sản của người này.", interaction: "refusal-review", priority: 40 },
  "heir-search-complete": { kind: "interaction", prompt: "Hãy kiểm tra cây gia đình và xác nhận đã nhập đủ ứng viên.", interaction: "family-tree", priority: 50 },
  "inheritance-opening-date": { kind: "question", prompt: "Ngày mở thừa kế là ngày nào?", answerKind: "date", priority: 10 },
  "limitation-request-type": { kind: "question", prompt: "Bạn đang muốn thực hiện loại yêu cầu nào?", answerKind: "single-choice", priority: 20 },
  "guided-estate-settlement": { kind: "interaction", prompt: "Hãy bổ sung các phần di sản và nghĩa vụ cần thanh toán hoặc phân chia.", interaction: "timeline", priority: 10 },
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
