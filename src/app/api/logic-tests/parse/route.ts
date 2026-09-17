import { logicTestLimits, type LogicTestParseResult } from "@/domain/logic-test";
import { parseLogicTestClpBytes } from "@/server/logic-test/parser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "INVALID_MULTIPART_REQUEST" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "CLP_FILE_REQUIRED" }, { status: 400 });

  if (file.size > logicTestLimits.maxFileBytes) {
    const result: LogicTestParseResult = {
      diagnostics: [{
        code: "FILE_TOO_LARGE",
        severity: "error",
        message: `File vượt quá ${logicTestLimits.maxFileBytes} bytes.`,
        location: { line: 1, column: 1, offset: 0 },
      }],
    };
    return Response.json(result, { status: 413 });
  }

  try {
    const result = parseLogicTestClpBytes(new Uint8Array(await file.arrayBuffer()), { fileName: file.name });
    return Response.json(result, { status: result.caseStudy ? 200 : 422 });
  } catch (error) {
    console.error("Parsing Quick Logic Test input failed", error);
    return Response.json({ error: "LOGIC_TEST_PARSE_FAILED" }, { status: 500 });
  }
}
