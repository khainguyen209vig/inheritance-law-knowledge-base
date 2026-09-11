"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
type Scenario = "no-will" | "undisposed" | "effective" | "dead" | "organization" | "disqualified" | "refused";

const scenarios: Array<{ id: Scenario; title: string; description: string; ruleId: string }> = [
  { id: "no-will", title: "Không có di chúc", description: "Người chết không để lại di chúc.", ruleId: "R-A01" },
  { id: "undisposed", title: "Phần chưa được định đoạt", description: "Có di chúc nhưng phần đang xét không nằm trong tập định đoạt đầy đủ.", ruleId: "R-A06" },
  { id: "effective", title: "Định đoạt cho người hưởng", description: "Phần đang xét được định đoạt và việc chỉ định người hưởng có hiệu lực.", ruleId: "R-A03" },
  { id: "dead", title: "Người hưởng đã chết", description: "Người hưởng chết trước hoặc cùng thời điểm với người lập di chúc.", ruleId: "R-A04" },
  { id: "organization", title: "Tổ chức không còn tồn tại", description: "Tổ chức được chỉ định không còn tồn tại khi mở thừa kế.", ruleId: "R-A04" },
  { id: "disqualified", title: "Người hưởng không có quyền", description: "Người hưởng bị loại trừ và không thuộc ngoại lệ.", ruleId: "R-A05a" },
  { id: "refused", title: "Người hưởng từ chối", description: "Có việc từ chối nhận di sản hợp lệ.", ruleId: "R-A05b" },
];

const inheritancePredicates = new Set([
  "has-will", "estate-portion", "applicable-will", "portion-disposed", "disposition-beneficiary",
  "disposition-status", "disposition-set-complete", "beneficiary-life-status", "beneficiary-disqualified",
  "disqualification-exception", "valid-refusal",
]);

