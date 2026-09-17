import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { AnalysisModuleId } from "@/domain/analysis-modules";
import type { WillValidityRequest } from "@/domain/will-validity";
import type { StoredCase } from "@/server/db/case-repository";
import { addCalendarYears } from "@/domain/temporal";
import { parseClipsOutput } from "./parse-output";
import type { InferenceOutput } from "./types";

const execFileAsync = promisify(execFile);
const knowledgeBaseDirectory = path.join(process.cwd(), "knowledge-base");
export const clipsExecutionLimits = { timeoutMs: 10_000, maxBufferBytes: 2 * 1024 * 1024 } as const;

/** Each package is one CLIPS working memory containing its goal rules and required dependency rules. */
export const clipsRulePackages: Record<AnalysisModuleId, readonly string[]> = {
  "will-validity": ["rules/01-will-validity.clp", "rules/90-will-validity-completeness.clp", "rules/98-explanation.clp", "rules/99-result-projection.clp"],
  "inheritance-type": ["rules/01-will-validity.clp", "rules/03-eligibility.clp", "rules/08-refusal-and-unclaimed.clp", "rules/02-inheritance-type.clp", "rules/91-inheritance-type-completeness.clp", "rules/97-inheritance-type-projection.clp", "rules/98-explanation.clp"],
  eligibility: ["rules/03-eligibility.clp", "rules/92-eligibility-completeness.clp", "rules/96-eligibility-projection.clp", "rules/98-explanation.clp"],
  "heir-rank": ["rules/03-eligibility.clp", "rules/08-refusal-and-unclaimed.clp", "rules/04-heir-rank.clp", "rules/93-heir-rank-completeness.clp", "rules/95-heir-rank-projection.clp", "rules/98-explanation.clp"],
  representation: ["rules/03-eligibility.clp", "rules/08-refusal-and-unclaimed.clp", "rules/05-representation.clp", "rules/94-representation-completeness.clp", "rules/95-representation-projection.clp", "rules/98-explanation.clp"],
  "compulsory-share": ["rules/03-eligibility.clp", "rules/08-refusal-and-unclaimed.clp", "rules/06-compulsory-share.clp", "rules/96-compulsory-share-completeness.clp", "rules/97-compulsory-share-projection.clp", "rules/98-explanation.clp"],
  "spouse-status": ["rules/07-spouse-status.clp", "rules/97-spouse-status-completeness.clp", "rules/98-spouse-status-projection.clp", "rules/98-explanation.clp"],
  "refusal-and-unclaimed": ["rules/03-eligibility.clp", "rules/04-heir-rank.clp", "rules/08-refusal-and-unclaimed.clp", "rules/98-refusal-and-unclaimed-completeness.clp", "rules/99-refusal-and-unclaimed-projection.clp", "rules/98-explanation.clp"],
  "estate-settlement": ["rules/03-eligibility.clp", "rules/08-refusal-and-unclaimed.clp", "rules/04-heir-rank.clp", "rules/09-estate-settlement.clp", "rules/99-estate-settlement-completeness.clp", "rules/99-estate-settlement-projection.clp", "rules/98-explanation.clp"],
  limitation: ["rules/10-limitation.clp", "rules/99-limitation-completeness.clp", "rules/99-limitation-projection.clp", "rules/98-explanation.clp"],
};

export async function inferWillValidity(input: WillValidityRequest): Promise<InferenceOutput> {
  return inferWithClips(serializeWillFacts(input), "will-validity");
}

export async function inferInheritanceType(input: {
  caseId: string;
  subject: string;
  facts: StoredCase["facts"];
}): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "inheritance-type");
}

export async function inferEligibility(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "eligibility");
}

export async function inferHeirRank(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "heir-rank");
}

export async function inferRepresentation(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "representation");
}

export async function inferCompulsoryShare(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "compulsory-share");
}

export async function inferSpouseStatus(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "spouse-status");
}

export async function inferRefusalAndUnclaimed(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "refusal-and-unclaimed");
}

export async function inferEstateSettlement(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "estate-settlement");
}

export async function inferLimitation(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferAnalysisModule(input, "limitation");
}

