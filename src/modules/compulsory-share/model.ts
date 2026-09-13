import type { ApiFact } from "@/modules/contracts";

export type CompulsoryAgeGroup = "minor" | "adult";
export type CompulsoryWorkCapacity = "capable" | "incapable";
export type CompulsoryFamilyRole = "biological-child" | "adopted-child" | "parent" | "spouse" | "other";

export interface CompulsoryPersonDraft {
  id: string;
  name: string;
  role: CompulsoryFamilyRole;
  age?: CompulsoryAgeGroup;
  workCapacity?: CompulsoryWorkCapacity;
}

export interface CompulsoryPortionDraft { id: string; name: string }
export interface CompulsoryCalculationDraft { id: string; personId: string; portionId: string; statutoryShare?: number; testamentaryShare?: number }

export const compulsoryAssessmentPredicates = new Set(["compulsory-share-assessment-subject", "age-group", "work-capacity-status"]);
export const compulsoryCalculationPredicates = new Set(["compulsory-share-calculation", "calculation-person", "calculation-estate-portion", "hypothetical-statutory-share", "testamentary-share-received"]);

export function restoreCompulsoryPeople(facts: readonly ApiFact[]): CompulsoryPersonDraft[] {
  const deceased = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  if (!deceased) return [];
  const ids = [...new Set(facts.flatMap((fact) => fact.predicate === "heir-rank-candidate" && fact.value === true && fact.subject ? [fact.subject] : []))];
  return ids.map((id) => ({
    id,
    name: String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? id),
    role: compulsoryFamilyRole(facts, deceased, id),
    age: facts.find((fact) => fact.subject === id && fact.predicate === "age-group")?.value as CompulsoryAgeGroup | undefined,
    workCapacity: facts.find((fact) => fact.subject === id && fact.predicate === "work-capacity-status")?.value as CompulsoryWorkCapacity | undefined,
  }));
}

export function buildCompulsoryAssessmentFacts(people: readonly CompulsoryPersonDraft[]): ApiFact[] {
  return people.flatMap((person, index) => {
    const prefix = `cs-person-${index + 1}`;
    const facts: ApiFact[] = [{ id: `${prefix}-scope`, subject: person.id, predicate: "compulsory-share-assessment-subject", value: true }];
    if (person.age) facts.push({ id: `${prefix}-age`, subject: person.id, predicate: "age-group", value: person.age });
    if (person.age === "adult" && person.workCapacity) facts.push({ id: `${prefix}-capacity`, subject: person.id, predicate: "work-capacity-status", value: person.workCapacity });
    return facts;
  });
}

export function compulsoryRoleLabel(role: CompulsoryFamilyRole): string {
  return ({ "biological-child": "Con đẻ", "adopted-child": "Con nuôi", parent: "Cha/mẹ", spouse: "Vợ/chồng", other: "Quan hệ khác" } as const)[role];
}

export function restoreCompulsoryPortions(facts: readonly ApiFact[]): CompulsoryPortionDraft[] {
  return facts.flatMap((fact): CompulsoryPortionDraft[] => fact.predicate === "estate-portion" && fact.value === true && fact.subject
    ? [{ id: fact.subject, name: String(facts.find((item) => item.subject === fact.subject && item.predicate === "estate-portion-label")?.value ?? fact.subject) }]
    : []);
}

export function restoreCompulsoryCalculations(facts: readonly ApiFact[], people: readonly { id: string }[], portions: readonly CompulsoryPortionDraft[]): CompulsoryCalculationDraft[] {
  const stored = facts.flatMap((fact): CompulsoryCalculationDraft[] => {
    if (fact.predicate !== "compulsory-share-calculation" || fact.value !== true || !fact.subject) return [];
    const personId = facts.find((item) => item.subject === fact.subject && item.predicate === "calculation-person")?.value;
    const portionId = facts.find((item) => item.subject === fact.subject && item.predicate === "calculation-estate-portion")?.value;
    if (typeof personId !== "string" || typeof portionId !== "string") return [];
    const statutoryShare = facts.find((item) => item.subject === fact.subject && item.predicate === "hypothetical-statutory-share")?.value;
    const testamentaryShare = facts.find((item) => item.subject === fact.subject && item.predicate === "testamentary-share-received")?.value;
    return [{ id: fact.subject, personId, portionId, statutoryShare: typeof statutoryShare === "number" ? statutoryShare : undefined, testamentaryShare: typeof testamentaryShare === "number" ? testamentaryShare : undefined }];
  });
  const byPair = new Map(stored.map((calculation) => [`${calculation.personId}:${calculation.portionId}`, calculation]));
  return people.flatMap((person, personIndex) => portions.map((portion, portionIndex) => byPair.get(`${person.id}:${portion.id}`) ?? { id: `guided-calc-${personIndex + 1}-${portionIndex + 1}`, personId: person.id, portionId: portion.id }));
}

export function buildCompulsoryCalculationFacts(calculations: readonly CompulsoryCalculationDraft[]): ApiFact[] {
  return calculations.flatMap((calculation): ApiFact[] => {
    if (calculation.statutoryShare === undefined && calculation.testamentaryShare === undefined) return [];
    const facts: ApiFact[] = [
      { id: `${calculation.id}-scope`, subject: calculation.id, predicate: "compulsory-share-calculation", value: true },
      { id: `${calculation.id}-person`, subject: calculation.id, predicate: "calculation-person", value: calculation.personId },
      { id: `${calculation.id}-portion`, subject: calculation.id, predicate: "calculation-estate-portion", value: calculation.portionId },
    ];
    if (calculation.statutoryShare !== undefined && calculation.statutoryShare > 0) facts.push({ id: `${calculation.id}-statutory`, subject: calculation.id, predicate: "hypothetical-statutory-share", value: calculation.statutoryShare });
    if (calculation.testamentaryShare !== undefined && calculation.testamentaryShare >= 0) facts.push({ id: `${calculation.id}-testamentary`, subject: calculation.id, predicate: "testamentary-share-received", value: calculation.testamentaryShare });
    return facts;
  });
}

function compulsoryFamilyRole(facts: readonly ApiFact[], deceased: string, person: string): CompulsoryFamilyRole {
  if (facts.some((fact) => fact.subject === deceased && fact.value === person && fact.predicate === "biological-parent-of")) return "biological-child";
  if (facts.some((fact) => fact.subject === deceased && fact.value === person && fact.predicate === "adoptive-parent-of")) return "adopted-child";
  if (facts.some((fact) => fact.subject === person && fact.value === deceased && (fact.predicate === "biological-parent-of" || fact.predicate === "adoptive-parent-of"))) return "parent";
  if (facts.some((fact) => ((fact.subject === person && fact.value === deceased) || (fact.subject === deceased && fact.value === person)) && fact.predicate === "spouse-at-opening")) return "spouse";
  return "other";
}
