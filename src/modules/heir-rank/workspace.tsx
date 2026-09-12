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
type Relationship = "spouse" | "biological-parent" | "adoptive-parent" | "biological-child" | "adoptive-child";
interface Candidate { id: string; name: string; relationship?: Relationship }

const relationships: Array<{ id: Relationship; label: string; edge: string }> = [
  { id: "spouse", label: "Vợ/chồng tại thời điểm mở thừa kế", edge: "spouse-at-opening" },
  { id: "biological-parent", label: "Cha/mẹ đẻ", edge: "biological-parent-of" },
  { id: "adoptive-parent", label: "Cha/mẹ nuôi", edge: "adoptive-parent-of" },
  { id: "biological-child", label: "Con đẻ", edge: "biological-parent-of" },
  { id: "adoptive-child", label: "Con nuôi", edge: "adoptive-parent-of" },
];
const heirPredicates = new Set(["deceased-person", "heir-rank-candidate", "biological-parent-of", "adoptive-parent-of", "spouse-at-opening", "heir-person-label"]);

export function HeirRankWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const token = `draft-${useId().toLowerCase().replace(/[^a-z0-9]/g, "") || "case"}`;
  const caseId = useRef(initialCase?.id ?? `case-${token}`);
  const caseCreated = useRef(Boolean(initialCase));
  const restored = useMemo(() => restoreGraph(initialCase?.facts ?? [], token), [initialCase?.facts, token]);
  const deceasedId = useRef(restored.deceasedId);
  const counter = useRef(restored.candidates.length + 1);
  const [deceasedName, setDeceasedName] = useState(restored.deceasedName);
  const [candidates, setCandidates] = useState<Candidate[]>(restored.candidates);
  const [activeId, setActiveId] = useState(restored.candidates[0]?.id);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = candidates.find((candidate) => candidate.id === activeId) ?? candidates[0];
  const facts = useMemo(() => buildGraphFacts(deceasedId.current, deceasedName, candidates), [deceasedName, candidates]);
  const results = useMemo(() => new Map(run?.results.filter((item) => item.predicate === "candidate-heir-rank").map((item) => [item.subject, item]) ?? []), [run]);

  function update(update: Partial<Candidate>) { if (!active) return; setCandidates((current) => current.map((candidate) => candidate.id === active.id ? { ...candidate, ...update } : candidate)); setRun(undefined); }
  function addCandidate() { const n = counter.current++; const candidate = { id: `person-${token}-${n}`, name: `Người thân ${candidates.length + 1}` }; setCandidates((current) => [...current, candidate]); setActiveId(candidate.id); setRun(undefined); }
  function removeCandidate(id: string) { const remaining = candidates.filter((candidate) => candidate.id !== id); setCandidates(remaining); setActiveId(remaining[0]?.id); setRun(undefined); }
  function runInference() { startTransition(async () => { setError(undefined); try {
    if (!caseCreated.current) { await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) }); caseCreated.current = true; }
    else await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
    const retained = (initialCase?.facts ?? []).filter((fact) => !heirPredicates.has(fact.predicate));
    await requestJson(`/api/cases/${caseId.current}/facts`, { method: "PUT", body: JSON.stringify({ subject: caseId.current, facts: [...retained, ...facts] }) });
    setRun(await requestJson<InferenceRun>(`/api/cases/${caseId.current}/inference/heir-rank`, { method: "POST", body: "{}" }));
  } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); } }); }
  const ready = deceasedName.trim() && candidates.length > 0 && candidates.every((candidate) => candidate.name.trim() && candidate.relationship);

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · family graph · R-C01</p></div><div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Mô-đun</Link></Button><Badge variant="warning">Knowledge base: draft</Badge></div></div></header>
    <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
      <aside className="space-y-4"><Card><CardHeader><CardTitle>Hồ sơ</CardTitle></CardHeader><CardContent><label className="space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} onChange={(event) => setTitle(event.target.value)} /></label></CardContent></Card><Card><CardHeader><div className="flex justify-between"><CardTitle>Thành viên graph</CardTitle><Badge variant="secondary">{candidates.length + 1}</Badge></div><CardDescription>Chọn một người để sửa cạnh quan hệ.</CardDescription></CardHeader><CardContent className="space-y-2"><div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-3"><p className="text-xs text-muted-foreground">Người để lại di sản</p><p className="font-semibold">{deceasedName}</p></div>{candidates.map((candidate) => { const result = results.get(candidate.id); return <button key={candidate.id} type="button" onClick={() => setActiveId(candidate.id)} className={cn("w-full rounded-lg border p-3 text-left", active?.id === candidate.id && "border-primary bg-primary/[0.05]")}><span className="flex justify-between gap-2 text-sm font-semibold"><span>{candidate.name}</span>{result ? <Badge variant={result.value === "rank-1" ? "success" : "warning"}>{result.value === "rank-1" ? "Hàng 1" : "Chưa rõ"}</Badge> : null}</span><span className="mt-1 block text-xs text-muted-foreground">{relationshipLabel(candidate.relationship)}</span></button>; })}<Button className="w-full" variant="outline" onClick={addCandidate}>+ Thêm người thân</Button></CardContent></Card></aside>
      <main className="space-y-4"><Card><CardHeader><Badge variant="outline">Sơ đồ quan hệ trực tiếp</Badge><CardTitle className="pt-2">Graph gia đình của {deceasedName}</CardTitle><CardDescription>Cạnh có hướng được lưu thành facts; giao diện không gửi nhãn quan hệ tổng hợp vào CLIPS.</CardDescription></CardHeader><CardContent><div className="relative mx-auto max-w-2xl rounded-2xl border bg-muted/25 p-6"><div className="mx-auto w-fit rounded-xl border-2 border-primary bg-card px-6 py-4 text-center shadow-sm"><p className="text-xs text-muted-foreground">Người để lại di sản</p><p className="font-semibold">{deceasedName}</p></div><div className="mx-auto h-8 w-px bg-border" /><div className="grid gap-3 sm:grid-cols-2">{candidates.map((candidate) => <button key={candidate.id} type="button" onClick={() => setActiveId(candidate.id)} className={cn("rounded-xl border bg-card p-4 text-left", active?.id === candidate.id && "border-primary ring-1 ring-primary")}><p className="font-semibold">{candidate.name}</p><p className="mt-1 text-xs text-muted-foreground">{relationshipLabel(candidate.relationship)}</p></button>)}</div></div></CardContent></Card>
        {active ? <Card><CardHeader><div className="flex justify-between"><CardTitle>Chỉnh sửa người thân</CardTitle><Button variant="ghost" size="sm" onClick={() => removeCandidate(active.id)}>Xóa</Button></div></CardHeader><CardContent className="space-y-4"><label className="block max-w-md space-y-2 text-sm font-medium">Tên hiển thị<Input value={active.name} maxLength={80} onChange={(event) => update({ name: event.target.value })} /></label><div><p className="text-sm font-medium">Quan hệ tại thời điểm mở thừa kế</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{relationships.map((relationship) => <button key={relationship.id} type="button" onClick={() => update({ relationship: relationship.id })} className={cn("rounded-lg border p-3 text-left text-sm", active.relationship === relationship.id && "border-primary bg-primary/[0.06]")}><span className="font-medium">{relationship.label}</span><code className="mt-1 block text-[10px] text-muted-foreground">{relationship.edge}</code></button>)}</div></div><Button variant="outline" onClick={() => setSelectedRule("R-C01")}>Xem Điều 651 khoản 1 điểm a</Button></CardContent></Card> : null}
        <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu và phân loại ${candidates.length} người`}</Button></div>
      </main>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả phân loại</Badge><CardTitle className="pt-2">{run ? `${run.results.length} người đã xét` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>“Ứng viên hàng 1” chưa đồng nghĩa được gọi hưởng; R-C05/R-C06 sẽ xử lý ở lát cắt sau.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? candidates.map((candidate) => { const result = results.get(candidate.id); const trace = run.traces.find((item) => item.subject === candidate.id && item.ruleId === "R-C01"); const explanation = trace ? getRuleExplanation(trace.ruleId) : undefined; return <div key={candidate.id} className="rounded-xl border p-4"><div className="flex justify-between gap-2"><p className="font-semibold">{candidate.name}</p><Badge variant={result?.value === "rank-1" ? "success" : "warning"}>{result?.value === "rank-1" ? "Hàng thứ nhất" : "Chưa đủ dữ kiện"}</Badge></div>{explanation ? <><p className="mt-2 text-xs text-muted-foreground">{explanation.reasoning}</p><Button className="mt-2 px-0" variant="ghost" size="sm" onClick={() => setSelectedRule("R-C01")}>Đọc căn cứ</Button></> : null}</div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Kết quả và trace sẽ xuất hiện tại đây.</div>}</CardContent></Card></aside>
    </div><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Chưa phải danh sách người thực tế được hưởng · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function buildGraphFacts(deceased: string, deceasedName: string, candidates: Candidate[]): ApiFact[] {
  const facts: ApiFact[] = [{ id: `${deceased}-marker`, subject: deceased, predicate: "deceased-person", value: true }, { id: `${deceased}-label`, subject: deceased, predicate: "heir-person-label", value: deceasedName || "Người để lại di sản" }];
  for (const candidate of candidates) {
    facts.push({ id: `${candidate.id}-rank-candidate`, subject: candidate.id, predicate: "heir-rank-candidate", value: true }, { id: `${candidate.id}-rank-label`, subject: candidate.id, predicate: "heir-person-label", value: candidate.name || "Người thân" });
    if (candidate.relationship === "spouse") facts.push({ id: `${candidate.id}-spouse-edge`, subject: candidate.id, predicate: "spouse-at-opening", value: deceased });
    if (candidate.relationship === "biological-parent") facts.push({ id: `${candidate.id}-parent-edge`, subject: candidate.id, predicate: "biological-parent-of", value: deceased });
    if (candidate.relationship === "adoptive-parent") facts.push({ id: `${candidate.id}-parent-edge`, subject: candidate.id, predicate: "adoptive-parent-of", value: deceased });
    if (candidate.relationship === "biological-child") facts.push({ id: `${candidate.id}-child-edge`, subject: deceased, predicate: "biological-parent-of", value: candidate.id });
    if (candidate.relationship === "adoptive-child") facts.push({ id: `${candidate.id}-child-edge`, subject: deceased, predicate: "adoptive-parent-of", value: candidate.id });
  }
  return facts;
}

function restoreGraph(facts: ApiFact[], token: string): { deceasedId: string; deceasedName: string; candidates: Candidate[] } {
  const deceasedId = facts.find((fact) => fact.predicate === "deceased-person")?.subject ?? `deceased-${token}`;
  const deceasedName = String(facts.find((fact) => fact.subject === deceasedId && fact.predicate === "heir-person-label")?.value ?? "Người để lại di sản");
  let ids = [...new Set(facts.flatMap((fact) => fact.predicate === "heir-rank-candidate" && fact.subject ? [fact.subject] : []))];
  if (!ids.length) ids = [...new Set(facts.flatMap((fact) => fact.predicate === "eligibility-candidate" && fact.subject ? [fact.subject] : []))];
  const candidates = ids.map((id, index) => ({ id, name: String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? `Người thân ${index + 1}`), relationship: restoreRelationship(facts, deceasedId, id) }));
  return { deceasedId, deceasedName, candidates: candidates.length ? candidates : [{ id: `person-${token}-0`, name: "Người thân 1" }] };
}
function restoreRelationship(facts: ApiFact[], deceased: string, person: string): Relationship | undefined {
  if (facts.some((fact) => fact.subject === person && fact.predicate === "spouse-at-opening" && fact.value === deceased)) return "spouse";
  if (facts.some((fact) => fact.subject === person && fact.predicate === "biological-parent-of" && fact.value === deceased)) return "biological-parent";
  if (facts.some((fact) => fact.subject === person && fact.predicate === "adoptive-parent-of" && fact.value === deceased)) return "adoptive-parent";
  if (facts.some((fact) => fact.subject === deceased && fact.predicate === "biological-parent-of" && fact.value === person)) return "biological-child";
  if (facts.some((fact) => fact.subject === deceased && fact.predicate === "adoptive-parent-of" && fact.value === person)) return "adoptive-child";
}
function relationshipLabel(value?: Relationship): string { return relationships.find((relationship) => relationship.id === value)?.label ?? "Chưa nối quan hệ"; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
