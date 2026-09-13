import { caseIdSchema, updateCaseSchema } from "@/domain/case";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

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
    return Response.json(new CaseRepository(getDatabase()).getCase(parsed.data));
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Reading case failed", error);
    return Response.json({ error: "CASE_READ_FAILED" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const parsedCaseId = caseIdSchema.safeParse((await params).caseId);
  const parsedBody = updateCaseSchema.safeParse(await readJson(request));
  if (!parsedCaseId.success || !parsedBody.success) {
    return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    return Response.json(new CaseRepository(getDatabase()).updateCaseTitle(parsedCaseId.data, parsedBody.data.title));
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Updating case failed", error);
    return Response.json({ error: "CASE_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const parsed = caseIdSchema.safeParse((await params).caseId);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  }

  try {
    new CaseRepository(getDatabase()).deleteCase(parsed.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Deleting case failed", error);
    return Response.json({ error: "CASE_DELETE_FAILED" }, { status: 500 });
  }
}