export function InheritanceTypeWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const stableToken = `draft-${useId().toLowerCase().replace(/[^a-z0-9]/g, "") || "case"}`;
  const willSubjects = useMemo(() => [...new Set((initialCase?.facts ?? [])
    .filter((fact) => fact.predicate === "will-type" && fact.subject)
    .map((fact) => fact.subject as string))], [initialCase?.facts]);
  const [scenario, setScenario] = useState<Scenario>();
  const [selectedWill, setSelectedWill] = useState(willSubjects[0]);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [technicalMode, setTechnicalMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const caseId = useRef(initialCase?.id ?? `case-${stableToken}`);
  const portion = useRef(initialCase?.subject ?? `portion-${stableToken}`);
  const beneficiary = useRef(`beneficiary-${stableToken}`);
  const caseCreated = useRef(Boolean(initialCase));

  const moduleFacts = useMemo(() => buildFacts(caseId.current, portion.current, beneficiary.current, selectedWill, scenario), [scenario, selectedWill]);
  const result = run?.results.find((item) => item.subject === portion.current && item.predicate === "inheritance-regime");
  const traces = run?.traces.filter((trace) => trace.subject === portion.current) ?? [];

  function runInference() {
    startTransition(async () => {
      setError(undefined);
      try {
        if (!caseCreated.current) {
          await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) });
          caseCreated.current = true;
        } else {
          await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
        }
        const retained = (initialCase?.facts ?? []).filter((fact) => !inheritancePredicates.has(fact.predicate));
        await requestJson(`/api/cases/${caseId.current}/facts`, {
          method: "PUT",
          body: JSON.stringify({ subject: portion.current, facts: [...retained, ...moduleFacts] }),
        });
        const inferenceRun = await requestJson<InferenceRun>(
          `/api/cases/${caseId.current}/inference/inheritance-type`,
          { method: "POST", body: "{}" },
        );
        setRun(inferenceRun);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="font-semibold">Inheritance Reasoner</p>
            <p className="text-xs text-muted-foreground">{module.title} · CLIPS · Forward chaining theo từng phần di sản</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link href="/modules">Các mô-đun</Link></Button>
            <Badge variant="warning">Có rule TEAM_REVIEW</Badge>
            <Button variant={technicalMode ? "secondary" : "outline"} size="sm" onClick={() => setTechnicalMode((value) => !value)}>Kỹ thuật</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="space-y-5">
          <Card>
            <CardHeader>
              <Badge variant="outline">Một phần di sản nguyên tử</Badge>
              <CardTitle className="pt-2">Mô tả trạng thái của phần di sản đang xét</CardTitle>
              <CardDescription>Mỗi người hưởng chung được tách thành một phần riêng. Cách này cho phép cùng một hồ sơ có cả phần theo di chúc và phần theo pháp luật.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="block max-w-xl space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} /></label>
              <div className="grid gap-3 md:grid-cols-2">
                {scenarios.map((item) => {
                  const selected = scenario === item.id;
                  const needsWill = item.id !== "no-will";
                  return (
                    <button key={item.id} type="button" disabled={needsWill && willSubjects.length === 0} aria-pressed={selected}
                      onClick={() => { setScenario(item.id); setRun(undefined); }}
                      className={cn("rounded-xl border p-4 text-left transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-45", selected && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>
                      <span className="flex items-center justify-between gap-3 font-semibold"><span>{item.title}</span><Badge variant="outline">{item.ruleId}</Badge></span>
                      <span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                    </button>
                  );
                })}
              </div>

              {willSubjects.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  Hồ sơ chưa có dữ kiện di chúc. Bạn vẫn có thể xét nhánh “Không có di chúc”; để dùng các nhánh còn lại, hãy <Link className="font-semibold underline" href={`/cases/${caseId.current}/modules/will-validity`}>nhập dữ kiện tính hợp pháp của di chúc</Link> trước.
                </div>
              ) : scenario && scenario !== "no-will" ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Di chúc áp dụng cho phần này</p>
                  <div className="flex flex-wrap gap-2">{willSubjects.map((will) => <Button key={will} type="button" variant={selectedWill === will ? "secondary" : "outline"} onClick={() => setSelectedWill(will)}>{will}</Button>)}</div>
                  <p className="text-xs text-muted-foreground">Mô-đun này tự chạy lại các rule R-B để lấy kết luận hợp pháp; không yêu cầu người dùng tự khai <code>valid-will</code>.</p>
                </div>
              ) : null}

              {scenario ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                  <Button variant="outline" onClick={() => setSelectedRuleId(scenarios.find((item) => item.id === scenario)?.ruleId)}>Xem căn cứ đang kiểm tra</Button>
                  <Button disabled={isPending || moduleFacts.length === 0 || (scenario !== "no-will" && !selectedWill)} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : "Lưu và chạy suy luận"}</Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {technicalMode ? <TechnicalFacts facts={moduleFacts} /> : null}
        </main>

        <aside>
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-2"><Badge variant="outline">Kết quả theo phần</Badge>{run ? <span className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleTimeString("vi-VN")}</span> : null}</div>
              <CardTitle className="pt-2">{result ? resultLabel(result.value) : "Chưa chạy CLIPS"}</CardTitle>
              <CardDescription>{result ? resultDescription(result.value) : "Chọn trạng thái sát với hồ sơ và chạy suy luận."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
              {result ? <div className={cn("rounded-xl border p-4", resultTone(result.value))}><Badge variant={result.value === "statutory" ? "warning" : result.value === "testamentary" ? "success" : "outline"}>{result.value}</Badge><p className="mt-3 text-sm">Dẫn xuất bởi {result.derivations.join(", ")}.</p></div> : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Kết luận sẽ xuất hiện tại đây.</div>}
              {run?.missing.length ? <div><p className="text-sm font-semibold">Dữ kiện cần bổ sung</p><ul className="mt-2 space-y-2">{run.missing.map((item) => <li key={`${item.predicate}-${item.subject}`} className="rounded-lg bg-amber-50 p-2 text-sm text-amber-950">{missingLabel(item.predicate)}</li>)}</ul></div> : null}
              {traces.length ? <div><p className="text-sm font-semibold">Luồng suy luận</p><ol className="mt-3 space-y-3">{traces.map((trace, index) => { const explanation = getRuleExplanation(trace.ruleId); return <li key={`${trace.ruleId}-${index}`} className="rounded-lg border p-3"><div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index + 1}</span><Badge variant="outline">{trace.ruleId}</Badge></div><p className="mt-2 text-sm font-medium">{explanation?.conclusion ?? `${trace.conclusionPredicate} = ${trace.conclusionValue}`}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{explanation?.reasoning}</p>{explanation ? <Button className="mt-2 px-0" variant="ghost" size="sm" onClick={() => setSelectedRuleId(trace.ruleId)}>Đọc điều luật</Button> : null}</li>; })}</ol></div> : null}
              {run ? <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">KB: {run.knowledgeBaseVersion}<br />Snapshot và trace đã lưu trong SQLite.</p> : null}
            </CardContent>
          </Card>
        </aside>
      </div>
      <footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Các rule TEAM_REVIEW chưa được chuyên gia pháp lý phê duyệt · Không phải tư vấn pháp lý</footer>
      <LegalRuleDialog ruleId={selectedRuleId} onOpenChange={(open) => { if (!open) setSelectedRuleId(undefined); }} />
    </div>
  );
}

function buildFacts(caseId: string, portion: string, beneficiary: string, will: string | undefined, scenario: Scenario | undefined): ApiFact[] {
  if (!scenario) return [];
  const facts: ApiFact[] = [
    { id: "inheritance-estate-portion", subject: portion, predicate: "estate-portion", value: true },
    { id: "inheritance-has-will", subject: caseId, predicate: "has-will", value: scenario !== "no-will" },
  ];
  if (scenario === "no-will" || !will) return facts;
  facts.push({ id: "inheritance-applicable-will", subject: portion, predicate: "applicable-will", value: will });
  if (scenario === "undisposed") return [...facts,
    { id: "inheritance-disposition-complete", subject: portion, predicate: "disposition-set-complete", value: true },
    { id: "inheritance-portion-disposed", subject: portion, predicate: "portion-disposed", value: false },
  ];
  facts.push(
    { id: "inheritance-portion-disposed", subject: portion, predicate: "portion-disposed", value: true },
    { id: "inheritance-beneficiary", subject: portion, predicate: "disposition-beneficiary", value: beneficiary },
    { id: "inheritance-disposition-status", subject: portion, predicate: "disposition-status", value: scenario === "effective" ? "effective" : "ineffective-beneficiary" },
  );
  if (scenario === "effective") return facts;
  facts.push({ id: "inheritance-disposition-complete", subject: portion, predicate: "disposition-set-complete", value: true });
  if (scenario === "dead") facts.push({ id: "inheritance-beneficiary-life", subject: beneficiary, predicate: "beneficiary-life-status", value: "dead-before-or-same" });
  if (scenario === "organization") facts.push({ id: "inheritance-beneficiary-life", subject: beneficiary, predicate: "beneficiary-life-status", value: "organization-no-longer-exists" });
  if (scenario === "disqualified") facts.push(
    { id: "inheritance-beneficiary-disqualified", subject: beneficiary, predicate: "beneficiary-disqualified", value: true },
    { id: "inheritance-disqualification-exception", subject: beneficiary, predicate: "disqualification-exception", value: false },
  );
  if (scenario === "refused") facts.push({ id: "inheritance-valid-refusal", subject: beneficiary, predicate: "valid-refusal", value: true });
  return facts;
}

function TechnicalFacts({ facts }: { facts: ApiFact[] }) {
  return <Card><CardHeader><CardTitle>Working memory</CardTitle><CardDescription>Các fact của riêng mô-đun loại thừa kế.</CardDescription></CardHeader><CardContent><ul className="space-y-2">{facts.map((fact) => <li key={fact.id}><code className="block break-all rounded bg-muted p-2 text-xs">{fact.subject}: {fact.predicate}={String(fact.value)}</code></li>)}</ul></CardContent></Card>;
}

function resultLabel(value: string): string { return value === "statutory" ? "Thừa kế theo pháp luật" : value === "testamentary" ? "Thừa kế theo di chúc" : value === "conflict" ? "Dữ kiện mâu thuẫn" : "Chưa đủ dữ kiện"; }
function resultDescription(value: string): string { return value === "statutory" ? "Phần di sản đang xét đi theo nhánh thừa kế theo pháp luật." : value === "testamentary" ? "Phần di sản đang xét đi theo nhánh thừa kế theo di chúc." : "Hệ thống chưa thể đưa ra một phân loại duy nhất."; }
function resultTone(value: string): string { return value === "testamentary" ? "border-emerald-200 bg-emerald-50" : value === "statutory" ? "border-amber-200 bg-amber-50" : "bg-muted"; }
function missingLabel(predicate: string): string { return ({ "valid-will": "Chưa suy ra được tính hợp pháp của di chúc", "applicable-will": "Di chúc áp dụng", "portion-disposed": "Trạng thái định đoạt phần di sản", "disposition-details": "Chi tiết định đoạt", "disposition-set-complete": "Xác nhận tập định đoạt đã đầy đủ", "beneficiary-outcome": "Trạng thái của người hưởng", "has-will": "Có hay không có di chúc", "unresolved-rule-path": "Dữ kiện chưa khớp đường suy luận" } as Record<string, string>)[predicate] ?? predicate; }

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`);
  return data;
}
