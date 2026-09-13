import type { ApiFact } from "@/modules/contracts";

export type FamilyEdgeType = "biological-parent-of" | "adoptive-parent-of" | "step-parent-of" | "spouse-at-opening";
export type StepCareStatus = "established" | "not-established";
export type FamilyLifeStatus = "alive" | "dead-before-or-same";

export interface FamilyPerson {
  id: string;
  name: string;
  life?: FamilyLifeStatus;
  eligibilityReviewed: boolean;
}

export interface FamilyEdge {
  id: string;
  from: string;
  to: string;
  type: FamilyEdgeType;
  careStatus?: StepCareStatus;
}

export interface FamilyGraph {
  deceasedId: string;
  people: FamilyPerson[];
  edges: FamilyEdge[];
}

export interface JointBiologicalChildConnection {
  spouseEdgeId: string;
  firstParentId: string;
  secondParentId: string;
  childId: string;
  parentEdgeIds: [string, string];
}

export interface JointChildConnection extends JointBiologicalChildConnection {
  relationType: "biological-parent-of" | "adoptive-parent-of";
}

const edgePredicates = new Set<FamilyEdgeType>(["biological-parent-of", "adoptive-parent-of", "step-parent-of", "spouse-at-opening"]);
export const familyGraphPredicates = new Set(["deceased-person", "heir-rank-candidate", "heir-search-complete", "heir-life-status", "biological-parent-of", "adoptive-parent-of", "step-parent-of", "step-care-status", "spouse-at-opening", "heir-person-label"]);

export function restoreFamilyGraph(facts: ApiFact[], token: string): FamilyGraph {
  const deceasedId = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject ?? `deceased-${token}`;
  const ids = new Set<string>([deceasedId]);
  for (const fact of facts) {
    if (fact.subject && (fact.predicate === "heir-person-label" || fact.predicate === "heir-rank-candidate")) ids.add(fact.subject);
    if (edgePredicates.has(fact.predicate as FamilyEdgeType) && fact.subject && typeof fact.value === "string") { ids.add(fact.subject); ids.add(fact.value); }
  }
  const people = [...ids].map((id, index) => ({
    id,
    name: String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? (id === deceasedId ? "Người để lại di sản" : `Người ${index}`)),
    life: facts.find((fact) => fact.subject === id && fact.predicate === "heir-life-status")?.value as FamilyLifeStatus | undefined,
    eligibilityReviewed: facts.some((fact) => fact.subject === id && fact.predicate === "eligibility-review-complete" && fact.value === true),
  }));
  const careByEdgeId = new Map(facts.filter((fact) => fact.predicate === "step-care-status" && typeof fact.value === "string").map((fact) => [fact.subject, fact.value as StepCareStatus]));
  const edges = facts.flatMap((fact): FamilyEdge[] => edgePredicates.has(fact.predicate as FamilyEdgeType) && fact.subject && typeof fact.value === "string"
    ? [{ id: fact.id, from: fact.subject, to: fact.value, type: fact.predicate as FamilyEdgeType, careStatus: careByEdgeId.get(fact.id) }]
    : []);
  return { deceasedId, people, edges: deduplicateEdges(edges) };
}

export function serializeFamilyGraph(caseId: string, graph: FamilyGraph, searchComplete?: boolean): ApiFact[] {
  const facts: ApiFact[] = [];
  graph.people.forEach((person, index) => {
    const personFactPrefix = `fgp-${stableToken(person.id)}`;
    facts.push({ id: `${personFactPrefix}-label`, subject: person.id, predicate: "heir-person-label", value: person.name || `Người ${index + 1}` });
    if (person.id === graph.deceasedId) facts.push({ id: "fg-deceased", subject: person.id, predicate: "deceased-person", value: true });
    else {
      facts.push(
        { id: `${personFactPrefix}-rank`, subject: person.id, predicate: "heir-rank-candidate", value: true },
        { id: `${personFactPrefix}-eligibility`, subject: person.id, predicate: "eligibility-candidate", value: true },
      );
      if (person.life) facts.push({ id: `${personFactPrefix}-life`, subject: person.id, predicate: "heir-life-status", value: person.life });
    }
  });
  graph.edges.forEach((edge) => {
    const edgeId = stableEdgeFactId(edge.id);
    facts.push({ id: edgeId, subject: edge.from, predicate: edge.type, value: edge.to });
    if (edge.type === "step-parent-of" && edge.careStatus) facts.push({ id: `${edgeId}-care`, subject: edgeId, predicate: "step-care-status", value: edge.careStatus });
  });
  if (searchComplete !== undefined) facts.push({ id: "fg-search-complete", subject: caseId, predicate: "heir-search-complete", value: searchComplete });
  return facts;
}

function stableEdgeFactId(edgeId: string): string {
  return /^[a-z][a-z0-9-]{0,58}$/u.test(edgeId) ? edgeId : `fge-${stableToken(edgeId)}`;
}

function stableToken(value: string): string {
  let first = 2166136261;
  let second = 2246822519;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619);
    second = Math.imul(second ^ code, 3266489917);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

