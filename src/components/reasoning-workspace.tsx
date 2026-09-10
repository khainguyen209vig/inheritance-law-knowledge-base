"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getRuleExplanation, legalProvisions } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";

type Answer = string | number | boolean | undefined;
type Answers = Record<string, Answer>;

interface Choice {
  label: string;
  value: string | boolean;
  description: string;
}

interface Question {
  id: string;
  group: string;
  title: string;
  description: string;
  legalSource: string;
  kind: "choice" | "number";
  choices?: Choice[];
  placeholder?: string;
  unit?: string;
}

interface ApiFact {
  id: string;
  predicate: string;
  value: string | number | boolean;
}

interface InferenceRun {
  id: string;
  caseId: string;
  knowledgeBaseVersion: string;
  createdAt: string;
  results: Array<{ predicate: string; value: "true" | "false" | "unknown" | "conflict"; derivations: string[] }>;
  missing: Array<{ predicate: string }>;
  traces: Array<{
    ruleId: string;
    conclusionPredicate: string;
    conclusionValue: string;
    supports: string[];
  }>;
}

type InferenceTrace = InferenceRun["traces"][number];

const YES_NO_UNKNOWN: Choice[] = [
  { label: "Có", value: true, description: "Ghi nhận dữ kiện này là đúng." },
  { label: "Không", value: false, description: "Ghi nhận dữ kiện này là không đúng." },
];

const baseQuestions: Question[] = [
  {
    id: "willType",
    group: "Hình thức di chúc",
    title: "Di chúc được lập theo hình thức nào?",
    description: "Hình thức quyết định nhánh điều kiện mà hệ thống cần kiểm tra tiếp theo.",
    legalSource: "Điều 627, 629 và 630 BLDS 2015",
    kind: "choice",
    choices: [
      { label: "Bằng văn bản", value: "written", description: "Di chúc được thể hiện dưới dạng văn bản." },
      { label: "Bằng miệng", value: "oral", description: "Lời di chúc được thể hiện trước người làm chứng." },
    ],
  },
  {
    id: "age",
    group: "Người lập di chúc",
    title: "Người lập di chúc bao nhiêu tuổi?",
    description: "Độ tuổi từ đủ 15 đến dưới 18 làm phát sinh điều kiện riêng.",
    legalSource: "Điều 630 khoản 2 BLDS 2015",
    kind: "number",
    placeholder: "Ví dụ: 42",
    unit: "tuổi",
  },
  {
    id: "mentalState",
    group: "Ý chí",
    title: "Khi lập di chúc, người này có minh mẫn và sáng suốt không?",
    description: "Đây là dữ kiện về trạng thái tinh thần tại thời điểm lập di chúc.",
    legalSource: "R-B01, R-B04 · Điều 630 khoản 1 điểm a",
    kind: "choice",
    choices: [
      { label: "Minh mẫn", value: "lucid", description: "Có khả năng nhận thức và làm chủ ý chí." },
      { label: "Không minh mẫn", value: "not-lucid", description: "Có căn cứ xác định không minh mẫn." },
    ],
  },
  {
    id: "influence",
    group: "Ý chí",
    title: "Có dấu hiệu tác động trái ý chí không?",
    description: "Chỉ chọn một trạng thái đã có căn cứ trong hồ sơ vụ việc.",
    legalSource: "R-B01, R-B04 · Điều 630 khoản 1 điểm a",
    kind: "choice",
    choices: [
      { label: "Không phát hiện", value: "none", description: "Không có dữ kiện về lừa dối hoặc đe dọa." },
      { label: "Lừa dối", value: "deception", description: "Có dữ kiện cho thấy người lập bị lừa dối." },
      { label: "Đe dọa", value: "threat", description: "Có dữ kiện cho thấy người lập bị đe dọa." },
    ],
  },
  {
    id: "prohibitedContent",
    group: "Nội dung",
    title: "Có phát hiện nội dung bị pháp luật cấm không?",
    description: "Prototype hiện dùng observation tổng quát; tiêu chí chi tiết sẽ được phân rã ở phiên bản sau.",
    legalSource: "R-B02 · Điều 630 khoản 1 điểm b",
    kind: "choice",
    choices: [
      { label: "Không phát hiện", value: "not-detected", description: "Chưa phát hiện nội dung vi phạm điều cấm." },
      { label: "Có phát hiện", value: "detected", description: "Có dấu hiệu nội dung vi phạm điều cấm." },
    ],
  },
];

