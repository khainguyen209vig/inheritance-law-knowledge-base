import { getRuleSource } from "@/server/logic-test/rule-source";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ implementation: string }> },
) {
  const implementation = (await params).implementation;
  if (implementation.length > 160) return Response.json({ error: "INVALID_RULE_IMPLEMENTATION" }, { status: 400 });
  const entry = getRuleSource(implementation);
  if (!entry) return Response.json({ error: "RULE_SOURCE_NOT_FOUND" }, { status: 404 });
  return Response.json(entry);
}
