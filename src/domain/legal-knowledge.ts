import legalCatalog from "../../knowledge-base/legal-sources/civil-code-2015.inheritance.json";

export interface LegalSection {
  id: string;
  label: string;
  text: string;
}

export interface LegalProvision {
  id: string;
  number: string;
  title: string;
  sections: LegalSection[];
  sourceDocument: string;
  officialUrl: string;
}

export const legalProvisions = legalCatalog.provisions satisfies Record<string, LegalProvision>;
export const legalCatalogMetadata = legalCatalog.document;

export type LegalProvisionId = keyof typeof legalProvisions;

export interface RuleExplanation {
  ruleId: string;
  title: string;
  reasoning: string;
  conclusion: string;
  citation: string;
  provisionId?: LegalProvisionId;
  relevantSections: string[];
  kind: "legal" | "internal" | "system";
}

export const ruleExplanations: Record<string, RuleExplanation> = {
  "ARTICLE-627": {
    ruleId: "ARTICLE-627",
    title: "Xác định hình thức của di chúc",
    reasoning: "Điều 627 xác lập hai hình thức chính là di chúc bằng văn bản và di chúc miệng; câu trả lời dùng để chọn nhánh suy luận tiếp theo.",
    conclusion: "Xác định nhánh hình thức cần đánh giá",
    citation: "Điều 627 Bộ luật Dân sự 2015",
    provisionId: "article-627",
    relevantSections: ["main"],
    kind: "legal",
  },
  "FORM-ASSESSMENT-ACCEPTED": {
    ruleId: "FORM-ASSESSMENT-ACCEPTED",
    title: "Chấp nhận đánh giá hình thức chuyển tiếp",
    reasoning: "Từ dữ kiện di chúc bằng văn bản và chưa phát hiện khiếm khuyết hình thức, hệ thống tạm ghi nhận điều kiện hình thức đã đạt.",
    conclusion: "Điều kiện hình thức được ghi nhận là đạt",
    citation: "Quy tắc chuyển tiếp nội bộ; liên quan Điều 627–636",
    provisionId: "article-627",
    relevantSections: ["main"],
    kind: "internal",
  },
  "R-B01": {
    ruleId: "R-B01",
    title: "Đánh giá ý chí của người lập di chúc",
    reasoning: "Vì người lập di chúc minh mẫn, sáng suốt và không có dữ kiện về lừa dối hoặc đe dọa, hệ thống suy ra điều kiện về ý chí đã đạt.",
    conclusion: "Ý chí lập di chúc hợp lệ",
    citation: "Điều 630 khoản 1 điểm a Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-1-intro", "clause-1-a"],
    kind: "legal",
  },
  "R-B02": {
    ruleId: "R-B02",
    title: "Đánh giá nội dung và hình thức",
    reasoning: "Vì không phát hiện nội dung bị cấm và điều kiện hình thức đã đạt, hệ thống suy ra điều kiện về nội dung và hình thức đã đạt.",
    conclusion: "Nội dung và hình thức hợp lệ",
    citation: "Điều 630 khoản 1 điểm b Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-1-intro", "clause-1-b"],
    kind: "legal",
  },
  "R-B03": {
    ruleId: "R-B03",
    title: "Kết hợp các điều kiện hợp pháp",
    reasoning: "Khi điều kiện về ý chí, nội dung và hình thức đều đã được dẫn xuất là hợp lệ, hệ thống kết luận di chúc hợp pháp.",
    conclusion: "Di chúc hợp pháp",
    citation: "Điều 630 Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-1-intro", "clause-1-a", "clause-1-b"],
    kind: "legal",
  },
  "R-B04": {
    ruleId: "R-B04",
    title: "Loại trừ do ý chí không hợp lệ",
    reasoning: "Trạng thái không minh mẫn hoặc tác động trái ý chí làm điều kiện tại khoản 1 điểm a không được đáp ứng.",
    conclusion: "Di chúc không hợp pháp về điều kiện ý chí",
    citation: "Điều 630 khoản 1 điểm a Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-1-intro", "clause-1-a"],
    kind: "legal",
  },
  "R-B05": {
    ruleId: "R-B05",
    title: "Điều kiện dành cho người từ 15 đến dưới 18 tuổi",
    reasoning: "Độ tuổi, hình thức văn bản và sự đồng ý của cha, mẹ hoặc người giám hộ đáp ứng yêu cầu riêng đối với người chưa thành niên.",
    conclusion: "Yêu cầu đặc biệt theo độ tuổi đã đạt",
    citation: "Điều 630 khoản 2 Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-2"],
    kind: "legal",
  },
  "R-B06": {
    ruleId: "R-B06",
    title: "Loại trừ do không đạt điều kiện theo độ tuổi",
    reasoning: "Người từ 15 đến dưới 18 tuổi không lập di chúc bằng văn bản hoặc không có sự đồng ý cần thiết nên không đạt yêu cầu riêng.",
    conclusion: "Di chúc không hợp pháp do điều kiện theo độ tuổi",
    citation: "Điều 630 khoản 2 Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-2"],
    kind: "legal",
  },
  "R-B07": {
    ruleId: "R-B07",
    title: "Điều kiện hình thức trong trường hợp đặc biệt",
    reasoning: "Đối với người bị hạn chế thể chất hoặc không biết chữ, văn bản do người làm chứng lập và được công chứng hoặc chứng thực đáp ứng yêu cầu hình thức.",
    conclusion: "Điều kiện hình thức đặc biệt đã đạt",
    citation: "Điều 630 khoản 3 Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-3"],
    kind: "legal",
  },
  "R-B08": {
    ruleId: "R-B08",
    title: "Đánh giá hiệu lực hiện tại của di chúc miệng",
    reasoning: "Sau ba tháng, người lập vẫn còn sống, minh mẫn và sáng suốt nên di chúc miệng mặc nhiên bị hủy bỏ.",
    conclusion: "Di chúc miệng không còn hiệu lực",
    citation: "Điều 629 khoản 2 Bộ luật Dân sự 2015",
    provisionId: "article-629",
    relevantSections: ["clause-2"],
    kind: "legal",
  },
  "R-B09": {
    ruleId: "R-B09",
    title: "Đánh giá hình thức của di chúc miệng",
    reasoning: "Số người làm chứng, việc ghi chép, ký hoặc điểm chỉ và thời hạn xác nhận đáp ứng các điều kiện của di chúc miệng.",
    conclusion: "Điều kiện hình thức của di chúc miệng đã đạt",
    citation: "Điều 630 khoản 5 Bộ luật Dân sự 2015",
    provisionId: "article-630",
    relevantSections: ["clause-5"],
    kind: "legal",
  },
  "SYSTEM-CONFLICT": {
    ruleId: "SYSTEM-CONFLICT",
    title: "Phát hiện kết luận mâu thuẫn",
    reasoning: "Working memory đồng thời chứa kết luận hợp pháp và không hợp pháp cho cùng một di chúc.",
    conclusion: "Cần kiểm tra lại dữ kiện mâu thuẫn",
    citation: "Quy tắc kiểm soát nhất quán của hệ thống",
    relevantSections: [],
    kind: "system",
  },
};

export function getRuleExplanation(ruleId: string): RuleExplanation | undefined {
  return ruleExplanations[ruleId];
}

export function getLegalProvision(provisionId: LegalProvisionId): LegalProvision {
  return legalProvisions[provisionId];
}

export function getLegalSection(provisionId: LegalProvisionId, sectionId: string): LegalSection | undefined {
  return getLegalProvision(provisionId).sections.find((section) => section.id === sectionId);
}
