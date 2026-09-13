import Link from "next/link";
import { CreateCaseForm } from "@/components/cases/create-case-form";
import { DeleteCaseButton } from "@/components/cases/delete-case-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisModule } from "@/domain/analysis-modules";
import type { ModuleResultValue } from "@/modules/contracts";
import { CaseRepository } from "@/server/db/case-repository";
import { getDatabase } from "@/server/db/database";

export const dynamic = "force-dynamic";

const resultLabels: Partial<Record<ModuleResultValue, string>> = { true: "Đạt", false: "Không đạt", unknown: "Chưa đủ dữ kiện", conflict: "Mâu thuẫn", statutory: "Theo pháp luật", testamentary: "Theo di chúc", excluded: "Không có quyền hưởng", "not-excluded": "Không bị loại trừ", "exception-under-will": "Ngoại lệ di chúc", "rank-1": "Hàng thứ nhất", "rank-2": "Hàng thứ hai", "rank-3": "Hàng thứ ba", valid: "Tư cách được giữ", state: "Thuộc Nhà nước" };

export default function CasesPage() {
  const cases = new CaseRepository(getDatabase()).listCases();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <Badge variant="outline">Case-specific database</Badge>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight">Hồ sơ vụ việc</h1>
          <p className="mt-3 text-muted-foreground">Facts hiện tại có thể thay đổi; mỗi inference run giữ một snapshot bất biến để đối chiếu.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button asChild><Link href="/guided">Bắt đầu có hướng dẫn</Link></Button><Button asChild variant="outline"><Link href="/modules">Xem các mô-đun</Link></Button></div>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tạo hồ sơ mới</CardTitle>
            <CardDescription>Hồ sơ ban đầu chưa chứa dữ kiện hoặc kết luận.</CardDescription>
          </CardHeader>
          <CardContent><CreateCaseForm /></CardContent>
        </Card>

        <section className="space-y-3">
          {cases.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Chưa có hồ sơ nào trong SQLite.</CardContent></Card>
          ) : cases.map((item) => {
            const module = item.latestRun ? getAnalysisModule(item.latestRun.module) : undefined;
            const primaryResult = item.latestRun?.results.find((result) => result.predicate === module?.primaryResultPredicate)
              ?? item.latestRun?.results[0];
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.factCount} facts</Badge>
                      <Badge variant="secondary">{item.runCount} lần suy luận</Badge>
                      {primaryResult ? <Badge variant={primaryResult.value === "true" || primaryResult.value === "testamentary" || primaryResult.value === "not-excluded" ? "success" : primaryResult.value === "false" || primaryResult.value === "excluded" ? "destructive" : "warning"}>{resultLabels[primaryResult.value] ?? primaryResult.value}</Badge> : null}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleString("vi-VN")}</span>
                  </div>
                  <CardTitle className="pt-2">{item.title}</CardTitle>
                  <CardDescription>{item.latestRun ? `Gần nhất: ${module?.title ?? item.latestRun.module}` : "Chưa chạy mô-đun nào"}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2"><Button asChild><Link href={`/cases/${item.id}`}>Mở hồ sơ</Link></Button><DeleteCaseButton caseId={item.id} caseTitle={item.title} /></CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
