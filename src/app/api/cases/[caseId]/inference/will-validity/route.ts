import { caseIdSchema, runWillValiditySchema } from "@/domain/case";
import { runStoredWillValidity } from "@/server/cases/service";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const parsedCaseId = caseIdSchema.safeParse((await params).caseId);
  const parsedBody = runWillValiditySchema.safeParse(await readJson(request));
  if (!parsedCaseId.success || !parsedBody.success) {
    return Response.json(
      {
        error: "INVALID_REQUEST",
        issues: parsedBody.success ? [] : parsedBody.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const run = await runStoredWillValidity(
      new CaseRepository(getDatabase()),
      parsedCaseId.data,
      parsedBody.data.subject,
    );
    return Response.json(run, { status: 201 });
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Stored CLIPS inference failed", error);
    return Response.json({ error: "INFERENCE_FAILED" }, { status: 500 });
  }
}
