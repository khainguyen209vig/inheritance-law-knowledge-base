import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analysisModules, getAnalysisModule } from "@/domain/analysis-modules";
import { CaseNotFoundError, CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const repository = new CaseRepository(getDatabase());
  let storedCase;
  try {
    storedCase = repository.getCase(caseId);
  } catch (error) {
    if (error instanceof CaseNotFoundError) notFound();
    throw error;
  }
  const runs = repository.listInferenceRuns(caseId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2"><Badge variant="outline">{storedCase.id}</Badge><Badge variant="secondary">{storedCase.facts.length} facts</Badge></div>
          <h1 className="mt-4 font-serif text-4xl font-semibold">{storedCase.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Cập nhật {new Date(storedCase.updatedAt).toLocaleString("vi-VN")}</p>
        </div>
        <Button asChild variant="outline"><Link href="/cases">Tất cả hồ sơ</Link></Button>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="text-lg font-semibold">Chọn mô-đun phân tích</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {Object.values(analysisModules).map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex gap-2"><Badge variant={module.status === "implemented" ? "success" : "secondary"}>{module.status === "implemented" ? "Có thể chạy" : "Dự kiến"}</Badge><Badge variant="outline">{module.interactionMode}</Badge></div>
                  <CardTitle className="pt-2 text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant={module.status === "implemented" ? "default" : "outline"}>
                    <Link href={`/cases/${storedCase.id}/modules/${module.id}`}>{module.status === "implemented" ? "Nhập dữ kiện / chạy lại" : "Xem kế hoạch"}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <aside>
          <Card>
            <CardHeader><CardTitle>Lịch sử suy luận</CardTitle><CardDescription>Mỗi lần chạy là một snapshot không bị thay đổi khi facts hiện tại được sửa.</CardDescription></CardHeader>
            <CardContent>
              {runs.length === 0 ? <p className="text-sm text-muted-foreground">Hồ sơ chưa có lần suy luận nào.</p> : (
                <ol className="space-y-3">
                  {runs.map((run) => {
                    const module = getAnalysisModule(run.module);
                    const result = run.results.find((item) => item.predicate === module?.primaryResultPredicate) ?? run.results[0];
                    return (
                      <li key={run.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{module?.title ?? run.module}</p>{result ? <Badge variant="outline">{result.value}</Badge> : null}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString("vi-VN")}</p>
                        <Button asChild variant="ghost" size="sm" className="mt-2"><Link href={`/cases/${storedCase.id}/runs/${run.id}`}>Xem snapshot</Link></Button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
