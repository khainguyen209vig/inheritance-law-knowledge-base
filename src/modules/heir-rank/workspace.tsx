"use client";

import Link from "next/link";
import { useId, useMemo, useReducer, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { FamilyGraphEditor, type RelatedPersonRole } from "@/components/family-graph/family-graph-editor";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [graphHistory, dispatchGraph] = useReducer(graphHistoryReducer, restored, (present): GraphHistory => ({ past: [], present, future: [] }));
  const graph = graphHistory.present;
  const [selectedId, setSelectedId] = useState(restored.deceasedId);
  const [searchComplete, setSearchComplete] = useState<boolean | undefined>(() => initialCase?.facts.find((fact) => fact.predicate === "heir-search-complete")?.value as boolean | undefined);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [pendingDeletionId, setPendingDeletionId] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const selectedPerson = graph.people.find((person) => person.id === selectedId) ?? graph.people[0];
  const candidates = graph.people.filter((person) => person.id !== graph.deceasedId);
  const diagnostics = useMemo(() => graphDiagnostics(graph), [graph]);
  const facts = useMemo(() => serializeFamilyGraph(caseId.current, graph, searchComplete), [graph, searchComplete]);
  const rankResults = useMemo(() => resultMap(run, "candidate-heir-rank"), [run]);
  const callResults = useMemo(() => resultMap(run, "called-to-inherit"), [run]);
  const activeRank = run?.results.find((item) => item.predicate === "active-heir-rank");
  const equalShare = run?.results.some((item) => item.predicate === "equal-share-principle-applies" && item.value === "true");

  function updateGraph(next: FamilyGraph) { dispatchGraph({ type: "commit", graph: next }); setSearchComplete(undefined); setRun(undefined); }
  function updatePerson(update: Partial<FamilyPerson>) {
    if (!selectedPerson) return;
    updateGraph({ ...graph, people: graph.people.map((person) => person.id === selectedPerson.id ? { ...person, ...update } : person) });
  }
  function requestPersonDeletion(personId: string) { if (personId !== graph.deceasedId) setPendingDeletionId(personId); }
  function confirmPersonDeletion() {
    if (!pendingDeletionId) return;
    updateGraph({ ...graph, people: graph.people.filter((person) => person.id !== pendingDeletionId), edges: graph.edges.filter((edge) => edge.from !== pendingDeletionId && edge.to !== pendingDeletionId) });
    setSelectedId(graph.deceasedId); setPendingDeletionId(undefined);
  }
  function createRelatedPerson(anchorId: string, name: string, role: RelatedPersonRole) {
    const number = counter.current++;
    const person: FamilyPerson = { id: `person-${token}-${number}`, name, eligibilityReviewed: false };
    const parentRole = role === "biological-parent" || role === "adoptive-parent";
    const edgeType = role === "biological-parent" || role === "biological-child" ? "biological-parent-of" as const
      : role === "adoptive-parent" || role === "adopted-child" ? "adoptive-parent-of" as const
        : "spouse-at-opening" as const;
    const edge = { id: `edge-${crypto.randomUUID()}`, from: parentRole ? person.id : anchorId, to: parentRole ? anchorId : person.id, type: edgeType };
    updateGraph({ ...graph, people: [...graph.people, person], edges: [...graph.edges, edge] });
    setSelectedId(person.id);
  }
  function createJointChild(spouseEdgeId: string, name: string) {
    const spouseEdge = graph.edges.find((edge) => edge.id === spouseEdgeId && edge.type === "spouse-at-opening");
    if (!spouseEdge) return;
    const number = counter.current++;
    const person: FamilyPerson = { id: `person-${token}-${number}`, name, eligibilityReviewed: false };
    const edges = [
      { id: `edge-${crypto.randomUUID()}`, from: spouseEdge.from, to: person.id, type: "biological-parent-of" as const },
      { id: `edge-${crypto.randomUUID()}`, from: spouseEdge.to, to: person.id, type: "biological-parent-of" as const },
    ];
    updateGraph({ ...graph, people: [...graph.people, person], edges: [...graph.edges, ...edges] });
    setSelectedId(person.id);
  }
  function renamePerson(personId: string, name: string) { updateGraph({ ...graph, people: graph.people.map((person) => person.id === personId ? { ...person, name } : person) }); }
  function undoGraph() { dispatchGraph({ type: "undo" }); setSelectedId(graph.deceasedId); setSearchComplete(undefined); setRun(undefined); }
  function redoGraph() { dispatchGraph({ type: "redo" }); setSelectedId(graph.deceasedId); setSearchComplete(undefined); setRun(undefined); }
  function runInference() { startTransition(async () => { setError(undefined); try {
    if (!caseCreated.current) { await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) }); caseCreated.current = true; }
    else await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
    const ownedIds = new Set([...initialOwnedIds.current, ...graph.people.map((person) => person.id)]);
    const currentIds = new Set(graph.people.map((person) => person.id));
    const deletedIds = new Set([...initialOwnedIds.current].filter((id) => !currentIds.has(id)));
    const retained = (initialCase?.facts ?? []).filter((fact) => !deletedIds.has(fact.subject ?? "")
      && !(typeof fact.value === "string" && deletedIds.has(fact.value) && (fact.predicate === "biological-parent-of" || fact.predicate === "adoptive-parent-of" || fact.predicate === "step-parent-of" || fact.predicate === "spouse-at-opening"))
      && !familyGraphPredicates.has(fact.predicate)
      && !(ownedIds.has(fact.subject ?? "") && fact.predicate === "eligibility-candidate"));
    await requestJson(`/api/cases/${caseId.current}/facts`, { method: "PUT", body: JSON.stringify({ subject: caseId.current, facts: [...retained, ...facts] }) });
    setRun(await requestJson<InferenceRun>(`/api/cases/${caseId.current}/inference/heir-rank`, { method: "POST", body: "{}" }));
    initialOwnedIds.current = new Set(graph.people.map((person) => person.id));
  } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); } }); }
  const ready = graph.people.length > 1 && diagnostics.length === 0;

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1550px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · cây/graph facts · R-C01–R-C06</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Mô-đun</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge></div></div></header>
    <div className="mx-auto grid max-w-[1550px] gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <main className="space-y-4"><Card><CardContent className="pt-6"><label className="space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} onChange={(event) => setTitle(event.target.value)} /></label></CardContent></Card><FamilyGraphEditor graph={graph} selectedId={selectedPerson?.id} onSelect={setSelectedId} onChange={updateGraph} onCreateRelated={createRelatedPerson} onCreateJointChild={createJointChild} onRenamePerson={renamePerson} onDeletePerson={requestPersonDeletion} onUndo={undoGraph} onRedo={redoGraph} canUndo={graphHistory.past.length > 0} canRedo={graphHistory.future.length > 0} />
        <Card><CardHeader><CardTitle>Phạm vi rà soát ứng viên</CardTitle><CardDescription>Chỉ chọn “đã đầy đủ” khi team đã nhập đủ người ở cả ba hàng. Thay đổi cấu trúc graph sẽ tự xóa xác nhận này.</CardDescription></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-2"><Choice selected={searchComplete === true} onClick={() => { setSearchComplete(true); setRun(undefined); }}>Đã nhập đầy đủ</Choice><Choice selected={searchComplete === false} onClick={() => { setSearchComplete(false); setRun(undefined); }}>Chưa đầy đủ</Choice></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Facts sẽ gửi vào CLIPS</CardTitle><CardDescription>Preview giúp kiểm tra knowledge representation trước khi suy luận.</CardDescription></CardHeader><CardContent><details><summary className="cursor-pointer text-sm font-medium">Xem {facts.length} asserted facts</summary><div className="mt-3 max-h-72 space-y-1 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{facts.map((fact) => <code key={fact.id} className="block">{fact.predicate}({fact.subject}, {String(fact.value)})</code>)}</div></details></CardContent></Card>
        <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu graph và suy luận ${candidates.length} người`}</Button></div>
      </main>
      <aside className="space-y-4">{selectedPerson ? <Card id="node-properties"><CardHeader><CardTitle>Thuộc tính node</CardTitle><CardDescription>Facts gắn với người đang chọn.</CardDescription></CardHeader><CardContent className="space-y-5"><label className="block space-y-2 text-sm font-medium">Tên hiển thị<Input value={selectedPerson.name} maxLength={80} onChange={(event) => updatePerson({ name: event.target.value })} /></label>{selectedPerson.id !== graph.deceasedId ? <><Question title="Tình trạng tại thời điểm mở thừa kế" description="Để trống nếu chưa xác định."><Choice selected={selectedPerson.life === "alive"} onClick={() => updatePerson({ life: "alive" })}>Còn sống</Choice><Choice selected={selectedPerson.life === "dead-before-or-same"} onClick={() => updatePerson({ life: "dead-before-or-same" })}>Chết trước/cùng lúc</Choice></Question><div className="rounded-lg border border-dashed p-3 text-sm"><p className="font-medium">Điều kiện pháp lý dùng chung</p><p className="mt-1 text-xs text-muted-foreground">Quyền hưởng do mô-đun Điều 621 đánh giá; trạng thái từ chối do nhóm H suy luận từ facts chi tiết.</p><div className="mt-2 flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm" className="px-0"><Link href={`/cases/${caseId.current}/modules/eligibility`}>Mở Điều 621</Link></Button><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}/modules/refusal-and-unclaimed`}>Mở từ chối nhận di sản</Link></Button></div></div></> : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Node gốc của graph. Tình trạng sống và việc từ chối không áp dụng cho người để lại di sản.</p>}</CardContent></Card> : null}
        <Card><CardHeader><Badge variant="outline">Kết quả tách lớp</Badge><CardTitle className="pt-2">{activeRank ? `Hàng hoạt động: ${rankLabel(activeRank.value)}` : run ? "Chưa xác định hàng hoạt động" : "Chưa chạy CLIPS"}</CardTitle><CardDescription>{equalShare ? "Có nhiều người cùng được gọi hưởng: áp dụng nguyên tắc phần bằng nhau." : "Xếp hàng không tự động đồng nghĩa được gọi hưởng."}</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? candidates.map((person) => { const rank = rankResults.get(person.id); const call = callResults.get(person.id); const missing = run.missing.filter((item) => item.subject === person.id); const ruleIds = [...new Set([...(rank?.derivations ?? []), ...(call?.derivations ?? [])])]; return <div key={person.id} className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{person.name}</p><div className="flex gap-1"><Badge variant={rank?.value.startsWith("rank-") ? "success" : "warning"}>{rank ? rankLabel(rank.value) : "Chưa xếp hàng"}</Badge>{call ? <Badge variant={call.value === "true" ? "success" : call.value === "false" ? "secondary" : "warning"}>{callLabel(call.value)}</Badge> : null}</div></div>{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<div className="mt-2 flex flex-wrap gap-1">{ruleIds.filter((ruleId) => getRuleExplanation(ruleId)).map((ruleId) => <Button key={ruleId} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedRule(ruleId)}>{ruleId} · căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-24 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">Kết quả và dữ kiện thiếu sẽ xuất hiện tại đây.</div>}</CardContent></Card></aside>
    </div><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Graph lưu facts nguyên tử, không lưu nhãn hàng · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} /><DeletePersonDialog person={graph.people.find((item) => item.id === pendingDeletionId)} edgeCount={graph.edges.filter((edge) => edge.from === pendingDeletionId || edge.to === pendingDeletionId).length} onCancel={() => setPendingDeletionId(undefined)} onConfirm={confirmPersonDeletion} />
  </div>;
}

function Question({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06]")}>{children}</button>; }
function resultMap(run: InferenceRun | undefined, predicate: string) { return new Map(run?.results.filter((item) => item.predicate === predicate).map((item) => [item.subject, item]) ?? []); }
function rankLabel(value: ModuleResultValue) { return ({ "rank-1": "Hàng 1", "rank-2": "Hàng 2", "rank-3": "Hàng 3", conflict: "Xung đột", unknown: "Chưa rõ" } as Partial<Record<ModuleResultValue, string>>)[value] ?? value; }
function callLabel(value: ModuleResultValue) { return value === "true" ? "Được gọi hưởng" : value === "false" ? "Không được gọi" : "Chưa xác định"; }
function missingLabel(predicate: string) { return ({ "relationship-at-opening": "đường quan hệ", "article-621-status": "kết quả Điều 621", "heir-life-status": "tình trạng sống", "valid-refusal": "trạng thái từ chối", "heir-search-complete": "xác nhận đã nhập đủ ứng viên" } as Record<string, string>)[predicate] ?? predicate; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }

interface GraphHistory { past: FamilyGraph[]; present: FamilyGraph; future: FamilyGraph[] }
type GraphHistoryAction = { type: "commit"; graph: FamilyGraph } | { type: "undo" } | { type: "redo" };
function graphHistoryReducer(state: GraphHistory, action: GraphHistoryAction): GraphHistory {
  if (action.type === "commit") return { past: [...state.past, state.present].slice(-50), present: action.graph, future: [] };
  if (action.type === "undo") { const previous = state.past.at(-1); return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state; }
  const next = state.future[0]; return next ? { past: [...state.past, state.present].slice(-50), present: next, future: state.future.slice(1) } : state;
}
function DeletePersonDialog({ person, edgeCount, onCancel, onConfirm }: { person?: FamilyPerson; edgeCount: number; onCancel: () => void; onConfirm: () => void }) { return <Dialog open={Boolean(person)} onOpenChange={(open) => { if (!open) onCancel(); }}><DialogContent><DialogHeader><DialogTitle>Xóa {person?.name}?</DialogTitle><DialogDescription>Thao tác này cũng xóa {edgeCount} quan hệ nối với người này. Bạn có thể dùng Hoàn tác ngay sau khi xóa.</DialogDescription></DialogHeader><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onCancel}>Hủy</Button><Button className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Xóa người và quan hệ</Button></div></DialogContent></Dialog>; }
