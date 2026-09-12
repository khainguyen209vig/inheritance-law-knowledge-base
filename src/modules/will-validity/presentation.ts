import { getRuleExplanation } from "@/domain/legal-knowledge";
import type { ApiFact, InferenceTrace, InferenceValue, ModuleResultValue } from "@/modules/contracts";

const tracePriorities: Record<string, number> = {
  "FORM-ASSESSMENT-ACCEPTED": 10,
  "R-B01": 10,
  "R-B05": 10,
  "R-B07": 10,
  "R-B09": 10,
  "R-B02": 20,
  "R-B03": 30,
  "R-B04": 30,
  "R-B06": 30,
  "R-B08": 40,
  "SYSTEM-CONFLICT": 50,
};

export function sortWillValidityTraces(traces: InferenceTrace[]): InferenceTrace[] {
  return [...traces].sort(
    (left, right) => (tracePriorities[left.ruleId] ?? 25) - (tracePriorities[right.ruleId] ?? 25),
  );
}

export function willValidityConclusionLabel(predicate: string, value: string): string {
  const labels: Record<string, string> = {
    "valid-intention": "Ý chí lập di chúc hợp lệ",
    "valid-form-requirements": "Điều kiện hình thức đã đạt",
    "valid-content-and-form": "Nội dung và hình thức hợp lệ",
    "valid-will": value === "true" ? "Di chúc hợp pháp" : "Di chúc không hợp pháp",
    "minor-special-requirement": "Yêu cầu riêng theo độ tuổi đã được đánh giá",
    "accessibility-form-requirement": "Yêu cầu hình thức đặc biệt đã được đánh giá",
    "oral-form-requirement": "Yêu cầu hình thức của di chúc miệng đã đạt",
    "will-effect-status": "Trạng thái hiệu lực của di chúc đã thay đổi",
    "will-currently-effective": value === "true" ? "Di chúc đang có hiệu lực" : "Di chúc không còn hiệu lực",
  };
  return labels[predicate] ?? `Suy ra ${predicate} = ${value}`;
}

export function willValidityFactLabel(fact: ApiFact): string {
  const labels: Record<string, string> = {
    "will-type": fact.value === "written" ? "Di chúc bằng văn bản" : "Di chúc bằng miệng",
    "testator-age": `Người lập ${fact.value} tuổi`,
    "testator-mental-state": fact.value === "lucid" ? "Người lập minh mẫn" : "Người lập không minh mẫn",
    "undue-influence": fact.value === "none" ? "Không phát hiện tác động trái ý chí" : `Tác động trái ý chí: ${fact.value}`,
    "prohibited-content": fact.value === "not-detected" ? "Không phát hiện nội dung bị cấm" : "Phát hiện nội dung bị cấm",
    "formal-defect": fact.value === "not-detected" ? "Không phát hiện lỗi hình thức" : "Phát hiện lỗi hình thức",
    "guardian-consent": fact.value ? "Người giám hộ đã đồng ý" : "Người giám hộ không đồng ý",
    "physical-limitation": fact.value ? "Có hạn chế thể chất" : "Không hạn chế thể chất",
    "testator-literacy": fact.value === "literate" ? "Người lập biết chữ" : "Người lập không biết chữ",
    "prepared-by-witness": fact.value ? "Có người làm chứng lập văn bản" : "Không có người làm chứng lập văn bản",
    "notarized-or-certified": fact.value ? "Đã công chứng/chứng thực" : "Chưa công chứng/chứng thực",
    "witness-count": `${fact.value} người làm chứng`,
    "witnesses-recorded": fact.value ? "Lời di chúc đã được ghi chép" : "Lời di chúc chưa được ghi chép",
    "witnesses-signed": fact.value ? "Người làm chứng đã ký/điểm chỉ" : "Người làm chứng chưa ký/điểm chỉ",
    "certified-within-days": `Chứng nhận sau ${fact.value} ngày`,
    "testator-alive-after-three-months": fact.value ? "Còn sống sau ba tháng" : "Không còn sống sau ba tháng",
    "testator-mental-state-after-three-months": fact.value === "lucid" ? "Minh mẫn sau ba tháng" : "Không minh mẫn sau ba tháng",
  };
  return labels[fact.predicate] ?? `${fact.predicate}: ${String(fact.value)}`;
}

