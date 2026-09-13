"use client";

import { useMemo, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { cn } from "@/lib/utils";
import type { ApiFact } from "@/modules/contracts";

type PortionScenario = "undisposed" | "living-person" | "existing-organization" | "dead-person" | "ended-organization";
interface PortionDraft { id: string; name: string; scenario?: PortionScenario; beneficiaryId: string; beneficiaryName: string }

const scenarios: Array<{ id: PortionScenario; title: string; detail: string; ruleId: string }> = [
  { id: "undisposed", title: "Di chúc không định đoạt phần này", detail: "Đây là dữ kiện về phạm vi nội dung di chúc.", ruleId: "R-A06" },
  { id: "living-person", title: "Chỉ định một người đang sống", detail: "Quyền hưởng và việc từ chối sẽ được rà soát ở bước sau.", ruleId: "R-A03" },
  { id: "existing-organization", title: "Chỉ định tổ chức còn tồn tại", detail: "Tổ chức còn tồn tại tại thời điểm mở thừa kế.", ruleId: "R-A03" },
  { id: "dead-person", title: "Chỉ định người đã chết", detail: "Người này chết trước hoặc cùng thời điểm với người lập di chúc.", ruleId: "R-A04" },
  { id: "ended-organization", title: "Chỉ định tổ chức đã chấm dứt", detail: "Tổ chức không còn tồn tại tại thời điểm mở thừa kế.", ruleId: "R-A04" },
];

export function GuidedInheritancePortionsStep({ state, onStateChange }: { state: GuidedCaseState; onStateChange: (state: GuidedCaseState) => void }) {
  const hasWill = state.case.facts.find((fact) => fact.subject === state.case.id && fact.predicate === "has-will")?.value;
  const willValidity = state.latestResults["will-validity"]?.find((result) => result.predicate === "valid-will")?.value;
  const people = useMemo(() => restorePeople(state.case.facts), [state.case.facts]);
  const [portions, setPortions] = useState<PortionDraft[]>(() => restorePortions(state.case.facts));
  const [selectedRule, setSelectedRule] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const canDescribeDisposition = hasWill === true && willValidity === "true";
  const blockedByWill = hasWill === true && willValidity !== "true" && willValidity !== "false";
  const ready = !blockedByWill && portions.length > 0 && portions.every((portion) => portion.name.trim()
    && (!canDescribeDisposition || (portion.scenario && (portion.scenario === "undisposed" || portion.beneficiaryName.trim()))));

  function addPortion() {
    const sequence = portions.length + 1;
    setPortions((current) => [...current, { id: `portion-${crypto.randomUUID()}`, name: `Phần di sản ${sequence}`, beneficiaryId: `beneficiary-${crypto.randomUUID()}`, beneficiaryName: "" }]);
  }

  function update(id: string, change: Partial<PortionDraft>) {
    setPortions((current) => current.map((portion) => portion.id === id ? { ...portion, ...change } : portion));
  }

  function saveAndContinue() {
    if (!ready || typeof hasWill !== "boolean") return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = state.case.facts.filter((fact) => !fact.id.startsWith("gip-"));
        const facts = buildFacts(portions, hasWill, willValidity);
        await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...facts] }) });
        onStateChange(await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided/inference`, { method: "POST", body: "{}" }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu các phần di sản.");
      }
    });
  }

  return <div className="max-w-3xl space-y-4">
    <Card><CardHeader><Badge variant="outline" className="w-fit">Phạm vi · từng phần di sản</Badge><CardTitle className="text-lg">Các phần di sản được xử lý thế nào?</CardTitle><CardDescription>Khai riêng từng phần vì một hồ sơ có thể đồng thời có phần chia theo di chúc và phần chia theo pháp luật.</CardDescription></CardHeader><CardContent>{hasWill === false ? <p className="rounded-lg bg-muted/40 p-3 text-sm">Bạn đã xác nhận không có di chúc. Hệ thống sẽ kiểm tra việc chia theo pháp luật cho từng phần.</p> : willValidity === "false" ? <p className="rounded-lg bg-muted/40 p-3 text-sm">Di chúc đã được xác định không hợp lệ. Hệ thống sẽ kiểm tra từng phần theo quy định tương ứng.</p> : blockedByWill ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Chưa có kết luận rõ ràng về di chúc nên chưa thể mô tả việc định đoạt.</p> : null}</CardContent></Card>
    {portions.map((portion) => <Card key={portion.id}><CardHeader><div className="flex items-start justify-between gap-3"><label className="min-w-0 flex-1 text-sm font-medium">Tên phần di sản<Input className="mt-2" value={portion.name} maxLength={80} onChange={(event) => update(portion.id, { name: event.target.value })} /></label><Button variant="ghost" size="sm" onClick={() => setPortions((current) => current.filter((item) => item.id !== portion.id))}>Xóa</Button></div></CardHeader>{canDescribeDisposition ? <CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-2">{scenarios.map((scenario) => <button key={scenario.id} type="button" aria-pressed={portion.scenario === scenario.id} onClick={() => update(portion.id, { scenario: scenario.id })} className={cn("rounded-xl border p-4 text-left outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", portion.scenario === scenario.id && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="flex items-start justify-between gap-2 font-semibold"><span>{scenario.title}</span><Badge variant="outline">{scenario.ruleId}</Badge></span><span className="mt-2 block text-sm text-muted-foreground">{scenario.detail}</span></button>)}</div>{portion.scenario && portion.scenario !== "undisposed" ? <div className="space-y-3 rounded-xl border p-4"><p className="text-sm font-semibold">Người hoặc tổ chức được chỉ định</p>{people.length ? <div className="flex flex-wrap gap-2">{people.map((person) => <Button key={person.id} type="button" size="sm" variant={portion.beneficiaryId === person.id ? "secondary" : "outline"} onClick={() => update(portion.id, { beneficiaryId: person.id, beneficiaryName: person.name })}>{person.name}</Button>)}</div> : null}<label className="block text-sm font-medium">Hoặc nhập tên khác<Input className="mt-2" value={people.some((person) => person.id === portion.beneficiaryId) ? "" : portion.beneficiaryName} placeholder="Tên người hoặc tổ chức" maxLength={80} onChange={(event) => update(portion.id, { beneficiaryId: `beneficiary-${stableToken(portion.id)}`, beneficiaryName: event.target.value })} /></label></div> : null}{portion.scenario ? <Button variant="ghost" className="px-0" onClick={() => setSelectedRule(scenarios.find((scenario) => scenario.id === portion.scenario)?.ruleId)}>Đọc căn cứ của trường hợp này</Button> : null}</CardContent> : null}</Card>) }
    <Button variant="outline" className="w-full" onClick={addPortion}>+ Thêm phần di sản</Button>
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <div className="flex justify-end"><Button disabled={!ready || isPending || typeof hasWill !== "boolean"} onClick={saveAndContinue}>{isPending ? "Đang lưu và đối chiếu quy tắc…" : "Lưu và tiếp tục"}</Button></div>
    <LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function restorePeople(facts: readonly ApiFact[]): Array<{ id: string; name: string }> {
  return [...new Set(facts.flatMap((fact) => fact.predicate === "heir-person-label" && fact.subject && !facts.some((item) => item.subject === fact.subject && item.predicate === "deceased-person" && item.value === true) ? [fact.subject] : []))]
    .map((id) => ({ id, name: String(facts.find((fact) => fact.subject === id && fact.predicate === "heir-person-label")?.value ?? id) }));
}

function restorePortions(facts: readonly ApiFact[]): PortionDraft[] {
  return facts.flatMap((fact): PortionDraft[] => {
    if (fact.predicate !== "estate-portion" || fact.value !== true || !fact.subject) return [];
    const own = facts.filter((item) => item.subject === fact.subject);
    const beneficiaryId = String(own.find((item) => item.predicate === "disposition-beneficiary")?.value ?? `beneficiary-${stableToken(fact.subject)}`);
    const beneficiaryFacts = facts.filter((item) => item.subject === beneficiaryId);
    let scenario: PortionScenario | undefined;
    if (own.some((item) => item.predicate === "portion-disposed" && item.value === false)) scenario = "undisposed";
    else if (beneficiaryFacts.some((item) => item.predicate === "beneficiary-life-status" && item.value === "dead-before-or-same")) scenario = "dead-person";
    else if (beneficiaryFacts.some((item) => item.predicate === "beneficiary-life-status" && item.value === "organization-no-longer-exists")) scenario = "ended-organization";
    else if (beneficiaryFacts.some((item) => item.predicate === "beneficiary-kind" && item.value === "organization")) scenario = "existing-organization";
    else if (beneficiaryFacts.some((item) => item.predicate === "beneficiary-kind" && item.value === "person") || own.some((item) => item.predicate === "disposition-status" && item.value === "effective")) scenario = "living-person";
    const beneficiaryName = String(facts.find((item) => item.subject === beneficiaryId && (item.predicate === "person-label" || item.predicate === "heir-person-label"))?.value ?? "");
    return [{ id: fact.subject, name: String(own.find((item) => item.predicate === "estate-portion-label")?.value ?? fact.subject), scenario, beneficiaryId, beneficiaryName }];
  });
}

function buildFacts(portions: readonly PortionDraft[], hasWill: boolean, willValidity: string | undefined): ApiFact[] {
  return portions.flatMap((portion): ApiFact[] => {
    const facts: ApiFact[] = [
      { id: `gip-${stableToken(portion.id)}-m`, subject: portion.id, predicate: "estate-portion", value: true },
      { id: `gip-${stableToken(portion.id)}-l`, subject: portion.id, predicate: "estate-portion-label", value: portion.name.trim() },
    ];
    if (!hasWill) return facts;
    facts.push({ id: `gip-${stableToken(portion.id)}-w`, subject: portion.id, predicate: "applicable-will", value: "will-guided" });
    if (willValidity !== "true" || !portion.scenario) return facts;
    if (portion.scenario === "undisposed") return [...facts,
      { id: `gip-${stableToken(portion.id)}-d`, subject: portion.id, predicate: "portion-disposed", value: false },
      { id: `gip-${stableToken(portion.id)}-c`, subject: portion.id, predicate: "disposition-set-complete", value: true },
    ];
    facts.push(
      { id: `gip-${stableToken(portion.id)}-d`, subject: portion.id, predicate: "portion-disposed", value: true },
      { id: `gip-${stableToken(portion.id)}-b`, subject: portion.id, predicate: "disposition-beneficiary", value: portion.beneficiaryId },
      { id: `gip-${stableToken(portion.id)}-c`, subject: portion.id, predicate: "disposition-set-complete", value: true },
    );
    if (portion.beneficiaryName.trim()) facts.push({ id: `gip-${stableToken(portion.id)}-n`, subject: portion.beneficiaryId, predicate: "person-label", value: portion.beneficiaryName.trim() });
    if (portion.scenario === "living-person") facts.push(
      { id: `gip-${stableToken(portion.id)}-k`, subject: portion.beneficiaryId, predicate: "beneficiary-kind", value: "person" },
      { id: `gip-${stableToken(portion.id)}-x`, subject: portion.beneficiaryId, predicate: "beneficiary-life-status", value: "alive" },
      { id: `gip-${stableToken(portion.id)}-e`, subject: portion.beneficiaryId, predicate: "eligibility-candidate", value: true },
      { id: `gip-${stableToken(portion.id)}-r`, subject: portion.beneficiaryId, predicate: "refusal-assessment-subject", value: true },
    );
    if (portion.scenario === "existing-organization") facts.push(
      { id: `gip-${stableToken(portion.id)}-k`, subject: portion.beneficiaryId, predicate: "beneficiary-kind", value: "organization" },
      { id: `gip-${stableToken(portion.id)}-x`, subject: portion.beneficiaryId, predicate: "beneficiary-life-status", value: "organization-exists" },
    );
    if (portion.scenario === "dead-person") facts.push(
      { id: `gip-${stableToken(portion.id)}-k`, subject: portion.beneficiaryId, predicate: "beneficiary-kind", value: "person" },
      { id: `gip-${stableToken(portion.id)}-x`, subject: portion.beneficiaryId, predicate: "beneficiary-life-status", value: "dead-before-or-same" },
    );
    if (portion.scenario === "ended-organization") facts.push(
      { id: `gip-${stableToken(portion.id)}-k`, subject: portion.beneficiaryId, predicate: "beneficiary-kind", value: "organization" },
      { id: `gip-${stableToken(portion.id)}-x`, subject: portion.beneficiaryId, predicate: "beneficiary-life-status", value: "organization-no-longer-exists" },
    );
    return facts;
  });
}

function stableToken(value: string): string { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619); return (hash >>> 0).toString(16); }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(20_000), headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
