import { caseIdSchema, runHeirRankSchema } from "@/domain/case";
import { runStoredHeirRank } from "@/server/cases/service";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const caseId = caseIdSchema.safeParse((await params).caseId);
  const body = runHeirRankSchema.safeParse(await readJson(request));
  if (!caseId.success || !body.success) return Response.json({ error: "INVALID_REQUEST", issues: body.success ? [] : body.error.issues }, { status: 400 });
  try { return Response.json(await runStoredHeirRank(new CaseRepository(getDatabase()), caseId.data), { status: 201 }); }
  catch (error) { const known = databaseErrorResponse(error); if (known) return known; console.error("Stored heir-rank inference failed", error); return Response.json({ error: "INFERENCE_FAILED" }, { status: 500 }); }
}
