import type { ApiFact } from "@/modules/contracts";

export type EligibilityGround = "clear" | "offense-deceased" | "abuse-deceased" | "support" | "other-heir" | "deception" | "coercion" | "forgery" | "alteration" | "destruction" | "concealment";

export interface EligibilityPersonDraft {
  id: string;
  name: string;
  ground?: EligibilityGround;
  exception: boolean;
  will?: string;
}

export const eligibilityGrounds: Array<{ id: EligibilityGround; title: string; detail: string; ruleId: string }> = [
  { id: "clear", title: "Không phát hiện căn cứ loại trừ", detail: "Đã rà soát đầy đủ các nhóm tại Điều 621 khoản 1.", ruleId: "ELIGIBILITY-CLEAR" },
  { id: "offense-deceased", title: "Bị kết án xâm phạm người để lại di sản", detail: "Hành vi cố ý xâm phạm tính mạng hoặc sức khỏe.", ruleId: "R-D01" },
  { id: "abuse-deceased", title: "Bị kết án về hành vi ngược đãi", detail: "Ngược đãi, hành hạ hoặc xâm phạm nghiêm trọng danh dự, nhân phẩm.", ruleId: "R-D01" },
  { id: "support", title: "Vi phạm nghĩa vụ nuôi dưỡng", detail: "Mức vi phạm được xác định là nghiêm trọng.", ruleId: "R-D02" },
  { id: "other-heir", title: "Xâm phạm người thừa kế khác", detail: "Có bản án và mục đích hưởng thêm di sản.", ruleId: "R-D03" },
  { id: "deception", title: "Lừa dối việc lập di chúc", detail: "Can thiệp trái ý chí người lập di chúc.", ruleId: "R-D04a" },
  { id: "coercion", title: "Cưỡng ép việc lập di chúc", detail: "Can thiệp trái ý chí người lập di chúc.", ruleId: "R-D04a" },
  { id: "forgery", title: "Giả mạo di chúc", detail: "Nhằm hưởng di sản trái ý chí người lập.", ruleId: "R-D04b" },
  { id: "alteration", title: "Sửa chữa di chúc", detail: "Nhằm hưởng di sản trái ý chí người lập.", ruleId: "R-D04b" },
  { id: "destruction", title: "Hủy di chúc", detail: "Nhằm hưởng di sản trái ý chí người lập.", ruleId: "R-D04b" },
  { id: "concealment", title: "Che giấu di chúc", detail: "Nhằm hưởng di sản trái ý chí người lập.", ruleId: "R-D04b" },
];

export const eligibilityPredicates = new Set([
  "eligibility-candidate", "eligibility-review-complete", "person-label", "convicted-intentional-offense-against-deceased",
  "convicted-abuse-against-deceased", "serious-support-duty-violation", "convicted-offense-against-other-heir",
  "inheritance-benefit-motive", "will-interference", "will-document-interference", "improper-benefit-intent",
  "deceased-knew-disqualifying-act", "named-in-will-after-knowledge", "eligibility-applicable-will",
]);

export function buildEligibilityFacts(people: readonly EligibilityPersonDraft[]): ApiFact[] {
  const facts: ApiFact[] = [];
  for (const person of people) {
    const prefix = person.id;
    facts.push({ id: `${prefix}-candidate`, subject: person.id, predicate: "eligibility-candidate", value: true }, { id: `${prefix}-label`, subject: person.id, predicate: "person-label", value: person.name || "Người được xét" });
    if (!person.ground) continue;
    facts.push({ id: `${prefix}-complete`, subject: person.id, predicate: "eligibility-review-complete", value: true });
    if (person.ground === "offense-deceased") facts.push({ id: `${prefix}-offense-deceased`, subject: person.id, predicate: "convicted-intentional-offense-against-deceased", value: true });
    if (person.ground === "abuse-deceased") facts.push({ id: `${prefix}-abuse`, subject: person.id, predicate: "convicted-abuse-against-deceased", value: true });
    if (person.ground === "support") facts.push({ id: `${prefix}-support`, subject: person.id, predicate: "serious-support-duty-violation", value: true });
    if (person.ground === "other-heir") facts.push({ id: `${prefix}-other-heir`, subject: person.id, predicate: "convicted-offense-against-other-heir", value: true }, { id: `${prefix}-motive`, subject: person.id, predicate: "inheritance-benefit-motive", value: true });
    if (person.ground === "deception" || person.ground === "coercion") facts.push({ id: `${prefix}-will-interference`, subject: person.id, predicate: "will-interference", value: person.ground });
    if (["forgery", "alteration", "destruction", "concealment"].includes(person.ground)) facts.push({ id: `${prefix}-document-interference`, subject: person.id, predicate: "will-document-interference", value: person.ground }, { id: `${prefix}-intent`, subject: person.id, predicate: "improper-benefit-intent", value: true });
    if (person.exception && person.will) facts.push({ id: `${prefix}-knew`, subject: person.id, predicate: "deceased-knew-disqualifying-act", value: true }, { id: `${prefix}-named`, subject: person.id, predicate: "named-in-will-after-knowledge", value: true }, { id: `${prefix}-will`, subject: person.id, predicate: "eligibility-applicable-will", value: person.will });
  }
  return facts;
}

export function restoreEligibilityPeople(facts: readonly ApiFact[], fallbackId: string, defaultWill?: string): EligibilityPersonDraft[] {
  const ids = [...new Set(facts.flatMap((fact) => fact.predicate === "eligibility-candidate" && fact.subject ? [fact.subject] : []))];
  const people = ids.map((id, index) => {
    const own = facts.filter((fact) => fact.subject === id);
    return { id, name: String(own.find((fact) => fact.predicate === "person-label" || fact.predicate === "heir-person-label")?.value ?? `Người được xét ${index + 1}`), ground: restoreEligibilityGround(own), exception: own.some((fact) => fact.predicate === "deceased-knew-disqualifying-act" && fact.value === true), will: String(own.find((fact) => fact.predicate === "eligibility-applicable-will")?.value ?? defaultWill ?? "") || undefined };
  });
  return people.length ? people : [{ id: fallbackId, name: "Người được xét 1", exception: false, will: defaultWill }];
}

export function eligibilityGroundTitle(ground?: EligibilityGround): string { return eligibilityGrounds.find((item) => item.id === ground)?.title ?? "Chưa rà soát"; }

export function eligibilityResultLabel(value: string): string { return value === "not-excluded" ? "Không bị loại trừ theo Điều 621" : value === "excluded" ? "Không có quyền hưởng" : value === "exception-under-will" ? "Ngoại lệ theo di chúc" : "Chưa đủ dữ kiện"; }

function restoreEligibilityGround(facts: readonly ApiFact[]): EligibilityGround | undefined {
  if (facts.some((fact) => fact.predicate === "convicted-intentional-offense-against-deceased")) return "offense-deceased";
  if (facts.some((fact) => fact.predicate === "convicted-abuse-against-deceased")) return "abuse-deceased";
  if (facts.some((fact) => fact.predicate === "serious-support-duty-violation")) return "support";
  if (facts.some((fact) => fact.predicate === "convicted-offense-against-other-heir")) return "other-heir";
  const direct = facts.find((fact) => fact.predicate === "will-interference")?.value;
  if (direct === "deception" || direct === "coercion") return direct;
  const document = facts.find((fact) => fact.predicate === "will-document-interference")?.value;
  if (document === "forgery" || document === "alteration" || document === "destruction" || document === "concealment") return document;
  if (facts.some((fact) => fact.predicate === "eligibility-review-complete")) return "clear";
}
