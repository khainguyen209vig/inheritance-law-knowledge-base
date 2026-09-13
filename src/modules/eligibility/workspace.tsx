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
import { buildEligibilityFacts, eligibilityGrounds, eligibilityGroundTitle, eligibilityPredicates, eligibilityResultLabel, restoreEligibilityPeople, type EligibilityPersonDraft } from "@/modules/eligibility/model";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }

export function EligibilityWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const stableToken = `draft-${useId().toLowerCase().replace(/[^a-z0-9]/g, "") || "case"}`;
  const caseId = useRef(initialCase?.id ?? `case-${stableToken}`);
  const caseCreated = useRef(Boolean(initialCase));
  const willSubjects = useMemo(() => [...new Set((initialCase?.facts ?? []).flatMap((fact) => fact.predicate === "will-type" && fact.subject ? [fact.subject] : []))], [initialCase?.facts]);
  const initialPeople = useMemo(() => restoreEligibilityPeople(initialCase?.facts ?? [], `person-${stableToken}-0`, willSubjects[0]), [initialCase?.facts, stableToken, willSubjects]);
  const counter = useRef(initialPeople.length + 1);
  const [people, setPeople] = useState<EligibilityPersonDraft[]>(initialPeople);
  const [activeId, setActiveId] = useState(initialPeople[0]?.id);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = people.find((person) => person.id === activeId) ?? people[0];
  const facts = useMemo(() => buildEligibilityFacts(people), [people]);
  const results = useMemo(() => new Map(run?.results.filter((item) => item.predicate === "article-621-status").map((item) => [item.subject, item]) ?? []), [run]);

  function update(update: Partial<EligibilityPersonDraft>) { if (!active) return; setPeople((current) => current.map((person) => person.id === active.id ? { ...person, ...update } : person)); setRun(undefined); }
  function addPerson() { const n = counter.current++; const person = { id: `person-${stableToken}-${n}`, name: `Người được xét ${people.length + 1}`, exception: false, will: willSubjects[0] }; setPeople((current) => [...current, person]); setActiveId(person.id); setRun(undefined); }
  function removePerson(id: string) { setPeople((current) => { const remaining = current.filter((person) => person.id !== id); setActiveId(remaining[0]?.id); return remaining; }); setRun(undefined); }
  function runInference() {
    startTransition(async () => {
      setError(undefined);
      try {
        if (!caseCreated.current) { await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) }); caseCreated.current = true; }
        else await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
        const retained = (initialCase?.facts ?? []).filter((fact) => !eligibilityPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${caseId.current}/facts`, { method: "PUT", body: JSON.stringify({ subject: caseId.current, facts: [...retained, ...facts] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${caseId.current}/inference/eligibility`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }
  const ready = people.length > 0 && people.every((person) => person.name.trim() && person.ground && (!person.exception || person.will));

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · Điều 621 · đánh giá theo từng người</p></div><div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Mô-đun</Link></Button><Badge variant="warning">Draft / TEAM_REVIEW</Badge></div></div></header>
    <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)_390px]">
      <aside className="space-y-4"><Card><CardHeader><CardTitle>Hồ sơ</CardTitle></CardHeader><CardContent><label className="space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} onChange={(event) => setTitle(event.target.value)} /></label></CardContent></Card><Card><CardHeader><div className="flex justify-between"><CardTitle>Người được xét</CardTitle><Badge variant="secondary">{people.length}</Badge></div></CardHeader><CardContent className="space-y-2">{people.map((person) => { const result = results.get(person.id); return <button key={person.id} type="button" onClick={() => setActiveId(person.id)} className={cn("w-full rounded-lg border p-3 text-left", active?.id === person.id && "border-primary bg-primary/[0.05]")}><span className="flex justify-between gap-2 text-sm font-semibold"><span>{person.name}</span>{result ? <Badge variant={result.value === "true" ? "success" : result.value === "false" ? "destructive" : "warning"}>{eligibilityResultLabel(result.value)}</Badge> : null}</span><span className="mt-1 block text-xs text-muted-foreground">{eligibilityGroundTitle(person.ground)}</span></button>; })}<Button className="w-full" variant="outline" onClick={addPerson}>+ Thêm người</Button></CardContent></Card></aside>
      <main className="space-y-4">{active ? <Card><CardHeader><div className="flex justify-between"><Badge variant="outline">{active.id}</Badge><Button variant="ghost" size="sm" onClick={() => removePerson(active.id)}>Xóa người này</Button></div><CardTitle>Rà soát căn cứ loại trừ</CardTitle><CardDescription>Chọn trạng thái đã có căn cứ trong hồ sơ; đây không phải câu hỏi về kết luận cuối cùng.</CardDescription></CardHeader><CardContent className="space-y-5"><label className="block max-w-md space-y-2 text-sm font-medium">Tên hiển thị<Input value={active.name} maxLength={80} onChange={(event) => update({ name: event.target.value })} /></label><div className="grid gap-3 sm:grid-cols-2">{eligibilityGrounds.map((ground) => <button key={ground.id} type="button" aria-pressed={active.ground === ground.id} onClick={() => update({ ground: ground.id, exception: ground.id === "clear" ? false : active.exception })} className={cn("rounded-xl border p-4 text-left", active.ground === ground.id && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="flex justify-between gap-2 font-semibold"><span>{ground.title}</span><Badge variant="outline">{ground.ruleId}</Badge></span><span className="mt-2 block text-sm text-muted-foreground">{ground.detail}</span></button>)}</div>{active.ground && active.ground !== "clear" ? <div className="rounded-xl border p-4"><p className="font-semibold">Ngoại lệ Điều 621 khoản 2</p><p className="mt-1 text-sm text-muted-foreground">Người để lại di sản đã biết hành vi nhưng vẫn chỉ định người này hưởng theo di chúc?</p><div className="mt-3 flex gap-2"><Button variant={active.exception ? "secondary" : "outline"} disabled={!willSubjects.length} onClick={() => update({ exception: true, will: active.will ?? willSubjects[0] })}>Có ngoại lệ</Button><Button variant={!active.exception ? "secondary" : "outline"} onClick={() => update({ exception: false })}>Không</Button></div>{!willSubjects.length ? <p className="mt-2 text-xs text-amber-800">Hồ sơ chưa có di chúc để áp dụng ngoại lệ.</p> : null}{active.exception ? <div className="mt-3 flex flex-wrap gap-2">{willSubjects.map((will) => <Button key={will} size="sm" variant={active.will === will ? "secondary" : "outline"} onClick={() => update({ will })}>{will}</Button>)}</div> : null}<Button className="mt-3 px-0" variant="ghost" size="sm" onClick={() => setSelectedRuleId("R-D05")}>Đọc khoản 2</Button></div> : null}</CardContent></Card> : <Card><CardContent className="py-12 text-center text-muted-foreground">Hãy thêm một người để bắt đầu.</CardContent></Card>}<div className="flex justify-end"><Button disabled={!ready || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu và suy luận ${people.length} người`}</Button></div></main>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả từng người</Badge><CardTitle className="pt-2">{run ? `${run.results.length} kết quả` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Kết quả chỉ phản ánh căn cứ loại trừ tại Điều 621, chưa phải phân chia di sản cuối cùng.</CardDescription></CardHeader><CardContent className="space-y-4">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? people.map((person) => { const result = results.get(person.id); const traces = run.traces.filter((trace) => trace.subject === person.id); return <div key={person.id} className="rounded-xl border p-4"><div className="flex justify-between gap-2"><p className="font-semibold">{person.name}</p>{result ? <Badge variant={result.value === "true" ? "success" : result.value === "false" ? "destructive" : "warning"}>{eligibilityResultLabel(result.value)}</Badge> : null}</div>{result ? <p className="mt-2 text-xs text-muted-foreground">Dẫn xuất: {result.derivations.join(", ")}</p> : null}<ol className="mt-3 space-y-2">{traces.map((trace) => { const explanation = getRuleExplanation(trace.ruleId); return <li key={`${trace.ruleId}-${trace.conclusionPredicate}`} className="rounded bg-muted/60 p-2 text-xs"><button className="font-semibold text-primary" onClick={() => setSelectedRuleId(trace.ruleId)}>{trace.ruleId}: {explanation?.conclusion ?? trace.conclusionPredicate}</button></li>; })}</ol></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Kết quả và trace sẽ xuất hiện tại đây.</div>}</CardContent></Card></aside>
    </div><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Không phải tư vấn pháp lý · Knowledge base chưa được phê duyệt</footer><LegalRuleDialog ruleId={selectedRuleId} onOpenChange={(open) => { if (!open) setSelectedRuleId(undefined); }} />
  </div>;
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
