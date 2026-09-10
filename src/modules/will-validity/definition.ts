import type { Answer, Answers, ApiFact, Choice, Question } from "@/modules/contracts";

const YES_NO: Choice[] = [
  { label: "Có", value: true, description: "Ghi nhận dữ kiện này là đúng." },
  { label: "Không", value: false, description: "Ghi nhận dữ kiện này là không đúng." },
];

const baseQuestions: Question[] = [
  {
    id: "willType",
    group: "Hình thức di chúc",
    title: "Di chúc được lập theo hình thức nào?",
    description: "Hình thức quyết định nhánh điều kiện mà hệ thống cần kiểm tra tiếp theo.",
    legalSource: "Điều 627, 629 và 630 BLDS 2015",
    kind: "choice",
    choices: [
      { label: "Bằng văn bản", value: "written", description: "Di chúc được thể hiện dưới dạng văn bản." },
      { label: "Bằng miệng", value: "oral", description: "Lời di chúc được thể hiện trước người làm chứng." },
    ],
  },
  {
    id: "age",
    group: "Người lập di chúc",
    title: "Người lập di chúc bao nhiêu tuổi?",
    description: "Độ tuổi từ đủ 15 đến dưới 18 làm phát sinh điều kiện riêng.",
    legalSource: "Điều 630 khoản 2 BLDS 2015",
    kind: "number",
    placeholder: "Ví dụ: 42",
    unit: "tuổi",
  },
  {
    id: "mentalState",
    group: "Ý chí",
    title: "Khi lập di chúc, người này có minh mẫn và sáng suốt không?",
    description: "Đây là dữ kiện về trạng thái tinh thần tại thời điểm lập di chúc.",
    legalSource: "R-B01, R-B04 · Điều 630 khoản 1 điểm a",
    kind: "choice",
    choices: [
      { label: "Minh mẫn", value: "lucid", description: "Có khả năng nhận thức và làm chủ ý chí." },
      { label: "Không minh mẫn", value: "not-lucid", description: "Có căn cứ xác định không minh mẫn." },
    ],
  },
  {
    id: "influence",
    group: "Ý chí",
    title: "Có dấu hiệu tác động trái ý chí không?",
    description: "Chỉ chọn một trạng thái đã có căn cứ trong hồ sơ vụ việc.",
    legalSource: "R-B01, R-B04 · Điều 630 khoản 1 điểm a",
    kind: "choice",
    choices: [
      { label: "Không phát hiện", value: "none", description: "Không có dữ kiện về lừa dối hoặc đe dọa." },
      { label: "Lừa dối", value: "deception", description: "Có dữ kiện cho thấy người lập bị lừa dối." },
      { label: "Đe dọa", value: "threat", description: "Có dữ kiện cho thấy người lập bị đe dọa." },
    ],
  },
  {
    id: "prohibitedContent",
    group: "Nội dung",
    title: "Có phát hiện nội dung bị pháp luật cấm không?",
    description: "Prototype hiện dùng observation tổng quát; tiêu chí chi tiết sẽ được phân rã ở phiên bản sau.",
    legalSource: "R-B02 · Điều 630 khoản 1 điểm b",
    kind: "choice",
    choices: [
      { label: "Không phát hiện", value: "not-detected", description: "Chưa phát hiện nội dung vi phạm điều cấm." },
      { label: "Có phát hiện", value: "detected", description: "Có dấu hiệu nội dung vi phạm điều cấm." },
    ],
  },
];

const writtenQuestions: Question[] = [
  {
    id: "physicalLimitation",
    group: "Điều kiện đặc biệt",
    title: "Người lập có bị hạn chế về thể chất không?",
    description: "Nếu có, di chúc phải đáp ứng thêm yêu cầu về người làm chứng và chứng nhận.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: YES_NO,
  },
  {
    id: "literacy",
    group: "Điều kiện đặc biệt",
    title: "Người lập di chúc có biết chữ không?",
    description: "Trường hợp không biết chữ áp dụng yêu cầu hình thức đặc biệt.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: [
      { label: "Biết chữ", value: "literate", description: "Người lập có khả năng đọc và viết." },
      { label: "Không biết chữ", value: "illiterate", description: "Cần áp dụng điều kiện hình thức đặc biệt." },
    ],
  },
];

