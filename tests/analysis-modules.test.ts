import assert from "node:assert/strict";
import test from "node:test";
import {
  analysisModules,
  getExecutableModulePlan,
  resolveInferencePath,
  type AnalysisModuleId,
} from "../src/domain/analysis-modules";

test("module registry uses stable IDs and references existing dependencies", () => {
  for (const [moduleId, module] of Object.entries(analysisModules)) {
    assert.equal(module.id, moduleId);
    assert.ok(module.primaryResultPredicate.length > 0);
    if (module.status === "implemented") assert.ok(module.runtime, `${moduleId} needs a runtime adapter`);

    for (const dependency of module.dependencies) {
      assert.ok(analysisModules[dependency.moduleId], `${moduleId} references missing module ${dependency.moduleId}`);
      assert.notEqual(dependency.moduleId, moduleId, `${moduleId} cannot depend on itself`);
    }
  }
});

test("the complete declared dependency graph is acyclic", () => {
  const visited = new Set<AnalysisModuleId>();
  const visiting = new Set<AnalysisModuleId>();

  function visit(moduleId: AnalysisModuleId) {
    if (visited.has(moduleId)) return;
    assert.ok(!visiting.has(moduleId), `dependency cycle detected at ${moduleId}`);
    visiting.add(moduleId);
    for (const dependency of analysisModules[moduleId].dependencies) visit(dependency.moduleId);
    visiting.delete(moduleId);
    visited.add(moduleId);
  }

  for (const moduleId of Object.keys(analysisModules) as AnalysisModuleId[]) visit(moduleId);
});

test("execution plan includes only implemented required dependencies", () => {
  assert.deepEqual(getExecutableModulePlan("will-validity").map((module) => module.id), ["will-validity"]);
  assert.equal(
    resolveInferencePath(analysisModules["will-validity"], "case-demo"),
    "/api/cases/case-demo/inference/will-validity",
  );
});
