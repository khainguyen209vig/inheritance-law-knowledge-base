"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";
import type { ApiFact, InferenceRun, ModuleResultValue } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
type Relationship = "spouse" | "biological-parent" | "adoptive-parent" | "biological-child" | "adoptive-child" | "grandparent" | "sibling" | "grandchild" | "great-grandparent" | "aunt-uncle" | "niece-nephew" | "great-grandchild";
type LifeStatus = "alive" | "dead-before-or-same";
interface Candidate { id: string; name: string; relationship?: Relationship; life?: LifeStatus; refusal?: boolean }

const relationships: Array<{ id: Relationship; label: string; rank: 1 | 2 | 3; ruleId: "R-C01" | "R-C02" | "R-C03" }> = [
  { id: "spouse", label: "Vợ/chồng tại thời điểm mở thừa kế", rank: 1, ruleId: "R-C01" },
  { id: "biological-parent", label: "Cha/mẹ đẻ", rank: 1, ruleId: "R-C01" },
  { id: "adoptive-parent", label: "Cha/mẹ nuôi", rank: 1, ruleId: "R-C01" },
  { id: "biological-child", label: "Con đẻ", rank: 1, ruleId: "R-C01" },
  { id: "adoptive-child", label: "Con nuôi", rank: 1, ruleId: "R-C01" },
  { id: "grandparent", label: "Ông/bà nội hoặc ngoại", rank: 2, ruleId: "R-C02" },
  { id: "sibling", label: "Anh/chị/em ruột", rank: 2, ruleId: "R-C02" },
  { id: "grandchild", label: "Cháu ruột (người chết là ông/bà)", rank: 2, ruleId: "R-C02" },
  { id: "great-grandparent", label: "Cụ nội hoặc cụ ngoại", rank: 3, ruleId: "R-C03" },
  { id: "aunt-uncle", label: "Bác/chú/cậu/cô/dì ruột", rank: 3, ruleId: "R-C03" },
  { id: "niece-nephew", label: "Cháu ruột (con của anh/chị/em)", rank: 3, ruleId: "R-C03" },
  { id: "great-grandchild", label: "Chắt ruột", rank: 3, ruleId: "R-C03" },
];
const heirPredicates = new Set(["deceased-person", "heir-rank-candidate", "heir-search-complete", "heir-life-status", "biological-parent-of", "adoptive-parent-of", "spouse-at-opening", "heir-person-label"]);

