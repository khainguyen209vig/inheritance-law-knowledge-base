"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import { buildCompulsoryAssessmentFacts, compulsoryRoleLabel, restoreCompulsoryPeople, type CompulsoryPersonDraft } from "@/modules/compulsory-share/model";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
interface PortionDraft { id: string; name: string }
interface CalculationDraft { id: string; personId: string; portionId: string; statutoryShare?: number; testamentaryShare?: number }

const ownedPredicates = new Set(["compulsory-share-assessment-subject", "age-group", "work-capacity-status", "compulsory-share-calculation", "calculation-person", "calculation-estate-portion", "hypothetical-statutory-share", "testamentary-share-received"]);

export function CompulsoryShareWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const people = useMemo(() => restoreCompulsoryPeople(initialCase?.facts ?? []), [initialCase?.facts]);
  const portions = useMemo(() => restorePortions(initialCase?.facts ?? []), [initialCase?.facts]);
  const initialCalculations = useMemo(() => restoreCalculations(initialCase?.facts ?? [], people, portions), [initialCase?.facts, people, portions]);
  const [drafts, setDrafts] = useState<CompulsoryPersonDraft[]>(people);
  const [calculations, setCalculations] = useState<CalculationDraft[]>(initialCalculations);
  const [activeId, setActiveId] = useState(people[0]?.id);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = drafts.find((person) => person.id === activeId) ?? drafts[0];
  const facts = useMemo(() => [...buildCompulsoryAssessmentFacts(drafts), ...buildCalculationFacts(calculations)], [drafts, calculations]);
  const candidateResults = useMemo(() => resultMap(run, "compulsory-heir-candidate"), [run]);
  const activeResults = useMemo(() => resultMap(run, "compulsory-heir"), [run]);
  const minimumResults = useMemo(() => resultMap(run, "minimum-compulsory-share"), [run]);
  const applicationResults = useMemo(() => resultMap(run, "minimum-share-rule-applies"), [run]);
  const shortfallResults = useMemo(() => resultMap(run, "compulsory-share-shortfall"), [run]);
  const graphComplete = initialCase?.facts.some((fact) => fact.predicate === "heir-search-complete" && fact.value === true) ?? false;

  function update(update: Partial<CompulsoryPersonDraft>) {
    if (!active) return;
    setDrafts((current) => current.map((person) => person.id === active.id ? { ...person, ...update } : person));
    setRun(undefined);
  }

  function updateCalculation(calculationId: string, field: "statutoryShare" | "testamentaryShare", rawValue: string) {
    const value = rawValue === "" ? undefined : Number(rawValue);
    setCalculations((current) => current.map((calculation) => calculation.id === calculationId ? { ...calculation, [field]: Number.isFinite(value) ? value : undefined } : calculation));
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
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-F01–R-F04 · tính ngưỡng theo từng phần</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button><Button asChild variant="outline" size="sm"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Mở graph</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge></div></div></header>
    <main className="mx-auto grid max-w-[1450px] gap-5 p-4 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)_390px]">
      <aside><Card><CardHeader><CardTitle>Người trong graph</CardTitle><CardDescription>Dùng lại node và quan hệ đã nhập ở mô-đun hàng thừa kế.</CardDescription></CardHeader><CardContent className="space-y-2">{drafts.map((person) => { const result = candidateResults.get(person.id); return <button key={person.id} type="button" onClick={() => setActiveId(person.id)} className={cn("w-full rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", active?.id === person.id && "border-primary bg-primary/[0.05]")}><span className="flex items-center justify-between gap-2"><span className="font-semibold">{person.name}</span>{result ? <CandidateBadge value={result.value} /> : null}</span><span className="mt-1 block text-xs text-muted-foreground">{compulsoryRoleLabel(person.role)}</span></button>; })}</CardContent></Card></aside>
      <section className="space-y-4">{!graphComplete ? <Card className="border-amber-200 bg-amber-50/50"><CardHeader><CardTitle>Graph chưa được xác nhận đầy đủ</CardTitle><CardDescription>CLIPS vẫn có thể nhận diện một quan hệ dương đã biết, nhưng sẽ không kết luận một người nằm ngoài nhóm bảo vệ chỉ từ một cây gia đình còn thiếu.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link href={`/cases/${initialCase.id}/modules/heir-rank`}>Hoàn tất graph và danh sách ứng viên</Link></Button></CardContent></Card> : null}{active ? <Card><CardHeader><Badge variant="outline">{compulsoryRoleLabel(active.role)}</Badge><CardTitle className="pt-2">{active.name}</CardTitle><CardDescription>Chỉ nhập quan sát cần cho nhóm đối tượng Điều 644. Quan hệ gia đình được lấy trực tiếp từ graph.</CardDescription></CardHeader><CardContent className="space-y-5">{active.role === "biological-child" || active.role === "adopted-child" ? <><Question title="Nhóm tuổi tại thời điểm mở thừa kế" description="Tuổi quyết định nhánh điểm a hoặc điểm b khoản 1."><Choice selected={active.age === "minor"} onClick={() => update({ age: "minor", workCapacity: undefined })}>Chưa thành niên</Choice><Choice selected={active.age === "adult"} onClick={() => update({ age: "adult" })}>Đã thành niên</Choice></Question>{active.age === "adult" ? <Question title="Khả năng lao động" description="R-F02 đang ở TEAM_REVIEW; chỉ chọn khi đã có căn cứ đánh giá phù hợp."><Choice selected={active.workCapacity === "incapable"} onClick={() => update({ workCapacity: "incapable" })}>Không có khả năng lao động</Choice><Choice selected={active.workCapacity === "capable"} onClick={() => update({ workCapacity: "capable" })}>Có khả năng lao động</Choice></Question> : null}</> : <p className="rounded-lg bg-muted/50 p-3 text-sm">{active.role === "parent" || active.role === "spouse" ? "Quan hệ này thuộc nhóm điểm a; không cần nhập tuổi hoặc khả năng lao động." : "Quan hệ hiện tại không thuộc nhóm được liệt kê tại khoản 1 Điều 644."}</p>}<div className="rounded-lg border border-dashed p-3 text-sm"><p className="font-medium">Điều kiện dùng lại</p><p className="mt-1 text-xs text-muted-foreground">Trạng thái từ chối lấy từ graph; kết quả quyền hưởng lấy từ mô-đun Điều 621.</p><div className="mt-2 flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}/modules/eligibility`}>Rà soát Điều 621</Link></Button><Button variant="ghost" size="sm" onClick={() => setSelectedRule("R-F01a")}>Đọc Điều 644</Button></div></div></CardContent></Card> : null}{active ? <Card><CardHeader><CardTitle>Đối chiếu ngưỡng 2/3 theo từng phần di sản</CardTitle><CardDescription>Nhập hai giá trị cùng một đơn vị. “Suất pháp luật giả định” là đầu vào đã được xác định bên ngoài lát cắt này, không phải kết quả chia tự động.</CardDescription></CardHeader><CardContent className="space-y-3">{portions.length ? calculations.filter((calculation) => calculation.personId === active.id).map((calculation) => { const portion = portions.find((item) => item.id === calculation.portionId); return <div key={calculation.id} className="rounded-xl border p-4"><p className="font-semibold">{portion?.name ?? calculation.portionId}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium">Suất pháp luật giả định<Input type="number" min="0" step="any" value={calculation.statutoryShare ?? ""} onChange={(event) => updateCalculation(calculation.id, "statutoryShare", event.target.value)} placeholder="Ví dụ: 300" /></label><label className="space-y-1 text-xs font-medium">Phần đã nhận theo di chúc<Input type="number" min="0" step="any" value={calculation.testamentaryShare ?? ""} onChange={(event) => updateCalculation(calculation.id, "testamentaryShare", event.target.value)} placeholder="0 nếu không được cho hưởng" /></label></div></div>; }) : <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Hồ sơ chưa có phần di sản. Hãy tạo phần di sản ở mô-đun loại thừa kế trước khi tính ngưỡng.</div>}<div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link href={`/cases/${initialCase.id}/modules/inheritance-type`}>Quản lý phần di sản</Link></Button><Button variant="ghost" size="sm" onClick={() => setSelectedRule("R-F01c")}>Xem công thức Điều 644</Button></div></CardContent></Card> : null}<Card><CardHeader><CardTitle>Facts của lát cắt nhóm F</CardTitle><CardDescription>Marker phạm vi không phải kết luận pháp lý; candidate và phép tính do CLIPS dẫn xuất.</CardDescription></CardHeader><CardContent><details><summary className="cursor-pointer text-sm font-medium">Xem {facts.length} asserted facts</summary><div className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{facts.map((fact) => <code key={fact.id} className="block">{fact.predicate}({fact.subject}, {String(fact.value)})</code>)}</div></details></CardContent></Card><div className="flex justify-end"><Button disabled={isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu dữ kiện và xét ${drafts.length} người`}</Button></div></section>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả phân lớp và ngưỡng</Badge><CardTitle className="pt-2">{run ? `${drafts.length} người được rà soát` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Giá trị phần thiếu chỉ thuộc calculation đã nhập, không phải kết quả chia toàn bộ di sản.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? drafts.map((person) => { const candidate = candidateResults.get(person.id); const status = activeResults.get(person.id); const missing = run.missing.filter((item) => item.subject === person.id); const ruleIds = [...new Set([...(candidate?.derivations ?? []), ...(status?.derivations ?? [])])]; return <div key={person.id} className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{person.name}</p><CandidateBadge value={candidate?.value ?? "unknown"} /></div>{candidate?.value === "true" ? <p className="mt-2 text-sm">{status?.value === "true" ? "Đủ điều kiện cá nhân để đối chiếu ngưỡng 2/3." : status?.value === "false" ? "Không áp dụng suất bắt buộc do từ chối hoặc Điều 621." : "Chưa đủ dữ kiện về từ chối hoặc Điều 621."}</p> : null}{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<CalculationResultRows calculations={calculations.filter((calculation) => calculation.personId === person.id)} portions={portions} minimumResults={minimumResults} applicationResults={applicationResults} shortfallResults={shortfallResults} missingRequirements={run.missing} onOpenRule={() => setSelectedRule("R-F01c")} /><div className="mt-2 flex flex-wrap gap-1">{ruleIds.filter((ruleId) => getRuleExplanation(ruleId)).map((ruleId) => <Button key={ruleId} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedRule(ruleId)}>{ruleId} · căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">Kết quả, dữ kiện thiếu và căn cứ Điều 644 sẽ xuất hiện tại đây.</div>}<p className="rounded-lg bg-sky-50 p-3 text-xs text-sky-900">Phép tính dùng suất pháp luật giả định do người dùng cung cấp; hệ thống chưa tự xác định suất này từ tổng giá trị và toàn bộ người thừa kế.</p></CardContent></Card></aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Tính ngưỡng theo calculation, không chia di sản end-to-end · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function restorePortions(facts: ApiFact[]): PortionDraft[] { return facts.flatMap((fact): PortionDraft[] => fact.predicate === "estate-portion" && fact.value === true && fact.subject ? [{ id: fact.subject, name: String(facts.find((item) => item.subject === fact.subject && item.predicate === "estate-portion-label")?.value ?? fact.subject) }] : []); }
function restoreCalculations(facts: ApiFact[], people: CompulsoryPersonDraft[], portions: PortionDraft[]): CalculationDraft[] {
  const stored = facts.flatMap((fact): CalculationDraft[] => {
    if (fact.predicate !== "compulsory-share-calculation" || fact.value !== true || !fact.subject) return [];
    const personId = facts.find((item) => item.subject === fact.subject && item.predicate === "calculation-person")?.value;
    const portionId = facts.find((item) => item.subject === fact.subject && item.predicate === "calculation-estate-portion")?.value;
    if (typeof personId !== "string" || typeof portionId !== "string") return [];
    const statutoryShare = facts.find((item) => item.subject === fact.subject && item.predicate === "hypothetical-statutory-share")?.value;
    const testamentaryShare = facts.find((item) => item.subject === fact.subject && item.predicate === "testamentary-share-received")?.value;
    return [{ id: fact.subject, personId, portionId, statutoryShare: typeof statutoryShare === "number" ? statutoryShare : undefined, testamentaryShare: typeof testamentaryShare === "number" ? testamentaryShare : undefined }];
  });
  const byPair = new Map(stored.map((calculation) => [`${calculation.personId}:${calculation.portionId}`, calculation]));
  return people.flatMap((person, personIndex) => portions.map((portion, portionIndex) => byPair.get(`${person.id}:${portion.id}`) ?? { id: `cs-calc-${personIndex + 1}-${portionIndex + 1}`, personId: person.id, portionId: portion.id }));
}
function buildCalculationFacts(calculations: CalculationDraft[]): ApiFact[] { return calculations.flatMap((calculation): ApiFact[] => { if (calculation.statutoryShare === undefined && calculation.testamentaryShare === undefined) return []; const facts: ApiFact[] = [
  { id: `${calculation.id}-scope`, subject: calculation.id, predicate: "compulsory-share-calculation", value: true },
  { id: `${calculation.id}-person`, subject: calculation.id, predicate: "calculation-person", value: calculation.personId },
  { id: `${calculation.id}-portion`, subject: calculation.id, predicate: "calculation-estate-portion", value: calculation.portionId },
]; if (calculation.statutoryShare !== undefined && calculation.statutoryShare > 0) facts.push({ id: `${calculation.id}-statutory`, subject: calculation.id, predicate: "hypothetical-statutory-share", value: calculation.statutoryShare }); if (calculation.testamentaryShare !== undefined && calculation.testamentaryShare >= 0) facts.push({ id: `${calculation.id}-testamentary`, subject: calculation.id, predicate: "testamentary-share-received", value: calculation.testamentaryShare }); return facts; }); }
function CalculationResultRows({ calculations, portions, minimumResults, applicationResults, shortfallResults, missingRequirements, onOpenRule }: { calculations: CalculationDraft[]; portions: PortionDraft[]; minimumResults: ReturnType<typeof resultMap>; applicationResults: ReturnType<typeof resultMap>; shortfallResults: ReturnType<typeof resultMap>; missingRequirements: InferenceRun["missing"]; onOpenRule: () => void }) {
  const entered = calculations.filter((calculation) => calculation.statutoryShare !== undefined || calculation.testamentaryShare !== undefined);
  if (!entered.length) return null;
  return <div className="mt-3 space-y-2">{entered.map((calculation) => {
    const minimum = minimumResults.get(calculation.id);
    const applies = applicationResults.get(calculation.id);
    const shortfall = shortfallResults.get(calculation.id);
    const missing = missingRequirements.filter((item) => item.subject === calculation.id);
    return <div key={calculation.id} className="rounded-lg bg-muted/50 p-3 text-xs"><p className="font-medium">{portions.find((portion) => portion.id === calculation.portionId)?.name ?? calculation.portionId}</p>{minimum ? <><p className="mt-1">Ngưỡng 2/3: <strong>{formatAmount(minimum.value)}</strong></p><p>Phần thiếu: <strong>{shortfall ? formatAmount(shortfall.value) : "chưa xác định"}</strong></p><Badge className="mt-2" variant={applies?.value === "true" ? "warning" : applies?.value === "false" ? "success" : "secondary"}>{applies?.value === "true" ? "Cần xem xét bù phần thiếu" : applies?.value === "false" ? "Đã đạt ngưỡng" : "Chưa đủ dữ kiện"}</Badge><Button className="ml-1 mt-2 px-1" variant="ghost" size="sm" onClick={onOpenRule}>R-F01c · căn cứ</Button></> : <p className="mt-1 text-amber-800">{missing.length ? `Thiếu: ${missing.map((item) => missingLabel(item.predicate)).join("; ")}` : "Chưa có kết quả tính; kiểm tra điều kiện cá nhân."}</p>}</div>;
  })}</div>;
}
function Question({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06]")}>{children}</button>; }
function CandidateBadge({ value }: { value: string }) { return <Badge variant={value === "true" ? "success" : value === "false" ? "secondary" : "warning"}>{value === "true" ? "Thuộc nhóm bảo vệ" : value === "false" ? "Không thuộc nhóm" : "Chưa xác định"}</Badge>; }
function resultMap(run: InferenceRun | undefined, predicate: string) { return new Map(run?.results.filter((item) => item.predicate === predicate).map((item) => [item.subject, item]) ?? []); }
function formatAmount(value: string) { const number = Number(value); return Number.isFinite(number) ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(number) : value; }
function missingLabel(predicate: string) { return ({ "family-graph-completeness": "xác nhận graph gia đình đầy đủ", "age-group": "nhóm tuổi", "work-capacity-status": "đánh giá khả năng lao động", "valid-refusal": "trạng thái từ chối", "article-621-status": "kết quả Điều 621", "calculation-person": "người được tính", "calculation-estate-portion": "phần di sản", "hypothetical-statutory-share": "suất pháp luật giả định", "testamentary-share-received": "phần đã nhận theo di chúc" } as Record<string, string>)[predicate] ?? predicate; }
function EmptyState({ module, caseId }: { module: AnalysisModuleDefinition; caseId?: string }) { return <main className="mx-auto grid min-h-screen max-w-2xl place-items-center p-6"><Card><CardHeader><Badge variant="warning">Cần graph gia đình</Badge><CardTitle>{module.title}</CardTitle><CardDescription>Chưa có danh sách người từ graph. Hãy tạo quan hệ và ứng viên ở mô-đun hàng thừa kế trước.</CardDescription></CardHeader><CardContent><Button asChild><Link href={caseId ? `/cases/${caseId}/modules/heir-rank` : "/cases"}>Mở graph quan hệ</Link></Button></CardContent></Card></main>; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
