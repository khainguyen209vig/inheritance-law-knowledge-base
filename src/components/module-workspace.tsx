import type { ComponentType } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisModule, type AnalysisModuleDefinition, type AnalysisModuleId } from "@/domain/analysis-modules";
import type { ApiFact } from "@/modules/contracts";
import { WillValidityWorkspace } from "@/modules/will-validity/workspace";
import { InheritanceTypeWorkspace } from "@/modules/inheritance-type/workspace";
import { EligibilityWorkspace } from "@/modules/eligibility/workspace";
import { HeirRankWorkspace } from "@/modules/heir-rank/workspace";
import { RepresentationWorkspace } from "@/modules/representation/workspace";

interface ModuleInitialCase {
  id: string;
  title: string;
  subject: string;
  facts: ApiFact[];
}

type WorkspacePresenter = ComponentType<{ module: AnalysisModuleDefinition; initialCase?: ModuleInitialCase }>;

const workspacePresenters: Partial<Record<AnalysisModuleId, WorkspacePresenter>> = {
  "will-validity": WillValidityWorkspace,
  "inheritance-type": InheritanceTypeWorkspace,
  eligibility: EligibilityWorkspace,
  "heir-rank": HeirRankWorkspace,
  representation: RepresentationWorkspace,
};

export function ModuleWorkspace({ moduleId, initialCase }: { moduleId: AnalysisModuleId; initialCase?: ModuleInitialCase }) {
  const module = getAnalysisModule(moduleId);

  if (!module) return null;
  const WorkspacePresenter = workspacePresenters[module.id];
  if (module.status === "implemented" && WorkspacePresenter && module.runtime) {
    return <WorkspacePresenter module={module} initialCase={initialCase} />;
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
