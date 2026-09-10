import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analysisModules } from "@/domain/analysis-modules";

const interactionLabels = {
  questionnaire: "Bộ câu hỏi",
  "family-tree": "Cây gia đình",
  "people-table": "Danh sách người",
  timeline: "Dòng thời gian",
};

export default function ModulesPage() {
  const modules = Object.values(analysisModules);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-3xl">
        <Badge variant="outline">Module registry</Badge>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight">Chọn mục tiêu phân tích</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Mỗi mô-đun tạo một nhóm kết quả riêng nhưng có thể sử dụng chung facts và derived facts trong cùng vụ việc.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={module.status === "implemented" ? "success" : "secondary"}>
                  {module.status === "implemented" ? "Đã triển khai" : "Dự kiến"}
                </Badge>
                <Badge variant="outline">{interactionLabels[module.interactionMode]}</Badge>
              </div>
              <CardTitle className="pt-2">{module.title}</CardTitle>
              <CardDescription className="leading-6">{module.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant={module.status === "implemented" ? "default" : "outline"} className="w-full">
                <Link href={`/modules/${module.id}`}>
                  {module.status === "implemented" ? "Mở mô-đun" : "Xem thiết kế dự kiến"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
