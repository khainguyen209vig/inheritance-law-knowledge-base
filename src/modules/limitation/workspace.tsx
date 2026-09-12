"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
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

const ownedPredicates = new Set(["limitation-assessment-subject", "limitation-request-label", "request-type", "asset-type", "inheritance-opening-date"]);

export function LimitationWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const restored = useMemo(() => restoreRequests(initialCase?.facts ?? []), [initialCase?.facts]);
  const [requests, setRequests] = useState<RequestDraft[]>(() => restored.length ? restored : [newRequest(1, "limitation-request-1")]);
  const [activeId, setActiveId] = useState<string | undefined>(() => restored[0]?.id ?? requests[0]?.id);
  const [run, setRun] = useState<InferenceRun>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const active = requests.find((item) => item.id === activeId) ?? requests[0];
  const facts = useMemo(() => buildFacts(requests), [requests]);
  const results = useMemo(() => new Map(run?.results.map((item) => [`${item.predicate}:${item.subject}`, item]) ?? []), [run]);

  function updateActive(update: Partial<RequestDraft>) {
    if (!active) return;
    setRequests((current) => current.map((item) => item.id === active.id ? { ...item, ...update } : item));
    setRun(undefined);
  }

  function addRequest() {
    const item = newRequest(requests.length + 1);
    setRequests((current) => [...current, item]);
    setActiveId(item.id);
    setRun(undefined);
  }

  function removeActive() {
    if (!active) return;
    setRequests((current) => current.filter((item) => item.id !== active.id));
    setActiveId(requests.find((item) => item.id !== active.id)?.id);
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

  if (!initialCase) return <main className="mx-auto grid min-h-screen max-w-2xl place-items-center p-6"><Card><CardHeader><Badge variant="outline">Timeline presenter</Badge><CardTitle>{module.title}</CardTitle><CardDescription>Hãy tạo hoặc mở một hồ sơ để lưu các yêu cầu và chạy CLIPS.</CardDescription></CardHeader><CardContent><Button asChild><Link href="/cases">Mở danh sách hồ sơ</Link></Button></CardContent></Card></main>;

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-J01–R-J04 · Điều 623</p></div><div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button><Badge variant="warning">Knowledge base draft</Badge></div></div></header>
    <main className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[290px_minmax(0,1fr)_410px]">
      <aside><Card><CardHeader><CardTitle>Các yêu cầu cần xét</CardTitle><CardDescription>Mỗi yêu cầu có loại, đối tượng tài sản và mốc mở thừa kế riêng.</CardDescription></CardHeader><CardContent className="space-y-2">{requests.map((item) => <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={cn("w-full rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", item.id === active?.id && "border-primary bg-primary/[0.05]")}><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-xs text-muted-foreground">{item.type ? limitationRequestTypeLabels[item.type] : "Chưa chọn loại yêu cầu"}</span></button>)}<Button className="w-full" variant="outline" onClick={addRequest}>Thêm yêu cầu</Button></CardContent></Card></aside>
      <section className="space-y-4">{active ? <Card><CardHeader><div className="flex items-center justify-between gap-3"><Badge variant="outline">{active.id}</Badge><Button size="sm" variant="ghost" onClick={removeActive}>Xóa</Button></div><CardTitle className="pt-2">Dữ kiện của yêu cầu</CardTitle><CardDescription>CLIPS dùng loại yêu cầu và loại tài sản để chọn rule. Ngày chỉ được temporal helper dùng sau khi suy luận.</CardDescription></CardHeader><CardContent className="space-y-5"><label className="block text-sm font-medium">Tên gợi nhớ<Input className="mt-2" value={active.label} onChange={(event) => updateActive({ label: event.target.value })} /></label><div><p className="text-sm font-medium">Loại yêu cầu</p><div className="mt-2 grid gap-2">{Object.entries(limitationRequestTypeLabels).map(([value, label]) => <Choice key={value} selected={active.type === value} onClick={() => updateActive({ type: value as LimitationRequestType, assetType: value === "divide-estate" ? active.assetType : undefined })}>{label}</Choice>)}</div></div>{active.type === "divide-estate" ? <div><p className="text-sm font-medium">Loại di sản cần chia</p><div className="mt-2 grid gap-2 sm:grid-cols-2"><Choice selected={active.assetType === "immovable"} onClick={() => updateActive({ assetType: "immovable" })}>Bất động sản</Choice><Choice selected={active.assetType === "movable"} onClick={() => updateActive({ assetType: "movable" })}>Động sản</Choice></div></div> : null}<label className="block text-sm font-medium">Ngày mở thừa kế<Input className="mt-2" type="date" value={active.openingDate ?? ""} onChange={(event) => updateActive({ openingDate: event.target.value || undefined })} /></label></CardContent></Card> : <Card><CardHeader><CardTitle>Chưa có yêu cầu</CardTitle></CardHeader><CardContent><Button onClick={addRequest}>Thêm yêu cầu</Button></CardContent></Card>}<Card><CardHeader><CardTitle>Ranh giới suy luận</CardTitle><CardDescription>Phiên bản này chỉ xác định thời hạn và mốc ngày theo Điều 623. Chưa đánh giá gián đoạn, bắt đầu lại, quy định chuyển tiếp hoặc hậu quả sau khi hết thời hiệu.</CardDescription></CardHeader></Card><div className="flex justify-end"><Button disabled={isPending || requests.length === 0} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : `Lưu và xét ${requests.length} yêu cầu`}</Button></div></section>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Timeline Điều 623</Badge><CardTitle className="pt-2">{run ? "Kết quả theo từng yêu cầu" : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Mốc cuối được tính theo năm lịch; ngày 29/02 chuyển về ngày cuối tháng 02 nếu năm đích không có ngày tương ứng.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? requests.map((item) => { const period = results.get(`limitation-period-years:${item.id}`); const deadline = results.get(`limitation-deadline:${item.id}`); const ruleId = period?.derivations[0]; const missing = run.missing.filter((entry) => entry.subject === item.id); return <div key={item.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-2"><p className="font-semibold">{item.label}</p><Badge variant={deadline ? "success" : "warning"}>{deadline ? `${period?.value} năm` : "Chưa đủ dữ kiện"}</Badge></div><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><TimelinePoint label="Mở thừa kế" value={item.openingDate ?? "—"} /><span className="text-muted-foreground">→</span><TimelinePoint label="Mốc thời hiệu" value={deadline?.value ?? "—"} /></div>{missing.length ? <p className="mt-3 text-xs text-amber-800">Thiếu: {missing.map((entry) => missingLabel(entry.predicate)).join("; ")}</p> : null}{ruleId ? <Button className="mt-2 px-0" size="sm" variant="ghost" onClick={() => setSelectedRule(ruleId)}>{ruleId} · xem Điều 623</Button> : null}</div>; }) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Timeline, thời hạn và căn cứ rule sẽ xuất hiện tại đây.</div>}</CardContent></Card></aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Mốc tính toán không tự động đồng nghĩa yêu cầu đã hết thời hiệu · Không phải tư vấn pháp lý</footer><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function newRequest(index: number, id = `limitation-${crypto.randomUUID()}`): RequestDraft { return { id, label: `Yêu cầu ${index}` }; }
function restoreRequests(facts: ApiFact[]): RequestDraft[] { return facts.filter((fact) => fact.predicate === "limitation-assessment-subject" && fact.value === true && fact.subject).map((scope) => ({ id: scope.subject!, label: String(find(facts, scope.subject!, "limitation-request-label") ?? scope.subject), type: find(facts, scope.subject!, "request-type") as LimitationRequestType | undefined, assetType: find(facts, scope.subject!, "asset-type") as RequestDraft["assetType"], openingDate: find(facts, scope.subject!, "inheritance-opening-date") as string | undefined })); }
function find(facts: ApiFact[], subject: string, predicate: string) { return facts.find((fact) => fact.subject === subject && fact.predicate === predicate)?.value; }
function buildFacts(items: RequestDraft[]): ApiFact[] { return items.flatMap((item): ApiFact[] => { const facts: ApiFact[] = [{ id: `${item.id}-scope`, subject: item.id, predicate: "limitation-assessment-subject", value: true }, { id: `${item.id}-label`, subject: item.id, predicate: "limitation-request-label", value: item.label || item.id }]; if (item.type) facts.push({ id: `${item.id}-type`, subject: item.id, predicate: "request-type", value: item.type }); if (item.type === "divide-estate" && item.assetType) facts.push({ id: `${item.id}-asset`, subject: item.id, predicate: "asset-type", value: item.assetType }); if (item.openingDate) facts.push({ id: `${item.id}-opening`, subject: item.id, predicate: "inheritance-opening-date", value: item.openingDate }); return facts; }); }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) { return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium", selected && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{children}</button>; }
function TimelinePoint({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold tabular-nums">{value}</p></div>; }
function missingLabel(predicate: string) { return ({ "request-type": "loại yêu cầu", "asset-type": "loại tài sản", "inheritance-opening-date": "ngày mở thừa kế" } as Record<string, string>)[predicate] ?? predicate; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