const writtenQuestions: Question[] = [
  {
    id: "physicalLimitation",
    group: "Điều kiện đặc biệt",
    title: "Người lập có bị hạn chế về thể chất không?",
    description: "Nếu có, di chúc phải đáp ứng thêm yêu cầu về người làm chứng và chứng nhận.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: YES_NO_UNKNOWN,
  },
  {
    id: "literacy",
    group: "Điều kiện đặc biệt",
    title: "Người lập di chúc có biết chữ không?",
    description: "Trường hợp không biết chữ áp dụng yêu cầu hình thức đặc biệt.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: [
      { label: "Biết chữ", value: "literate", description: "Người lập có khả năng đọc và viết." },
      { label: "Không biết chữ", value: "illiterate", description: "Cần áp dụng điều kiện hình thức đặc biệt." },
    ],
  },
];

const accessibilityQuestions: Question[] = [
  {
    id: "preparedByWitness",
    group: "Hình thức đặc biệt",
    title: "Di chúc có được người làm chứng lập thành văn bản không?",
    description: "Dữ kiện này chỉ được hỏi khi có hạn chế thể chất hoặc người lập không biết chữ.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: YES_NO_UNKNOWN,
  },
  {
    id: "notarized",
    group: "Hình thức đặc biệt",
    title: "Văn bản đã được công chứng hoặc chứng thực chưa?",
    description: "Ghi nhận trạng thái công chứng hoặc chứng thực của di chúc.",
    legalSource: "R-B07 · Điều 630 khoản 3",
    kind: "choice",
    choices: YES_NO_UNKNOWN,
  },
];

const formalQuestion: Question = {
  id: "formalDefect",
  group: "Hình thức di chúc",
  title: "Có phát hiện vi phạm về hình thức không?",
  description: "Đây là observation chuyển tiếp cho đến khi Điều 627–636 được mô hình hóa chi tiết.",
  legalSource: "FORM-ASSESSMENT-ACCEPTED",
  kind: "choice",
  choices: [
    { label: "Không phát hiện", value: "not-detected", description: "Chưa phát hiện vi phạm hình thức." },
    { label: "Có phát hiện", value: "detected", description: "Có dấu hiệu vi phạm hình thức." },
  ],
};

const guardianQuestion: Question = {
  id: "guardianConsent",
  group: "Người chưa thành niên",
  title: "Cha, mẹ hoặc người giám hộ có đồng ý việc lập di chúc không?",
  description: "Câu hỏi xuất hiện vì tuổi đã nhập nằm trong khoảng từ đủ 15 đến dưới 18.",
  legalSource: "R-B05, R-B06 · Điều 630 khoản 2",
  kind: "choice",
  choices: YES_NO_UNKNOWN,
};

const oralQuestions: Question[] = [
  {
    id: "witnessCount",
    group: "Di chúc miệng",
    title: "Có bao nhiêu người làm chứng?",
    description: "Di chúc miệng cần ít nhất hai người làm chứng.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "number",
    placeholder: "Ví dụ: 2",
    unit: "người",
  },
  {
    id: "witnessesRecorded",
    group: "Di chúc miệng",
    title: "Ý chí cuối cùng đã được người làm chứng ghi chép lại chưa?",
    description: "Việc ghi chép là một phần của chuỗi điều kiện hình thức.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "choice",
    choices: YES_NO_UNKNOWN,
  },
  {
    id: "witnessesSigned",
    group: "Di chúc miệng",
    title: "Những người làm chứng đã ký hoặc điểm chỉ chưa?",
    description: "Ghi nhận việc xác nhận nội dung bởi người làm chứng.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "choice",
    choices: YES_NO_UNKNOWN,
  },
  {
    id: "certifiedDays",
    group: "Di chúc miệng",
    title: "Sau bao nhiêu ngày văn bản được công chứng hoặc chứng thực?",
    description: "Mốc biên được knowledge base kiểm tra là 5 ngày.",
    legalSource: "R-B09 · Điều 630 khoản 5",
    kind: "number",
    placeholder: "Từ 0 đến 5",
    unit: "ngày",
  },
  {
    id: "aliveAfterThreeMonths",
    group: "Hiệu lực hiện tại",
    title: "Sau ba tháng, người lập di chúc vẫn còn sống không?",
    description: "Dữ kiện này được dùng để xác định việc di chúc miệng có mặc nhiên bị hủy bỏ hay không.",
    legalSource: "R-B08 · Điều 629 khoản 2",
    kind: "choice",
    choices: YES_NO_UNKNOWN,
  },
];

