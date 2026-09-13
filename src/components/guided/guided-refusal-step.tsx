"use client";

import { useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { cn } from "@/lib/utils";
import type { ApiFact } from "@/modules/contracts";

type Recipient = "estate-manager" | "other-heir" | "distribution-assignee" | "none";
interface RefusalDraft { made?: boolean; intent?: "ordinary" | "avoid-obligation"; written?: boolean; recipient?: Recipient; beforeDistribution?: boolean }

const refusalPredicates = new Set(["refusal-assessment-subject", "refusal-made", "refusal-intent", "refusal-written", "refusal-notice-recipient", "refusal-before-estate-distribution"]);

export function GuidedRefusalStep({ state, personId, onStateChange }: { state: GuidedCaseState; personId: string; onStateChange: (state: GuidedCaseState) => void }) {
  const [draft, setDraft] = useState<RefusalDraft>(() => restoreDraft(state.case.facts.filter((fact) => fact.subject === personId)));
  const [selectedRule, setSelectedRule] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const name = String(state.case.facts.find((fact) => fact.subject === personId && (fact.predicate === "person-label" || fact.predicate === "heir-person-label"))?.value ?? personId);
  const complete = draft.made === false || (draft.made === true && draft.intent !== undefined && draft.written !== undefined && (!draft.written || draft.recipient !== undefined) && draft.beforeDistribution !== undefined);

  function update(update: Partial<RefusalDraft>) { setDraft((current) => ({ ...current, ...update })); }

  function saveAndContinue() {
    if (!complete) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = state.case.facts.filter((fact) => fact.subject !== personId || !refusalPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...buildFacts(personId, draft)] }) });
        await requestJson(`/api/cases/${state.case.id}/inference/refusal-and-unclaimed`, { method: "POST", body: "{}" });
        if (state.topic.modules.includes("heir-rank")) await requestJson(`/api/cases/${state.case.id}/inference/heir-rank`, { method: "POST", body: "{}" });
        onStateChange(await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided`, { method: "GET" }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu đánh giá từ chối.");
      }
    });
  }

  return <Card className="max-w-3xl"><CardHeader><Badge variant="outline" className="w-fit">Điều 620 · {name}</Badge><CardTitle className="text-lg">Người này có từ chối nhận di sản không?</CardTitle><CardDescription>Hệ thống thu thập từng điều kiện của việc từ chối; `valid-refusal` là kết luận do CLIPS suy ra.</CardDescription></CardHeader><CardContent className="space-y-6">
    <Question title="Có thực hiện việc từ chối?" rule="R-H01" onOpen={setSelectedRule}><ChoiceGrid><Choice selected={draft.made === true} onClick={() => update({ made: true })}>Có từ chối</Choice><Choice selected={draft.made === false} onClick={() => setDraft({ made: false })}>Không từ chối</Choice></ChoiceGrid></Question>
    {draft.made ? <>
      <Question title="Mục đích của việc từ chối" rule="R-H01" onOpen={setSelectedRule}><ChoiceGrid><Choice selected={draft.intent === "ordinary"} onClick={() => update({ intent: "ordinary" })}>Không nhằm trốn nghĩa vụ</Choice><Choice selected={draft.intent === "avoid-obligation"} onClick={() => update({ intent: "avoid-obligation" })}>Nhằm trốn nghĩa vụ tài sản</Choice></ChoiceGrid></Question>
      <Question title="Việc từ chối được lập thành văn bản?" rule="R-H03" onOpen={setSelectedRule}><ChoiceGrid><Choice selected={draft.written === true} onClick={() => update({ written: true })}>Có văn bản</Choice><Choice selected={draft.written === false} onClick={() => update({ written: false, recipient: undefined })}>Không có văn bản</Choice></ChoiceGrid></Question>
      {draft.written ? <Question title="Văn bản đã được gửi cho ai?" rule="R-H03" onOpen={setSelectedRule}><ChoiceGrid>{([['estate-manager','Người quản lý di sản'],['other-heir','Người thừa kế khác'],['distribution-assignee','Người được giao phân chia'],['none','Chưa gửi đúng chủ thể']] as const).map(([value, label]) => <Choice key={value} selected={draft.recipient === value} onClick={() => update({ recipient: value })}>{label}</Choice>)}</ChoiceGrid></Question> : null}
      <Question title="Việc từ chối diễn ra trước khi phân chia di sản?" rule="VALID-REFUSAL-COMPOSED" onOpen={setSelectedRule}><ChoiceGrid><Choice selected={draft.beforeDistribution === true} onClick={() => update({ beforeDistribution: true })}>Trước khi phân chia</Choice><Choice selected={draft.beforeDistribution === false} onClick={() => update({ beforeDistribution: false })}>Sau khi đã phân chia</Choice></ChoiceGrid></Question>
    </> : null}
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <div className="flex justify-end"><Button disabled={!complete || isPending} onClick={saveAndContinue}>{isPending ? "Đang lưu và suy luận…" : "Lưu đánh giá và tiếp tục"}</Button></div>
  </CardContent><LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} /></Card>;
}

function Question({ title, rule, onOpen, children }: { title: string; rule: string; onOpen: (rule: string) => void; children: React.ReactNode }) { return <div><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{title}</p><Button variant="ghost" size="sm" onClick={() => onOpen(rule)}>{rule} · xem căn cứ</Button></div><div className="mt-2">{children}</div></div>; }
function ChoiceGrid({ children }: { children: React.ReactNode }) { return <div className="grid gap-2 sm:grid-cols-2">{children}</div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{children}</button>; }

function restoreDraft(facts: readonly ApiFact[]): RefusalDraft {
  const bool = (predicate: string) => { const value = facts.find((fact) => fact.predicate === predicate)?.value; return typeof value === "boolean" ? value : undefined; };
  return { made: bool("refusal-made"), intent: facts.find((fact) => fact.predicate === "refusal-intent")?.value as RefusalDraft["intent"], written: bool("refusal-written"), recipient: facts.find((fact) => fact.predicate === "refusal-notice-recipient")?.value as Recipient | undefined, beforeDistribution: bool("refusal-before-estate-distribution") };
}

function buildFacts(personId: string, draft: RefusalDraft): ApiFact[] {
  const facts: ApiFact[] = [{ id: `${personId}-refusal-scope`, subject: personId, predicate: "refusal-assessment-subject", value: true }];
  if (draft.made !== undefined) facts.push({ id: `${personId}-refusal-made`, subject: personId, predicate: "refusal-made", value: draft.made });
  if (draft.made && draft.intent) facts.push({ id: `${personId}-refusal-intent`, subject: personId, predicate: "refusal-intent", value: draft.intent });
  if (draft.made && draft.written !== undefined) facts.push({ id: `${personId}-refusal-written`, subject: personId, predicate: "refusal-written", value: draft.written });
  if (draft.made && draft.written && draft.recipient) facts.push({ id: `${personId}-refusal-recipient`, subject: personId, predicate: "refusal-notice-recipient", value: draft.recipient });
  if (draft.made && draft.beforeDistribution !== undefined) facts.push({ id: `${personId}-refusal-timing`, subject: personId, predicate: "refusal-before-estate-distribution", value: draft.beforeDistribution });
  return facts;
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
