"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
interface RepresentationPath { candidate: string; represented: string; originalChild: string; generation: 2 | 3 }

export function RepresentationWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const paths = useMemo(() => discoverRepresentationPaths(initialCase?.facts ?? []), [initialCase?.facts]);
  const existingCandidates = useMemo(() => new Set((initialCase?.facts ?? []).filter((fact) => fact.predicate === "representation-candidate" && fact.value === true).map((fact) => fact.subject ?? "")), [initialCase?.facts]);
  const [selected, setSelected] = useState<Set<string>>(() => existingCandidates.size ? existingCandidates : new Set(paths.map((path) => path.candidate)));
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const results = useMemo(() => new Map(run?.results.filter((result) => result.predicate === "inherits-by-representation").map((result) => [result.subject, result]) ?? []), [run]);
  const adoptionResults = useMemo(() => run?.results.filter((result) => result.predicate === "adoption-inheritance-basis") ?? [], [run]);
  const dualParentage = useMemo(() => new Set(run?.results.filter((result) => result.predicate === "dual-parentage-inheritance-basis").map((result) => result.subject) ?? []), [run]);
  const labels = useMemo(() => personLabels(initialCase?.facts ?? []), [initialCase?.facts]);
  const hasAdoptionEdges = initialCase?.facts.some((fact) => fact.predicate === "adoptive-parent-of") ?? false;

  function toggle(person: string) {
    setSelected((current) => { const next = new Set(current); if (next.has(person)) next.delete(person); else next.add(person); return next; });
    setRun(undefined);
  }

  function runInference() {
    if (!initialCase) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = initialCase.facts.filter((fact) => fact.predicate !== "representation-candidate");
        const markers: ApiFact[] = [...selected].map((person, index) => ({ id: `representation-candidate-${index + 1}`, subject: person, predicate: "representation-candidate", value: true }));
        await requestJson(`/api/cases/${initialCase.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: initialCase.id, facts: [...retained, ...markers] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${initialCase.id}/inference/representation`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }

  if (!initialCase) return <EmptyRepresentationState module={module} />;

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-E01–R-E03 · rà soát graph dùng chung</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button><Button asChild variant="outline" size="sm"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Mở graph quan hệ</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge></div></div></header>
    <main className="mx-auto grid max-w-6xl gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_370px]">
      <section className="space-y-4"><Card><CardHeader><Badge variant="outline">Nhánh có khả năng thế vị</Badge><CardTitle className="pt-2">{initialCase.title}</CardTitle><CardDescription>Hệ thống dò đường cha/mẹ–con dài hai hoặc ba cạnh. Chọn người cần xét; việc chọn chỉ tạo marker phạm vi, không khẳng định họ được hưởng.</CardDescription></CardHeader><CardContent className="space-y-3">{paths.length ? paths.map((path) => <button key={`${path.candidate}-${path.generation}`} type="button" onClick={() => toggle(path.candidate)} className={cn("w-full rounded-xl border p-4 text-left", selected.has(path.candidate) && "border-primary bg-primary/[0.05]")}><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{labelOf(labels, path.candidate)}</span><Badge variant={selected.has(path.candidate) ? "success" : "secondary"}>{selected.has(path.candidate) ? "Đang xét" : "Bỏ qua"}</Badge></span><span className="mt-2 block text-sm text-muted-foreground">{path.generation === 2 ? "Cháu" : "Chắt"} → thế vị cho {labelOf(labels, path.represented)}</span><code className="mt-2 block overflow-x-auto rounded bg-muted p-2 text-[11px]">{labelOf(labels, path.originalChild)} → {path.generation === 3 ? `${labelOf(labels, path.represented)} → ` : ""}{labelOf(labels, path.candidate)}</code></button>) : <div className="rounded-xl border border-dashed p-6 text-center"><p className="font-medium">Chưa phát hiện nhánh hai hoặc ba thế hệ</p><p className="mt-2 text-sm text-muted-foreground">Graph hiện tại chưa có đủ cạnh cha/mẹ đẻ–con để tạo ứng viên R-E01/R-E02.</p><Button asChild className="mt-4" variant="outline"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Kiểm tra graph quan hệ</Link></Button></div>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Quan hệ con nuôi trong graph</CardTitle><CardDescription>R-E03 giữ quan hệ cha/mẹ nuôi–con nuôi theo cả hai chiều và không biến căn cứ này thành kết luận được hưởng cuối cùng.</CardDescription></CardHeader><CardContent>{hasAdoptionEdges ? <p className="text-sm text-emerald-700">Đã phát hiện cạnh <code>adoptive-parent-of</code>. CLIPS sẽ tạo căn cứ quan hệ khi chạy.</p> : <p className="text-sm text-muted-foreground">Chưa có cạnh cha/mẹ nuôi–con nuôi. Có thể bổ sung trong graph editor dùng chung.</p>}<Button className="mt-3" variant="outline" onClick={() => setSelectedRule("R-E03a")}>Đọc Điều 653</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Điều kiện được dùng lại</CardTitle><CardDescription>R-E01/R-E02 cần tình trạng sống và kết quả Điều 621 của cả người được thế vị lẫn ứng viên. Ứng viên còn cần trạng thái từ chối.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={`/cases/${initialCase.id}/modules/eligibility`}>Rà soát Điều 621</Link></Button><Button variant="outline" onClick={() => setSelectedRule("R-E01")}>Đọc Điều 652</Button></CardContent></Card>
        <div className="flex justify-end"><Button disabled={(!selected.size && !hasAdoptionEdges) || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Chạy suy luận${selected.size ? ` ${selected.size} ứng viên thế vị` : " quan hệ"}`}</Button></div>
      </section>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả mô-đun</Badge><CardTitle className="pt-2">{run ? `${run.results.length} kết quả` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Quan hệ pháp lý và kết luận thế vị được trình bày tách biệt.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run && adoptionResults.length ? <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4"><p className="text-sm font-semibold">Căn cứ quan hệ con nuôi</p><div className="mt-2 space-y-2">{adoptionResults.map((result) => <div key={result.subject} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{labelOf(labels, result.subject)}</span><div className="flex gap-1"><Badge variant="success">Có căn cứ Điều 653</Badge>{dualParentage.has(result.subject) ? <Badge variant="outline">Có cả quan hệ cha/mẹ đẻ</Badge> : null}</div></div>)}</div><Button className="mt-2 px-0" variant="ghost" size="sm" onClick={() => setSelectedRule("R-E03a")}>Xem căn cứ</Button></div> : null}{run ? [...selected].map((person) => { const result = results.get(person); const missing = run.missing.filter((item) => item.subject === person); return <div key={person} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{labelOf(labels, person)}</p><Badge variant={result?.value === "true" ? "success" : result?.value === "false" ? "secondary" : "warning"}>{result?.value === "true" ? "Được thế vị" : result?.value === "false" ? "Không đủ điều kiện" : "Chưa đủ dữ kiện"}</Badge></div>{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<div className="mt-2 flex flex-wrap gap-1">{result?.derivations.filter((ruleId) => getRuleExplanation(ruleId)).map((ruleId) => <Button key={ruleId} className="h-7 px-2 text-xs" variant="ghost" size="sm" onClick={() => setSelectedRule(ruleId)}>{ruleId} · xem căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">Kết quả và dữ kiện thiếu sẽ xuất hiện ở đây.</div>}{run?.traces.some((trace) => getRuleExplanation(trace.ruleId)?.reviewState === "TEAM_REVIEW") ? <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Run sử dụng rule TEAM_REVIEW, chưa được phê duyệt pháp lý.</p> : null}</CardContent></Card></aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · UI chỉnh sửa cây quan hệ đang nằm trong UX debt bắt buộc · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function EmptyRepresentationState({ module }: { module: AnalysisModuleDefinition }) { return <main className="mx-auto grid min-h-screen max-w-2xl place-items-center p-6"><Card><CardHeader><Badge variant="warning">Cần graph của hồ sơ</Badge><CardTitle>{module.title}</CardTitle><CardDescription>Mô-đun thế vị không tạo một cây quan hệ riêng. Hãy mở hoặc tạo hồ sơ, nhập graph dùng chung rồi chạy mô-đun từ trang hồ sơ.</CardDescription></CardHeader><CardContent><Button asChild><Link href="/cases">Mở danh sách hồ sơ</Link></Button></CardContent></Card></main>; }

function discoverRepresentationPaths(facts: ApiFact[]): RepresentationPath[] {
  const deceased = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  if (!deceased) return [];
  const children = new Map<string, string[]>();
  for (const fact of facts) if (fact.predicate === "biological-parent-of" && typeof fact.value === "string" && fact.subject) children.set(fact.subject, [...(children.get(fact.subject) ?? []), fact.value]);
  const paths: RepresentationPath[] = [];
  for (const originalChild of children.get(deceased) ?? []) {
    for (const grandchild of children.get(originalChild) ?? []) {
      paths.push({ candidate: grandchild, represented: originalChild, originalChild, generation: 2 });
      for (const greatGrandchild of children.get(grandchild) ?? []) paths.push({ candidate: greatGrandchild, represented: grandchild, originalChild, generation: 3 });
    }
  }
  const seen = new Set<string>();
  return paths.filter((path) => { const key = `${path.candidate}:${path.represented}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

function personLabels(facts: ApiFact[]) { const labels = new Map<string, string>(); for (const fact of facts) if ((fact.predicate === "heir-person-label" || fact.predicate === "person-label") && fact.subject) labels.set(fact.subject, String(fact.value)); return labels; }
function labelOf(labels: Map<string, string>, person: string) { return labels.get(person) ?? person; }
function missingLabel(predicate: string) { return ({ "heir-life-status": "tình trạng sống của ứng viên", "article-621-status": "kết quả Điều 621 của ứng viên", "valid-refusal": "trạng thái từ chối", "represented-person-life-status": "tình trạng sống của người được thế vị", "represented-person-article-621-status": "kết quả Điều 621 của người được thế vị", "representation-path-or-qualification": "đường quan hệ hoặc điều kiện của nhánh" } as Record<string, string>)[predicate] ?? predicate; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