export function willValiditySupportLabel(support: string, facts: ApiFact[]): string {
  const fact = facts.find((candidate) => candidate.id === support);
  if (fact) return willValidityFactLabel(fact);

  const derivedLabels: Record<string, string> = {
    "valid-intention=true": "Kết luận trước đó: ý chí lập di chúc hợp lệ",
    "valid-content-and-form=true": "Kết luận trước đó: nội dung và hình thức hợp lệ",
    "minor-special-requirement=satisfied": "Yêu cầu riêng theo độ tuổi đã đạt",
    "minor-special-requirement=failed": "Yêu cầu riêng theo độ tuổi không đạt",
    "accessibility-form-requirement=satisfied": "Yêu cầu hình thức đặc biệt đã đạt",
    "oral-form-requirement=satisfied": "Yêu cầu hình thức của di chúc miệng đã đạt",
    "will-effect-status=automatically-revoked": "Di chúc miệng đã mặc nhiên bị hủy bỏ",
  };
  if (derivedLabels[support]) return derivedLabels[support];

  const supportingRule = getRuleExplanation(support);
  return supportingRule ? `Kết luận được tạo bởi ${support}: ${supportingRule.conclusion}` : support;
}

export function willValidityResultTitle(value: InferenceValue): string {
  return {
    true: "Có đủ căn cứ hợp pháp",
    false: "Có căn cứ không hợp pháp",
    unknown: "Chưa đủ dữ kiện",
    conflict: "Dữ kiện đang mâu thuẫn",
  }[value];
}

export function willValidityResultDescription(value: InferenceValue): string {
  return {
    true: "Các dữ kiện và điều kiện pháp lý hiện có đủ để hệ thống kết luận di chúc hợp pháp.",
    false: "Một hoặc nhiều điều kiện pháp lý không được đáp ứng nên hệ thống kết luận di chúc không hợp pháp.",
    unknown: "CLIPS không suy đoán dữ kiện vắng mặt. Hãy bổ sung các mục bên dưới.",
    conflict: "Working memory chứa các kết luận đối nghịch cần được kiểm tra lại.",
  }[value];
}

export function resultStatusLabel(value: ModuleResultValue): string {
  const labels: Partial<Record<ModuleResultValue, string>> = { true: "Hợp pháp", false: "Không hợp pháp", unknown: "Chưa đủ dữ kiện", conflict: "Mâu thuẫn", statutory: "Theo pháp luật", testamentary: "Theo di chúc", excluded: "Không có quyền hưởng", "not-excluded": "Không bị loại trừ", "exception-under-will": "Ngoại lệ theo di chúc", "rank-1": "Hàng thứ nhất", "rank-2": "Hàng thứ hai", "rank-3": "Hàng thứ ba" };
  return labels[value] ?? value;
}

export function resultTone(value: InferenceValue): string {
  return {
    true: "border-emerald-200 bg-emerald-50 text-emerald-950",
    false: "border-red-200 bg-red-50 text-red-950",
    unknown: "border-amber-200 bg-amber-50 text-amber-950",
    conflict: "border-violet-200 bg-violet-50 text-violet-950",
  }[value];
}

export function resultBadge(value: ModuleResultValue): "success" | "destructive" | "warning" | "secondary" {
  const badges: Partial<Record<ModuleResultValue, "success" | "destructive" | "warning" | "secondary">> = { true: "success", false: "destructive", unknown: "warning", conflict: "secondary", statutory: "warning", testamentary: "success", excluded: "destructive", "not-excluded": "success", "exception-under-will": "warning", "rank-1": "success", "rank-2": "secondary", "rank-3": "warning" };
  return badges[value] ?? "secondary";
}
