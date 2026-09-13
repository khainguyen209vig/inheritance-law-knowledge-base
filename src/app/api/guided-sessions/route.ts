import { createGuidedSessionSchema } from "@/domain/guided-conversation";
import { getDatabase } from "@/server/db/database";
import { createGuidedCase } from "@/server/guided/service";
import { databaseErrorResponse } from "@/server/http/errors";
import { readJson } from "@/server/http/json";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = createGuidedSessionSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "INVALID_REQUEST", issues: parsed.error.issues }, { status: 400 });
  try {
    return Response.json(createGuidedCase(getDatabase(), parsed.data), { status: 201 });
  } catch (error) {
    const knownError = databaseErrorResponse(error);
    if (knownError) return knownError;
    console.error("Creating guided session failed", error);
    return Response.json({ error: "GUIDED_SESSION_CREATE_FAILED" }, { status: 500 });
  }
}
