"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnalysisModuleDefinition } from "@/domain/analysis-modules";
import { obligationTypeLabels, obligationTypes, type ObligationType } from "@/domain/estate-settlement";
import { cn } from "@/lib/utils";
import type { ApiFact, InferenceRun } from "@/modules/contracts";

interface InitialCase { id: string; title: string; subject: string; facts: ApiFact[] }
interface ObligationDraft { id: string; label: string; type?: ObligationType; amount?: number }

const ownedPredicates = new Set(["estate-obligation", "obligation-type", "obligation-label", "obligation-amount"]);

export function EstateSettlementWorkspace({ module, initialCase }: { module: AnalysisModuleDefinition; initialCase?: InitialCase }) {
  const initialObligations = useMemo(() => restoreObligations(initialCase?.facts ?? []), [initialCase?.facts]);
  const [obligations, setObligations] = useState(initialObligations);
  const [selectedId, setSelectedId] = useState(initialObligations[0]?.id);
  const [run, setRun] = useState<InferenceRun>();
  const [error, setError] = useState<string>();
  const [showLaw, setShowLaw] = useState(false);
  const [isPending, startTransition] = useTransition();
  const active = obligations.find((item) => item.id === selectedId);
  const facts = useMemo(() => buildFacts(obligations), [obligations]);
  const resultMap = useMemo(() => new Map(run?.results.filter((item) => item.predicate === "payment-priority").map((item) => [item.subject, item]) ?? []), [run]);
  const ordered = useMemo(() => obligations.map((item, index) => ({ item, index, priority: numericPriority(resultMap.get(item.id)?.value) })).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.index - b.index), [obligations, resultMap]);

  function addObligation() {
    const id = `obligation-${Date.now().toString(36)}`;
    setObligations((current) => [...current, { id, label: `Khoản ${current.length + 1}` }]);
    setSelectedId(id);
    setRun(undefined);
  }
  function updateActive(update: Partial<ObligationDraft>) { if (!active) return; setObligations((current) => current.map((item) => item.id === active.id ? { ...item, ...update } : item)); setRun(undefined); }
  function removeActive() { if (!active) return; const remaining = obligations.filter((item) => item.id !== active.id); setObligations(remaining); setSelectedId(remaining[0]?.id); setRun(undefined); }
  function runInference() {
    if (!initialCase || obligations.length === 0) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = initialCase.facts.filter((fact) => !ownedPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${initialCase.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: initialCase.id, facts: [...retained, ...facts] }) });
        setRun(await requestJson<InferenceRun>(`/api/cases/${initialCase.id}/inference/estate-settlement`, { method: "POST", body: "{}" }));
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể chạy suy luận."); }
    });
  }

  if (!initialCase) return null;
  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card/80"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><p className="font-semibold">Inheritance Reasoner</p><p className="text-xs text-muted-foreground">{module.title} · R-I01 · Điều 658</p></div><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => setShowLaw(true)}>Mở Điều 658</Button><Button asChild variant="ghost" size="sm"><Link href={`/cases/${initialCase.id}`}>Hồ sơ</Link></Button></div></div></header>
    <main className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)_420px]">
      <aside><Card><CardHeader><div className="flex items-center justify-between gap-2"><CardTitle>Các khoản cần trả</CardTitle><Button size="sm" onClick={addObligation}>Thêm khoản</Button></div><CardDescription>Mỗi khoản là một thực thể; loại khoản là dữ kiện đầu vào.</CardDescription></CardHeader><CardContent className="space-y-2">{obligations.length ? obligations.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={cn("w-full rounded-lg border p-3 text-left", selectedId === item.id && "border-primary bg-primary/[0.05]")}><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-xs text-muted-foreground">{item.type ? obligationTypeLabels[item.type] : "Chưa phân loại"}</span></button>) : <button type="button" onClick={addObligation} className="grid min-h-32 w-full place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">+ Tạo khoản nghĩa vụ đầu tiên</button>}</CardContent></Card></aside>
      <section className="space-y-4">{active ? <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{active.id}</Badge><Button variant="ghost" size="sm" onClick={removeActive}>Xóa khoản</Button></div><CardTitle className="pt-2">Phân loại khoản nghĩa vụ</CardTitle><CardDescription>Hãy chọn bản chất pháp lý của khoản. Mức ưu tiên không do người dùng nhập mà do bảng tri thức Điều 658 cung cấp.</CardDescription></CardHeader><CardContent className="space-y-5"><label className="block text-sm font-medium">Tên gợi nhớ<Input className="mt-2" value={active.label} maxLength={200} onChange={(event) => updateActive({ label: event.target.value })} /></label><label className="block text-sm font-medium">Số tiền tham khảo (không dùng để suy luận thứ tự)<Input className="mt-2" type="number" min="0" value={active.amount ?? ""} onChange={(event) => updateActive({ amount: event.target.value === "" ? undefined : Number(event.target.value) })} /></label><div><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">Loại nghĩa vụ / chi phí</p><Button variant="ghost" size="sm" onClick={() => setShowLaw(true)}>R-I01 · căn cứ</Button></div><div className="mt-2 grid gap-2 sm:grid-cols-2">{obligationTypes.map((type, index) => <button key={type} type="button" aria-pressed={active.type === type} onClick={() => updateActive({ type })} className={cn("flex gap-3 rounded-lg border p-3 text-left text-sm", active.type === type && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted font-mono text-xs">{index + 1}</span><span className="font-medium">{obligationTypeLabels[type]}</span></button>)}</div></div></CardContent></Card> : <Card><CardHeader><CardTitle>Chưa có khoản nghĩa vụ</CardTitle><CardDescription>Thêm từng khoản để CLIPS đối chiếu với bảng tri thức Điều 658.</CardDescription></CardHeader></Card>}<Card><CardHeader><CardTitle>Facts đưa vào working memory</CardTitle><CardDescription>Không có fact `payment-priority`; đó là kết luận do CLIPS sinh ra.</CardDescription></CardHeader><CardContent><details><summary className="cursor-pointer text-sm font-medium">Xem {facts.length} facts</summary><div className="mt-3 max-h-52 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{facts.map((fact) => <code key={fact.id} className="block">{fact.predicate}({fact.subject}, {String(fact.value)})</code>)}</div></details></CardContent></Card><div className="flex justify-end"><Button disabled={isPending || obligations.length === 0} onClick={runInference}>{isPending ? "CLIPS đang suy luận…" : "Lưu và xếp thứ tự bằng CLIPS"}</Button></div></section>
      <aside><Card className="sticky top-4"><CardHeader><Badge variant="outline">Hàng đợi thanh toán</Badge><CardTitle className="pt-2">{run ? `${ordered.length} khoản đã đối chiếu` : "Chưa chạy CLIPS"}</CardTitle><CardDescription>Thứ tự hiển thị lấy từ kết quả `payment-priority`, không lấy từ vị trí nhập.</CardDescription></CardHeader><CardContent className="space-y-3">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}{run ? ordered.map(({ item, priority }) => <div key={item.id} className="flex gap-3 rounded-xl border p-3"><span className={cn("grid size-9 shrink-0 place-items-center rounded-full font-mono font-bold", priority ? "bg-primary text-primary-foreground" : "bg-amber-100 text-amber-900")}>{priority ?? "?"}</span><div className="min-w-0"><p className="font-semibold">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">{item.type ? obligationTypeLabels[item.type] : "Thiếu loại nghĩa vụ"}</p>{item.amount !== undefined ? <p className="mt-1 text-xs">{item.amount.toLocaleString("vi-VN")} đ</p> : null}{priority ? <Button variant="ghost" size="sm" className="mt-1 h-7 px-0 text-xs" onClick={() => setShowLaw(true)}>R-I01 · xem Điều 658</Button> : <p className="mt-2 text-xs text-amber-800">Cần bổ sung loại nghĩa vụ.</p>}</div></div>) : <div className="grid min-h-36 place-items-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground">Sau khi chạy, các khoản sẽ tự sắp từ ưu tiên 1 đến 10.</div>}<p className="rounded-lg bg-sky-50 p-3 text-xs text-sky-900">Mô-đun này chưa trừ tiền, xử lý thiếu hụt tài sản hoặc chia phần còn lại. Nó chỉ xác định trật tự pháp lý.</p></CardContent></Card></aside>
    </main><footer className="px-6 pb-8 text-center text-xs text-muted-foreground">Prototype học tập · Không phải tư vấn pháp lý · R-I01 cần team kiểm chứng trước khi phê duyệt</footer><LegalRuleDialog ruleId={showLaw ? "R-I01" : undefined} onOpenChange={setShowLaw} />
  </div>;
}

function restoreObligations(facts: ApiFact[]): ObligationDraft[] { return facts.flatMap((fact): ObligationDraft[] => fact.predicate === "estate-obligation" && fact.value === true && fact.subject ? [{ id: fact.subject, label: String(facts.find((item) => item.subject === fact.subject && item.predicate === "obligation-label")?.value ?? fact.subject), type: facts.find((item) => item.subject === fact.subject && item.predicate === "obligation-type")?.value as ObligationType | undefined, amount: facts.find((item) => item.subject === fact.subject && item.predicate === "obligation-amount")?.value as number | undefined }] : []); }
function buildFacts(obligations: ObligationDraft[]): ApiFact[] { return obligations.flatMap((item): ApiFact[] => { const facts: ApiFact[] = [{ id: `${item.id}-entity`, subject: item.id, predicate: "estate-obligation", value: true }, { id: `${item.id}-label`, subject: item.id, predicate: "obligation-label", value: item.label || item.id }]; if (item.type) facts.push({ id: `${item.id}-type`, subject: item.id, predicate: "obligation-type", value: item.type }); if (item.amount !== undefined) facts.push({ id: `${item.id}-amount`, subject: item.id, predicate: "obligation-amount", value: item.amount }); return facts; }); }
function numericPriority(value?: string): number | undefined { if (!value || value === "unknown") return undefined; const parsed = Number(value); return Number.isInteger(parsed) ? parsed : undefined; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