export function graphDiagnostics(graph: FamilyGraph): string[] {
  const diagnostics: string[] = [];
  const seen = new Set<string>();
  const parentTypes = new Map<string, FamilyEdgeType>();
  for (const edge of graph.edges) {
    if (edge.from === edge.to) diagnostics.push("Một quan hệ không thể nối một người với chính họ.");
    const endpoints = edge.type === "spouse-at-opening" ? [edge.from, edge.to].sort().join(":") : `${edge.from}:${edge.to}`;
    const key = `${edge.type}:${endpoints}`;
    if (seen.has(key)) diagnostics.push("Graph có cạnh quan hệ trùng nhau.");
    seen.add(key);
    if (edge.type !== "spouse-at-opening") {
      const pair = `${edge.from}:${edge.to}`;
      const existing = parentTypes.get(pair);
      if (existing && existing !== edge.type) diagnostics.push("Cùng một cặp người đang có nhiều loại quan hệ cha/mẹ–con không tương thích.");
      parentTypes.set(pair, edge.type);
    }
  }
  if (hasParentCycle(graph)) diagnostics.push("Các cạnh cha/mẹ–con đang tạo thành chu trình.");
  const levels = graphLevels(graph);
  if (graph.edges.some((edge) => {
    const from = levels.get(edge.from), to = levels.get(edge.to);
    if (from === undefined || to === undefined) return false;
    return edge.type === "spouse-at-opening" ? from !== to : to !== from + 1;
  })) diagnostics.push("Một hoặc nhiều cạnh tạo ra thế hệ không nhất quán trong graph.");
  if (graph.people.some((person) => !person.name.trim())) diagnostics.push("Mỗi người cần có tên hiển thị.");
  return [...new Set(diagnostics)];
}

export function graphWarnings(graph: FamilyGraph): string[] {
  const warnings: string[] = [];
  if (graph.edges.some((edge) => edge.type === "step-parent-of" && !edge.careStatus)) warnings.push("Có quan hệ con riêng–bố dượng/mẹ kế chưa được đánh giá chăm sóc; CLIPS sẽ giữ kết quả ở trạng thái thiếu dữ kiện.");
  return warnings;
}

export function graphLevels(graph: FamilyGraph): Map<string, number | undefined> {
  const levels = new Map<string, number | undefined>(graph.people.map((person) => [person.id, undefined]));
  levels.set(graph.deceasedId, 0);
  for (let iteration = 0; iteration < graph.people.length; iteration += 1) {
    let changed = false;
    for (const edge of graph.edges) {
      const from = levels.get(edge.from), to = levels.get(edge.to);
      const delta = edge.type === "spouse-at-opening" ? 0 : 1;
      if (from !== undefined && to === undefined) { levels.set(edge.to, from + delta); changed = true; }
      else if (to !== undefined && from === undefined) { levels.set(edge.from, to - delta); changed = true; }
    }
    if (!changed) break;
  }
  return levels;
}

export function edgeLabel(edge: FamilyEdge, people: Map<string, FamilyPerson>): string {
  const from = people.get(edge.from)?.name ?? edge.from;
  const to = people.get(edge.to)?.name ?? edge.to;
  if (edge.type === "biological-parent-of") return `${from} là cha/mẹ đẻ của ${to}`;
  if (edge.type === "adoptive-parent-of") return `${from} là cha/mẹ nuôi của ${to}`;
  if (edge.type === "step-parent-of") return `${from} là bố dượng/mẹ kế của ${to}`;
  return `${from} là vợ/chồng của ${to} tại thời điểm mở thừa kế`;
}

export function jointBiologicalChildren(graph: FamilyGraph): JointBiologicalChildConnection[] {
  return jointChildrenOfSpouses(graph)
    .filter((connection) => connection.relationType === "biological-parent-of")
    .map(({ relationType: _relationType, ...connection }) => connection);
}

export function jointChildrenOfSpouses(graph: FamilyGraph): JointChildConnection[] {
  const connections: JointChildConnection[] = [];
  for (const spouseEdge of graph.edges) {
    if (spouseEdge.type !== "spouse-at-opening") continue;
    for (const relationType of ["biological-parent-of", "adoptive-parent-of"] as const) {
      const relationEdges = graph.edges.filter((edge) => edge.type === relationType);
      const firstParentEdges = relationEdges.filter((edge) => edge.from === spouseEdge.from);
      const secondParentByChild = new Map(relationEdges.filter((edge) => edge.from === spouseEdge.to).map((edge) => [edge.to, edge]));
      for (const firstEdge of firstParentEdges) {
        const secondEdge = secondParentByChild.get(firstEdge.to);
        if (secondEdge) connections.push({
          spouseEdgeId: spouseEdge.id,
          firstParentId: spouseEdge.from,
          secondParentId: spouseEdge.to,
          childId: firstEdge.to,
          parentEdgeIds: [firstEdge.id, secondEdge.id],
          relationType,
        });
      }
    }
  }
  return connections;
}

export function soleExistingParentOfType(
  graph: FamilyGraph,
  childId: string,
  relationType: "biological-parent-of" | "adoptive-parent-of",
): string | undefined {
  const parentIds = new Set(
    graph.edges
      .filter((edge) => edge.type === relationType && edge.to === childId)
      .map((edge) => edge.from),
  );
  return parentIds.size === 1 ? [...parentIds][0] : undefined;
}

function deduplicateEdges(edges: FamilyEdge[]) {
  const seen = new Set<string>();
  return edges.filter((edge) => { const key = `${edge.type}:${edge.from}:${edge.to}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

function hasParentCycle(graph: FamilyGraph): boolean {
  const children = new Map<string, string[]>();
  for (const edge of graph.edges) if (edge.type !== "spouse-at-opening") children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to]);
  const visiting = new Set<string>(), visited = new Set<string>();
  function visit(person: string): boolean {
    if (visiting.has(person)) return true;
    if (visited.has(person)) return false;
    visiting.add(person);
    for (const child of children.get(person) ?? []) if (visit(child)) return true;
    visiting.delete(person); visited.add(person); return false;
  }
  return graph.people.some((person) => visit(person.id));
}
