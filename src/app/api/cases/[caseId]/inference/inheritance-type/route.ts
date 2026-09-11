import { caseIdSchema, runInheritanceTypeSchema } from "@/domain/case";
import { runStoredInheritanceType } from "@/server/cases/service";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const parsedCaseId = caseIdSchema.safeParse((await params).caseId);
  const parsedBody = runInheritanceTypeSchema.safeParse(await readJson(request));
  if (!parsedCaseId.success || !parsedBody.success) {
    return Response.json({ error: "INVALID_REQUEST", issues: parsedBody.success ? [] : parsedBody.error.issues }, { status: 400 });
  }
  try {
    const run = await runStoredInheritanceType(new CaseRepository(getDatabase()), parsedCaseId.data);
    return Response.json(run, { status: 201 });
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Stored inheritance-type inference failed", error);
    return Response.json({ error: "INFERENCE_FAILED" }, { status: 500 });
  }
}
