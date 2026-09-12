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
type PortionScenario = "undisposed" | "effective" | "dead" | "organization" | "disqualified" | "refused";
interface PortionDraft { id: string; name: string; scenario?: PortionScenario; will?: string; beneficiary: string }

const scenarios: Array<{ id: PortionScenario; title: string; description: string; ruleId: string }> = [
  { id: "undisposed", title: "Chưa được định đoạt", description: "Phần này không nằm trong tập định đoạt đã khai đầy đủ.", ruleId: "R-A06" },
  { id: "effective", title: "Định đoạt có hiệu lực", description: "Phần được chỉ định cho người hưởng và định đoạt còn hiệu lực.", ruleId: "R-A03" },
  { id: "dead", title: "Người hưởng đã chết", description: "Người hưởng chết trước hoặc cùng thời điểm người lập di chúc.", ruleId: "R-A04" },
  { id: "organization", title: "Tổ chức không còn", description: "Tổ chức không còn tồn tại khi mở thừa kế.", ruleId: "R-A04" },
  { id: "disqualified", title: "Không có quyền hưởng", description: "Người hưởng bị loại trừ và không thuộc ngoại lệ.", ruleId: "R-A05a" },
  { id: "refused", title: "Đã từ chối nhận", description: "Người hưởng có việc từ chối nhận di sản hợp lệ.", ruleId: "R-A05b" },
];

const inheritancePredicates = new Set([
  "has-will", "estate-portion", "applicable-will", "portion-disposed", "disposition-beneficiary",
  "disposition-status", "disposition-set-complete", "beneficiary-life-status", "beneficiary-disqualified",
  "disqualification-exception", "valid-refusal",
  "estate-portion-label",
]);

