import { notFound } from "next/navigation";
import { GuidedSession } from "@/components/guided/guided-session";
import { CaseNotFoundError } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";
import { GuidedSessionNotFoundError } from "@/server/db/guided-session-repository";
import { getGuidedCaseState } from "@/server/guided/service";

export const dynamic = "force-dynamic";

export default async function GuidedCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  try {
    return <GuidedSession initialState={getGuidedCaseState(getDatabase(), caseId)} />;
  } catch (error) {
    if (error instanceof CaseNotFoundError || error instanceof GuidedSessionNotFoundError) notFound();
    throw error;
  }
}