const accessibilityQuestions: Question[] = [
  {
    id: "preparedByWitness",
    group: "Hình thức đặc biệt",
    title: "Di chúc có được người làm chứng lập thành văn bản không?",
    description: "Dữ kiện này chỉ được hỏi khi có hạn chế thể chất hoặc người lập không biết chữ.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: YES_NO,
  },
  {
    id: "notarized",
    group: "Hình thức đặc biệt",
    title: "Văn bản đã được công chứng hoặc chứng thực chưa?",
    description: "Ghi nhận trạng thái công chứng hoặc chứng thực của di chúc.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: YES_NO,
  },
];

const formalQuestion: Question = {
  id: "formalDefect",
  group: "Hình thức di chúc",
  title: "Có phát hiện vi phạm về hình thức không?",
  description: "Đây là observation chuyển tiếp cho đến khi Điều 627–636 được mô hình hóa chi tiết.",
  legalSource: "FORM-ASSESSMENT-ACCEPTED",
  kind: "choice",
  choices: [
    { label: "Không phát hiện", value: "not-detected", description: "Chưa phát hiện vi phạm hình thức." },
    { label: "Có phát hiện", value: "detected", description: "Có dấu hiệu vi phạm hình thức." },
  ],
};

const guardianQuestion: Question = {
  id: "guardianConsent",
  group: "Người chưa thành niên",
  title: "Cha, mẹ hoặc người giám hộ có đồng ý việc lập di chúc không?",
  description: "Câu hỏi xuất hiện vì tuổi đã nhập nằm trong khoảng từ đủ 15 đến dưới 18.",
  legalSource: "R-B05, R-B06 · Điều 630 khoản 2",
  kind: "choice",
  choices: YES_NO,
};

const oralQuestions: Question[] = [
  {
    id: "witnessCount",
    group: "Di chúc miệng",
    title: "Có bao nhiêu người làm chứng?",
    description: "Di chúc miệng cần ít nhất hai người làm chứng.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "number",
    placeholder: "Ví dụ: 2",
    unit: "người",
  },
  {
    id: "witnessesRecorded",
    group: "Di chúc miệng",
    title: "Ý chí cuối cùng đã được người làm chứng ghi chép lại chưa?",
    description: "Việc ghi chép là một phần của chuỗi điều kiện hình thức.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "choice",
    choices: YES_NO,
  },
  {
    id: "witnessesSigned",
    group: "Di chúc miệng",
    title: "Những người làm chứng đã ký hoặc điểm chỉ chưa?",
    description: "Ghi nhận việc xác nhận nội dung bởi người làm chứng.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "choice",
    choices: YES_NO,
  },
  {
    id: "certifiedDays",
    group: "Di chúc miệng",
    title: "Sau bao nhiêu ngày văn bản được công chứng hoặc chứng thực?",
    description: "Mốc biên được knowledge base kiểm tra là 5 ngày.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "number",
    placeholder: "Từ 0 đến 5",
    unit: "ngày",
  },
  {
    id: "aliveAfterThreeMonths",
    group: "Hiệu lực hiện tại",
    title: "Sau ba tháng, người lập di chúc vẫn còn sống không?",
    description: "Dữ kiện này được dùng để xác định việc di chúc miệng có mặc nhiên bị hủy bỏ hay không.",
    legalSource: "R-B08 · Điều 629 khoản 2",
    kind: "choice",
    choices: YES_NO,
  },
];

const afterThreeMonthsQuestion: Question = {
  id: "mentalAfterThreeMonths",
  group: "Hiệu lực hiện tại",
  title: "Sau ba tháng, người lập có còn minh mẫn và sáng suốt không?",
  description: "Nếu vẫn sống, minh mẫn và sáng suốt thì di chúc miệng mặc nhiên bị hủy bỏ.",
  legalSource: "R-B08 · Điều 629 khoản 2",
  kind: "choice",
  choices: [
    { label: "Minh mẫn", value: "lucid", description: "Vẫn minh mẫn và sáng suốt sau ba tháng." },
    { label: "Không minh mẫn", value: "not-lucid", description: "Không đủ căn cứ cho trạng thái minh mẫn." },
  ],
};

