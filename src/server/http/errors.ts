import { CaseNotFoundError, InferenceRunNotFoundError } from "@/server/db/case-repository";
import { GuidedAnswerNotCurrentError, GuidedSessionNotFoundError } from "@/server/db/guided-session-repository";

export function databaseErrorResponse(error: unknown): Response | undefined {
  if (error instanceof CaseNotFoundError) {
    return Response.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
  }
  if (error instanceof InferenceRunNotFoundError) {
    return Response.json({ error: "INFERENCE_RUN_NOT_FOUND" }, { status: 404 });
  }
  if (error instanceof GuidedSessionNotFoundError) {
    return Response.json({ error: "GUIDED_SESSION_NOT_FOUND" }, { status: 404 });
  }
  if (error instanceof GuidedAnswerNotCurrentError) {
    return Response.json({ error: "GUIDED_ANSWER_NOT_CURRENT" }, { status: 409 });
  }
  if (isUniqueConstraintError(error)) {
    return Response.json({ error: "CASE_ALREADY_EXISTS" }, { status: 409 });
  }
  return undefined;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "SQLITE_CONSTRAINT_PRIMARYKEY";
}
