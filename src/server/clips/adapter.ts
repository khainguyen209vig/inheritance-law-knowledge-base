import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { WillValidityRequest } from "@/domain/will-validity";
import { parseClipsOutput } from "./parse-output";
import type { InferenceOutput } from "./types";

const execFileAsync = promisify(execFile);
const knowledgeBaseDirectory = path.join(process.cwd(), "knowledge-base");

export async function inferWillValidity(input: WillValidityRequest): Promise<InferenceOutput> {
  const workingDirectory = await mkdtemp(path.join(tmpdir(), "inheritance-clips-"));
  const factsPath = path.join(workingDirectory, "case-facts.clp");
  const driverPath = path.join(workingDirectory, "run.clp");

  try {
    await Promise.all([
      writeFile(factsPath, serializeFacts(input), "utf8"),
      writeFile(driverPath, createDriver(factsPath), "utf8"),
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

function serializeFacts(input: WillValidityRequest): string {
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

function createDriver(factsPath: string): string {
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

function quoteClipsPath(filePath: string): string {
  return `"${filePath.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}
