import { logicTestExportRequestSchema } from "@/domain/logic-test";
import { readJson } from "@/server/http/json";
import { exportLogicTestClp, exportLogicTestMarkdown } from "@/server/logic-test/exporter";
import { LogicTestScopeNotFoundError, runLogicTest } from "@/server/logic-test/runner";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const input = logicTestExportRequestSchema.safeParse(await readJson(request));
  if (!input.success) return Response.json({ error: "INVALID_LOGIC_TEST_EXPORT_REQUEST", issues: input.error.issues }, { status: 400 });
  try {
    const { format, ...runRequest } = input.data;
    const report = await runLogicTest(runRequest);
    const output = format === "md" ? exportLogicTestMarkdown(report) : exportLogicTestClp(report);
    return new Response(output.content, {
      status: 200,
      headers: {
        "content-type": output.mediaType,
        "content-disposition": `attachment; filename="${output.fileName}"`,
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof LogicTestScopeNotFoundError) return Response.json({ error: "SCOPE_SUBJECT_NOT_FOUND" }, { status: 400 });
    console.error("Exporting Quick Logic Test failed", error);
    return Response.json({ error: "LOGIC_TEST_EXPORT_FAILED" }, { status: 500 });
  }
}
