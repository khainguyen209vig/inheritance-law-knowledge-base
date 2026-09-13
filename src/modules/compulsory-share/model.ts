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

export const compulsoryAssessmentPredicates = new Set(["compulsory-share-assessment-subject", "age-group", "work-capacity-status"]);

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

function compulsoryFamilyRole(facts: readonly ApiFact[], deceased: string, person: string): CompulsoryFamilyRole {
  if (facts.some((fact) => fact.subject === deceased && fact.value === person && fact.predicate === "biological-parent-of")) return "biological-child";
  if (facts.some((fact) => fact.subject === deceased && fact.value === person && fact.predicate === "adoptive-parent-of")) return "adopted-child";
  if (facts.some((fact) => fact.subject === person && fact.value === deceased && (fact.predicate === "biological-parent-of" || fact.predicate === "adoptive-parent-of"))) return "parent";
  if (facts.some((fact) => ((fact.subject === person && fact.value === deceased) || (fact.subject === deceased && fact.value === person)) && fact.predicate === "spouse-at-opening")) return "spouse";
  return "other";
}
