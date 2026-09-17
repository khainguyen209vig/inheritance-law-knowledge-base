import { LogicTestScopeNotFoundError } from "./runner";

/** Keep native CLIPS errors and stderr out of the public response. */
export function logicTestRunErrorResponse(error: unknown): Response {
  if (error instanceof LogicTestScopeNotFoundError) return Response.json({ error: "SCOPE_SUBJECT_NOT_FOUND" }, { status: 400 });
  return Response.json({ error: "LOGIC_TEST_RUN_FAILED" }, { status: 500 });
}