export function HeirRankWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const token = `draft-${useId().toLowerCase().replace(/[^a-z0-9]/g, "") || "case"}`;
  const caseId = useRef(initialCase?.id ?? `case-${token}`);
  const caseCreated = useRef(Boolean(initialCase));
  const restored = useMemo(() => restoreGraph(initialCase?.facts ?? [], token), [initialCase?.facts, token]);
  const deceasedId = useRef(restored.deceasedId);
  const counter = useRef(restored.candidates.length + 1);
  const [deceasedName, setDeceasedName] = useState(restored.deceasedName);
  const [candidates, setCandidates] = useState<Candidate[]>(restored.candidates);
  const [searchComplete, setSearchComplete] = useState<boolean | undefined>(restored.searchComplete);
  const [activeId, setActiveId] = useState(restored.candidates[0]?.id);
  const [title, setTitle] = useState(initialCase?.title ?? module.runtime?.defaultCaseTitle ?? module.title);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = candidates.find((candidate) => candidate.id === activeId) ?? candidates[0];
  const facts = useMemo(() => buildGraphFacts(caseId.current, deceasedId.current, deceasedName, candidates, searchComplete), [deceasedName, candidates, searchComplete]);
  const rankResults = useMemo(() => resultMap(run, "candidate-heir-rank"), [run]);
  const callResults = useMemo(() => resultMap(run, "called-to-inherit"), [run]);
  const activeRank = run?.results.find((item) => item.predicate === "active-heir-rank");
  const equalShare = run?.results.some((item) => item.predicate === "equal-share-principle-applies" && item.value === "true");

  function update(updateValue: Partial<Candidate>) {
    if (!active) return;
    setCandidates((current) => current.map((candidate) => candidate.id === active.id ? { ...candidate, ...updateValue } : candidate));
    setRun(undefined);
  }
  function addCandidate() {
    const n = counter.current++;
    const candidate = { id: `person-${token}-${n}`, name: `Người thân ${candidates.length + 1}` };
    setCandidates((current) => [...current, candidate]);
    setActiveId(candidate.id);
    setSearchComplete(undefined);
    setRun(undefined);
  }
  function removeCandidate(id: string) {
    const remaining = candidates.filter((candidate) => candidate.id !== id);
    setCandidates(remaining);
    setActiveId(remaining[0]?.id);
    setSearchComplete(undefined);
    setRun(undefined);
  }
  function runInference() { startTransition(async () => { setError(undefined); try {
    if (!caseCreated.current) { await requestJson("/api/cases", { method: "POST", body: JSON.stringify({ id: caseId.current, title }) }); caseCreated.current = true; }
    else await requestJson(`/api/cases/${caseId.current}`, { method: "PATCH", body: JSON.stringify({ title }) });
    const currentIds = new Set(candidates.map((candidate) => candidate.id));
    const ownedIds = new Set([...(initialCase?.facts ?? []).filter((fact) => fact.predicate === "heir-rank-candidate").map((fact) => fact.subject ?? ""), ...currentIds]);
    const retained = (initialCase?.facts ?? []).filter((fact) => !heirPredicates.has(fact.predicate)
      && !(ownedIds.has(fact.subject ?? "") && (fact.predicate === "eligibility-candidate" || fact.predicate === "valid-refusal")));
    await requestJson(`/api/cases/${caseId.current}/facts`, { method: "PUT", body: JSON.stringify({ subject: caseId.current, facts: [...retained, ...facts] }) });
    setRun(await requestJson<InferenceRun>(`/api/cases/${caseId.current}/inference/heir-rank`, { method: "POST", body: "{}" }));
  } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); } }); }
  const ready = deceasedName.trim() && candidates.length > 0 && candidates.every((candidate) => candidate.name.trim() && candidate.relationship);

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · graph quan hệ · R-C01–R-C06</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${caseId.current}`}>Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Mô-đun</Link></Button><Badge variant="warning">Có rule TEAM_REVIEW</Badge></div></div></header>
    <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
      <aside className="space-y-4"><Card><CardHeader><CardTitle>Hồ sơ</CardTitle></CardHeader><CardContent className="space-y-4"><label className="space-y-2 text-sm font-medium">Tên hồ sơ<Input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Người để lại di sản<Input value={deceasedName} onChange={(event) => { setDeceasedName(event.target.value); setRun(undefined); }} /></label></CardContent></Card><Card><CardHeader><div className="flex justify-between"><CardTitle>Người đang xét</CardTitle><Badge variant="secondary">{candidates.length}</Badge></div><CardDescription>Mỗi người là một nút ứng viên trong graph.</CardDescription></CardHeader><CardContent className="space-y-2">{candidates.map((candidate) => { const rank = rankResults.get(candidate.id); return <button key={candidate.id} type="button" onClick={() => setActiveId(candidate.id)} className={cn("w-full rounded-lg border p-3 text-left", active?.id === candidate.id && "border-primary bg-primary/[0.05]")}><span className="flex justify-between gap-2 text-sm font-semibold"><span>{candidate.name}</span>{rank ? <Badge variant={rank.value.startsWith("rank-") ? "success" : "warning"}>{rankLabel(rank.value)}</Badge> : null}</span><span className="mt-1 block text-xs text-muted-foreground">{relationshipLabel(candidate.relationship)}</span></button>; })}<Button className="w-full" variant="outline" onClick={addCandidate}>+ Thêm người thân</Button></CardContent></Card></aside>
      <main className="space-y-4">
        <Card><CardHeader><Badge variant="outline">Family graph</Badge><CardTitle className="pt-2">Quan hệ quanh {deceasedName}</CardTitle><CardDescription>UI chuyển lựa chọn thành các cạnh cha/mẹ–con hoặc vợ/chồng. Hàng thừa kế chỉ do CLIPS dẫn xuất từ các đường đi này.</CardDescription></CardHeader><CardContent><div className="relative mx-auto max-w-2xl rounded-2xl border bg-muted/25 p-6"><div className="mx-auto w-fit rounded-xl border-2 border-primary bg-card px-6 py-4 text-center shadow-sm"><p className="text-xs text-muted-foreground">Người để lại di sản</p><p className="font-semibold">{deceasedName}</p></div><div className="mx-auto h-8 w-px bg-border" /><div className="grid gap-3 sm:grid-cols-2">{candidates.map((candidate) => <button key={candidate.id} type="button" onClick={() => setActiveId(candidate.id)} className={cn("rounded-xl border bg-card p-4 text-left", active?.id === candidate.id && "border-primary ring-1 ring-primary")}><p className="font-semibold">{candidate.name}</p><p className="mt-1 text-xs text-muted-foreground">{relationshipLabel(candidate.relationship)}</p><p className="mt-2 font-mono text-[10px] text-muted-foreground">{graphPath(candidate.relationship)}</p></button>)}</div></div></CardContent></Card>
        {active ? <Card><CardHeader><div className="flex justify-between gap-3"><div><CardTitle>Chỉnh sửa {active.name}</CardTitle><CardDescription>Dữ kiện pháp lý được hỏi riêng; không gộp thành một nhãn kết luận.</CardDescription></div><Button variant="ghost" size="sm" onClick={() => removeCandidate(active.id)}>Xóa</Button></div></CardHeader><CardContent className="space-y-5"><label className="block max-w-md space-y-2 text-sm font-medium">Tên hiển thị<Input value={active.name} maxLength={80} onChange={(event) => update({ name: event.target.value })} /></label><div><p className="text-sm font-medium">Quan hệ tại thời điểm mở thừa kế</p>{([1, 2, 3] as const).map((rank) => <div key={rank} className="mt-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nhóm quan hệ hàng {rank}</p><div className="grid gap-2 sm:grid-cols-2">{relationships.filter((item) => item.rank === rank).map((relationship) => <button key={relationship.id} type="button" onClick={() => update({ relationship: relationship.id })} className={cn("rounded-lg border p-3 text-left text-sm", active.relationship === relationship.id && "border-primary bg-primary/[0.06]")}><span className="font-medium">{relationship.label}</span><span className="mt-1 block text-[10px] text-muted-foreground">CLIPS: {relationship.ruleId}</span></button>)}</div></div>)}</div>
          <Question title="Tình trạng tại thời điểm mở thừa kế" description="Cần dữ kiện dương; để trống sẽ trả về chưa đủ dữ kiện."><Choice selected={active.life === "alive"} onClick={() => update({ life: "alive" })}>Còn sống</Choice><Choice selected={active.life === "dead-before-or-same"} onClick={() => update({ life: "dead-before-or-same" })}>Chết trước hoặc cùng thời điểm</Choice></Question>
          <Question title="Có việc từ chối nhận di sản hợp lệ?" description="Đây là fact dùng chung với mô-đun phân loại phần di sản."><Choice selected={active.refusal === false} onClick={() => update({ refusal: false })}>Không</Choice><Choice selected={active.refusal === true} onClick={() => update({ refusal: true })}>Có</Choice></Question>
          <div className="rounded-lg border border-dashed p-3 text-sm"><p className="font-medium">Kiểm tra Điều 621</p><p className="mt-1 text-xs text-muted-foreground">{hasEligibilityReview(initialCase?.facts ?? [], active.id) ? "Hồ sơ đã có marker hoàn tất rà soát eligibility; CLIPS sẽ suy lại trạng thái trong cùng working memory." : "Chưa có marker hoàn tất rà soát. Kết quả gọi hưởng sẽ ở trạng thái chưa đủ dữ kiện."}</p><Button asChild className="mt-2 px-0" variant="ghost" size="sm"><Link href={`/cases/${caseId.current}/modules/eligibility`}>Mở mô-đun eligibility</Link></Button></div>
          {active.relationship ? <Button variant="outline" onClick={() => setSelectedRule(relationshipConfig(active.relationship)?.ruleId)}>Đọc Điều 651 cho quan hệ này</Button> : null}</CardContent></Card> : null}
        <Card><CardHeader><CardTitle>Phạm vi rà soát ứng viên</CardTitle><CardDescription>Chỉ chọn “đã đầy đủ” khi team đã nhập đủ người ở cả ba hàng. Marker này cho phép dùng sự vắng mặt của hàng trước trong suy luận R-C06.</CardDescription></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-2"><Choice selected={searchComplete === true} onClick={() => { setSearchComplete(true); setRun(undefined); }}>Đã nhập đầy đủ</Choice><Choice selected={searchComplete === false} onClick={() => { setSearchComplete(false); setRun(undefined); }}>Chưa đầy đủ</Choice></div></CardContent></Card>
        <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu và suy luận ${candidates.length} người`}</Button></div>
      </main>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Kết quả tách lớp</Badge><CardTitle className="pt-2">{activeRank ? `Hàng hoạt động: ${rankLabel(activeRank.value)}` : run ? "Chưa xác định hàng hoạt động" : "Chưa chạy CLIPS"}</CardTitle><CardDescription>{equalShare ? "Có từ hai người cùng được gọi hưởng: áp dụng nguyên tắc phần bằng nhau (chưa tính giá trị)." : "Phân loại hàng không tự động đồng nghĩa được gọi hưởng."}</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? candidates.map((candidate) => { const rank = rankResults.get(candidate.id); const call = callResults.get(candidate.id); const missing = run.missing.filter((item) => item.subject === candidate.id); const ruleIds = [...new Set([...(rank?.derivations ?? []), ...(call?.derivations ?? [])])]; return <div key={candidate.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{candidate.name}</p><div className="flex gap-1"><Badge variant={rank?.value.startsWith("rank-") ? "success" : "warning"}>{rank ? rankLabel(rank.value) : "Chưa xếp hàng"}</Badge>{call ? <Badge variant={call.value === "true" ? "success" : call.value === "false" ? "secondary" : "warning"}>{callLabel(call.value)}</Badge> : null}</div></div>{missing.length ? <p className="mt-2 text-xs text-amber-800">Thiếu: {missing.map((item) => missingLabel(item.predicate)).join("; ")}</p> : null}<div className="mt-2 flex flex-wrap gap-1">{ruleIds.filter((ruleId) => getRuleExplanation(ruleId)).map((ruleId) => <Button key={ruleId} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedRule(ruleId)}>{ruleId} · xem căn cứ</Button>)}</div></div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Kết quả, dữ kiện thiếu và trace sẽ xuất hiện tại đây.</div>}{run?.traces.some((trace) => getRuleExplanation(trace.ruleId)?.reviewState === "TEAM_REVIEW") ? <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Run này sử dụng rule TEAM_REVIEW. Cần team kiểm chứng trước khi trình bày như kết luận pháp lý.</p> : null}</CardContent></Card></aside>
    </div><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Rule TEAM_REVIEW chưa được phê duyệt · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function Question({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium", selected && "border-primary bg-primary/[0.06]")}>{children}</button>; }

function buildGraphFacts(caseId: string, deceased: string, deceasedName: string, candidates: Candidate[], searchComplete?: boolean): ApiFact[] {
  const facts: ApiFact[] = [{ id: `${deceased}-marker`, subject: deceased, predicate: "deceased-person", value: true }, { id: `${deceased}-label`, subject: deceased, predicate: "heir-person-label", value: deceasedName || "Người để lại di sản" }];
  if (searchComplete !== undefined) facts.push({ id: `${caseId}-heir-search`, subject: caseId, predicate: "heir-search-complete", value: searchComplete });
  for (const candidate of candidates) {
    facts.push(
      { id: `${candidate.id}-rank-candidate`, subject: candidate.id, predicate: "heir-rank-candidate", value: true },
      { id: `${candidate.id}-eligibility-link`, subject: candidate.id, predicate: "eligibility-candidate", value: true },
      { id: `${candidate.id}-rank-label`, subject: candidate.id, predicate: "heir-person-label", value: candidate.name || "Người thân" },
    );
    if (candidate.life) facts.push({ id: `${candidate.id}-rank-life`, subject: candidate.id, predicate: "heir-life-status", value: candidate.life });
    if (candidate.refusal !== undefined) facts.push({ id: `${candidate.id}-rank-refusal`, subject: candidate.id, predicate: "valid-refusal", value: candidate.refusal });
    addRelationshipFacts(facts, deceased, candidate);
  }
  return facts;
}

function addRelationshipFacts(facts: ApiFact[], deceased: string, candidate: Candidate) {
  const one = `${candidate.id}-bridge-one`;
  const two = `${candidate.id}-bridge-two`;
  const edge = (number: number, subject: string, predicate: "biological-parent-of" | "adoptive-parent-of" | "spouse-at-opening", value: string) => facts.push({ id: `${candidate.id}-rank-edge-${number}`, subject, predicate, value });
  if (candidate.relationship === "spouse") edge(1, candidate.id, "spouse-at-opening", deceased);
  if (candidate.relationship === "biological-parent") edge(1, candidate.id, "biological-parent-of", deceased);
  if (candidate.relationship === "adoptive-parent") edge(1, candidate.id, "adoptive-parent-of", deceased);
  if (candidate.relationship === "biological-child") edge(1, deceased, "biological-parent-of", candidate.id);
  if (candidate.relationship === "adoptive-child") edge(1, deceased, "adoptive-parent-of", candidate.id);
  if (candidate.relationship === "grandparent") { edge(1, candidate.id, "biological-parent-of", one); edge(2, one, "biological-parent-of", deceased); }
  if (candidate.relationship === "sibling") { edge(1, one, "biological-parent-of", candidate.id); edge(2, one, "biological-parent-of", deceased); }
  if (candidate.relationship === "grandchild") { edge(1, deceased, "biological-parent-of", one); edge(2, one, "biological-parent-of", candidate.id); }
  if (candidate.relationship === "great-grandparent") { edge(1, candidate.id, "biological-parent-of", one); edge(2, one, "biological-parent-of", two); edge(3, two, "biological-parent-of", deceased); }
  if (candidate.relationship === "aunt-uncle") { edge(1, one, "biological-parent-of", candidate.id); edge(2, one, "biological-parent-of", two); edge(3, two, "biological-parent-of", deceased); }
  if (candidate.relationship === "niece-nephew") { edge(1, one, "biological-parent-of", deceased); edge(2, one, "biological-parent-of", two); edge(3, two, "biological-parent-of", candidate.id); }
  if (candidate.relationship === "great-grandchild") { edge(1, deceased, "biological-parent-of", one); edge(2, one, "biological-parent-of", two); edge(3, two, "biological-parent-of", candidate.id); }
}

function restoreGraph(facts: ApiFact[], token: string): { deceasedId: string; deceasedName: string; candidates: Candidate[]; searchComplete?: boolean } {
  const deceasedId = facts.find((fact) => fact.predicate === "deceased-person")?.subject ?? `deceased-${token}`;
  const deceasedName = String(facts.find((fact) => fact.subject === deceasedId && fact.predicate === "heir-person-label")?.value ?? "Người để lại di sản");
  let ids = [...new Set(facts.flatMap((fact) => fact.predicate === "heir-rank-candidate" && fact.subject ? [fact.subject] : []))];
  if (!ids.length) ids = [...new Set(facts.flatMap((fact) => fact.predicate === "eligibility-candidate" && fact.subject ? [fact.subject] : []))];
  const candidates = ids.map((id, index) => ({
    id,
    name: String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? `Người thân ${index + 1}`),
    relationship: restoreRelationship(facts, deceasedId, id),
    life: facts.find((fact) => fact.subject === id && fact.predicate === "heir-life-status")?.value as LifeStatus | undefined,
    refusal: facts.find((fact) => fact.subject === id && fact.predicate === "valid-refusal")?.value as boolean | undefined,
  }));
  const searchFact = facts.find((fact) => fact.predicate === "heir-search-complete");
  return { deceasedId, deceasedName, candidates: candidates.length ? candidates : [{ id: `person-${token}-0`, name: "Người thân 1" }], searchComplete: searchFact?.value as boolean | undefined };
}

function restoreRelationship(facts: ApiFact[], deceased: string, person: string): Relationship | undefined {
  const has = (subject: string, predicate: string, value: string) => facts.some((fact) => fact.subject === subject && fact.predicate === predicate && fact.value === value);
  const one = `${person}-bridge-one`, two = `${person}-bridge-two`;
  if (has(person, "spouse-at-opening", deceased)) return "spouse";
  if (has(person, "biological-parent-of", deceased)) return "biological-parent";
  if (has(person, "adoptive-parent-of", deceased)) return "adoptive-parent";
  if (has(deceased, "biological-parent-of", person)) return "biological-child";
  if (has(deceased, "adoptive-parent-of", person)) return "adoptive-child";
  if (has(person, "biological-parent-of", one) && has(one, "biological-parent-of", deceased)) return "grandparent";
  if (has(one, "biological-parent-of", person) && has(one, "biological-parent-of", deceased)) return "sibling";
  if (has(deceased, "biological-parent-of", one) && has(one, "biological-parent-of", person)) return "grandchild";
  if (has(person, "biological-parent-of", one) && has(one, "biological-parent-of", two) && has(two, "biological-parent-of", deceased)) return "great-grandparent";
  if (has(one, "biological-parent-of", person) && has(one, "biological-parent-of", two) && has(two, "biological-parent-of", deceased)) return "aunt-uncle";
  if (has(one, "biological-parent-of", deceased) && has(one, "biological-parent-of", two) && has(two, "biological-parent-of", person)) return "niece-nephew";
  if (has(deceased, "biological-parent-of", one) && has(one, "biological-parent-of", two) && has(two, "biological-parent-of", person)) return "great-grandchild";
}

function resultMap(run: InferenceRun | undefined, predicate: string) { return new Map(run?.results.filter((item) => item.predicate === predicate).map((item) => [item.subject, item]) ?? []); }
function relationshipConfig(value?: Relationship) { return relationships.find((relationship) => relationship.id === value); }
function relationshipLabel(value?: Relationship) { return relationshipConfig(value)?.label ?? "Chưa nối quan hệ"; }
function graphPath(value?: Relationship) { const config = relationshipConfig(value); return config ? `cạnh nguyên tử → ${config.ruleId} → candidate-heir-rank` : "chưa có đường quan hệ"; }
function rankLabel(value: ModuleResultValue) { return ({ "rank-1": "Hàng 1", "rank-2": "Hàng 2", "rank-3": "Hàng 3", conflict: "Xung đột", unknown: "Chưa rõ" } as Partial<Record<ModuleResultValue, string>>)[value] ?? value; }
function callLabel(value: ModuleResultValue) { return value === "true" ? "Được gọi hưởng" : value === "false" ? "Không được gọi" : "Chưa xác định gọi hưởng"; }
function missingLabel(predicate: string) { return ({ "relationship-at-opening": "quan hệ tại thời điểm mở thừa kế", "article-621-status": "kết quả rà soát Điều 621", "heir-life-status": "tình trạng sống", "valid-refusal": "trạng thái từ chối", "heir-search-complete": "xác nhận đã nhập đủ ứng viên" } as Record<string, string>)[predicate] ?? predicate; }
function hasEligibilityReview(facts: ApiFact[], person: string) { return facts.some((fact) => fact.subject === person && fact.predicate === "eligibility-review-complete" && fact.value === true); }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
