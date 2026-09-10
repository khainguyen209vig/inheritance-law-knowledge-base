import { caseIdSchema } from "@/domain/case";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; runId: string }> },
) {
  const { caseId, runId } = await params;
  const parsedCaseId = caseIdSchema.safeParse(caseId);
  if (!parsedCaseId.success || !/^run-[0-9a-f-]{36}$/.test(runId)) {
    return Response.json({ error: "INVALID_IDENTIFIER" }, { status: 400 });
  }

  try {
    const run = new CaseRepository(getDatabase()).getInferenceRun(parsedCaseId.data, runId);
    return Response.json(run);
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Reading inference run failed", error);
    return Response.json({ error: "INFERENCE_RUN_READ_FAILED" }, { status: 500 });
  }
}
