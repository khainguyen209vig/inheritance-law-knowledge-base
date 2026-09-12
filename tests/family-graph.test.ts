import assert from "node:assert/strict";
import test from "node:test";
import { graphDiagnostics, restoreFamilyGraph, serializeFamilyGraph, type FamilyGraph } from "../src/modules/family-graph/model";

test("family graph restores formerly hidden intermediate people as editable nodes", () => {
  const graph = restoreFamilyGraph([
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "candidate", subject: "grandchild-one", predicate: "heir-rank-candidate", value: true },
    { id: "edge-one", subject: "deceased-one", predicate: "biological-parent-of", value: "legacy-bridge" },
    { id: "edge-two", subject: "legacy-bridge", predicate: "biological-parent-of", value: "grandchild-one" },
  ], "test");
  assert.deepEqual(new Set(graph.people.map((person) => person.id)), new Set(["deceased-one", "legacy-bridge", "grandchild-one"]));
  assert.equal(graph.edges.length, 2);
});

test("family graph ignores a person label that is not part of the graph", () => {
  const graph = restoreFamilyGraph([
    { id: "deceased", subject: "deceased-one", predicate: "deceased-person", value: true },
    { id: "unrelated-label", subject: "unrelated-one", predicate: "person-label", value: "Người chỉ có trong mô-đun khác" },
  ], "test");
  assert.deepEqual(graph.people.map((person) => person.id), ["deceased-one"]);
});

test("family graph serializes observations and never serializes a legal rank conclusion", () => {
  const graph: FamilyGraph = {
    deceasedId: "person-a",
    people: [
      { id: "person-a", name: "A", eligibilityReviewed: false },
      { id: "person-b", name: "B", life: "alive", refusal: false, eligibilityReviewed: true },
    ],
    edges: [{ id: "edge", from: "person-a", to: "person-b", type: "biological-parent-of" }],
  };
  const facts = serializeFamilyGraph("case-graph", graph, true);
  assert.ok(facts.some((fact) => fact.predicate === "biological-parent-of"));
  assert.ok(facts.some((fact) => fact.predicate === "heir-rank-candidate"));
  assert.ok(!facts.some((fact) => fact.predicate === "candidate-heir-rank" || fact.predicate === "called-to-inherit"));
});

test("family graph reports parent cycles", () => {
  const graph: FamilyGraph = {
    deceasedId: "person-a",
    people: [{ id: "person-a", name: "A", eligibilityReviewed: false }, { id: "person-b", name: "B", eligibilityReviewed: false }],
    edges: [
      { id: "one", from: "person-a", to: "person-b", type: "biological-parent-of" },
      { id: "two", from: "person-b", to: "person-a", type: "biological-parent-of" },
    ],
  };
  assert.ok(graphDiagnostics(graph).some((message) => message.includes("chu trình")));
});

test("family graph treats reverse spouse edges as duplicates", () => {
  const graph: FamilyGraph = {
    deceasedId: "person-a",
    people: [{ id: "person-a", name: "A", eligibilityReviewed: false }, { id: "person-b", name: "B", eligibilityReviewed: false }],
    edges: [
      { id: "one", from: "person-a", to: "person-b", type: "spouse-at-opening" },
      { id: "two", from: "person-b", to: "person-a", type: "spouse-at-opening" },
    ],
  };
  assert.ok(graphDiagnostics(graph).some((message) => message.includes("trùng")));
});
