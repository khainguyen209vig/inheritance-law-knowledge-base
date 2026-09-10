import { willValidityRequestSchema } from "@/domain/will-validity";
import { inferWillValidity } from "@/server/clips/adapter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = willValidityRequestSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return Response.json(
      { error: "INVALID_REQUEST", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const output = await inferWillValidity(parsed.data);
    return Response.json(output);
  } catch (error) {
    console.error("CLIPS inference failed", error);
    return Response.json({ error: "INFERENCE_FAILED" }, { status: 500 });
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
