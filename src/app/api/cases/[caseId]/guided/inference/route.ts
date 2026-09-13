import { caseIdSchema } from "@/domain/case";
import { getDatabase } from "@/server/db/database";
import { runGuidedInference } from "@/server/guided/service";
import { databaseErrorResponse } from "@/server/http/errors";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const caseId = caseIdSchema.safeParse((await params).caseId);
  if (!caseId.success) return Response.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  try {
    return Response.json(await runGuidedInference(getDatabase(), caseId.data));
  } catch (error) {
    const known = databaseErrorResponse(error);
    if (known) return known;
    console.error("Guided inference orchestration failed", error);
    return Response.json({ error: "GUIDED_INFERENCE_FAILED" }, { status: 500 });
  }
}
