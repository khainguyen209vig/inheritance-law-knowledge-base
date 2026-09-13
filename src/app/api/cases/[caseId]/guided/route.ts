import { caseIdSchema } from "@/domain/case";
import { getDatabase } from "@/server/db/database";
import { getGuidedCaseState } from "@/server/guided/service";
import { databaseErrorResponse } from "@/server/http/errors";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const parsed = caseIdSchema.safeParse((await params).caseId);
  if (!parsed.success) return Response.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  try {
    return Response.json(getGuidedCaseState(getDatabase(), parsed.data));
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Reading guided session failed", error);
    return Response.json({ error: "GUIDED_SESSION_READ_FAILED" }, { status: 500 });
  }
}
