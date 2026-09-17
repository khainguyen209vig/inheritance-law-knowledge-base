"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuidedTopicId } from "@/domain/guided-conversation";
import type { LogicReasoningStep, LogicTestParseResult, LogicTestReport, NormalizedLogicTestCaseStudy } from "@/domain/logic-test";
import { cn } from "@/lib/utils";

const ExploreDialog = dynamic(
  () => import("./logic-test-explore-dialog").then((module) => module.LogicTestExploreDialog),
  { ssr: false },
);

interface TopicOption { id: GuidedTopicId; question: string; description: string }

const statusPresentation = {
  complete: { label: "Đã có kết luận", variant: "success" as const, description: "Knowledge base đã suy ra kết quả từ các facts được cung cấp." },
  unknown: { label: "Chưa xác định", variant: "warning" as const, description: "Các facts hiện tại chưa dẫn tới một kết luận xác định." },
  conflict: { label: "Có mâu thuẫn", variant: "destructive" as const, description: "Knowledge base sinh ra các kết luận xung đột cần kiểm tra lại." },
  "missing-facts": { label: "Thiếu dữ kiện", variant: "warning" as const, description: "Cần bổ sung facts được liệt kê bên dưới để tiếp tục suy luận." },
};

export function LogicTestWorkspace({ topics }: { topics: TopicOption[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File>();
  const [parseResult, setParseResult] = useState<LogicTestParseResult>();
  const [topicId, setTopicId] = useState<GuidedTopicId>();
  const [scopeSubject, setScopeSubject] = useState<string>();
  const [report, setReport] = useState<LogicTestReport>();
  const [busy, setBusy] = useState<"parse" | "run">();
  const [error, setError] = useState<string>();
  const [exploreStep, setExploreStep] = useState<LogicReasoningStep>();
  const [legalRuleId, setLegalRuleId] = useState<string>();

  const factsBySubject = useMemo(() => {
    const groups = new Map<string, NormalizedLogicTestCaseStudy["facts"]>();
    for (const fact of parseResult?.caseStudy?.facts ?? []) groups.set(fact.subject, [...(groups.get(fact.subject) ?? []), fact]);
    return [...groups.entries()];
  }, [parseResult?.caseStudy?.facts]);

  async function parseFile(nextFile: File) {
    setFile(nextFile);
    setBusy("parse");
    setError(undefined);
    setReport(undefined);
    const data = new FormData();
    data.set("file", nextFile);
    try {
      const response = await fetch("/api/logic-tests/parse", { method: "POST", body: data });
      const payload = await response.json() as LogicTestParseResult & { error?: string };
      setParseResult(payload);
      if (!response.ok && !payload.diagnostics) setError("Không thể đọc file CLP.");
      setScopeSubject(undefined);
    } catch {
      setError("Không thể kết nối đến máy chủ để đọc file. Bạn có thể thử lại mà không cần chọn lại file.");
    } finally {
      setBusy(undefined);
    }
  }

  async function runInference() {
    if (!parseResult?.caseStudy || !topicId) return;
    setBusy("run");
    setError(undefined);
    try {
      const response = await fetch("/api/logic-tests/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topicId, scopeSubject: scopeSubject || undefined, caseStudy: parseResult.caseStudy }),
      });
      if (!response.ok) throw new Error("Không thể chạy suy luận với lựa chọn hiện tại.");
      setReport(await response.json() as LogicTestReport);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể chạy suy luận. File đã đọc vẫn được giữ lại để bạn thử lại.");
    } finally {
      setBusy(undefined);
    }
  }

  const selectedTopic = topics.find((topic) => topic.id === topicId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <Badge variant="outline">Chế độ kỹ thuật · không lưu hồ sơ</Badge>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight">Test nhanh logic từ file CLP</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Upload facts của một case study, chọn câu hỏi và theo dõi từng bước suy luận. Nội dung upload chỉ được parse thành facts, không được thực thi như code.</p>
        </div>
        <Button asChild variant="ghost"><Link href="/modules">← Chế độ kỹ thuật</Link></Button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><Badge variant="secondary">Bước 1</Badge><CardTitle>Đưa facts vào hệ thống</CardTitle><CardDescription>Chấp nhận file .clp tối đa 1 MB theo format Quick Logic Test.</CardDescription></CardHeader>
            <CardContent>
              <input ref={inputRef} type="file" accept=".clp,text/plain" className="sr-only" onChange={(event) => { const nextFile = event.target.files?.[0]; if (nextFile) void parseFile(nextFile); }} />
              <button
                type="button"
                className={cn("w-full rounded-xl border-2 border-dashed p-8 text-center transition-colors", dragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/35")}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); const nextFile = event.dataTransfer.files[0]; if (nextFile) void parseFile(nextFile); }}
              >
                <span className="block text-2xl">⇧</span>
                <span className="mt-2 block font-semibold">{busy === "parse" ? "Đang đọc file…" : file?.name ?? "Kéo thả hoặc chọn file .clp"}</span>
                {file ? <span className="mt-1 block text-xs text-muted-foreground">{file.size.toLocaleString("vi-VN")} bytes · Nhấn để chọn file khác</span> : null}
              </button>

              {parseResult?.diagnostics.length ? (
                <div className="mt-4 space-y-2" aria-live="polite">
                  {parseResult.diagnostics.map((diagnostic, index) => (
                    <div key={`${diagnostic.code}:${diagnostic.location.offset}:${index}`} className={cn("rounded-lg border p-3 text-sm", diagnostic.severity === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-950")}>
                      <span className="font-semibold">Dòng {diagnostic.location.line}, cột {diagnostic.location.column}:</span> {diagnostic.message}
                    </div>
                  ))}
                </div>
              ) : null}

              {parseResult?.summary ? <p className="mt-4 text-sm text-muted-foreground">Đã đọc {parseResult.summary.factCount} facts của {parseResult.summary.subjectCount} chủ thể.</p> : null}
            </CardContent>
          </Card>

          {parseResult?.caseStudy ? (
            <Card>
              <CardHeader><Badge variant="secondary">Bước 2</Badge><CardTitle>Chọn vấn đề cần hỏi</CardTitle><CardDescription>Câu hỏi quyết định các package luật được chạy; module khai trong file không thể ghi đè lựa chọn này.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {topics.map((topic) => (
                  <button key={topic.id} type="button" onClick={() => { setTopicId(topic.id); setReport(undefined); }} className={cn("w-full rounded-lg border p-4 text-left transition-colors", topicId === topic.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/45")}>
                    <span className="font-semibold">{topic.question}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{topic.description}</span>
                  </button>
                ))}

                {topicId && factsBySubject.length ? (
                  <label className="block pt-2 text-sm font-semibold">Chủ thể cần tập trung
                    <select value={scopeSubject ?? ""} onChange={(event) => { setScopeSubject(event.target.value || undefined); setReport(undefined); }} className="mt-2 h-11 w-full rounded-lg border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Tất cả chủ thể phù hợp</option>
                      {factsBySubject.map(([subject, facts]) => <option key={subject} value={subject}>{subjectLabel(subject, facts)} ({subject})</option>)}
                    </select>
                  </label>
                ) : null}

                <Button className="mt-2 w-full" size="lg" disabled={!topicId || busy === "run"} onClick={() => void runInference()}>
                  {busy === "run" ? "Đang suy luận…" : "Chạy suy luận"}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          {factsBySubject.length ? (
            <Card>
              <CardHeader><CardTitle>Facts đã nhận diện</CardTitle><CardDescription>Preview theo chủ thể trước khi chạy knowledge base.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {factsBySubject.map(([subject, facts]) => (
                  <section key={subject} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{subjectLabel(subject, facts)}</h3><Badge variant="outline">{subject}</Badge></div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {facts.map((fact) => <div key={fact.id} className="rounded-md bg-muted/45 px-3 py-2 text-xs"><code>{fact.predicate}</code><span className="mx-1 text-muted-foreground">=</span><strong>{String(fact.value)}</strong></div>)}
                    </div>
                  </section>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed"><CardContent className="p-8 text-center text-sm leading-6 text-muted-foreground">Kết quả parse và quá trình suy luận sẽ xuất hiện tại đây sau khi bạn chọn file.</CardContent></Card>
          )}

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">{error}</div> : null}
          {report ? <ReportView report={report} selectedTopic={selectedTopic} onExplore={setExploreStep} /> : null}
        </div>
      </div>

      <ExploreDialog step={exploreStep} onOpenChange={(open) => { if (!open) setExploreStep(undefined); }} onOpenLegalRule={(ruleId) => { setExploreStep(undefined); setLegalRuleId(ruleId); }} />
      <LegalRuleDialog ruleId={legalRuleId} onOpenChange={(open) => { if (!open) setLegalRuleId(undefined); }} />
    </main>
  );
}

function ReportView({ report, selectedTopic, onExplore }: { report: LogicTestReport; selectedTopic?: TopicOption; onExplore: (step: LogicReasoningStep) => void }) {
  const status = statusPresentation[report.status];
  return (
    <section className="space-y-5" aria-live="polite">
      <Card className={cn(report.status === "conflict" ? "border-red-300" : report.status === "complete" ? "border-emerald-300" : "border-amber-300")}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2"><Badge variant={status.variant}>{status.label}</Badge><Badge variant="outline">KB {report.knowledgeBaseVersion}</Badge></div>
          <CardTitle>{selectedTopic?.question ?? report.query.question}</CardTitle>
          <CardDescription>{status.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.conclusions.map((conclusion) => <div key={conclusion.id} className="rounded-lg bg-primary/[0.055] p-4 text-sm font-medium leading-6">{conclusion.statement}</div>)}
          {!report.conclusions.length ? <p className="text-sm text-muted-foreground">Chưa có kết luận cuối để hiển thị.</p> : null}
        </CardContent>
      </Card>

      {report.missing.length ? (
        <Card><CardHeader><CardTitle>Dữ kiện còn thiếu</CardTitle></CardHeader><CardContent><ul className="space-y-2">{report.missing.map((item) => <li key={`${item.module}:${item.subject}:${item.predicate}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{item.explanation}</li>)}</ul></CardContent></Card>
      ) : null}

      {report.reasoningGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader><div className="flex flex-wrap gap-2"><Badge variant={group.kind === "legal" ? "outline" : "warning"}>{group.citation}</Badge><Badge variant="secondary">{group.steps.length} bước</Badge></div><CardTitle>{group.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {group.steps.map((step, index) => (
              <article key={step.id} className="rounded-lg border p-4">
                <div className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm leading-6">{step.plainExplanation}</p><Button size="sm" variant="outline" onClick={() => onExplore(step)}>Explore</Button></div><p className="mt-2 text-sm font-semibold text-primary">→ {step.conclusion}</p></div></div>
              </article>
            ))}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function subjectLabel(subject: string, facts: NormalizedLogicTestCaseStudy["facts"]): string {
  const labelPredicates = new Set(["person-label", "heir-person-label", "estate-portion-label", "obligation-label", "distribution-group-label", "distribution-beneficiary-label", "limitation-request-label", "estate-asset-label"]);
  const label = facts.find((fact) => labelPredicates.has(fact.predicate))?.value;
  return typeof label === "string" && label ? label : subject;
}
