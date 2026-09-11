import { caseIdSchema } from "@/domain/case";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const parsed = caseIdSchema.safeParse((await params).caseId);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  }

  try {
    return Response.json(new CaseRepository(getDatabase()).listInferenceRuns(parsed.data));
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Listing inference runs failed", error);
    return Response.json({ error: "INFERENCE_RUN_LIST_FAILED" }, { status: 500 });
  }
}
