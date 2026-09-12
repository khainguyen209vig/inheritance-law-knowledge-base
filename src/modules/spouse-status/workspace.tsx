"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
interface SpouseDraft { id: string; name: string; jointPropertyDivided?: boolean; divorcePending?: boolean; decisionEffective?: boolean; remarriedAfterOpening?: boolean }

const ownedPredicates = new Set(["spouse-status-assessment-subject", "joint-property-divided", "divorce-petition-pending-at-opening", "divorce-decision-effective-at-opening", "remarried-after-opening"]);

export function SpouseStatusWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const initialPeople = useMemo(() => restoreSpouses(initialCase?.facts ?? []), [initialCase?.facts]);
  const [people, setPeople] = useState(initialPeople);
  const [activeId, setActiveId] = useState(initialPeople[0]?.id);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = people.find((person) => person.id === activeId) ?? people[0];
  const facts = useMemo(() => buildFacts(people), [people]);
  const results = useMemo(() => new Map(run?.results.filter((item) => item.predicate === "spouse-status-at-opening").map((item) => [item.subject, item]) ?? []), [run]);

  function update(update: Partial<SpouseDraft>) {
    if (!active) return;
    setPeople((current) => current.map((person) => person.id === active.id ? { ...person, ...update } : person));
    setRun(undefined);
  }

  function runInference() {
    if (!initialCase) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = initialCase.facts.filter((fact) => !ownedPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${initialCase.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: initialCase.id, facts: [...retained, ...facts] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${initialCase.id}/inference/spouse-status`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }

  if (!initialCase || !people.length) return <EmptyState module={module} caseId={initialCase?.id} />;

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-G01–R-G03 · Điều 655</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button><Button asChild variant="outline" size="sm"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Mở graph</Link></Button><Badge variant="warning">Knowledge base draft</Badge></div></div></header>
    <main className="mx-auto grid max-w-[1450px] gap-5 p-4 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)_390px]">
      <aside><Card><CardHeader><CardTitle>Vợ/chồng trong graph</CardTitle><CardDescription>Danh sách được lấy từ cạnh `spouse-at-opening`, không nhập lại quan hệ.</CardDescription></CardHeader><CardContent className="space-y-2">{people.map((person) => { const result = results.get(person.id); return <button key={person.id} type="button" onClick={() => setActiveId(person.id)} className={cn("w-full rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", active?.id === person.id && "border-primary bg-primary/[0.05]")}><span className="flex items-center justify-between gap-2"><span className="font-semibold">{person.name}</span>{result ? <StatusBadge value={result.value} /> : null}</span></button>; })}</CardContent></Card></aside>
      <section className="space-y-4">{active ? <Card><CardHeader><Badge variant="outline">{active.name}</Badge><CardTitle className="pt-2">Các sự kiện liên quan tới quan hệ vợ chồng</CardTitle><CardDescription>Mỗi câu trả lời tạo một fact quan sát độc lập. Hệ thống chỉ bảo toàn tư cách tại thời điểm mở thừa kế, chưa kết luận quyền hưởng cuối cùng.</CardDescription></CardHeader><CardContent className="space-y-6"><Question title="Vợ chồng đã chia tài sản chung trong thời kỳ hôn nhân?" ruleId="R-G01" onOpenRule={setSelectedRule}><BooleanChoice value={active.jointPropertyDivided} onChange={(value) => update({ jointPropertyDivided: value })} /></Question><Question title="Tại thời điểm mở thừa kế, hai bên đang xin ly hôn?" ruleId="R-G02" onOpenRule={setSelectedRule}><BooleanChoice value={active.divorcePending} onChange={(value) => update({ divorcePending: value, decisionEffective: value ? active.decisionEffective : undefined })} /></Question>{active.divorcePending ? <Question title="Bản án hoặc quyết định ly hôn đã có hiệu lực tại thời điểm đó?" ruleId="R-G02" onOpenRule={setSelectedRule}><BooleanChoice value={active.decisionEffective} onChange={(value) => update({ decisionEffective: value })} yes="Đã có hiệu lực" no="Chưa có hiệu lực" /></Question> : null}<Question title="Người còn sống kết hôn với người khác sau thời điểm mở thừa kế?" ruleId="R-G03" onOpenRule={setSelectedRule}><BooleanChoice value={active.remarriedAfterOpening} onChange={(value) => update({ remarriedAfterOpening: value })} /></Question></CardContent></Card> : null}<Card><CardHeader><CardTitle>Facts sẽ gửi tới CLIPS</CardTitle><CardDescription>Quan hệ graph được giữ lại trong hồ sơ; bên dưới chỉ là facts thuộc nhóm G.</CardDescription></CardHeader><CardContent><details><summary className="cursor-pointer text-sm font-medium">Xem {facts.length} facts nhóm G</summary><div className="mt-3 rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{facts.map((fact) => <code key={fact.id} className="block">{fact.predicate}({fact.subject}, {String(fact.value)})</code>)}</div></details></CardContent></Card><div className="flex justify-end"><Button disabled={isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu và xét ${people.length} người`}</Button></div></section>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả Điều 655</Badge><CardTitle className="pt-2">{run ? `${people.length} người được rà soát` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>`unknown` không có nghĩa hôn nhân vô hiệu; nó chỉ cho biết chưa có căn cứ bảo toàn từ ba tình huống đặc biệt đang xét.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? people.map((person) => { const result = results.get(person.id); const missing = run.missing.filter((item) => item.subject === person.id); const traces = run.traces.filter((trace) => trace.subject === person.id && getRuleExplanation(trace.ruleId)?.kind === "legal"); return <div key={person.id} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{person.name}</p><StatusBadge value={result?.value ?? "unknown"} /></div><p className="mt-2 text-sm">{result?.value === "valid" ? "Có căn cứ Điều 655 để giữ tư cách vợ/chồng tại thời điểm mở thừa kế." : "Chưa dẫn xuất được căn cứ bảo toàn thuộc nhóm G; không phải kết luận mất quyền."}</p>{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<div className="mt-3 flex flex-wrap gap-1">{traces.map((trace) => <Button key={`${trace.ruleId}-${trace.conclusionPredicate}`} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedRule(trace.ruleId)}>{trace.ruleId} · xem căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">Kết quả, facts thiếu và căn cứ Điều 655 sẽ xuất hiện tại đây.</div>}</CardContent></Card></aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Không kết luận quyền hưởng cuối cùng · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function restoreSpouses(facts: ApiFact[]): SpouseDraft[] {
  const deceased = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  if (!deceased) return [];
  const ids = [...new Set(facts.flatMap((fact) => fact.predicate === "spouse-at-opening" && (fact.subject === deceased || fact.value === deceased) ? [fact.subject === deceased ? String(fact.value) : String(fact.subject)] : []))];
  return ids.map((id) => { const own = facts.filter((fact) => fact.subject === id); return { id, name: String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? id), jointPropertyDivided: booleanValue(own, "joint-property-divided"), divorcePending: booleanValue(own, "divorce-petition-pending-at-opening"), decisionEffective: booleanValue(own, "divorce-decision-effective-at-opening"), remarriedAfterOpening: booleanValue(own, "remarried-after-opening") }; });
}
function booleanValue(facts: ApiFact[], predicate: string): boolean | undefined { const value = facts.find((fact) => fact.predicate === predicate)?.value; return typeof value === "boolean" ? value : undefined; }
function buildFacts(people: SpouseDraft[]): ApiFact[] { return people.flatMap((person): ApiFact[] => { const facts: ApiFact[] = [{ id: `${person.id}-spouse-scope`, subject: person.id, predicate: "spouse-status-assessment-subject", value: true }]; if (person.jointPropertyDivided !== undefined) facts.push({ id: `${person.id}-property-divided`, subject: person.id, predicate: "joint-property-divided", value: person.jointPropertyDivided }); if (person.divorcePending !== undefined) facts.push({ id: `${person.id}-divorce-pending`, subject: person.id, predicate: "divorce-petition-pending-at-opening", value: person.divorcePending }); if (person.divorcePending && person.decisionEffective !== undefined) facts.push({ id: `${person.id}-decision-effective`, subject: person.id, predicate: "divorce-decision-effective-at-opening", value: person.decisionEffective }); if (person.remarriedAfterOpening !== undefined) facts.push({ id: `${person.id}-remarried`, subject: person.id, predicate: "remarried-after-opening", value: person.remarriedAfterOpening }); return facts; }); }
function Question({ title, ruleId, onOpenRule, children }: { title: string; ruleId: string; onOpenRule: (ruleId: string) => void; children: ReactNode }) { return <div><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{title}</p><Button variant="ghost" size="sm" onClick={() => onOpenRule(ruleId)}>{ruleId} · điều luật</Button></div><div className="mt-2">{children}</div></div>; }
function BooleanChoice({ value, onChange, yes = "Có", no = "Không" }: { value?: boolean; onChange: (value: boolean) => void; yes?: string; no?: string }) { return <div className="grid gap-2 sm:grid-cols-2"><button type="button" aria-pressed={value === true} onClick={() => onChange(true)} className={cn("rounded-lg border p-3 text-left text-sm font-medium", value === true && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{yes}</button><button type="button" aria-pressed={value === false} onClick={() => onChange(false)} className={cn("rounded-lg border p-3 text-left text-sm font-medium", value === false && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{no}</button></div>; }
function StatusBadge({ value }: { value: string }) { return <Badge variant={value === "valid" ? "success" : "warning"}>{value === "valid" ? "Tư cách được giữ" : "Chưa xác định"}</Badge>; }
function missingLabel(predicate: string) { return ({ "spouse-at-opening": "quan hệ vợ/chồng tại thời điểm mở thừa kế", "joint-property-divided": "trạng thái chia tài sản chung", "divorce-petition-pending-at-opening": "trạng thái yêu cầu ly hôn", "divorce-decision-effective-at-opening": "hiệu lực bản án/quyết định ly hôn", "remarried-after-opening": "việc kết hôn sau thời điểm mở thừa kế" } as Record<string, string>)[predicate] ?? predicate; }
function EmptyState({ module, caseId }: { module: AnalysisModuleDefinition; caseId?: string }) { return <main className="mx-auto grid min-h-screen max-w-2xl place-items-center p-6"><Card><CardHeader><Badge variant="warning">Cần quan hệ vợ/chồng</Badge><CardTitle>{module.title}</CardTitle><CardDescription>Graph chưa có người chết và cạnh vợ/chồng tại thời điểm mở thừa kế. Hãy bổ sung quan hệ trước khi đánh giá Điều 655.</CardDescription></CardHeader><CardContent><Button asChild><Link href={caseId ? `/cases/${caseId}/modules/heir-rank` : "/cases"}>Mở graph quan hệ</Link></Button></CardContent></Card></main>; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