export function InheritanceTypeWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const stableToken = `draft-${useId().toLowerCase().replace(/[^a-z0-9]/g, "") || "case"}`;
  const caseId = useRef(initialCase?.id ?? `case-${stableToken}`);
  const caseCreated = useRef(Boolean(initialCase));
  const willSubjects = useMemo(() => [...new Set((initialCase?.facts ?? []).flatMap((fact) =>
    fact.predicate === "will-type" && fact.subject ? [fact.subject] : [],
  ))], [initialCase?.facts]);
  const initialState = useMemo(() => restorePortions(initialCase?.facts ?? [], stableToken, willSubjects[0]), [initialCase?.facts, stableToken, willSubjects]);
  const nextPortion = useRef(initialState.portions.length + 1);
  const [hasWill, setHasWill] = useState(initialState.hasWill);
  const [portions, setPortions] = useState<PortionDraft[]>(initialState.portions);
  const [activePortionId, setActivePortionId] = useState(initialState.portions[0]?.id);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [technicalMode, setTechnicalMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const activePortion = portions.find((portion) => portion.id === activePortionId) ?? portions[0];
  const moduleFacts = useMemo(() => buildFacts(caseId.current, hasWill, portions), [hasWill, portions]);
  const resultsBySubject = useMemo(() => new Map(run?.results.filter((result) => result.predicate === "inheritance-regime").map((result) => [result.subject, result]) ?? []), [run]);
  const activeTraces = run?.traces.filter((trace) => trace.subject === activePortion?.id) ?? [];

  function addPortion() {
    const sequence = nextPortion.current++;
    const id = `portion-${stableToken}-${sequence}`;
    const portion = { id, name: `Phần di sản ${portions.length + 1}`, will: willSubjects[0], beneficiary: `beneficiary-${stableToken}-${sequence}` };
    setPortions((current) => [...current, portion]);
    setActivePortionId(id);
    setRun(undefined);
  }
  function updatePortion(update: Partial<PortionDraft>) {
    if (!activePortion) return;
    setPortions((current) => current.map((portion) => portion.id === activePortion.id ? { ...portion, ...update } : portion));
    setRun(undefined);
  }
  function removePortion(portionId: string) {
    setPortions((current) => { const remaining = current.filter((portion) => portion.id !== portionId); setActivePortionId(remaining[0]?.id); return remaining; });
    setRun(undefined);
  }
  function runInference() {
    startTransition(async () => {
      setError(undefined);
      try {
        if (!caseCreated.current) {
          await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) });
          caseCreated.current = true;
        } else await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
        const retained = (initialCase?.facts ?? []).filter((fact) => !inheritancePredicates.has(fact.predicate));
        await requestJson(`/api/cases/${caseId.current}/facts`, { method: "PUT", body: JSON.stringify({ subject: caseId.current, facts: [...retained, ...moduleFacts] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${caseId.current}/inference/inheritance-type`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }
  const ready = hasWill !== undefined && portions.length > 0 && (hasWill === false || portions.every((portion) => portion.scenario && portion.will));

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card/80 backdrop-blur"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · nhiều phần di sản · CLIPS forward chaining</p></div>
      <div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Mô-đun</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge><Button variant={technicalMode ? "secondary" : "outline"} size="sm" onClick={() => setTechnicalMode((value) => !value)}>Kỹ thuật</Button></div>
    </div></header>
    <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)_390px]">
      <aside className="space-y-4">
        <Card><CardHeader><CardTitle>Hồ sơ</CardTitle><CardDescription>Dữ kiện chung cho mọi phần di sản.</CardDescription></CardHeader><CardContent className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} /></label>
          <div><p className="text-sm font-medium">Người chết có để lại di chúc?</p><div className="mt-2 flex gap-2"><Button variant={hasWill === true ? "secondary" : "outline"} onClick={() => { setHasWill(true); setRun(undefined); }}>Có</Button><Button variant={hasWill === false ? "secondary" : "outline"} onClick={() => { setHasWill(false); setRun(undefined); }}>Không</Button></div></div>
          {hasWill && willSubjects.length === 0 ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Cần <Link className="font-semibold underline" href={`/cases/${caseId.current}/modules/will-validity`}>nhập dữ kiện di chúc</Link> trước.</p> : null}
        </CardContent></Card>
        <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Các phần di sản</CardTitle><Badge variant="secondary">{portions.length}</Badge></div><CardDescription>Chọn một phần để sửa.</CardDescription></CardHeader><CardContent className="space-y-2">
          {portions.map((portion, index) => { const result = resultsBySubject.get(portion.id); return <button key={portion.id} type="button" onClick={() => setActivePortionId(portion.id)} className={cn("w-full rounded-lg border p-3 text-left", activePortion?.id === portion.id && "border-primary bg-primary/[0.05]")}><span className="flex justify-between gap-2 text-sm font-semibold"><span>{portion.name || `Phần ${index + 1}`}</span>{result ? <Badge variant={result.value === "testamentary" ? "success" : "warning"}>{shortResult(result.value)}</Badge> : null}</span><span className="mt-1 block text-xs text-muted-foreground">{scenarioTitle(portion.scenario)}</span></button>; })}
          <Button className="w-full" variant="outline" onClick={addPortion}>+ Thêm phần di sản</Button>
        </CardContent></Card>
      </aside>
      <main className="space-y-4">
        {activePortion ? <Card><CardHeader><div className="flex items-center justify-between gap-3"><Badge variant="outline">{activePortion.id}</Badge><Button variant="ghost" size="sm" onClick={() => removePortion(activePortion.id)}>Xóa phần này</Button></div><CardTitle>Chỉnh sửa {activePortion.name}</CardTitle><CardDescription>Một phần là đơn vị nhỏ nhất nhận một kết luận chế độ thừa kế.</CardDescription></CardHeader><CardContent className="space-y-5">
          <label className="block max-w-md space-y-2 text-sm font-medium">Tên hiển thị<Input value={activePortion.name} maxLength={80} onChange={(event) => updatePortion({ name: event.target.value })} /></label>
          {hasWill === false ? <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4"><p className="font-semibold">R-A01 áp dụng cho phần này</p><p className="mt-1 text-sm text-muted-foreground">Không có di chúc nên mỗi phần đã khai được xét theo pháp luật.</p><Button className="mt-3" variant="outline" size="sm" onClick={() => setSelectedRuleId("R-A01")}>Xem Điều 649–650</Button></div> : hasWill === true ? <>
            <div className="grid gap-3 sm:grid-cols-2">{scenarios.map((item) => <button key={item.id} type="button" disabled={willSubjects.length === 0} onClick={() => updatePortion({ scenario: item.id, will: activePortion.will ?? willSubjects[0] })} className={cn("rounded-xl border p-4 text-left disabled:opacity-45", activePortion.scenario === item.id && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="flex justify-between gap-2 font-semibold"><span>{item.title}</span><Badge variant="outline">{item.ruleId}</Badge></span><span className="mt-2 block text-sm text-muted-foreground">{item.description}</span></button>)}</div>
            {willSubjects.length ? <div><p className="text-sm font-medium">Di chúc áp dụng</p><div className="mt-2 flex flex-wrap gap-2">{willSubjects.map((will) => <Button key={will} variant={activePortion.will === will ? "secondary" : "outline"} onClick={() => updatePortion({ will })}>{will}</Button>)}</div></div> : null}
            {activePortion.scenario ? <Button variant="outline" onClick={() => setSelectedRuleId(scenarios.find((item) => item.id === activePortion.scenario)?.ruleId)}>Xem căn cứ của lựa chọn</Button> : null}
          </> : <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Hãy xác định có hay không có di chúc ở cột bên trái.</p>}
        </CardContent></Card> : <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Chưa có phần di sản. Hãy thêm một phần để bắt đầu.</CardContent></Card>}
        {technicalMode ? <TechnicalFacts facts={moduleFacts} /> : null}
        <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu và suy luận ${portions.length} phần`}</Button></div>
      </main>
      <aside><Card className="sticky top-4"><CardHeader><div className="flex items-center justify-between"><Badge variant="outline">Kết quả theo phần</Badge>{run ? <span className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleTimeString("vi-VN")}</span> : null}</div><CardTitle className="pt-2">{run ? `${run.results.filter((item) => item.predicate === "inheritance-regime").length} kết luận` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Mỗi phần có result và trace độc lập.</CardDescription></CardHeader><CardContent className="space-y-4">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
        {run ? portions.map((portion) => { const result = resultsBySubject.get(portion.id); const missing = run.missing.filter((item) => item.subject === portion.id); return <div key={portion.id} className="rounded-xl border p-4"><div className="flex justify-between gap-2"><p className="font-semibold">{portion.name}</p>{result ? <Badge variant={result.value === "testamentary" ? "success" : result.value === "statutory" ? "warning" : "secondary"}>{resultLabel(result.value)}</Badge> : null}</div>{result ? <p className="mt-2 text-xs text-muted-foreground">Dẫn xuất: {result.derivations.join(", ")}</p> : null}{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<Button className="mt-2 px-0" variant="ghost" size="sm" onClick={() => setActivePortionId(portion.id)}>Xem/sửa phần này</Button></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Kết quả sẽ xuất hiện tại đây.</div>}
        {activeTraces.length ? <div><p className="text-sm font-semibold">Trace của phần đang chọn</p><ol className="mt-2 space-y-2">{activeTraces.map((trace, index) => { const explanation = getRuleExplanation(trace.ruleId); return <li key={`${trace.ruleId}-${index}`} className="rounded-lg bg-muted/60 p-3"><div className="flex gap-2"><Badge>{index + 1}</Badge><Badge variant="outline">{trace.ruleId}</Badge></div><p className="mt-2 text-sm">{explanation?.conclusion ?? trace.conclusionPredicate}</p>{explanation ? <Button className="mt-1 px-0" variant="ghost" size="sm" onClick={() => setSelectedRuleId(trace.ruleId)}>Đọc điều luật</Button> : null}</li>; })}</ol></div> : null}
      </CardContent></Card></aside>
    </div>
    <footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Rule TEAM_REVIEW chưa được phê duyệt · Không phải tư vấn pháp lý</footer>
    <LegalRuleDialog ruleId={selectedRuleId} onOpenChange={(open) => { if (!open) setSelectedRuleId(undefined); }} />
  </div>;
}

function buildFacts(caseId: string, hasWill: boolean | undefined, portions: PortionDraft[]): ApiFact[] {
  if (hasWill === undefined) return [];
  const facts: ApiFact[] = [{ id: "inheritance-has-will", subject: caseId, predicate: "has-will", value: hasWill }];
  for (const portion of portions) {
    const prefix = portion.id;
    facts.push({ id: `${prefix}-marker`, subject: portion.id, predicate: "estate-portion", value: true });
    facts.push({ id: `${prefix}-label`, subject: portion.id, predicate: "estate-portion-label", value: portion.name || "Phần di sản" });
    if (!hasWill || !portion.scenario || !portion.will) continue;
    facts.push({ id: `${prefix}-will`, subject: portion.id, predicate: "applicable-will", value: portion.will });
    if (portion.scenario === "undisposed") { facts.push({ id: `${prefix}-complete`, subject: portion.id, predicate: "disposition-set-complete", value: true }, { id: `${prefix}-disposed`, subject: portion.id, predicate: "portion-disposed", value: false }); continue; }
    facts.push({ id: `${prefix}-disposed`, subject: portion.id, predicate: "portion-disposed", value: true }, { id: `${prefix}-beneficiary`, subject: portion.id, predicate: "disposition-beneficiary", value: portion.beneficiary }, { id: `${prefix}-status`, subject: portion.id, predicate: "disposition-status", value: portion.scenario === "effective" ? "effective" : "ineffective-beneficiary" });
    if (portion.scenario === "effective") continue;
    facts.push({ id: `${prefix}-complete`, subject: portion.id, predicate: "disposition-set-complete", value: true });
    if (portion.scenario === "dead") facts.push({ id: `${prefix}-life`, subject: portion.beneficiary, predicate: "beneficiary-life-status", value: "dead-before-or-same" });
    if (portion.scenario === "organization") facts.push({ id: `${prefix}-life`, subject: portion.beneficiary, predicate: "beneficiary-life-status", value: "organization-no-longer-exists" });
    if (portion.scenario === "disqualified") facts.push({ id: `${prefix}-disqualified`, subject: portion.beneficiary, predicate: "beneficiary-disqualified", value: true }, { id: `${prefix}-exception`, subject: portion.beneficiary, predicate: "disqualification-exception", value: false });
    if (portion.scenario === "refused") facts.push({ id: `${prefix}-refusal`, subject: portion.beneficiary, predicate: "valid-refusal", value: true });
  }
  return facts;
}

function restorePortions(facts: ApiFact[], token: string, defaultWill?: string): { hasWill?: boolean; portions: PortionDraft[] } {
  const hasWillFact = facts.find((fact) => fact.predicate === "has-will");
  const subjects = [...new Set(facts.flatMap((fact) => fact.predicate === "estate-portion" && fact.subject ? [fact.subject] : []))];
  const portions = subjects.map((id, index) => {
    const own = facts.filter((fact) => fact.subject === id);
    const beneficiary = String(own.find((fact) => fact.predicate === "disposition-beneficiary")?.value ?? `beneficiary-${token}-${index + 1}`);
    const beneficiaryFacts = facts.filter((fact) => fact.subject === beneficiary);
    let scenario: PortionScenario | undefined;
    if (own.some((fact) => fact.predicate === "portion-disposed" && fact.value === false)) scenario = "undisposed";
    else if (beneficiaryFacts.some((fact) => fact.predicate === "valid-refusal" && fact.value === true)) scenario = "refused";
    else if (beneficiaryFacts.some((fact) => fact.predicate === "beneficiary-disqualified" && fact.value === true)) scenario = "disqualified";
    else if (beneficiaryFacts.some((fact) => fact.predicate === "beneficiary-life-status" && fact.value === "dead-before-or-same")) scenario = "dead";
    else if (beneficiaryFacts.some((fact) => fact.predicate === "beneficiary-life-status" && fact.value === "organization-no-longer-exists")) scenario = "organization";
    else if (own.some((fact) => fact.predicate === "disposition-status" && fact.value === "effective")) scenario = "effective";
    return { id, name: String(own.find((fact) => fact.predicate === "estate-portion-label")?.value ?? `Phần di sản ${index + 1}`), scenario, will: String(own.find((fact) => fact.predicate === "applicable-will")?.value ?? defaultWill ?? "") || undefined, beneficiary };
  });
  return { hasWill: typeof hasWillFact?.value === "boolean" ? hasWillFact.value : undefined, portions: portions.length ? portions : [{ id: `portion-${token}-0`, name: "Phần di sản 1", will: defaultWill, beneficiary: `beneficiary-${token}-0` }] };
}

function TechnicalFacts({ facts }: { facts: ApiFact[] }) { return <Card><CardHeader><CardTitle>Working memory</CardTitle><CardDescription>{facts.length} asserted facts.</CardDescription></CardHeader><CardContent><ul className="space-y-2">{facts.map((fact) => <li key={fact.id}><code className="block break-all rounded bg-muted p-2 text-xs">{fact.subject}: {fact.predicate}={String(fact.value)}</code></li>)}</ul></CardContent></Card>; }
function scenarioTitle(value?: PortionScenario): string { return scenarios.find((item) => item.id === value)?.title ?? "Chưa mô tả"; }
function shortResult(value: string): string { return value === "statutory" ? "Pháp luật" : value === "testamentary" ? "Di chúc" : value; }
function resultLabel(value: string): string { return value === "statutory" ? "Theo pháp luật" : value === "testamentary" ? "Theo di chúc" : value === "conflict" ? "Mâu thuẫn" : "Chưa rõ"; }
function missingLabel(predicate: string): string { return ({ "valid-will": "tính hợp pháp của di chúc", "applicable-will": "di chúc áp dụng", "portion-disposed": "trạng thái định đoạt", "disposition-details": "chi tiết định đoạt", "beneficiary-outcome": "trạng thái người hưởng", "has-will": "có/không có di chúc", "unresolved-rule-path": "đường suy luận phù hợp" } as Record<string, string>)[predicate] ?? predicate; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
