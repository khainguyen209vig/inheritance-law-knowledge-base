import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import ruleRegistry from "../knowledge-base/rule-registry.json";
import { renderRuleMetadata, type ClipsMetadataEntry } from "../scripts/lib/render-rule-metadata";

const projectRoot = process.cwd();
const registryEntries = ruleRegistry.entries as Record<
  string,
  ClipsMetadataEntry & {
    kind: string;
    implementations: string[];
    relevantSections: string[];
  }
>;

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

test("rule registry has valid identities and controlled vocabulary", () => {
  const allowedKinds = new Set(["legal", "internal", "system"]);
  const allowedStatuses = new Set(["draft", "reviewed", "approved", "deprecated"]);

  for (const [registryId, entry] of Object.entries(registryEntries)) {
    assert.equal(entry.ruleId, registryId, `${registryId} has a mismatched ruleId`);
    assert.ok(allowedKinds.has(entry.kind), `${registryId} has invalid kind ${entry.kind}`);
    assert.ok(allowedStatuses.has(entry.status), `${registryId} has invalid status ${entry.status}`);
  }
});

test("every domain production rule is owned by exactly one registry entry", () => {
  const domainRules = ["01-will-validity.clp", "02-inheritance-type.clp"]
    .map((filename) => readFileSync(join(projectRoot, "knowledge-base/rules", filename), "utf8"))
    .join("\n");
  const implementedRuleNames = [...domainRules.matchAll(/^\(defrule\s+([^\s)]+)/gmu)].map((match) => match[1]);
  const registeredImplementations = Object.values(registryEntries)
    .filter((entry) => entry.kind !== "system")
    .flatMap((entry) => entry.implementations);

  assert.equal(new Set(registeredImplementations).size, registeredImplementations.length, "an implementation is owned more than once");
  assert.deepEqual(sorted(registeredImplementations), sorted(implementedRuleNames));
});

test("every emitted explanation ID has CLIPS metadata and no metadata is orphaned", () => {
  const rulesDirectory = join(projectRoot, "knowledge-base/rules");
  const emittedIds = new Set<string>();
  const allProductionRules = new Set<string>();

  for (const filename of readdirSync(rulesDirectory).filter((name) => name.endsWith(".clp"))) {
    const contents = readFileSync(join(rulesDirectory, filename), "utf8");
    for (const match of contents.matchAll(/^\(defrule\s+([^\s)]+)/gmu)) {
      allProductionRules.add(match[1]);
    }
    for (const match of contents.matchAll(/\((?:rule-id|derivations)\s+([A-Z][A-Za-z0-9-]*)\)/gu)) {
      emittedIds.add(match[1]);
    }
  }

  for (const entry of Object.values(registryEntries)) {
    for (const implementation of entry.implementations) {
      assert.ok(allProductionRules.has(implementation), `${entry.ruleId} references missing defrule ${implementation}`);
    }
  }

  const metadataIds = new Set(
    Object.values(registryEntries)
      .filter((entry) => entry.clipsMetadata)
      .map((entry) => entry.ruleId),
  );
  assert.deepEqual(sorted(metadataIds), sorted(emittedIds));
});

test("generated CLIPS metadata is synchronized with the registry", () => {
  const generatedFile = readFileSync(join(projectRoot, "knowledge-base/rule-metadata.clp"), "utf8");
  assert.equal(generatedFile, renderRuleMetadata(registryEntries));
});
