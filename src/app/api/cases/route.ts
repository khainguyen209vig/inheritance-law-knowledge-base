import { createCaseSchema } from "@/domain/case";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = createCaseSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return Response.json({ error: "INVALID_REQUEST", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const storedCase = new CaseRepository(getDatabase()).createCase(parsed.data);
    return Response.json(storedCase, { status: 201 });
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Creating case failed", error);
    return Response.json({ error: "CASE_CREATE_FAILED" }, { status: 500 });
  }
}
