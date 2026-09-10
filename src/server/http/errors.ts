import { CaseNotFoundError, InferenceRunNotFoundError } from "@/server/db/case-repository";

export function databaseErrorResponse(error: unknown): Response | undefined {
  if (error instanceof CaseNotFoundError) {
    return Response.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
  }
  if (error instanceof InferenceRunNotFoundError) {
    return Response.json({ error: "INFERENCE_RUN_NOT_FOUND" }, { status: 404 });
  }
  if (isUniqueConstraintError(error)) {
    return Response.json({ error: "CASE_ALREADY_EXISTS" }, { status: 409 });
  }
  return undefined;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "SQLITE_CONSTRAINT_PRIMARYKEY";
}
