import { caseIdSchema, replaceCaseFactsSchema } from "@/domain/case";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const parsedCaseId = caseIdSchema.safeParse((await params).caseId);
  const parsedBody = replaceCaseFactsSchema.safeParse(await readJson(request));
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
    const storedCase = new CaseRepository(getDatabase()).replaceFacts(parsedCaseId.data, parsedBody.data);
    return Response.json(storedCase);
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Replacing facts failed", error);
    return Response.json({ error: "FACTS_REPLACE_FAILED" }, { status: 500 });
  }
}
