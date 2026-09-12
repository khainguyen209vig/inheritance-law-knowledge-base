"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { limitationRequestTypeLabels, type LimitationRequestType } from "@/domain/limitation";
import { cn } from "@/lib/utils";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
interface RequestDraft { id: string; label: string; type?: LimitationRequestType; assetType?: "immovable" | "movable"; openingDate?: string }
interface OutcomeDraft { id: string; label: string; expired?: boolean; managingSearchComplete?: boolean; managingHeirId?: string; possessorSearchComplete?: boolean; qualifiedPossessorId?: string }
interface PersonOption { id: string; name: string }
type Mode = "deadline" | "outcome";

const ownedPredicates = new Set([
  "limitation-assessment-subject", "limitation-request-label", "request-type", "asset-type", "inheritance-opening-date",
  "post-limitation-assessment-subject", "estate-asset-label", "limitation-expiry-confirmed", "managing-heir-search-complete",
  "estate-managing-heir", "qualified-possessor-search-complete", "article-236-qualified-possessor",
]);

export function LimitationWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const restoredRequests = useMemo(() => restoreRequests(initialCase?.facts ?? []), [initialCase?.facts]);
  const restoredOutcomes = useMemo(() => restoreOutcomes(initialCase?.facts ?? []), [initialCase?.facts]);
  const people = useMemo(() => restorePeople(initialCase?.facts ?? []), [initialCase?.facts]);
  const [mode, setMode] = useState<Mode>("deadline");
  const [requests, setRequests] = useState<RequestDraft[]>(restoredRequests);
  const [outcomes, setOutcomes] = useState<OutcomeDraft[]>(restoredOutcomes);
  const [activeRequestId, setActiveRequestId] = useState<string | undefined>(() => restoredRequests[0]?.id);
  const [activeOutcomeId, setActiveOutcomeId] = useState<string | undefined>(() => restoredOutcomes[0]?.id);
  const [run, setRun] = useState<InferenceRun>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const activeRequest = requests.find((item) => item.id === activeRequestId) ?? requests[0];
  const activeOutcome = outcomes.find((item) => item.id === activeOutcomeId) ?? outcomes[0];
  const facts = useMemo(() => [...buildRequestFacts(requests), ...buildOutcomeFacts(outcomes)], [requests, outcomes]);
  const results = useMemo(() => new Map(run?.results.map((item) => [`${item.predicate}:${item.subject}`, item]) ?? []), [run]);
  const personNames = useMemo(() => new Map(people.map((person) => [person.id, person.name])), [people]);

  function updateRequest(update: Partial<RequestDraft>) {
    if (!activeRequest) return;
    setRequests((current) => current.map((item) => item.id === activeRequest.id ? { ...item, ...update } : item));
    setRun(undefined);
  }

  function updateOutcome(update: Partial<OutcomeDraft>) {
    if (!activeOutcome) return;
    setOutcomes((current) => current.map((item) => item.id === activeOutcome.id ? { ...item, ...update } : item));
    setRun(undefined);
  }

  function addRequest() {
    const item = newRequest(requests.length + 1);
    setRequests((current) => [...current, item]);
    setActiveRequestId(item.id);
    setRun(undefined);
  }

  function addOutcome() {
    const item = newOutcome(outcomes.length + 1);
    setOutcomes((current) => [...current, item]);
    setActiveOutcomeId(item.id);
    setRun(undefined);
  }

  function removeRequest() {
    if (!activeRequest) return;
    const next = requests.filter((item) => item.id !== activeRequest.id);
    setRequests(next);
    setActiveRequestId(next[0]?.id);
    setRun(undefined);
  }

  function removeOutcome() {
    if (!activeOutcome) return;
    const next = outcomes.filter((item) => item.id !== activeOutcome.id);
    setOutcomes(next);
    setActiveOutcomeId(next[0]?.id);
    setRun(undefined);
  }

  function runInference() {
    if (!initialCase) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = initialCase.facts.filter((fact) => !ownedPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${initialCase.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: initialCase.id, facts: [...retained, ...facts] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${initialCase.id}/inference/limitation`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }

  if (!initialCase) return <EmptyState module={module} />;

  const items = mode === "deadline" ? requests : outcomes;
  const activeId = mode === "deadline" ? activeRequest?.id : activeOutcome?.id;
  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-J01–R-J07 · Điều 623</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant={mode === "deadline" ? "default" : "outline"} onClick={() => setMode("deadline")}>Mốc thời hiệu</Button><Button size="sm" variant={mode === "outcome" ? "default" : "outline"} onClick={() => setMode("outcome")}>Sau thời hiệu</Button><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button></div></div></header>
    <main className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[290px_minmax(0,1fr)_410px]">
      <aside><Card><CardHeader><CardTitle>{mode === "deadline" ? "Các yêu cầu cần xét" : "Các phần di sản"}</CardTitle><CardDescription>{mode === "deadline" ? "Mỗi yêu cầu có loại, tài sản và mốc mở thừa kế riêng." : "Mỗi phần được đánh giá độc lập sau khi thời hiệu chia đã được xác nhận hết."}</CardDescription></CardHeader><CardContent className="space-y-2">{items.map((item) => <button key={item.id} type="button" onClick={() => mode === "deadline" ? setActiveRequestId(item.id) : setActiveOutcomeId(item.id)} className={cn("w-full rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", item.id === activeId && "border-primary bg-primary/[0.05]")}><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-xs text-muted-foreground">{mode === "deadline" && "type" in item && item.type ? limitationRequestTypeLabels[item.type] : mode === "outcome" ? "R-J05–R-J07" : "Chưa chọn loại yêu cầu"}</span></button>)}<Button className="w-full" variant="outline" onClick={mode === "deadline" ? addRequest : addOutcome}>{mode === "deadline" ? "Thêm yêu cầu" : "Thêm phần di sản"}</Button></CardContent></Card></aside>
      <section className="space-y-4">{mode === "deadline" ? <DeadlineEditor active={activeRequest} onUpdate={updateRequest} onRemove={removeRequest} onAdd={addRequest} /> : <OutcomeEditor active={activeOutcome} people={people} caseId={initialCase.id} onUpdate={updateOutcome} onRemove={removeOutcome} onAdd={addOutcome} onLaw={setSelectedRule} />}<Boundary mode={mode} /><div className="flex justify-end"><Button disabled={isPending || items.length === 0} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : "Lưu và chạy CLIPS"}</Button></div></section>
      <aside>{mode === "deadline" ? <DeadlineResults requests={requests} run={run} results={results} error={error} onLaw={setSelectedRule} /> : <OutcomeResults outcomes={outcomes} run={run} results={results} people={personNames} error={error} onLaw={setSelectedRule} />}</aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Không tự đánh giá Điều 236 hoặc tự xác nhận hết thời hiệu · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function DeadlineEditor({ active, onUpdate, onRemove, onAdd }: { active?: RequestDraft; onUpdate: (value: Partial<RequestDraft>) => void; onRemove: () => void; onAdd: () => void }) {
  if (!active) return <EmptyEditor text="Chưa có yêu cầu thời hiệu." onAdd={onAdd} />;
  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><Badge variant="outline">{active.id}</Badge><Button size="sm" variant="ghost" onClick={onRemove}>Xóa</Button></div><CardTitle className="pt-2">Dữ kiện của yêu cầu</CardTitle><CardDescription>CLIPS chọn số năm; temporal helper chỉ thực hiện phép cộng lịch.</CardDescription></CardHeader><CardContent className="space-y-5"><TextField label="Tên gợi nhớ" value={active.label} onChange={(label) => onUpdate({ label })} /><div><p className="text-sm font-medium">Loại yêu cầu</p><div className="mt-2 grid gap-2">{Object.entries(limitationRequestTypeLabels).map(([value, label]) => <Choice key={value} selected={active.type === value} onClick={() => onUpdate({ type: value as LimitationRequestType, assetType: value === "divide-estate" ? active.assetType : undefined })}>{label}</Choice>)}</div></div>{active.type === "divide-estate" ? <div><p className="text-sm font-medium">Loại di sản cần chia</p><div className="mt-2 grid gap-2 sm:grid-cols-2"><Choice selected={active.assetType === "immovable"} onClick={() => onUpdate({ assetType: "immovable" })}>Bất động sản</Choice><Choice selected={active.assetType === "movable"} onClick={() => onUpdate({ assetType: "movable" })}>Động sản</Choice></div></div> : null}<label className="block text-sm font-medium">Ngày mở thừa kế<Input className="mt-2" type="date" value={active.openingDate ?? ""} onChange={(event) => onUpdate({ openingDate: event.target.value || undefined })} /></label></CardContent></Card>;
}

function OutcomeEditor({ active, people, caseId, onUpdate, onRemove, onAdd, onLaw }: { active?: OutcomeDraft; people: PersonOption[]; caseId: string; onUpdate: (value: Partial<OutcomeDraft>) => void; onRemove: () => void; onAdd: () => void; onLaw: (rule: string) => void }) {
  if (!active) return <EmptyEditor text="Chưa có phần di sản cần đánh giá." onAdd={onAdd} />;
  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><Badge variant="warning">R-J05–R-J07</Badge><Button size="sm" variant="ghost" onClick={onRemove}>Xóa</Button></div><CardTitle className="pt-2">Hậu quả sau thời hiệu</CardTitle><CardDescription>Các xác nhận tìm kiếm đầy đủ kiểm soát việc CLIPS sử dụng phép phủ định.</CardDescription></CardHeader><CardContent className="space-y-6"><TextField label="Tên phần di sản" value={active.label} onChange={(label) => onUpdate({ label })} /><Question title="Việc hết thời hiệu chia phần di sản này đã được kiểm chứng?"><BooleanChoice value={active.expired} onChange={(expired) => onUpdate({ expired, managingSearchComplete: expired ? active.managingSearchComplete : undefined, managingHeirId: expired ? active.managingHeirId : undefined, possessorSearchComplete: expired ? active.possessorSearchComplete : undefined, qualifiedPossessorId: expired ? active.qualifiedPossessorId : undefined })} /></Question>{active.expired ? <><PersonAssessment title="Có người thừa kế đang quản lý di sản?" people={people} selectedId={active.managingHeirId} complete={active.managingSearchComplete} onSelect={(managingHeirId) => onUpdate({ managingHeirId, managingSearchComplete: undefined, qualifiedPossessorId: undefined, possessorSearchComplete: undefined })} onNone={() => onUpdate({ managingHeirId: undefined, managingSearchComplete: true })} onUnknown={() => onUpdate({ managingHeirId: undefined, managingSearchComplete: undefined, qualifiedPossessorId: undefined, possessorSearchComplete: undefined })} />{!active.managingHeirId && active.managingSearchComplete ? <PersonAssessment title="Có người chiếm hữu đã được xác nhận đáp ứng Điều 236?" people={people} selectedId={active.qualifiedPossessorId} complete={active.possessorSearchComplete} onSelect={(qualifiedPossessorId) => onUpdate({ qualifiedPossessorId, possessorSearchComplete: undefined })} onNone={() => onUpdate({ qualifiedPossessorId: undefined, possessorSearchComplete: true })} onUnknown={() => onUpdate({ qualifiedPossessorId: undefined, possessorSearchComplete: undefined })} /> : null}</> : null}<div className="flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={() => onLaw("R-J05")}>R-J05 · căn cứ</Button><Button size="sm" variant="ghost" onClick={() => onLaw("R-J06")}>R-J06 · Điều 236</Button><Button size="sm" variant="ghost" onClick={() => onLaw("R-J07")}>R-J07 · căn cứ</Button></div>{people.length === 0 ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Hồ sơ chưa có person node. <Link className="font-semibold underline" href={`/cases/${caseId}/modules/heir-rank`}>Mở graph quan hệ</Link> để thêm chủ thể.</div> : null}</CardContent></Card>;
}

function DeadlineResults({ requests, run, results, error, onLaw }: { requests: RequestDraft[]; run?: InferenceRun; results: Map<string, InferenceRun["results"][number]>; error?: string; onLaw: (rule: string) => void }) {
  return <Card className="sticky top-4"><CardHeader><Badge variant="outline">Timeline Điều 623</Badge><CardTitle className="pt-2">{run ? "Kết quả theo từng yêu cầu" : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Ngày 29/02 chuyển về ngày cuối tháng 02 nếu năm đích không có ngày tương ứng.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <ErrorMessage text={error} /> : null}{run ? requests.map((item) => { const period = results.get(`limitation-period-years:${item.id}`); const deadline = results.get(`limitation-deadline:${item.id}`); const ruleId = period?.derivations[0]; const missing = run.missing.filter((entry) => entry.subject === item.id); return <div key={item.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-2"><p className="font-semibold">{item.label}</p><Badge variant={deadline ? "success" : "warning"}>{deadline ? `${period?.value} năm` : "Chưa đủ dữ kiện"}</Badge></div><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><TimelinePoint label="Mở thừa kế" value={item.openingDate ?? "—"} /><span className="text-muted-foreground">→</span><TimelinePoint label="Mốc thời hiệu" value={deadline?.value ?? "—"} /></div>{missing.length ? <Missing items={missing.map((entry) => entry.predicate)} /> : null}{ruleId ? <Button className="mt-2 px-0" size="sm" variant="ghost" onClick={() => onLaw(ruleId)}>{ruleId} · xem Điều 623</Button> : null}</div>; }) : <Placeholder />}</CardContent></Card>;
}

function OutcomeResults({ outcomes, run, results, people, error, onLaw }: { outcomes: OutcomeDraft[]; run?: InferenceRun; results: Map<string, InferenceRun["results"][number]>; people: Map<string, string>; error?: string; onLaw: (rule: string) => void }) {
  return <Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả khoản 1 Điều 623</Badge><CardTitle className="pt-2">{run ? "Chủ thể nhận sau thời hiệu" : "Chưa chạy CLIPS"}</CardTitle><CardDescription>`unknown` không được diễn giải thành Nhà nước nhận di sản.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <ErrorMessage text={error} /> : null}{run ? outcomes.map((item) => { const result = results.get(`post-limitation-recipient:${item.id}`); const ruleId = result?.derivations[0]; const missing = run.missing.filter((entry) => entry.subject === item.id); const resolved = Boolean(result && result.value !== "unknown"); return <div key={item.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-2"><p className="font-semibold">{item.label}</p><Badge variant={resolved ? "success" : "warning"}>{resolved ? "Đã phân loại" : item.expired === false ? "Chưa áp dụng" : "Chưa đủ dữ kiện"}</Badge></div><p className="mt-3 text-sm leading-6">{recipientLabel(item, result?.value, people)}</p>{result?.value === "qualified-possessor" ? <p className="mt-2 text-xs text-amber-900">Điều kiện Điều 236 là fact đã được xác nhận bên ngoài mô-đun, không phải kết quả CLIPS tự đánh giá.</p> : null}{missing.length ? <Missing items={missing.map((entry) => entry.predicate)} /> : null}{ruleId ? <Button className="mt-2 px-0" size="sm" variant="ghost" onClick={() => onLaw(ruleId)}>{ruleId} · xem căn cứ</Button> : null}</div>; }) : <Placeholder />}</CardContent></Card>;
}

function PersonAssessment({ title, people, selectedId, complete, onSelect, onNone, onUnknown }: { title: string; people: PersonOption[]; selectedId?: string; complete?: boolean; onSelect: (id: string) => void; onNone: () => void; onUnknown: () => void }) { return <Question title={title}><div className="grid gap-2 sm:grid-cols-2">{people.map((person) => <Choice key={person.id} selected={selectedId === person.id} onClick={() => onSelect(person.id)}>{person.name}</Choice>)}<Choice selected={!selectedId && complete === true} onClick={onNone}>Đã tìm đủ — không có</Choice><Choice selected={!selectedId && complete === undefined} onClick={onUnknown}>Chưa tìm đầy đủ</Choice></div></Question>; }
function Boundary({ mode }: { mode: Mode }) { return <Card><CardHeader><CardTitle>Ranh giới suy luận</CardTitle><CardDescription>{mode === "deadline" ? "Chỉ xác định thời hạn và mốc ngày; chưa đánh giá gián đoạn, bắt đầu lại hoặc quy định chuyển tiếp." : "Không tự xác nhận hết thời hiệu và không tự đánh giá các điều kiện chiếm hữu tại Điều 236."}</CardDescription></CardHeader></Card>; }
function EmptyState({ module }: { module: AnalysisModuleDefinition }) { return <main className="mx-auto grid min-h-screen max-w-2xl place-items-center p-6"><Card><CardHeader><Badge variant="outline">Timeline presenter</Badge><CardTitle>{module.title}</CardTitle><CardDescription>Hãy tạo hoặc mở một hồ sơ để lưu dữ kiện và chạy CLIPS.</CardDescription></CardHeader><CardContent><Button asChild><Link href="/cases">Mở danh sách hồ sơ</Link></Button></CardContent></Card></main>; }
function EmptyEditor({ text, onAdd }: { text: string; onAdd: () => void }) { return <Card><CardHeader><CardTitle>{text}</CardTitle></CardHeader><CardContent><Button onClick={onAdd}>Thêm mới</Button></CardContent></Card>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-medium">{label}<Input className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Question({ title, children }: { title: string; children: ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><div className="mt-2">{children}</div></div>; }
function BooleanChoice({ value, onChange }: { value?: boolean; onChange: (value: boolean) => void }) { return <div className="grid gap-2 sm:grid-cols-2"><Choice selected={value === true} onClick={() => onChange(true)}>Đã xác nhận hết</Choice><Choice selected={value === false} onClick={() => onChange(false)}>Chưa hết / chưa xác nhận</Choice></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) { return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium", selected && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{children}</button>; }
function TimelinePoint({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold tabular-nums">{value}</p></div>; }
function Missing({ items }: { items: string[] }) { return <p className="mt-3 text-xs text-amber-800">Thiếu: {items.map(missingLabel).join("; ")}</p>; }
function ErrorMessage({ text }: { text: string }) { return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{text}</p>; }
function Placeholder() { return <div className="grid min-h-28 place-items-center rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Kết quả, dữ kiện thiếu và căn cứ rule sẽ xuất hiện tại đây.</div>; }

function newRequest(index: number, id = `limitation-${crypto.randomUUID()}`): RequestDraft { return { id, label: `Yêu cầu ${index}` }; }
function newOutcome(index: number, id = `post-limitation-${crypto.randomUUID()}`): OutcomeDraft { return { id, label: `Phần di sản ${index}` }; }
function restoreRequests(facts: ApiFact[]): RequestDraft[] { return facts.filter((fact) => fact.predicate === "limitation-assessment-subject" && fact.value === true && fact.subject).map((scope) => ({ id: scope.subject!, label: String(find(facts, scope.subject!, "limitation-request-label") ?? scope.subject), type: find(facts, scope.subject!, "request-type") as LimitationRequestType | undefined, assetType: find(facts, scope.subject!, "asset-type") as RequestDraft["assetType"], openingDate: find(facts, scope.subject!, "inheritance-opening-date") as string | undefined })); }
function restoreOutcomes(facts: ApiFact[]): OutcomeDraft[] { return facts.filter((fact) => fact.predicate === "post-limitation-assessment-subject" && fact.value === true && fact.subject).map((scope) => ({ id: scope.subject!, label: String(find(facts, scope.subject!, "estate-asset-label") ?? scope.subject), expired: booleanValue(find(facts, scope.subject!, "limitation-expiry-confirmed")), managingSearchComplete: booleanValue(find(facts, scope.subject!, "managing-heir-search-complete")), managingHeirId: stringValue(find(facts, scope.subject!, "estate-managing-heir")), possessorSearchComplete: booleanValue(find(facts, scope.subject!, "qualified-possessor-search-complete")), qualifiedPossessorId: stringValue(find(facts, scope.subject!, "article-236-qualified-possessor")) })); }
function restorePeople(facts: ApiFact[]): PersonOption[] { const labels = new Map<string, string>(); for (const fact of facts) if (fact.subject && (fact.predicate === "person-label" || fact.predicate === "heir-person-label")) labels.set(fact.subject, String(fact.value)); return [...labels].map(([id, name]) => ({ id, name })); }
function find(facts: ApiFact[], subject: string, predicate: string) { return facts.find((fact) => fact.subject === subject && fact.predicate === predicate)?.value; }
function booleanValue(value: ApiFact["value"] | undefined) { return typeof value === "boolean" ? value : undefined; }
function stringValue(value: ApiFact["value"] | undefined) { return typeof value === "string" ? value : undefined; }
function buildRequestFacts(items: RequestDraft[]): ApiFact[] { return items.flatMap((item): ApiFact[] => { const facts: ApiFact[] = [{ id: `${item.id}-scope`, subject: item.id, predicate: "limitation-assessment-subject", value: true }, { id: `${item.id}-label`, subject: item.id, predicate: "limitation-request-label", value: item.label || item.id }]; if (item.type) facts.push({ id: `${item.id}-type`, subject: item.id, predicate: "request-type", value: item.type }); if (item.type === "divide-estate" && item.assetType) facts.push({ id: `${item.id}-asset`, subject: item.id, predicate: "asset-type", value: item.assetType }); if (item.openingDate) facts.push({ id: `${item.id}-opening`, subject: item.id, predicate: "inheritance-opening-date", value: item.openingDate }); return facts; }); }
function buildOutcomeFacts(items: OutcomeDraft[]): ApiFact[] { return items.flatMap((item): ApiFact[] => { const facts: ApiFact[] = [{ id: `${item.id}-scope`, subject: item.id, predicate: "post-limitation-assessment-subject", value: true }, { id: `${item.id}-label`, subject: item.id, predicate: "estate-asset-label", value: item.label || item.id }]; if (item.expired !== undefined) facts.push({ id: `${item.id}-expired`, subject: item.id, predicate: "limitation-expiry-confirmed", value: item.expired }); if (item.expired && item.managingHeirId) facts.push({ id: `${item.id}-manager`, subject: item.id, predicate: "estate-managing-heir", value: item.managingHeirId }); if (item.expired && !item.managingHeirId && item.managingSearchComplete !== undefined) facts.push({ id: `${item.id}-manager-search`, subject: item.id, predicate: "managing-heir-search-complete", value: item.managingSearchComplete }); if (item.expired && item.managingSearchComplete && !item.managingHeirId && item.qualifiedPossessorId) facts.push({ id: `${item.id}-possessor`, subject: item.id, predicate: "article-236-qualified-possessor", value: item.qualifiedPossessorId }); if (item.expired && item.managingSearchComplete && !item.managingHeirId && !item.qualifiedPossessorId && item.possessorSearchComplete !== undefined) facts.push({ id: `${item.id}-possessor-search`, subject: item.id, predicate: "qualified-possessor-search-complete", value: item.possessorSearchComplete }); return facts; }); }
function recipientLabel(item: OutcomeDraft, value: string | undefined, people: Map<string, string>) { if (value === "managing-heir") return `Thuộc người thừa kế đang quản lý: ${people.get(item.managingHeirId ?? "") ?? item.managingHeirId ?? "chưa rõ"}.`; if (value === "qualified-possessor") return `Thuộc người chiếm hữu đáp ứng Điều 236: ${people.get(item.qualifiedPossessorId ?? "") ?? item.qualifiedPossessorId ?? "chưa rõ"}.`; if (value === "state") return "Thuộc về Nhà nước sau khi cả hai phạm vi tìm kiếm đã được xác nhận đầy đủ."; if (item.expired === false) return "Nhánh hậu quả chưa áp dụng vì việc hết thời hiệu chưa được xác nhận."; return "Chưa đủ dữ kiện để xác định chủ thể nhận sau thời hiệu."; }
function missingLabel(predicate: string) { return ({ "request-type": "loại yêu cầu", "asset-type": "loại tài sản", "inheritance-opening-date": "ngày mở thừa kế", "limitation-expiry-confirmed": "xác nhận hết thời hiệu", "managing-heir-search-complete": "xác nhận đã tìm đủ người thừa kế quản lý", "qualified-possessor-search-complete": "xác nhận đã tìm đủ người chiếm hữu đáp ứng Điều 236" } as Record<string, string>)[predicate] ?? predicate; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
