export type AnalysisModuleId =
  | "will-validity"
  | "inheritance-type"
  | "eligibility"
  | "heir-rank"
  | "representation"
  | "compulsory-share"
  | "refusal-and-unclaimed"
  | "limitation";

export type InteractionMode = "questionnaire" | "family-tree" | "people-table" | "timeline";
export type ModuleStatus = "implemented" | "planned";

export interface ModuleDependency {
  moduleId: AnalysisModuleId;
  mode: "required" | "conditional";
  status: "draft" | "implemented";
  reason: string;
}

export interface AnalysisModuleDefinition {
  id: AnalysisModuleId;
  title: string;
  shortDescription: string;
  status: ModuleStatus;
  interactionMode: InteractionMode;
  primaryResultPredicate: string;
  dependencies: readonly ModuleDependency[];
  runtime?: {
    inferencePath: string;
    subjectPrefix: string;
    defaultCaseTitle: string;
  };
}

export const analysisModules: Record<AnalysisModuleId, AnalysisModuleDefinition> = {
  "will-validity": {
    id: "will-validity",
    title: "Tính hợp pháp của di chúc",
    shortDescription: "Đánh giá các điều kiện về ý chí, nội dung và hình thức của di chúc.",
    status: "implemented",
    interactionMode: "questionnaire",
    primaryResultPredicate: "valid-will",
    dependencies: [],
    runtime: {
      inferencePath: "/api/cases/:caseId/inference/will-validity",
      subjectPrefix: "will",
      defaultCaseTitle: "Hồ sơ di chúc thử nghiệm",
    },
  },
  "inheritance-type": {
    id: "inheritance-type",
    title: "Loại thừa kế",
    shortDescription: "Xác định phần di sản áp dụng thừa kế theo di chúc hoặc theo pháp luật.",
    status: "implemented",
    interactionMode: "questionnaire",
    primaryResultPredicate: "inheritance-regime",
    dependencies: [
      {
        moduleId: "will-validity",
        mode: "conditional",
        status: "implemented",
        reason: "Cần kết quả tính hợp pháp khi vụ việc có di chúc.",
      },
    ],
    runtime: {
      inferencePath: "/api/cases/:caseId/inference/inheritance-type",
      subjectPrefix: "portion",
      defaultCaseTitle: "Hồ sơ xác định loại thừa kế",
    },
  },
  eligibility: {
    id: "eligibility",
    title: "Quyền hưởng di sản",
    shortDescription: "Đánh giá quyền hưởng hoặc căn cứ loại trừ đối với từng người.",
    status: "planned",
    interactionMode: "people-table",
    primaryResultPredicate: "eligible-to-inherit",
    dependencies: [],
  },
  "heir-rank": {
    id: "heir-rank",
    title: "Hàng thừa kế",
    shortDescription: "Xác định hàng thừa kế theo pháp luật của từng người.",
    status: "planned",
    interactionMode: "family-tree",
    primaryResultPredicate: "heir-rank",
    dependencies: [
      {
        moduleId: "inheritance-type",
        mode: "required",
        status: "draft",
        reason: "Chỉ cần xét hàng thừa kế cho phần di sản áp dụng thừa kế theo pháp luật.",
      },
    ],
  },
  representation: {
    id: "representation",
    title: "Thừa kế thế vị",
    shortDescription: "Đánh giá điều kiện thế vị dựa trên quan hệ gia đình và thời điểm chết.",
    status: "planned",
    interactionMode: "family-tree",
    primaryResultPredicate: "inherits-by-representation",
    dependencies: [
      {
        moduleId: "heir-rank",
        mode: "required",
        status: "draft",
        reason: "Cần biết nhánh quan hệ và vị trí của người được thế vị trong hàng thừa kế.",
      },
    ],
  },
  "compulsory-share": {
    id: "compulsory-share",
    title: "Suất thừa kế bắt buộc",
    shortDescription: "Đánh giá người thừa kế không phụ thuộc nội dung di chúc và mức suất liên quan.",
    status: "planned",
    interactionMode: "people-table",
    primaryResultPredicate: "entitled-to-compulsory-share",
    dependencies: [
      {
        moduleId: "will-validity",
        mode: "conditional",
        status: "draft",
        reason: "Có thể cần trạng thái pháp lý của di chúc khi đánh giá phần định đoạt.",
      },
      {
        moduleId: "eligibility",
        mode: "required",
        status: "draft",
        reason: "Người được xét trước hết phải có quyền hưởng di sản.",
      },
    ],
  },
  "refusal-and-unclaimed": {
    id: "refusal-and-unclaimed",
    title: "Từ chối và tài sản không có người nhận",
    shortDescription: "Ghi nhận việc từ chối nhận và trạng thái phần di sản chưa có người nhận.",
    status: "planned",
    interactionMode: "people-table",
    primaryResultPredicate: "inheritance-acceptance-status",
    dependencies: [
      {
        moduleId: "eligibility",
        mode: "conditional",
        status: "draft",
        reason: "Có thể cần danh sách người có quyền hưởng trước khi đánh giá hậu quả của việc từ chối.",
      },
    ],
  },
  limitation: {
    id: "limitation",
    title: "Thời hiệu thừa kế",
    shortDescription: "Đánh giá các mốc thời gian liên quan tới yêu cầu về thừa kế.",
    status: "planned",
    interactionMode: "timeline",
    primaryResultPredicate: "inheritance-limitation-status",
    dependencies: [],
  },
};

export function getAnalysisModule(moduleId: string): AnalysisModuleDefinition | undefined {
  return analysisModules[moduleId as AnalysisModuleId];
}

export function getExecutableModulePlan(targetModuleId: AnalysisModuleId): AnalysisModuleDefinition[] {
  const ordered: AnalysisModuleDefinition[] = [];
  const visited = new Set<AnalysisModuleId>();
  const visiting = new Set<AnalysisModuleId>();

  function visit(moduleId: AnalysisModuleId) {
    if (visited.has(moduleId)) return;
    if (visiting.has(moduleId)) throw new Error(`Phát hiện dependency cycle tại module ${moduleId}`);

    visiting.add(moduleId);
    const module = analysisModules[moduleId];
    for (const dependency of module.dependencies) {
      if (dependency.status === "implemented" && dependency.mode === "required") {
        visit(dependency.moduleId);
      }
    }
    visiting.delete(moduleId);
    visited.add(moduleId);
    ordered.push(module);
  }

  visit(targetModuleId);
  return ordered;
}

export function resolveInferencePath(module: AnalysisModuleDefinition, caseId: string): string {
  if (!module.runtime) throw new Error(`Module ${module.id} chưa có runtime adapter`);
  return module.runtime.inferencePath.replace(":caseId", encodeURIComponent(caseId));
}
