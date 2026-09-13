import { caseIdSchema } from "@/domain/case";
import { guidedAnswerSchema } from "@/domain/guided-conversation";
import { getDatabase } from "@/server/db/database";
import { answerGuidedQuestion } from "@/server/guided/service";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const parsedCaseId = caseIdSchema.safeParse((await params).caseId);
  const parsedAnswer = guidedAnswerSchema.safeParse(await readJson(request));
  if (!parsedCaseId.success || !parsedAnswer.success) return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  try {
    return Response.json(await answerGuidedQuestion(getDatabase(), parsedCaseId.data, parsedAnswer.data));
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Saving guided answer failed", error);
    return Response.json({ error: "GUIDED_ANSWER_SAVE_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const parsedCaseId = caseIdSchema.safeParse((await params).caseId);
  const parsedAnswer = guidedAnswerSchema.safeParse(await readJson(request));
  if (!parsedCaseId.success || !parsedAnswer.success) return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  try {
    return Response.json(await answerGuidedQuestion(getDatabase(), parsedCaseId.data, parsedAnswer.data, { revision: true }));
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Revising guided answer failed", error);
    return Response.json({ error: "GUIDED_ANSWER_REVISION_FAILED" }, { status: 500 });
  }
}
