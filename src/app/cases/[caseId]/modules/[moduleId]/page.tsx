import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { ModuleWorkspace } from "@/components/module-workspace";
import { getAnalysisModule } from "@/domain/analysis-modules";
import { CaseNotFoundError, CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";

export const dynamic = "force-dynamic";

export default async function CaseModulePage({ params }: { params: Promise<{ caseId: string; moduleId: string }> }) {
  const { caseId, moduleId } = await params;
  const module = getAnalysisModule(moduleId);
  if (!module) notFound();

  let storedCase;
  try {
    storedCase = new CaseRepository(getDatabase()).getCase(caseId);
  } catch (error) {
    if (error instanceof CaseNotFoundError) notFound();
    throw error;
  }

  const existingSubject = module.id === "will-validity"
    ? storedCase.facts.find((fact) => fact.predicate === "will-type")?.subject
    : module.id === "eligibility"
      ? storedCase.facts.find((fact) => fact.predicate === "eligibility-candidate")?.subject
      : module.id === "heir-rank"
        ? storedCase.facts.find((fact) => fact.predicate === "heir-rank-candidate")?.subject
        : module.id === "representation"
          ? storedCase.facts.find((fact) => fact.predicate === "representation-candidate")?.subject
          : module.id === "compulsory-share"
            ? storedCase.facts.find((fact) => fact.predicate === "compulsory-share-assessment-subject")?.subject
        : storedCase.facts.find((fact) => fact.predicate === "estate-portion")?.subject;
  const subject = existingSubject ?? `${module.runtime?.subjectPrefix ?? "subject"}-${randomUUID()}`;

  return (
    <ModuleWorkspace
      moduleId={module.id}
      initialCase={{ id: storedCase.id, title: storedCase.title, subject, facts: storedCase.facts }}
    />
  );
}
