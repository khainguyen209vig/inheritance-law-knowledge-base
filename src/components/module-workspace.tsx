import type { ComponentType } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisModule, type AnalysisModuleDefinition, type AnalysisModuleId } from "@/domain/analysis-modules";
import { WillValidityWorkspace } from "@/modules/will-validity/workspace";

type WorkspacePresenter = ComponentType<{ module: AnalysisModuleDefinition }>;

const workspacePresenters: Partial<Record<AnalysisModuleId, WorkspacePresenter>> = {
  "will-validity": WillValidityWorkspace,
};

export function ModuleWorkspace({ moduleId }: { moduleId: AnalysisModuleId }) {
  const module = getAnalysisModule(moduleId);

  if (!module) return null;
  const WorkspacePresenter = workspacePresenters[module.id];
  if (module.status === "implemented" && WorkspacePresenter && module.runtime) {
    return <WorkspacePresenter module={module} />;
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl place-items-center p-6">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Mô-đun dự kiến · {module.interactionMode}</p>
          <CardTitle>{module.title}</CardTitle>
          <CardDescription>{module.shortDescription} Presenter và rule package của mô-đun này chưa được triển khai.</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
