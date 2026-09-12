import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { WillValidityRequest } from "@/domain/will-validity";
import type { StoredCase } from "@/server/db/case-repository";
import { parseClipsOutput } from "./parse-output";
import type { InferenceOutput } from "./types";

const execFileAsync = promisify(execFile);
const knowledgeBaseDirectory = path.join(process.cwd(), "knowledge-base");

export async function inferWillValidity(input: WillValidityRequest): Promise<InferenceOutput> {
  return inferWithClips(serializeWillFacts(input), createWillValidityDriver);
}

export async function inferInheritanceType(input: {
  caseId: string;
  subject: string;
  facts: StoredCase["facts"];
}): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "inheritance-type" }), createInheritanceTypeDriver);
}

export async function inferEligibility(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "eligibility" }), createEligibilityDriver);
}

export async function inferHeirRank(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "heir-rank" }), createHeirRankDriver);
}

export async function inferRepresentation(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "representation" }), createRepresentationDriver);
}

export async function inferCompulsoryShare(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "compulsory-share" }), createCompulsoryShareDriver);
}

export async function inferSpouseStatus(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "spouse-status" }), createSpouseStatusDriver);
}

export async function inferRefusalAndUnclaimed(input: { caseId: string; subject: string; facts: StoredCase["facts"] }): Promise<InferenceOutput> {
  return inferWithClips(serializeCaseFacts({ ...input, module: "refusal-and-unclaimed" }), createRefusalAndUnclaimedDriver);
}

async function inferWithClips(
  serializedFacts: string,
  createDriverFile: (factsPath: string) => string,
): Promise<InferenceOutput> {
  const workingDirectory = await mkdtemp(path.join(tmpdir(), "inheritance-clips-"));
  const factsPath = path.join(workingDirectory, "case-facts.clp");
  const driverPath = path.join(workingDirectory, "run.clp");

  try {
    await Promise.all([
      writeFile(factsPath, serializedFacts, "utf8"),
      writeFile(driverPath, createDriverFile(factsPath), "utf8"),
    ]);

    const { stdout, stderr } = await execFileAsync("clips", ["-f2", driverPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 2 * 1024 * 1024,
      timeout: 10_000,
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
  if (fact.predicate === "estate-portion-label" || fact.predicate === "person-label" || fact.predicate === "heir-person-label") {
    return `"${String(fact.value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  return String(fact.value);
}

function createWillValidityDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));

  return [
    `(load ${clipsPath("templates.clp")})`,
    `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/01-will-validity.clp")})`,
    `(load ${clipsPath("rules/90-will-validity-completeness.clp")})`,
    `(load ${clipsPath("rules/98-explanation.clp")})`,
    `(load ${clipsPath("rules/99-result-projection.clp")})`,
    `(load ${clipsPath("machine-output.clp")})`,
    "(reset)",
    `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)",
    "(emit-machine-output)",
    "(exit)",
    "",
  ].join("\n");
}

function createInheritanceTypeDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`,
    `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/01-will-validity.clp")})`,
    `(load ${clipsPath("rules/02-inheritance-type.clp")})`,
    `(load ${clipsPath("rules/91-inheritance-type-completeness.clp")})`,
    `(load ${clipsPath("rules/97-inheritance-type-projection.clp")})`,
    `(load ${clipsPath("rules/98-explanation.clp")})`,
    `(load ${clipsPath("machine-output.clp")})`,
    "(reset)",
    `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)",
    "(emit-machine-output)",
    "(exit)",
    "",
  ].join("\n");
}

function createEligibilityDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`, `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/03-eligibility.clp")})`, `(load ${clipsPath("rules/92-eligibility-completeness.clp")})`,
    `(load ${clipsPath("rules/96-eligibility-projection.clp")})`, `(load ${clipsPath("rules/98-explanation.clp")})`,
    `(load ${clipsPath("machine-output.clp")})`, "(reset)", `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)", "(emit-machine-output)", "(exit)", "",
  ].join("\n");
}

function createHeirRankDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`, `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/03-eligibility.clp")})`, `(load ${clipsPath("rules/04-heir-rank.clp")})`,
    `(load ${clipsPath("rules/93-heir-rank-completeness.clp")})`,
    `(load ${clipsPath("rules/95-heir-rank-projection.clp")})`, `(load ${clipsPath("rules/98-explanation.clp")})`,
    `(load ${clipsPath("machine-output.clp")})`, "(reset)", `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)", "(emit-machine-output)", "(exit)", "",
  ].join("\n");
}

function createRepresentationDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`, `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/03-eligibility.clp")})`, `(load ${clipsPath("rules/05-representation.clp")})`,
    `(load ${clipsPath("rules/94-representation-completeness.clp")})`, `(load ${clipsPath("rules/95-representation-projection.clp")})`,
    `(load ${clipsPath("rules/98-explanation.clp")})`, `(load ${clipsPath("machine-output.clp")})`,
    "(reset)", `(load-facts ${quoteClipsPath(factsPath)})`, "(run)", "(emit-machine-output)", "(exit)", "",
  ].join("\n");
}

function createCompulsoryShareDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`, `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/03-eligibility.clp")})`, `(load ${clipsPath("rules/06-compulsory-share.clp")})`,
    `(load ${clipsPath("rules/96-compulsory-share-completeness.clp")})`, `(load ${clipsPath("rules/97-compulsory-share-projection.clp")})`,
    `(load ${clipsPath("rules/98-explanation.clp")})`, `(load ${clipsPath("machine-output.clp")})`,
    "(reset)", `(load-facts ${quoteClipsPath(factsPath)})`, "(run)", "(emit-machine-output)", "(exit)", "",
  ].join("\n");
}

function createSpouseStatusDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`, `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/07-spouse-status.clp")})`, `(load ${clipsPath("rules/97-spouse-status-completeness.clp")})`,
    `(load ${clipsPath("rules/98-spouse-status-projection.clp")})`, `(load ${clipsPath("rules/98-explanation.clp")})`,
    `(load ${clipsPath("machine-output.clp")})`, "(reset)", `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)", "(emit-machine-output)", "(exit)", "",
  ].join("\n");
}

function createRefusalAndUnclaimedDriver(factsPath: string): string {
  const clipsPath = (file: string) => quoteClipsPath(path.join(knowledgeBaseDirectory, file));
  return [
    `(load ${clipsPath("templates.clp")})`, `(load ${clipsPath("rule-metadata.clp")})`,
    `(load ${clipsPath("rules/03-eligibility.clp")})`, `(load ${clipsPath("rules/04-heir-rank.clp")})`,
    `(load ${clipsPath("rules/08-refusal-and-unclaimed.clp")})`, `(load ${clipsPath("rules/98-refusal-and-unclaimed-completeness.clp")})`,
    `(load ${clipsPath("rules/99-refusal-and-unclaimed-projection.clp")})`, `(load ${clipsPath("rules/98-explanation.clp")})`,
    `(load ${clipsPath("machine-output.clp")})`, "(reset)", `(load-facts ${quoteClipsPath(factsPath)})`,
    "(run)", "(emit-machine-output)", "(exit)", "",
  ].join("\n");
}

function quoteClipsPath(filePath: string): string {
  return `"${filePath.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}
