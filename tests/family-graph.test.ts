import assert from "node:assert/strict";
import test from "node:test";
import { graphDiagnostics, graphWarnings, jointBiologicalChildren, restoreFamilyGraph, serializeFamilyGraph, type FamilyGraph } from "../src/modules/family-graph/model";

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
      { id: "person-b", name: "B", life: "alive", eligibilityReviewed: true },
    ],
    edges: [{ id: "edge", from: "person-a", to: "person-b", type: "biological-parent-of" }],
  };
  const facts = serializeFamilyGraph("case-graph", graph, true);
  assert.ok(facts.some((fact) => fact.predicate === "biological-parent-of"));
  assert.ok(facts.some((fact) => fact.predicate === "heir-rank-candidate"));
  assert.ok(!facts.some((fact) => fact.predicate === "valid-refusal"));
  assert.ok(!facts.some((fact) => fact.predicate === "candidate-heir-rank" || fact.predicate === "called-to-inherit"));
});

test("family graph keeps fact identities stable when unrelated nodes or edges are removed", () => {
  const graph: FamilyGraph = {
    deceasedId: "person-a",
    people: [
      { id: "person-a", name: "A", eligibilityReviewed: false },
      { id: "person-b", name: "B", life: "alive", eligibilityReviewed: false },
      { id: "person-c", name: "C", life: "alive", eligibilityReviewed: false },
    ],
    edges: [
      { id: "edge-a-b", from: "person-a", to: "person-b", type: "biological-parent-of" },
      { id: "edge-a-c", from: "person-a", to: "person-c", type: "biological-parent-of" },
    ],
  };
  const before = serializeFamilyGraph("case-stable", graph);
  const after = serializeFamilyGraph("case-stable", {
    ...graph,
    people: graph.people.filter((person) => person.id !== "person-b"),
    edges: graph.edges.filter((edge) => edge.to !== "person-b"),
  });
  const personCBefore = before.filter((fact) => fact.subject === "person-c").map((fact) => fact.id).sort();
  const personCAfter = after.filter((fact) => fact.subject === "person-c").map((fact) => fact.id).sort();
  assert.deepEqual(personCAfter, personCBefore);
  assert.equal(before.find((fact) => fact.value === "person-c" && fact.predicate === "biological-parent-of")?.id, "edge-a-c");
  assert.equal(after.find((fact) => fact.value === "person-c" && fact.predicate === "biological-parent-of")?.id, "edge-a-c");
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

test("family graph stores an explicit care assessment on a step-parent relation", () => {
  const graph: FamilyGraph = {
    deceasedId: "person-a",
    people: [{ id: "person-a", name: "A", eligibilityReviewed: false }, { id: "person-b", name: "B", eligibilityReviewed: false }],
    edges: [{ id: "step-edge", from: "person-a", to: "person-b", type: "step-parent-of", careStatus: "established" }],
  };
  const facts = serializeFamilyGraph("case-step", graph);
  const relation = facts.find((fact) => fact.predicate === "step-parent-of");
  const assessment = facts.find((fact) => fact.predicate === "step-care-status");
  assert.equal(assessment?.subject, relation?.id);
  assert.equal(assessment?.value, "established");
  assert.equal(restoreFamilyGraph(facts, "test").edges[0]?.careStatus, "established");
});

test("family graph recognizes a child with two biological-parent facts as a joint child of spouses", () => {
  const graph: FamilyGraph = {
    deceasedId: "parent-a",
    people: [
      { id: "parent-a", name: "A", eligibilityReviewed: false },
      { id: "parent-b", name: "B", eligibilityReviewed: false },
      { id: "joint-child", name: "C", eligibilityReviewed: false },
      { id: "separate-child", name: "D", eligibilityReviewed: false },
    ],
    edges: [
      { id: "spouses", from: "parent-a", to: "parent-b", type: "spouse-at-opening" },
      { id: "a-joint", from: "parent-a", to: "joint-child", type: "biological-parent-of" },
      { id: "b-joint", from: "parent-b", to: "joint-child", type: "biological-parent-of" },
      { id: "a-separate", from: "parent-a", to: "separate-child", type: "biological-parent-of" },
    ],
  };
  assert.deepEqual(jointBiologicalChildren(graph), [{
    spouseEdgeId: "spouses",
    firstParentId: "parent-a",
    secondParentId: "parent-b",
    childId: "joint-child",
    parentEdgeIds: ["a-joint", "b-joint"],
  }]);
  assert.equal(serializeFamilyGraph("case-joint", graph).filter((fact) => fact.predicate === "biological-parent-of" && fact.value === "joint-child").length, 2);
});

test("family graph reports a missing step-family care assessment", () => {
  const graph: FamilyGraph = {
    deceasedId: "person-a",
    people: [{ id: "person-a", name: "A", eligibilityReviewed: false }, { id: "person-b", name: "B", eligibilityReviewed: false }],
    edges: [{ id: "step-edge", from: "person-a", to: "person-b", type: "step-parent-of" }],
  };
  assert.ok(graphWarnings(graph).some((message) => message.includes("chưa được đánh giá chăm sóc")));
  assert.equal(graphDiagnostics(graph).length, 0);
});
