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

export interface RuleExplanation {
  ruleId: string;
  title: string;
  reasoning: string;
  conclusion: string;
  citation: string;
  provisionId?: keyof typeof legalProvisions;
  relevantSections: string[];
  kind: "legal" | "internal" | "system";
}

export const legalProvisions = {
  "article-627": {
    id: "article-627",
    number: "Điều 627",
    title: "Hình thức của di chúc",
    sections: [
      {
        id: "main",
        label: "Nội dung điều luật",
        text: "Di chúc phải được lập thành văn bản; nếu không thể lập được di chúc bằng văn bản thì có thể di chúc miệng.",
      },
    ],
    sourceDocument: "doc/Luat_ThuaKe.doc",
    officialUrl: "https://vanban.chinhphu.vn/?pageid=27160&docid=183188",
  },
  "article-629": {
    id: "article-629",
    number: "Điều 629",
    title: "Di chúc miệng",
    sections: [
      {
        id: "clause-1",
        label: "Khoản 1",
        text: "Trường hợp tính mạng một người bị cái chết đe dọa và không thể lập di chúc bằng văn bản thì có thể lập di chúc miệng.",
      },
      {
        id: "clause-2",
        label: "Khoản 2",
        text: "Sau 03 tháng, kể từ thời điểm di chúc miệng mà người lập di chúc còn sống, minh mẫn, sáng suốt thì di chúc miệng mặc nhiên bị huỷ bỏ.",
      },
    ],
    sourceDocument: "doc/Luat_ThuaKe.doc",
    officialUrl: "https://vanban.chinhphu.vn/?pageid=27160&docid=183188",
  },
  "article-630": {
    id: "article-630",
    number: "Điều 630",
    title: "Di chúc hợp pháp",
    sections: [
      {
        id: "clause-1-intro",
        label: "Khoản 1",
        text: "Di chúc hợp pháp phải có đủ các điều kiện sau đây:",
      },
      {
        id: "clause-1-a",
        label: "Khoản 1 điểm a",
        text: "Người lập di chúc minh mẫn, sáng suốt trong khi lập di chúc; không bị lừa dối, đe doạ, cưỡng ép;",
      },
      {
        id: "clause-1-b",
        label: "Khoản 1 điểm b",
        text: "Nội dung của di chúc không vi phạm điều cấm của luật, không trái đạo đức xã hội; hình thức di chúc không trái quy định của luật.",
      },
      {
        id: "clause-2",
        label: "Khoản 2",
        text: "Di chúc của người từ đủ mười lăm tuổi đến chưa đủ mười tám tuổi phải được lập thành văn bản và phải được cha, mẹ hoặc người giám hộ đồng ý về việc lập di chúc.",
      },
      {
        id: "clause-3",
        label: "Khoản 3",
        text: "Di chúc của người bị hạn chế về thể chất hoặc của người không biết chữ phải được người làm chứng lập thành văn bản và có công chứng hoặc chứng thực.",
      },
      {
        id: "clause-4",
        label: "Khoản 4",
        text: "Di chúc bằng văn bản không có công chứng, chứng thực chỉ được coi là hợp pháp, nếu có đủ các điều kiện được quy định tại khoản 1 Điều này.",
      },
      {
        id: "clause-5",
        label: "Khoản 5",
        text: "Di chúc miệng được coi là hợp pháp nếu người di chúc miệng thể hiện ý chí cuối cùng của mình trước mặt ít nhất hai người làm chứng và ngay sau khi người di chúc miệng thể hiện ý chí cuối cùng, người làm chứng ghi chép lại, cùng ký tên hoặc điểm chỉ. Trong thời hạn 05 ngày làm việc, kể từ ngày người di chúc miệng thể hiện ý chí cuối cùng thì di chúc phải được công chứng viên hoặc cơ quan có thẩm quyền chứng thực xác nhận chữ ký hoặc điểm chỉ của người làm chứng.",
      },
    ],
    sourceDocument: "doc/Luat_ThuaKe.doc",
    officialUrl: "https://vanban.chinhphu.vn/?pageid=27160&docid=183188",
  },
} as const satisfies Record<string, LegalProvision>;

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
