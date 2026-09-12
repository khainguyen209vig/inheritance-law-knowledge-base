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
type AgeGroup = "minor" | "adult";
type WorkCapacity = "capable" | "incapable";
type FamilyRole = "biological-child" | "adopted-child" | "parent" | "spouse" | "other";
interface PersonDraft { id: string; name: string; role: FamilyRole; age?: AgeGroup; workCapacity?: WorkCapacity }

const ownedPredicates = new Set(["compulsory-share-assessment-subject", "age-group", "work-capacity-status"]);

export function CompulsoryShareWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const people = useMemo(() => restorePeople(initialCase?.facts ?? []), [initialCase?.facts]);
  const [drafts, setDrafts] = useState<PersonDraft[]>(people);
  const [activeId, setActiveId] = useState(people[0]?.id);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = drafts.find((person) => person.id === activeId) ?? drafts[0];
  const facts = useMemo(() => buildFacts(drafts), [drafts]);
  const candidateResults = useMemo(() => resultMap(run, "compulsory-heir-candidate"), [run]);
  const activeResults = useMemo(() => resultMap(run, "compulsory-heir"), [run]);
  const graphComplete = initialCase?.facts.some((fact) => fact.predicate === "heir-search-complete" && fact.value === true) ?? false;

  function update(update: Partial<PersonDraft>) {
    if (!active) return;
    setDrafts((current) => current.map((person) => person.id === active.id ? { ...person, ...update } : person));
    setRun(undefined);
  }

  function runInference() {
    if (!initialCase) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = initialCase.facts.filter((fact) => !ownedPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${initialCase.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: initialCase.id, facts: [...retained, ...facts] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${initialCase.id}/inference/compulsory-share`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }

  if (!initialCase || !drafts.length) return <EmptyState module={module} caseId={initialCase?.id} />;

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-F01–R-F04 · chưa tính giá trị 2/3</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button><Button asChild variant="outline" size="sm"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Mở graph</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge></div></div></header>
    <main className="mx-auto grid max-w-[1450px] gap-5 p-4 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)_390px]">
      <aside><Card><CardHeader><CardTitle>Người trong graph</CardTitle><CardDescription>Dùng lại node và quan hệ đã nhập ở mô-đun hàng thừa kế.</CardDescription></CardHeader><CardContent className="space-y-2">{drafts.map((person) => { const result = candidateResults.get(person.id); return <button key={person.id} type="button" onClick={() => setActiveId(person.id)} className={cn("w-full rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", active?.id === person.id && "border-primary bg-primary/[0.05]")}><span className="flex items-center justify-between gap-2"><span className="font-semibold">{person.name}</span>{result ? <CandidateBadge value={result.value} /> : null}</span><span className="mt-1 block text-xs text-muted-foreground">{roleLabel(person.role)}</span></button>; })}</CardContent></Card></aside>
      <section className="space-y-4">{!graphComplete ? <Card className="border-amber-200 bg-amber-50/50"><CardHeader><CardTitle>Graph chưa được xác nhận đầy đủ</CardTitle><CardDescription>CLIPS vẫn có thể nhận diện một quan hệ dương đã biết, nhưng sẽ không kết luận một người nằm ngoài nhóm bảo vệ chỉ từ một cây gia đình còn thiếu.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Hoàn tất graph và danh sách ứng viên</Link></Button></CardContent></Card> : null}{active ? <Card><CardHeader><Badge variant="outline">{roleLabel(active.role)}</Badge><CardTitle className="pt-2">{active.name}</CardTitle><CardDescription>Chỉ nhập quan sát cần cho nhóm đối tượng Điều 644. Quan hệ gia đình được lấy trực tiếp từ graph.</CardDescription></CardHeader><CardContent className="space-y-5">{active.role === "biological-child" || active.role === "adopted-child" ? <><Question title="Nhóm tuổi tại thời điểm mở thừa kế" description="Tuổi quyết định nhánh điểm a hoặc điểm b khoản 1."><Choice selected={active.age === "minor"} onClick={() => update({ age: "minor", workCapacity: undefined })}>Chưa thành niên</Choice><Choice selected={active.age === "adult"} onClick={() => update({ age: "adult" })}>Đã thành niên</Choice></Question>{active.age === "adult" ? <Question title="Khả năng lao động" description="R-F02 đang ở TEAM_REVIEW; chỉ chọn khi đã có căn cứ đánh giá phù hợp."><Choice selected={active.workCapacity === "incapable"} onClick={() => update({ workCapacity: "incapable" })}>Không có khả năng lao động</Choice><Choice selected={active.workCapacity === "capable"} onClick={() => update({ workCapacity: "capable" })}>Có khả năng lao động</Choice></Question> : null}</> : <p className="rounded-lg bg-muted/50 p-3 text-sm">{active.role === "parent" || active.role === "spouse" ? "Quan hệ này thuộc nhóm điểm a; không cần nhập tuổi hoặc khả năng lao động." : "Quan hệ hiện tại không thuộc nhóm được liệt kê tại khoản 1 Điều 644."}</p>}<div className="rounded-lg border border-dashed p-3 text-sm"><p className="font-medium">Điều kiện dùng lại</p><p className="mt-1 text-xs text-muted-foreground">Trạng thái từ chối lấy từ graph; kết quả quyền hưởng lấy từ mô-đun Điều 621.</p><div className="mt-2 flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}/modules/eligibility`}>Rà soát Điều 621</Link></Button><Button variant="ghost" size="sm" onClick={() => setSelectedRule("R-F01a")}>Đọc Điều 644</Button></div></div></CardContent></Card> : null}<Card><CardHeader><CardTitle>Facts của lát cắt nhóm F</CardTitle><CardDescription>Marker phạm vi không phải kết luận pháp lý; candidate do CLIPS dẫn xuất.</CardDescription></CardHeader><CardContent><details><summary className="cursor-pointer text-sm font-medium">Xem {facts.length} asserted facts</summary><div className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{facts.map((fact) => <code key={fact.id} className="block">{fact.predicate}({fact.subject}, {String(fact.value)})</code>)}</div></details></CardContent></Card><div className="flex justify-end"><Button disabled={isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu dữ kiện và xét ${drafts.length} người`}</Button></div></section>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả phân lớp</Badge><CardTitle className="pt-2">{run ? `${drafts.length} người được rà soát` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>“Đủ điều kiện cá nhân” chưa phải số tiền hoặc tỷ lệ được hưởng.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? drafts.map((person) => { const candidate = candidateResults.get(person.id); const status = activeResults.get(person.id); const missing = run.missing.filter((item) => item.subject === person.id); const ruleIds = [...new Set([...(candidate?.derivations ?? []), ...(status?.derivations ?? [])])]; return <div key={person.id} className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{person.name}</p><CandidateBadge value={candidate?.value ?? "unknown"} /></div>{candidate?.value === "true" ? <p className="mt-2 text-sm">{status?.value === "true" ? "Đủ điều kiện cá nhân; chờ đối chiếu ngưỡng 2/3." : status?.value === "false" ? "Không áp dụng suất bắt buộc do từ chối hoặc Điều 621." : "Chưa đủ dữ kiện về từ chối hoặc Điều 621."}</p> : null}{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<div className="mt-2 flex flex-wrap gap-1">{ruleIds.filter((ruleId) => getRuleExplanation(ruleId)).map((ruleId) => <Button key={ruleId} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedRule(ruleId)}>{ruleId} · căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">Kết quả, dữ kiện thiếu và căn cứ Điều 644 sẽ xuất hiện tại đây.</div>}<p className="rounded-lg bg-sky-50 p-3 text-xs text-sky-900">R-F01c chưa triển khai: hệ thống chưa so sánh phần di chúc với hai phần ba suất pháp luật và chưa tính phần bù.</p></CardContent></Card></aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Chỉ phân loại nhóm được bảo vệ, chưa tính phân chia di sản · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function restorePeople(facts: ApiFact[]): PersonDraft[] {
  const deceased = facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  if (!deceased) return [];
  const ids = [...new Set(facts.flatMap((fact) => fact.predicate === "heir-rank-candidate" && fact.value === true && fact.subject ? [fact.subject] : []))];
  return ids.map((id) => ({ id, name: String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? id), role: familyRole(facts, deceased, id), age: facts.find((fact) => fact.subject === id && fact.predicate === "age-group")?.value as AgeGroup | undefined, workCapacity: facts.find((fact) => fact.subject === id && fact.predicate === "work-capacity-status")?.value as WorkCapacity | undefined }));
}
function familyRole(facts: ApiFact[], deceased: string, person: string): FamilyRole { if (facts.some((fact) => fact.subject === deceased && fact.value === person && fact.predicate === "biological-parent-of")) return "biological-child"; if (facts.some((fact) => fact.subject === deceased && fact.value === person && fact.predicate === "adoptive-parent-of")) return "adopted-child"; if (facts.some((fact) => fact.subject === person && fact.value === deceased && (fact.predicate === "biological-parent-of" || fact.predicate === "adoptive-parent-of"))) return "parent"; if (facts.some((fact) => ((fact.subject === person && fact.value === deceased) || (fact.subject === deceased && fact.value === person)) && fact.predicate === "spouse-at-opening")) return "spouse"; return "other"; }
function buildFacts(people: PersonDraft[]): ApiFact[] { return people.flatMap((person, index) => { const prefix = `cs-person-${index + 1}`; const facts: ApiFact[] = [{ id: `${prefix}-scope`, subject: person.id, predicate: "compulsory-share-assessment-subject", value: true }]; if (person.age) facts.push({ id: `${prefix}-age`, subject: person.id, predicate: "age-group", value: person.age }); if (person.age === "adult" && person.workCapacity) facts.push({ id: `${prefix}-capacity`, subject: person.id, predicate: "work-capacity-status", value: person.workCapacity }); return facts; }); }
function Question({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06]")}>{children}</button>; }
function CandidateBadge({ value }: { value: string }) { return <Badge variant={value === "true" ? "success" : value === "false" ? "secondary" : "warning"}>{value === "true" ? "Thuộc nhóm bảo vệ" : value === "false" ? "Không thuộc nhóm" : "Chưa xác định"}</Badge>; }
function roleLabel(role: FamilyRole) { return ({ "biological-child": "Con đẻ", "adopted-child": "Con nuôi", parent: "Cha/mẹ", spouse: "Vợ/chồng", other: "Quan hệ khác" } as Record<FamilyRole, string>)[role]; }
function resultMap(run: InferenceRun | undefined, predicate: string) { return new Map(run?.results.filter((item) => item.predicate === predicate).map((item) => [item.subject, item]) ?? []); }
function missingLabel(predicate: string) { return ({ "family-graph-completeness": "xác nhận graph gia đình đầy đủ", "age-group": "nhóm tuổi", "work-capacity-status": "đánh giá khả năng lao động", "valid-refusal": "trạng thái từ chối", "article-621-status": "kết quả Điều 621" } as Record<string, string>)[predicate] ?? predicate; }
function EmptyState({ module, caseId }: { module: AnalysisModuleDefinition; caseId?: string }) { return <main className="mx-auto grid min-h-screen max-w-2xl place-items-center p-6"><Card><CardHeader><Badge variant="warning">Cần graph gia đình</Badge><CardTitle>{module.title}</CardTitle><CardDescription>Chưa có danh sách người từ graph. Hãy tạo quan hệ và ứng viên ở mô-đun hàng thừa kế trước.</CardDescription></CardHeader><CardContent><Button asChild><Link href={caseId ? `/cases/${caseId}/modules/heir-rank` : "/cases"}>Mở graph quan hệ</Link></Button></CardContent></Card></main>; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