export const willValidityMissingLabels: Record<string, string> = {
  "will-type": "Hình thức di chúc",
  "testator-mental-state": "Trạng thái tinh thần của người lập",
  "undue-influence": "Dấu hiệu lừa dối hoặc đe dọa",
  "prohibited-content": "Nội dung bị pháp luật cấm",
  "formal-defect": "Điều kiện về hình thức",
  "guardian-consent": "Sự đồng ý của cha, mẹ hoặc người giám hộ",
  "prepared-by-witness": "Việc lập văn bản bởi người làm chứng",
  "notarized-or-certified": "Công chứng hoặc chứng thực",
  "witness-count": "Số người làm chứng",
  "witnesses-recorded": "Việc ghi chép lời di chúc",
  "witnesses-signed": "Chữ ký hoặc điểm chỉ của người làm chứng",
  "certified-within-days": "Thời hạn công chứng hoặc chứng thực",
  "unresolved-rule-path": "Các dữ kiện hiện tại chưa khớp một đường suy luận đã được mô hình hóa",
};

export function buildWillValidityQuestions(answers: Answers): Question[] {
  const questions = [...baseQuestions];
  const age = typeof answers.age === "number" ? answers.age : undefined;
  if (age !== undefined && age >= 15 && age < 18) questions.push(guardianQuestion);

  if (answers.willType === "written") {
    questions.push(...writtenQuestions);
    const accessibility = answers.physicalLimitation === true || answers.literacy === "illiterate";
    questions.push(...(accessibility ? accessibilityQuestions : [formalQuestion]));
  }
  if (answers.willType === "oral") {
    questions.push(...oralQuestions);
    if (answers.aliveAfterThreeMonths === true) questions.push(afterThreeMonthsQuestion);
  }
  return questions;
}

export function buildWillValidityFacts(answers: Answers): ApiFact[] {
  const facts: ApiFact[] = [];
  const add = (predicate: string, value: Answer) => {
    if (value !== undefined) facts.push({ id: `fact-${predicate}`, predicate, value });
  };

  add("will-type", answers.willType);
  add("testator-age", answers.age);
  add("testator-mental-state", answers.mentalState);
  add("undue-influence", answers.influence);
  add("prohibited-content", answers.prohibitedContent);

  const age = typeof answers.age === "number" ? answers.age : undefined;
  if (age !== undefined && age >= 15 && age < 18) add("guardian-consent", answers.guardianConsent);
  if (answers.willType === "written") {
    add("physical-limitation", answers.physicalLimitation);
    add("testator-literacy", answers.literacy);
    const accessibility = answers.physicalLimitation === true || answers.literacy === "illiterate";
    if (accessibility) {
      add("prepared-by-witness", answers.preparedByWitness);
      add("notarized-or-certified", answers.notarized);
    } else add("formal-defect", answers.formalDefect);
  }
  if (answers.willType === "oral") {
    add("witness-count", answers.witnessCount);
    add("witnesses-recorded", answers.witnessesRecorded);
    add("witnesses-signed", answers.witnessesSigned);
    add("certified-within-days", answers.certifiedDays);
    add("testator-alive-after-three-months", answers.aliveAfterThreeMonths);
    if (answers.aliveAfterThreeMonths === true) {
      add("testator-mental-state-after-three-months", answers.mentalAfterThreeMonths);
    }
  }
  return facts;
}

export function willValidityQuestionRuleId(questionId: string, answers: Answers): string {
  if (questionId === "mentalState" && answers.mentalState === "not-lucid") return "R-B04";
  if (questionId === "influence" && (answers.influence === "deception" || answers.influence === "threat")) return "R-B04";
  if (questionId === "guardianConsent" && answers.guardianConsent === false) return "R-B06";

  return {
    willType: "ARTICLE-627", age: "R-B05", mentalState: "R-B01", influence: "R-B01",
    prohibitedContent: "R-B02", physicalLimitation: "R-B07", literacy: "R-B07",
    preparedByWitness: "R-B07", notarized: "R-B07", formalDefect: "FORM-ASSESSMENT-ACCEPTED",
    guardianConsent: "R-B05", witnessCount: "R-B09", witnessesRecorded: "R-B09",
    witnessesSigned: "R-B09", certifiedDays: "R-B09", aliveAfterThreeMonths: "R-B08",
    mentalAfterThreeMonths: "R-B08",
  }[questionId] ?? "R-B03";
}
