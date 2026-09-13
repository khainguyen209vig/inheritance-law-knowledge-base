"use client";

import { useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { limitationRequestTypeLabels, type LimitationRequestType } from "@/domain/limitation";
import { cn } from "@/lib/utils";
import type { ApiFact } from "@/modules/contracts";

interface Draft { type?: LimitationRequestType; assetType?: "immovable" | "movable"; openingDate: string }
const requestId = "limitation-guided";

export function GuidedLimitationTimelineStep({ state, onStateChange }: { state: GuidedCaseState; onStateChange: (state: GuidedCaseState) => void }) {
  const [draft, setDraft] = useState<Draft>(() => restore(state.case.facts));
  const [ruleId, setRuleId] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const ready = Boolean(draft.type && draft.openingDate && (draft.type !== "divide-estate" || draft.assetType));

  function update(change: Partial<Draft>) { setDraft((current) => ({ ...current, ...change })); }
  function save() {
    if (!ready || !draft.type) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = state.case.facts.filter((fact) => !fact.id.startsWith("glt-"));
        await json(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...factsFor(draft)] }) });
        onStateChange(await json<GuidedCaseState>(`/api/cases/${state.case.id}/guided/inference`, { method: "POST", body: "{}" }));
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu timeline thời hiệu."); }
    });
  }

  return <Card className="max-w-3xl"><CardHeader><Badge variant="outline" className="w-fit">Điều 623 · Mốc thời gian</Badge><CardTitle className="text-lg">Bạn muốn xác định thời hiệu cho yêu cầu nào?</CardTitle><CardDescription>Hệ thống đối chiếu loại yêu cầu và tài sản để chọn thời hạn 3, 10 hoặc 30 năm, sau đó tính mốc từ ngày mở thừa kế.</CardDescription></CardHeader><CardContent className="space-y-6">
    <div className="grid gap-3">{Object.entries(limitationRequestTypeLabels).map(([type, label]) => <button key={type} type="button" aria-pressed={draft.type === type} onClick={() => update({ type: type as LimitationRequestType, assetType: type === "divide-estate" ? draft.assetType : undefined })} className={cn("rounded-xl border p-4 text-left outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", draft.type === type && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="font-semibold">{label}</span><span className="mt-1 block text-sm text-muted-foreground">{type === "divide-estate" ? "Điều 623 khoản 1" : type === "confirm-or-deny-inheritance-right" ? "Điều 623 khoản 2" : "Điều 623 khoản 3"}</span></button>)}</div>
    {draft.type === "divide-estate" ? <div><p className="text-sm font-medium">Phần di sản cần chia là loại nào?</p><div className="mt-2 grid gap-2 sm:grid-cols-2"><Choice selected={draft.assetType === "immovable"} onClick={() => update({ assetType: "immovable" })}>Bất động sản · 30 năm</Choice><Choice selected={draft.assetType === "movable"} onClick={() => update({ assetType: "movable" })}>Động sản · 10 năm</Choice></div></div> : null}
    <label className="block text-sm font-medium">Ngày mở thừa kế<Input className="mt-2" type="date" value={draft.openingDate} onChange={(event) => update({ openingDate: event.target.value })} /></label>
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" className="px-0" onClick={() => setRuleId(ruleFor(draft))}>Đọc Điều 623 áp dụng</Button><Button disabled={!ready || pending} onClick={save}>{pending ? "Đang tính timeline…" : "Lưu và xác định mốc thời hiệu"}</Button></div>
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
  </CardContent><LegalRuleDialog ruleId={ruleId} onOpenChange={(open) => { if (!open) setRuleId(undefined); }} /></Card>;
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium", selected && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{children}</button>; }
function restore(facts: readonly ApiFact[]): Draft { return { type: facts.find((fact) => fact.subject === requestId && fact.predicate === "request-type")?.value as LimitationRequestType | undefined, assetType: facts.find((fact) => fact.subject === requestId && fact.predicate === "asset-type")?.value as Draft["assetType"], openingDate: String(facts.find((fact) => fact.subject === requestId && fact.predicate === "inheritance-opening-date")?.value ?? "") }; }
function factsFor(draft: Draft): ApiFact[] { return [
  { id: "glt-scope", subject: requestId, predicate: "limitation-assessment-subject", value: true },
  { id: "glt-label", subject: requestId, predicate: "limitation-request-label", value: "Yêu cầu đang được hỏi" },
  { id: "glt-type", subject: requestId, predicate: "request-type", value: draft.type! },
  ...(draft.assetType ? [{ id: "glt-asset", subject: requestId, predicate: "asset-type", value: draft.assetType } satisfies ApiFact] : []),
  { id: "glt-date", subject: requestId, predicate: "inheritance-opening-date", value: draft.openingDate },
]; }
function ruleFor(draft: Draft): string { return draft.type === "divide-estate" ? draft.assetType === "immovable" ? "R-J01" : "R-J02" : draft.type === "confirm-or-deny-inheritance-right" ? "R-J03" : "R-J04"; }
async function json<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(20_000), headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
