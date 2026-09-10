import { notFound } from "next/navigation";
import { ModuleWorkspace } from "@/components/module-workspace";
import { getAnalysisModule } from "@/domain/analysis-modules";

export default async function AnalysisModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const module = getAnalysisModule(moduleId);
  if (!module) notFound();

  return <ModuleWorkspace moduleId={module.id} />;
}
