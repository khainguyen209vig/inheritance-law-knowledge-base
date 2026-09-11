import Link from "next/link";
import { notFound } from "next/navigation";
import { InferenceRunSnapshot } from "@/components/cases/inference-run-snapshot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAnalysisModule } from "@/domain/analysis-modules";
import { InferenceRunNotFoundError, CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";

export const dynamic = "force-dynamic";

export default async function InferenceRunPage({ params }: { params: Promise<{ caseId: string; runId: string }> }) {
  const { caseId, runId } = await params;
  let run;
  try {
    run = new CaseRepository(getDatabase()).getInferenceRun(caseId, runId);
  } catch (error) {
    if (error instanceof InferenceRunNotFoundError) notFound();
    throw error;
  }
  const module = getAnalysisModule(run.module);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><Badge variant="outline">Inference snapshot</Badge><h1 className="mt-3 font-serif text-4xl font-semibold">Chi tiết lần suy luận</h1></div>
        <Button asChild variant="outline"><Link href={`/cases/${caseId}`}>Quay lại hồ sơ</Link></Button>
      </div>
      <InferenceRunSnapshot run={run} moduleTitle={module?.title ?? run.module} />
    </main>
  );
}