/** Run a configured module package without persisting a case or inference snapshot. */
export async function inferAnalysisModule(
  input: { caseId: string; subject: string; facts: StoredCase["facts"] },
  moduleId: AnalysisModuleId,
): Promise<InferenceOutput> {
  const output = await inferWithClips(serializeCaseFacts({ ...input, module: moduleId }), moduleId);
  if (moduleId !== "limitation") return output;
  const openingDates = new Map(input.facts
    .filter((fact) => fact.predicate === "inheritance-opening-date" && typeof fact.value === "string")
    .map((fact) => [fact.subject, String(fact.value)]));
  const deadlines = output.results.flatMap((result) => {
    const openingDate = openingDates.get(result.subject);
    const years = result.predicate === "limitation-period-years" && /^\d+$/u.test(result.value) ? Number(result.value) : undefined;
    if (!openingDate || years === undefined) return [];
    return [{ ...result, predicate: "limitation-deadline", value: addCalendarYears(openingDate, years) }];
  });
  return { ...output, results: [...output.results, ...deadlines] };
}

async function inferWithClips(
  serializedFacts: string,
  moduleId: AnalysisModuleId,
): Promise<InferenceOutput> {
  const workingDirectory = await mkdtemp(path.join(tmpdir(), "inheritance-clips-"));
  const factsPath = path.join(workingDirectory, "case-facts.clp");
  const driverPath = path.join(workingDirectory, "run.clp");

  try {
    await Promise.all([
      writeFile(factsPath, serializedFacts, "utf8"),
      writeFile(driverPath, createPackageDriver(factsPath, moduleId), "utf8"),
    ]);

    const { stdout, stderr } = await execFileAsync("clips", ["-f2", driverPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: clipsExecutionLimits.maxBufferBytes,
      timeout: clipsExecutionLimits.timeoutMs,
    });

    if (stderr.trim().length > 0) {
      throw new Error(`CLIPS stderr: ${stderr.trim()}`);
    }

    return parseClipsOutput(stdout);
  } finally {
    await rm(workingDirectory, { recursive: true, force: true });
  }
}

function serializeWillFacts(input: WillValidityRequest): string {
  const request = [
    "(analysis-request",
    `  (case-id ${input.caseId})`,
    `  (subject ${input.subject})`,
    "  (module will-validity))",
  ].join("\n");

  const facts = input.facts.map((fact) =>
    [
      "(asserted-fact",
      `  (fact-id ${fact.id})`,
      `  (case-id ${input.caseId})`,
      `  (subject ${input.subject})`,
      `  (predicate ${fact.predicate})`,
      `  (value ${String(fact.value)}))`,
    ].join("\n"),
  );

  return `${[request, ...facts].join("\n\n")}\n`;
}

function serializeCaseFacts(input: { caseId: string; subject: string; module: string; facts: StoredCase["facts"] }): string {
  const request = [
    "(analysis-request",
    `  (case-id ${input.caseId})`,
    `  (subject ${input.subject})`,
    `  (module ${input.module}))`,
  ].join("\n");
  const facts = input.facts.map((fact) => [
    "(asserted-fact",
    `  (fact-id ${fact.id})`,
    `  (case-id ${input.caseId})`,
    `  (subject ${fact.subject})`,
    `  (predicate ${fact.predicate})`,
    `  (value ${serializeCaseFactValue(fact)}))`,
  ].join("\n"));
  return `${[request, ...facts].join("\n\n")}\n`;
}

function serializeCaseFactValue(fact: StoredCase["facts"][number]): string {
  if (fact.predicate === "estate-portion-label" || fact.predicate === "person-label" || fact.predicate === "heir-person-label" || fact.predicate === "obligation-label" || fact.predicate === "distribution-group-label" || fact.predicate === "distribution-beneficiary-label" || fact.predicate === "specified-division-date" || fact.predicate === "limitation-request-label" || fact.predicate === "inheritance-opening-date" || fact.predicate === "estate-asset-label") {
    return `"${String(fact.value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  return String(fact.value);
}

function createPackageDriver(factsPath: string, moduleId: AnalysisModuleId): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`,
    `(load ${clipsPath("rule-metadata.clp")})`,
    ...clipsRulePackages[moduleId].map((file) => `(load ${clipsPath(file)})`),
    `(load ${clipsPath("machine-output.clp")})`,
    "(reset)",
    `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)",
    "(emit-machine-output)",
    "(exit)",
    "",
  ].join("\n");
}

function quoteClipsPath(filePath: string): string {
  return `"${filePath.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}