const afterThreeMonthsQuestion: Question = {
  id: "mentalAfterThreeMonths",
  group: "Hiệu lực hiện tại",
  title: "Sau ba tháng, người lập có còn minh mẫn và sáng suốt không?",
  description: "Nếu vẫn sống, minh mẫn và sáng suốt thì di chúc miệng mặc nhiên bị hủy bỏ.",
  legalSource: "R-B08 · Điều 629 khoản 2",
  kind: "choice",
  choices: [
    { label: "Minh mẫn", value: "lucid", description: "Vẫn minh mẫn và sáng suốt sau ba tháng." },
    { label: "Không minh mẫn", value: "not-lucid", description: "Không đủ căn cứ cho trạng thái minh mẫn." },
  ],
};

const missingLabels: Record<string, string> = {
  "will-type": "Hình thức di chúc",
  "testator-mental-state": "Trạng thái tinh thần của người lập",
  "undue-influence": "Dấu hiệu lừa dối hoặc đe dọa",
  "prohibited-content": "Nội dung bị pháp luật cấm",
  "formal-defect": "Điều kiện về hình thức",
  "guardian-consent": "Sự đồng ý của cha, mẹ hoặc người giám hộ",
  "prepared-by-witness": "Việc lập văn bản bởi người làm chứng",
  "notarized-or-certified": "Công chứng hoặc chứng thực",
  "witness-count": "Số người làm chứng",
  "witnesses-recorded": "Việc ghi chép lời di chúc",
  "witnesses-signed": "Chữ ký hoặc điểm chỉ của người làm chứng",
  "certified-within-days": "Thời hạn công chứng hoặc chứng thực",
  "unresolved-rule-path": "Các dữ kiện hiện tại chưa khớp một đường suy luận đã được mô hình hóa",
};

