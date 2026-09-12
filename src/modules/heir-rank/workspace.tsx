"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { FamilyGraphEditor } from "@/components/family-graph/family-graph-editor";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import { familyGraphPredicates, graphDiagnostics, restoreFamilyGraph, serializeFamilyGraph, type FamilyGraph, type FamilyPerson } from "@/modules/family-graph/model";
import type { ApiFact, InferenceRun, ModuleResultValue } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }

export function HeirRankWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const token = `draft-${useId().toLowerCase().replace(/[^a-z0-9]/g, "") || "case"}`;
  const caseId = useRef(initialCase?.id ?? `case-${token}`);
  const caseCreated = useRef(Boolean(initialCase));
  const restored = useMemo(() => restoreFamilyGraph(initialCase?.facts ?? [], token), [initialCase?.facts, token]);
  const initialOwnedIds = useRef(new Set(restored.people.map((person) => person.id)));
  const counter = useRef(restored.people.length + 1);
  const [graph, setGraph] = useState<FamilyGraph>(restored);
  const [selectedId, setSelectedId] = useState(restored.deceasedId);
  const [searchComplete, setSearchComplete] = useState<boolean | undefined>(() => initialCase?.facts.find((fact) => fact.predicate === "heir-search-complete")?.value as boolean | undefined);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const selectedPerson = graph.people.find((person) => person.id === selectedId) ?? graph.people[0];
  const candidates = graph.people.filter((person) => person.id !== graph.deceasedId);
  const diagnostics = useMemo(() => graphDiagnostics(graph), [graph]);
  const facts = useMemo(() => serializeFamilyGraph(caseId.current, graph, searchComplete), [graph, searchComplete]);
  const rankResults = useMemo(() => resultMap(run, "candidate-heir-rank"), [run]);
  const callResults = useMemo(() => resultMap(run, "called-to-inherit"), [run]);
  const activeRank = run?.results.find((item) => item.predicate === "active-heir-rank");
  const equalShare = run?.results.some((item) => item.predicate === "equal-share-principle-applies" && item.value === "true");

  function updateGraph(next: FamilyGraph) { setGraph(next); setSearchComplete(undefined); setRun(undefined); }
  function updatePerson(update: Partial<FamilyPerson>) {
    if (!selectedPerson) return;
    setGraph((current) => ({ ...current, people: current.people.map((person) => person.id === selectedPerson.id ? { ...person, ...update } : person) }));
    setRun(undefined);
  }
  function addPerson() {
    const number = counter.current++;
    const person: FamilyPerson = { id: `person-${token}-${number}`, name: `Người ${graph.people.length}`, eligibilityReviewed: false };
    setGraph((current) => ({ ...current, people: [...current.people, person] }));
    setSelectedId(person.id); setSearchComplete(undefined); setRun(undefined);
  }
  function removeSelectedPerson() {
    if (!selectedPerson || selectedPerson.id === graph.deceasedId) return;
    setGraph((current) => ({ ...current, people: current.people.filter((person) => person.id !== selectedPerson.id), edges: current.edges.filter((edge) => edge.from !== selectedPerson.id && edge.to !== selectedPerson.id) }));
    setSelectedId(graph.deceasedId); setSearchComplete(undefined); setRun(undefined);
  }
  function runInference() { startTransition(async () => { setError(undefined); try {
    if (!caseCreated.current) { await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) }); caseCreated.current = true; }
    else await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
    const ownedIds = new Set([...initialOwnedIds.current, ...graph.people.map((person) => person.id)]);
    const currentIds = new Set(graph.people.map((person) => person.id));
    const deletedIds = new Set([...initialOwnedIds.current].filter((id) => !currentIds.has(id)));
    const retained = (initialCase?.facts ?? []).filter((fact) => !deletedIds.has(fact.subject ?? "")
      && !(typeof fact.value === "string" && deletedIds.has(fact.value) && (fact.predicate === "biological-parent-of" || fact.predicate === "adoptive-parent-of" || fact.predicate === "spouse-at-opening"))
      && !familyGraphPredicates.has(fact.predicate)
      && !(ownedIds.has(fact.subject ?? "") && (fact.predicate === "eligibility-candidate" || fact.predicate === "valid-refusal")));
    await requestJson(`/api/cases/${caseId.current}/facts`, { method: "PUT", body: JSON.stringify({ subject: caseId.current, facts: [...retained, ...facts] }) });
    setRun(await requestJson<InferenceRun>(`/api/cases/${caseId.current}/inference/heir-rank`, { method: "POST", body: "{}" }));
    initialOwnedIds.current = new Set(graph.people.map((person) => person.id));
  } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); } }); }
  const ready = graph.people.length > 1 && diagnostics.length === 0;

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1550px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · cây/graph facts · R-C01–R-C06</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Mô-đun</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge></div></div></header>
    <div className="mx-auto grid max-w-[1550px] gap-5 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
      <aside className="space-y-4"><Card><CardHeader><CardTitle>Hồ sơ</CardTitle><CardDescription>Cây này được dùng chung với mô-đun thừa kế thế vị.</CardDescription></CardHeader><CardContent className="space-y-4"><label className="space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} onChange={(event) => setTitle(event.target.value)} /></label><Button className="w-full" variant="outline" onClick={addPerson}>+ Tạo một người</Button></CardContent></Card><Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Danh sách người</CardTitle><Badge variant="secondary">{graph.people.length}</Badge></div><CardDescription>Node trung gian không còn bị ẩn.</CardDescription></CardHeader><CardContent className="space-y-2">{graph.people.map((person) => { const rank = rankResults.get(person.id); return <button key={person.id} type="button" onClick={() => setSelectedId(person.id)} className={cn("w-full rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", selectedPerson?.id === person.id && "border-primary bg-primary/[0.05]")}><span className="flex items-center justify-between gap-2 text-sm font-semibold"><span>{person.name}</span>{person.id === graph.deceasedId ? <Badge variant="warning">Người chết</Badge> : rank ? <Badge variant={rank.value.startsWith("rank-") ? "success" : "warning"}>{rankLabel(rank.value)}</Badge> : null}</span><span className="mt-1 block font-mono text-[9px] text-muted-foreground">{person.id}</span></button>; })}</CardContent></Card></aside>
      <main className="space-y-4"><FamilyGraphEditor graph={graph} selectedId={selectedPerson?.id} onSelect={setSelectedId} onChange={updateGraph} />
        <Card><CardHeader><CardTitle>Phạm vi rà soát ứng viên</CardTitle><CardDescription>Chỉ chọn “đã đầy đủ” khi team đã nhập đủ người ở cả ba hàng. Thay đổi cấu trúc graph sẽ tự xóa xác nhận này.</CardDescription></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-2"><Choice selected={searchComplete === true} onClick={() => { setSearchComplete(true); setRun(undefined); }}>Đã nhập đầy đủ</Choice><Choice selected={searchComplete === false} onClick={() => { setSearchComplete(false); setRun(undefined); }}>Chưa đầy đủ</Choice></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Facts sẽ gửi vào CLIPS</CardTitle><CardDescription>Preview giúp kiểm tra knowledge representation trước khi suy luận.</CardDescription></CardHeader><CardContent><details><summary className="cursor-pointer text-sm font-medium">Xem {facts.length} asserted facts</summary><div className="mt-3 max-h-72 space-y-1 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{facts.map((fact) => <code key={fact.id} className="block">{fact.predicate}({fact.subject}, {String(fact.value)})</code>)}</div></details></CardContent></Card>
        <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu graph và suy luận ${candidates.length} người`}</Button></div>
      </main>
      <aside className="space-y-4">{selectedPerson ? <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-2"><div><CardTitle>Thuộc tính node</CardTitle><CardDescription>Facts gắn với người đang chọn.</CardDescription></div>{selectedPerson.id !== graph.deceasedId ? <Button variant="ghost" size="sm" onClick={removeSelectedPerson}>Xóa người</Button> : null}</div></CardHeader><CardContent className="space-y-5"><label className="block space-y-2 text-sm font-medium">Tên hiển thị<Input value={selectedPerson.name} maxLength={80} onChange={(event) => updatePerson({ name: event.target.value })} /></label>{selectedPerson.id !== graph.deceasedId ? <><Question title="Tình trạng tại thời điểm mở thừa kế" description="Để trống nếu chưa xác định."><Choice selected={selectedPerson.life === "alive"} onClick={() => updatePerson({ life: "alive" })}>Còn sống</Choice><Choice selected={selectedPerson.life === "dead-before-or-same"} onClick={() => updatePerson({ life: "dead-before-or-same" })}>Chết trước/cùng lúc</Choice></Question><Question title="Từ chối nhận di sản hợp lệ?" description="Fact dùng chung giữa các mô-đun."><Choice selected={selectedPerson.refusal === false} onClick={() => updatePerson({ refusal: false })}>Không</Choice><Choice selected={selectedPerson.refusal === true} onClick={() => updatePerson({ refusal: true })}>Có</Choice></Question><div className="rounded-lg border border-dashed p-3 text-sm"><p className="font-medium">Điều 621</p><p className="mt-1 text-xs text-muted-foreground">{selectedPerson.eligibilityReviewed ? "Đã có marker hoàn tất rà soát eligibility." : "Chưa hoàn tất rà soát; kết quả gọi hưởng có thể UNKNOWN."}</p><Button asChild className="mt-2 px-0" variant="ghost" size="sm"><Link href={`/cases/${caseId.current}/modules/eligibility`}>Mở eligibility</Link></Button></div></> : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Node gốc của graph. Tình trạng sống và từ chối không được nhập cho người để lại di sản trong mô-đun này.</p>}</CardContent></Card> : null}
        <Card><CardHeader><Badge variant="outline">Kết quả tách lớp</Badge><CardTitle className="pt-2">{activeRank ? `Hàng hoạt động: ${rankLabel(activeRank.value)}` : run ? "Chưa xác định hàng hoạt động" : "Chưa chạy CLIPS"}</CardTitle><CardDescription>{equalShare ? "Có nhiều người cùng được gọi hưởng: áp dụng nguyên tắc phần bằng nhau." : "Xếp hàng không tự động đồng nghĩa được gọi hưởng."}</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? candidates.map((person) => { const rank = rankResults.get(person.id); const call = callResults.get(person.id); const missing = run.missing.filter((item) => item.subject === person.id); const ruleIds = [...new Set([...(rank?.derivations ?? []), ...(call?.derivations ?? [])])]; return <div key={person.id} className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{person.name}</p><div className="flex gap-1"><Badge variant={rank?.value.startsWith("rank-") ? "success" : "warning"}>{rank ? rankLabel(rank.value) : "Chưa xếp hàng"}</Badge>{call ? <Badge variant={call.value === "true" ? "success" : call.value === "false" ? "secondary" : "warning"}>{callLabel(call.value)}</Badge> : null}</div></div>{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<div className="mt-2 flex flex-wrap gap-1">{ruleIds.filter((ruleId) => getRuleExplanation(ruleId)).map((ruleId) => <Button key={ruleId} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedRule(ruleId)}>{ruleId} · căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-24 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">Kết quả và dữ kiện thiếu sẽ xuất hiện tại đây.</div>}</CardContent></Card></aside>
    </div><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Graph lưu facts nguyên tử, không lưu nhãn hàng · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function Question({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06]")}>{children}</button>; }
function resultMap(run: InferenceRun | undefined, predicate: string) { return new Map(run?.results.filter((item) => item.predicate === predicate).map((item) => [item.subject, item]) ?? []); }
function rankLabel(value: ModuleResultValue) { return ({ "rank-1": "Hàng 1", "rank-2": "Hàng 2", "rank-3": "Hàng 3", conflict: "Xung đột", unknown: "Chưa rõ" } as Partial<Record<ModuleResultValue, string>>)[value] ?? value; }
function callLabel(value: ModuleResultValue) { return value === "true" ? "Được gọi hưởng" : value === "false" ? "Không được gọi" : "Chưa xác định"; }
function missingLabel(predicate: string) { return ({ "relationship-at-opening": "đường quan hệ", "article-621-status": "kết quả Điều 621", "heir-life-status": "tình trạng sống", "valid-refusal": "trạng thái từ chối", "heir-search-complete": "xác nhận đã nhập đủ ứng viên" } as Record<string, string>)[predicate] ?? predicate; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
