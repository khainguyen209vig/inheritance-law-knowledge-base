"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import type { Answer, Answers, InferenceRun } from "@/modules/contracts";
import {
  buildWillValidityFacts,
  buildWillValidityQuestions,
  willValidityMissingLabels,
  willValidityQuestionRuleId,
} from "@/modules/will-validity/definition";
import {
  resultBadge,
  resultStatusLabel,
  resultTone,
  sortWillValidityTraces,
  willValidityConclusionLabel,
  willValidityFactLabel,
  willValidityResultDescription,
  willValidityResultTitle,
  willValiditySupportLabel,
} from "@/modules/will-validity/presentation";

export function WillValidityWorkspace({ module }: { module: AnalysisModuleDefinition }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState(module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [technicalMode, setTechnicalMode] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const caseId = useRef<string | undefined>(undefined);
  const subject = useRef<string | undefined>(undefined);

  const questions = useMemo(() => buildWillValidityQuestions(answers), [answers]);
  const currentIndex = Math.min(activeIndex, questions.length - 1);
  const currentQuestion = questions[currentIndex];
  const facts = useMemo(() => buildWillValidityFacts(answers), [answers]);
  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const progress = questions.length === 0 ? 0 : (answeredCount / questions.length) * 100;
  const result = run?.results.find((item) => item.predicate === module.primaryResultPredicate);
  const orderedTraces = useMemo(() => sortWillValidityTraces(run?.traces ?? []), [run?.traces]);
  const currentRuleId = willValidityQuestionRuleId(currentQuestion.id, answers);

  function updateAnswer(questionId: string, value: Answer) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setRun(undefined);
  }

  function moveNext() {
    setActiveIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function runInference() {
    startTransition(async () => {
      setError(undefined);
      try {
        if (!caseId.current || !subject.current) {
          const token = crypto.randomUUID();
          caseId.current = `case-${token}`;
          subject.current = `${module.runtime?.subjectPrefix ?? "subject"}-${token}`;
          await requestJson("/api/cases", {
            method: "POST",
            body: JSON.stringify({ id: caseId.current, title }),
          });
        }

        await requestJson(`/api/cases/${caseId.current}/facts`, {
          method: "PUT",
          body: JSON.stringify({ subject: subject.current, facts }),
        });
        if (!module.runtime) throw new Error(`Mô-đun ${module.id} chưa có runtime adapter.`);
        const inferencePath = module.runtime.inferencePath.replace(":caseId", encodeURIComponent(caseId.current));
        const inferenceRun = await requestJson<InferenceRun>(
          inferencePath,
          { method: "POST", body: JSON.stringify({ subject: subject.current }) },
        );
        setRun(inferenceRun);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary font-serif text-lg text-primary-foreground">L</div>
            <div>
              <p className="text-sm font-semibold">Inheritance Reasoner</p>
              <p className="text-xs text-muted-foreground">{module.title} · CLIPS · Forward chaining</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/modules">Các mô-đun</Link>
            </Button>
            <Badge variant="warning">Knowledge base: draft</Badge>
            <Button variant={technicalMode ? "secondary" : "outline"} size="sm" onClick={() => setTechnicalMode((value) => !value)}>
              <span className="sm:hidden">Kỹ thuật</span>
              <span className="hidden sm:inline">{technicalMode ? "Đang xem kỹ thuật" : "Chế độ kỹ thuật"}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 p-4 sm:p-6 xl:grid-cols-[280px_minmax(440px,1fr)_380px]">
        <aside className="order-2 min-w-0 space-y-4 xl:order-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Hồ sơ vụ việc</Badge>
                <span className="text-xs text-muted-foreground">{caseId.current ? "Đã lưu" : "Chưa lưu"}</span>
              </div>
              <CardTitle className="pt-2">Thông tin làm việc</CardTitle>
              <CardDescription>Case chỉ được tạo trong SQLite khi chạy suy luận lần đầu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2 text-sm font-medium">
                Tên hồ sơ
                <Input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tiến độ dữ kiện</span>
                  <span>{answeredCount}/{questions.length}</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{technicalMode ? "Working memory" : "Dữ kiện đã ghi nhận"}</CardTitle>
              <CardDescription>{technicalMode ? `${facts.length} facts sẽ được assert vào CLIPS.` : `${facts.length} dữ kiện sẽ được hệ thống sử dụng.`}</CardDescription>
            </CardHeader>
            <CardContent>
              {facts.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Chưa có dữ kiện nào được ghi nhận.</p>
              ) : (
                <ul className="space-y-2">
                  {facts.map((fact) => (
                    <li key={fact.id} className="rounded-lg bg-muted/70 px-3 py-2.5">
                      <p className="text-sm font-medium">{willValidityFactLabel(fact)}</p>
                      {technicalMode ? <code className="mt-1 block break-all text-[11px] text-muted-foreground">{fact.predicate}={String(fact.value)}</code> : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>

        <main className="order-1 min-w-0 xl:order-2">
          <Card className="overflow-hidden border-primary/15 shadow-md">
            <div className="border-b bg-primary/[0.035] px-5 py-3">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="font-semibold uppercase tracking-[0.15em] text-primary">{currentQuestion.group}</span>
                <span className="text-muted-foreground">Câu {currentIndex + 1} / {questions.length}</span>
              </div>
            </div>
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="max-w-2xl text-2xl sm:text-3xl">{currentQuestion.title}</CardTitle>
              <CardDescription className="max-w-2xl text-base">{currentQuestion.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
              {currentQuestion.kind === "choice" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentQuestion.choices?.map((choice) => {
                    const selected = answers[currentQuestion.id] === choice.value;
                    return (
                      <button
                        key={String(choice.value)}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updateAnswer(currentQuestion.id, choice.value)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all outline-none hover:border-primary/50 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                          selected && "border-primary bg-primary/[0.06] ring-1 ring-primary",
                        )}
                      >
                        <span className="flex items-center gap-3 font-semibold">
                          <span className={cn("size-3 rounded-full border border-muted-foreground/50", selected && "border-primary bg-primary ring-2 ring-primary/20")} />
                          {choice.label}
                        </span>
                        <span className="mt-2 block pl-6 text-sm leading-6 text-muted-foreground">{choice.description}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="max-w-sm">
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      value={answers[currentQuestion.id] === undefined ? "" : String(answers[currentQuestion.id])}
                      placeholder={currentQuestion.placeholder}
                      onChange={(event) => updateAnswer(currentQuestion.id, event.target.value === "" ? undefined : Number(event.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">{currentQuestion.unit}</span>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
                <p className="font-semibold">Vì sao hệ thống hỏi?</p>
                <p className="mt-1 leading-6">{currentQuestion.legalSource}</p>
                <Button className="mt-3 border-amber-300 bg-transparent text-amber-950 hover:bg-amber-100" variant="outline" size="sm" onClick={() => setSelectedRuleId(currentRuleId)}>
                  Xem nội dung điều luật
                </Button>
              </div>

              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" disabled={currentIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}>Quay lại</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { updateAnswer(currentQuestion.id, undefined); moveNext(); }}>Chưa xác định</Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button onClick={moveNext}>Tiếp tục</Button>
                  ) : (
                    <Button disabled={isPending || facts.length === 0 || title.trim().length === 0} onClick={runInference}>
                      {isPending ? "CLIPS đang suy luận…" : "Lưu và chạy suy luận"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="mt-0.5 font-serif text-lg text-primary">§</span>
            <p>“Chưa xác định” không được chuyển thành <code>false</code>. Hệ thống bỏ qua fact đó và CLIPS có thể trả về <code>UNKNOWN</code> cùng danh sách dữ kiện cần bổ sung.</p>
          </div>
        </main>

        <aside className="order-3 min-w-0 space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">Kết quả suy luận</Badge>
                {run ? <span className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleTimeString("vi-VN")}</span> : null}
              </div>
              <CardTitle className="pt-2">{result ? willValidityResultTitle(result.value) : "Chưa chạy CLIPS"}</CardTitle>
              <CardDescription>
                {isPending ? "Đang lưu facts và chạy agenda…" : result ? willValidityResultDescription(result.value) : "Hoàn thành hoặc bỏ qua các câu hỏi, sau đó chạy suy luận."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

              {result ? (
                <div className={cn("rounded-xl border p-4", resultTone(result.value))}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider">{module.title}</span>
                    <Badge variant={resultBadge(result.value)}>{resultStatusLabel(result.value)}</Badge>
                  </div>
                  <p className="mt-3 text-sm">Kết luận được dẫn xuất qua {result.derivations.join(", ")}.</p>
                  <Button className="mt-3 bg-white/50" variant="outline" size="sm" onClick={() => setSelectedRuleId(result.derivations[0])}>
                    Xem căn cứ của kết luận
                  </Button>
                  {technicalMode ? <code className="mt-3 block text-[11px]">{module.primaryResultPredicate}={result.value}</code> : null}
                </div>
              ) : (
                <div className="grid min-h-32 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
                  Kết luận và trace sẽ xuất hiện tại đây.
                </div>
              )}

              {run?.missing.length ? (
                <div>
                  <h4 className="text-sm font-semibold">Cần bổ sung {run.missing.length} dữ kiện</h4>
                  <ul className="mt-2 space-y-2">
                    {run.missing.map((item) => (
                      <li key={item.predicate} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
                        {willValidityMissingLabels[item.predicate] ?? item.predicate}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {run?.traces.length ? (
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Luồng lập luận</h4>
                    <Badge variant="secondary">{orderedTraces.length} bước</Badge>
                  </div>
                  <ol className="mt-3 space-y-3">
                    {orderedTraces.map((trace, index) => {
                      const explanation = getRuleExplanation(trace.ruleId);
                      return (
                        <li key={`${trace.ruleId}-${trace.conclusionPredicate}`} className="rounded-xl border bg-card p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{index + 1}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold">{explanation?.conclusion ?? willValidityConclusionLabel(trace.conclusionPredicate, trace.conclusionValue)}</p>
                                <Badge variant="outline">{trace.ruleId}</Badge>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">{explanation?.reasoning ?? "Hệ thống đã dẫn xuất thêm một kết luận từ các dữ kiện hỗ trợ."}</p>
                              <div className="mt-3 rounded-lg bg-muted/70 p-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dựa trên</p>
                                <ul className="mt-1 space-y-1 text-xs">
                                  {trace.supports.map((support) => <li key={support}>• {willValiditySupportLabel(support, facts)}</li>)}
                                </ul>
                              </div>
                              {explanation ? (
                                <button type="button" className="mt-3 text-xs font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setSelectedRuleId(trace.ruleId)}>
                                  {explanation.kind === "legal" ? `Đọc ${explanation.citation}` : "Xem nguồn và giới hạn áp dụng"}
                                </button>
                              ) : null}
                              {technicalMode ? (
                                <code className="mt-2 block break-all rounded bg-muted p-2 text-[10px] leading-4">
                                  {trace.conclusionPredicate}={trace.conclusionValue}; supports: {trace.supports.join(" · ")}
                                </code>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ) : null}

              {run ? (
                <div className="rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                  <p>Run: {run.id}</p>
                  <p>KB: {run.knowledgeBaseVersion}</p>
                  <p>Snapshot đã được lưu trong SQLite.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>

      <footer className="mx-auto max-w-[1500px] px-6 pb-8 text-center text-xs text-muted-foreground">
        Bản thử nghiệm phục vụ học tập · Knowledge base chưa được chuyên gia pháp lý phê duyệt · Không phải tư vấn pháp lý
      </footer>

      <LegalRuleDialog ruleId={selectedRuleId} onOpenChange={(open) => { if (!open) setSelectedRuleId(undefined); }} />
    </div>
  );
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`);
  return data;
}