export function ReasoningWorkspace() {
  const [answers, setAnswers] = useState<Answers>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState("Hồ sơ di chúc thử nghiệm");
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [technicalMode, setTechnicalMode] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const caseId = useRef<string | undefined>(undefined);
  const subject = useRef<string | undefined>(undefined);

  const questions = useMemo(() => buildQuestions(answers), [answers]);
  const currentIndex = Math.min(activeIndex, questions.length - 1);
  const currentQuestion = questions[currentIndex];
  const facts = useMemo(() => buildFacts(answers), [answers]);
  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const progress = questions.length === 0 ? 0 : (answeredCount / questions.length) * 100;
  const result = run?.results.find((item) => item.predicate === "valid-will");
  const orderedTraces = useMemo(() => sortTraces(run?.traces ?? []), [run?.traces]);
  const currentRuleId = questionRuleId(currentQuestion.id, answers);

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
          subject.current = `will-${token}`;
          await requestJson("/api/cases", {
            method: "POST",
            body: JSON.stringify({ id: caseId.current, title }),
          });
        }

        await requestJson(`/api/cases/${caseId.current}/facts`, {
          method: "PUT",
          body: JSON.stringify({ subject: subject.current, facts }),
        });
        const inferenceRun = await requestJson<InferenceRun>(
          `/api/cases/${caseId.current}/inference/will-validity`,
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
              <p className="text-xs text-muted-foreground">CLIPS · Forward chaining · R-B01–R-B09</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                      <p className="text-sm font-medium">{factLabel(fact)}</p>
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
              <CardTitle className="pt-2">{result ? resultTitle(result.value) : "Chưa chạy CLIPS"}</CardTitle>
              <CardDescription>
                {isPending ? "Đang lưu facts và chạy agenda…" : result ? resultDescription(result.value) : "Hoàn thành hoặc bỏ qua các câu hỏi, sau đó chạy suy luận."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

              {result ? (
                <div className={cn("rounded-xl border p-4", resultTone(result.value))}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider">Tính hợp pháp của di chúc</span>
                    <Badge variant={resultBadge(result.value)}>{resultStatusLabel(result.value)}</Badge>
                  </div>
                  <p className="mt-3 text-sm">Kết luận được dẫn xuất qua {result.derivations.join(", ")}.</p>
                  <Button className="mt-3 bg-white/50" variant="outline" size="sm" onClick={() => setSelectedRuleId(result.derivations[0])}>
                    Xem căn cứ của kết luận
                  </Button>
                  {technicalMode ? <code className="mt-3 block text-[11px]">valid-will={result.value}</code> : null}
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
                        {missingLabels[item.predicate] ?? item.predicate}
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
                                <p className="text-sm font-semibold">{explanation?.conclusion ?? conclusionLabel(trace.conclusionPredicate, trace.conclusionValue)}</p>
                                <Badge variant="outline">{trace.ruleId}</Badge>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">{explanation?.reasoning ?? "Hệ thống đã dẫn xuất thêm một kết luận từ các dữ kiện hỗ trợ."}</p>
                              <div className="mt-3 rounded-lg bg-muted/70 p-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dựa trên</p>
                                <ul className="mt-1 space-y-1 text-xs">
                                  {trace.supports.map((support) => <li key={support}>• {supportLabel(support, facts)}</li>)}
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

function LegalRuleDialog({ ruleId, onOpenChange }: { ruleId?: string; onOpenChange: (open: boolean) => void }) {
  const explanation = ruleId ? getRuleExplanation(ruleId) : undefined;
  const provision = explanation?.provisionId ? legalProvisions[explanation.provisionId] : undefined;

  return (
    <Dialog open={Boolean(ruleId)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={explanation?.kind === "internal" ? "warning" : "outline"}>{ruleId === "ARTICLE-627" ? "Căn cứ câu hỏi" : ruleId}</Badge>
            {explanation ? <Badge variant="secondary">{explanation.citation}</Badge> : null}
          </div>
          <DialogTitle>{explanation?.title ?? "Thông tin căn cứ"}</DialogTitle>
          <DialogDescription>{explanation?.reasoning ?? "Chưa có nội dung giải thích dành cho rule này."}</DialogDescription>
        </DialogHeader>

        {explanation?.kind === "internal" ? (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Đây là quy tắc kỹ thuật chuyển tiếp của knowledge base, không phải một điều luật. Nó đang thay cho phần tiêu chí hình thức tại Điều 627–636 chưa được mô hình hóa đầy đủ.
          </div>
        ) : null}

        {provision ? (
          <div className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Bộ luật Dân sự 2015</p>
                <h3 className="mt-1 font-serif text-xl font-semibold">{provision.number}. {provision.title}</h3>
              </div>
              <Badge variant="outline">Nguồn local: {provision.sourceDocument}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {provision.sections.map((section) => {
                const relevant = explanation?.relevantSections.includes(section.id);
                return (
                  <section key={section.id} className={cn("rounded-lg border p-4", relevant ? "border-primary/40 bg-primary/[0.055]" : "bg-muted/35")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{section.label}</p>
                      {relevant ? <Badge variant="success">Rule đang sử dụng</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-foreground/85">{section.text}</p>
                  </section>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">Nội dung lấy từ tài liệu luật của dự án; knowledge base hiện ở trạng thái draft.</p>
              <Button asChild variant="outline" size="sm">
                <a href={provision.officialUrl} target="_blank" rel="noreferrer">Mở văn bản trên Cổng Chính phủ ↗</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">Rule hệ thống này không viện dẫn trực tiếp một điều luật.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function questionRuleId(questionId: string, answers: Answers): string {
  if (questionId === "mentalState" && answers.mentalState === "not-lucid") return "R-B04";
  if (questionId === "influence" && (answers.influence === "deception" || answers.influence === "threat")) return "R-B04";
  if (questionId === "guardianConsent" && answers.guardianConsent === false) return "R-B06";

  const mappings: Record<string, string> = {
    willType: "ARTICLE-627",
    age: "R-B05",
    mentalState: "R-B01",
    influence: "R-B01",
    prohibitedContent: "R-B02",
    physicalLimitation: "R-B07",
    literacy: "R-B07",
    preparedByWitness: "R-B07",
    notarized: "R-B07",
    formalDefect: "FORM-ASSESSMENT-ACCEPTED",
    guardianConsent: "R-B05",
    witnessCount: "R-B09",
    witnessesRecorded: "R-B09",
    witnessesSigned: "R-B09",
    certifiedDays: "R-B09",
    aliveAfterThreeMonths: "R-B08",
    mentalAfterThreeMonths: "R-B08",
  };
  return mappings[questionId] ?? "R-B03";
}

function sortTraces(traces: InferenceTrace[]): InferenceTrace[] {
  const priorities: Record<string, number> = {
    "FORM-ASSESSMENT-ACCEPTED": 10,
    "R-B01": 10,
    "R-B05": 10,
    "R-B07": 10,
    "R-B09": 10,
    "R-B02": 20,
    "R-B03": 30,
    "R-B04": 30,
    "R-B06": 30,
    "R-B08": 40,
    "SYSTEM-CONFLICT": 50,
  };
  return [...traces].sort((left, right) => (priorities[left.ruleId] ?? 25) - (priorities[right.ruleId] ?? 25));
}

function conclusionLabel(predicate: string, value: string): string {
  const labels: Record<string, string> = {
    "valid-intention": "Ý chí lập di chúc hợp lệ",
    "valid-form-requirements": "Điều kiện hình thức đã đạt",
    "valid-content-and-form": "Nội dung và hình thức hợp lệ",
    "valid-will": value === "true" ? "Di chúc hợp pháp" : "Di chúc không hợp pháp",
    "minor-special-requirement": "Yêu cầu riêng theo độ tuổi đã được đánh giá",
    "accessibility-form-requirement": "Yêu cầu hình thức đặc biệt đã được đánh giá",
    "oral-form-requirement": "Yêu cầu hình thức của di chúc miệng đã đạt",
    "will-effect-status": "Trạng thái hiệu lực của di chúc đã thay đổi",
    "will-currently-effective": value === "true" ? "Di chúc đang có hiệu lực" : "Di chúc không còn hiệu lực",
  };
  return labels[predicate] ?? `Suy ra ${predicate} = ${value}`;
}

function supportLabel(support: string, facts: ApiFact[]): string {
  const fact = facts.find((candidate) => candidate.id === support);
  if (fact) return factLabel(fact);

  const derivedLabels: Record<string, string> = {
    "valid-intention=true": "Kết luận trước đó: ý chí lập di chúc hợp lệ",
    "valid-content-and-form=true": "Kết luận trước đó: nội dung và hình thức hợp lệ",
    "minor-special-requirement=satisfied": "Yêu cầu riêng theo độ tuổi đã đạt",
    "minor-special-requirement=failed": "Yêu cầu riêng theo độ tuổi không đạt",
    "accessibility-form-requirement=satisfied": "Yêu cầu hình thức đặc biệt đã đạt",
    "oral-form-requirement=satisfied": "Yêu cầu hình thức của di chúc miệng đã đạt",
    "will-effect-status=automatically-revoked": "Di chúc miệng đã mặc nhiên bị hủy bỏ",
  };
  if (derivedLabels[support]) return derivedLabels[support];

  const supportingRule = getRuleExplanation(support);
  if (supportingRule) return `Kết luận được tạo bởi ${support}: ${supportingRule.conclusion}`;
  return support;
}

function buildQuestions(answers: Answers): Question[] {
  const questions = [...baseQuestions];
  const age = typeof answers.age === "number" ? answers.age : undefined;
  if (age !== undefined && age >= 15 && age < 18) questions.push(guardianQuestion);

  if (answers.willType === "written") {
    questions.push(...writtenQuestions);
    const accessibility = answers.physicalLimitation === true || answers.literacy === "illiterate";
    questions.push(...(accessibility ? accessibilityQuestions : [formalQuestion]));
  }

  if (answers.willType === "oral") {
    questions.push(...oralQuestions);
    if (answers.aliveAfterThreeMonths === true) questions.push(afterThreeMonthsQuestion);
  }
  return questions;
}

function buildFacts(answers: Answers): ApiFact[] {
  const facts: ApiFact[] = [];
  const add = (predicate: string, value: Answer) => {
    if (value !== undefined) facts.push({ id: `fact-${predicate}`, predicate, value });
  };

  add("will-type", answers.willType);
  add("testator-age", answers.age);
  add("testator-mental-state", answers.mentalState);
  add("undue-influence", answers.influence);
  add("prohibited-content", answers.prohibitedContent);

  const age = typeof answers.age === "number" ? answers.age : undefined;
  if (age !== undefined && age >= 15 && age < 18) add("guardian-consent", answers.guardianConsent);

  if (answers.willType === "written") {
    add("physical-limitation", answers.physicalLimitation);
    add("testator-literacy", answers.literacy);
    const accessibility = answers.physicalLimitation === true || answers.literacy === "illiterate";
    if (accessibility) {
      add("prepared-by-witness", answers.preparedByWitness);
      add("notarized-or-certified", answers.notarized);
    } else {
      add("formal-defect", answers.formalDefect);
    }
  }

  if (answers.willType === "oral") {
    add("witness-count", answers.witnessCount);
    add("witnesses-recorded", answers.witnessesRecorded);
    add("witnesses-signed", answers.witnessesSigned);
    add("certified-within-days", answers.certifiedDays);
    add("testator-alive-after-three-months", answers.aliveAfterThreeMonths);
    if (answers.aliveAfterThreeMonths === true) add("testator-mental-state-after-three-months", answers.mentalAfterThreeMonths);
  }
  return facts;
}

function factLabel(fact: ApiFact): string {
  const labels: Record<string, string> = {
    "will-type": fact.value === "written" ? "Di chúc bằng văn bản" : "Di chúc bằng miệng",
    "testator-age": `Người lập ${fact.value} tuổi`,
    "testator-mental-state": fact.value === "lucid" ? "Người lập minh mẫn" : "Người lập không minh mẫn",
    "undue-influence": fact.value === "none" ? "Không phát hiện tác động trái ý chí" : `Tác động trái ý chí: ${fact.value}`,
    "prohibited-content": fact.value === "not-detected" ? "Không phát hiện nội dung bị cấm" : "Phát hiện nội dung bị cấm",
    "formal-defect": fact.value === "not-detected" ? "Không phát hiện lỗi hình thức" : "Phát hiện lỗi hình thức",
    "guardian-consent": fact.value ? "Người giám hộ đã đồng ý" : "Người giám hộ không đồng ý",
    "physical-limitation": fact.value ? "Có hạn chế thể chất" : "Không hạn chế thể chất",
    "testator-literacy": fact.value === "literate" ? "Người lập biết chữ" : "Người lập không biết chữ",
    "prepared-by-witness": fact.value ? "Có người làm chứng lập văn bản" : "Không có người làm chứng lập văn bản",
    "notarized-or-certified": fact.value ? "Đã công chứng/chứng thực" : "Chưa công chứng/chứng thực",
    "witness-count": `${fact.value} người làm chứng`,
    "witnesses-recorded": fact.value ? "Lời di chúc đã được ghi chép" : "Lời di chúc chưa được ghi chép",
    "witnesses-signed": fact.value ? "Người làm chứng đã ký/điểm chỉ" : "Người làm chứng chưa ký/điểm chỉ",
    "certified-within-days": `Chứng nhận sau ${fact.value} ngày`,
    "testator-alive-after-three-months": fact.value ? "Còn sống sau ba tháng" : "Không còn sống sau ba tháng",
    "testator-mental-state-after-three-months": fact.value === "lucid" ? "Minh mẫn sau ba tháng" : "Không minh mẫn sau ba tháng",
  };
  return labels[fact.predicate] ?? `${fact.predicate}: ${String(fact.value)}`;
}

function resultTitle(value: InferenceRun["results"][number]["value"]): string {
  return { true: "Có đủ căn cứ hợp pháp", false: "Có căn cứ không hợp pháp", unknown: "Chưa đủ dữ kiện", conflict: "Dữ kiện đang mâu thuẫn" }[value];
}

function resultDescription(value: InferenceRun["results"][number]["value"]): string {
  return {
    true: "Các dữ kiện và điều kiện pháp lý hiện có đủ để hệ thống kết luận di chúc hợp pháp.",
    false: "Một hoặc nhiều điều kiện pháp lý không được đáp ứng nên hệ thống kết luận di chúc không hợp pháp.",
    unknown: "CLIPS không suy đoán dữ kiện vắng mặt. Hãy bổ sung các mục bên dưới.",
    conflict: "Working memory chứa các kết luận đối nghịch cần được kiểm tra lại.",
  }[value];
}

function resultStatusLabel(value: InferenceRun["results"][number]["value"]): string {
  return {
    true: "Hợp pháp",
    false: "Không hợp pháp",
    unknown: "Chưa đủ dữ kiện",
    conflict: "Mâu thuẫn",
  }[value];
}

function resultTone(value: InferenceRun["results"][number]["value"]): string {
  return { true: "border-emerald-200 bg-emerald-50 text-emerald-950", false: "border-red-200 bg-red-50 text-red-950", unknown: "border-amber-200 bg-amber-50 text-amber-950", conflict: "border-violet-200 bg-violet-50 text-violet-950" }[value];
}

function resultBadge(value: InferenceRun["results"][number]["value"]): "success" | "destructive" | "warning" | "secondary" {
  return { true: "success", false: "destructive", unknown: "warning", conflict: "secondary" }[value] as "success" | "destructive" | "warning" | "secondary";
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
