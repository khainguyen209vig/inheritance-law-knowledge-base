import { logicTestRunRequestSchema } from "@/domain/logic-test";
import { readJson } from "@/server/http/json";
import { logicTestRunErrorResponse } from "@/server/logic-test/http-error";
import { LogicTestScopeNotFoundError, runLogicTest } from "@/server/logic-test/runner";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const input = logicTestRunRequestSchema.safeParse(await readJson(request));
  if (!input.success) return Response.json({ error: "INVALID_LOGIC_TEST_REQUEST", issues: input.error.issues }, { status: 400 });
  try {
    return Response.json(await runLogicTest(input.data), { status: 200 });
  } catch (error) {
    if (!(error instanceof LogicTestScopeNotFoundError)) console.error("Running Quick Logic Test failed", error);
    return logicTestRunErrorResponse(error);
  }
}
