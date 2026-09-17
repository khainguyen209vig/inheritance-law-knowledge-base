import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export interface RuleSourceExcerpt {
  implementation: string;
  file: string;
  source: string;
}

interface RegistryEntry {
  clipsMetadata: boolean;
  implementations: string[];
}

export interface RuleSourceCatalog {
  schemaVersion: 1;
  knowledgeBaseVersion: string;
  entries: Record<string, RuleSourceExcerpt[]>;
}

export function buildRuleSourceCatalog(input: {
  rulesDirectory: string;
  knowledgeBaseVersion: string;
  entries: Record<string, RegistryEntry>;
}): RuleSourceCatalog {
  const implementations = new Map<string, RuleSourceExcerpt>();
  for (const file of readdirSync(input.rulesDirectory).filter((name) => name.endsWith(".clp")).sort()) {
    const source = readFileSync(path.join(input.rulesDirectory, file), "utf8");
    for (const excerpt of extractDefrules(source, `rules/${file}`)) {
      if (implementations.has(excerpt.implementation)) throw new Error(`Defrule bị trùng: ${excerpt.implementation}`);
      implementations.set(excerpt.implementation, excerpt);
    }
  }

  const entries: Record<string, RuleSourceExcerpt[]> = {};
  const missing: string[] = [];
  for (const [ruleId, entry] of Object.entries(input.entries)) {
    entries[ruleId] = entry.implementations.flatMap((implementation) => {
      const excerpt = implementations.get(implementation);
      if (!excerpt) { missing.push(`${ruleId}:${implementation}`); return []; }
      return [excerpt];
    });
    if (entry.clipsMetadata && entry.implementations.length === 0) missing.push(`${ruleId}:<no implementation>`);
  }
  if (missing.length) throw new Error(`Rule registry thiếu source implementation:\n${missing.join("\n")}`);
  return { schemaVersion: 1, knowledgeBaseVersion: input.knowledgeBaseVersion, entries };
}

export function extractDefrules(source: string, file: string): RuleSourceExcerpt[] {
  const output: RuleSourceExcerpt[] = [];
  const matcher = /\(defrule\s+([^\s()]+)/gu;
  for (const match of source.matchAll(matcher)) {
    const start = match.index;
    const end = findBalancedFormEnd(source, start);
    if (end === undefined) throw new Error(`Defrule ${match[1]} không đóng ngoặc trong ${file}`);
    output.push({ implementation: match[1], file, source: source.slice(start, end).trim() });
  }
  return output;
}

function findBalancedFormEnd(source: string, start: number): number | undefined {
  let depth = 0;
  let inString = false;
  let inComment = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inComment) { if (character === "\n") inComment = false; continue; }
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === ";") { inComment = true; continue; }
    if (character === '"') { inString = true; continue; }
    if (character === "(") depth += 1;
    else if (character === ")") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  return undefined;
}

export function serializeRuleSourceCatalog(catalog: RuleSourceCatalog): string {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}
