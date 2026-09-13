"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { buildCompulsoryCalculationFacts, compulsoryCalculationPredicates, restoreCompulsoryCalculations, restoreCompulsoryPortions, type CompulsoryCalculationDraft, type CompulsoryPortionDraft } from "@/modules/compulsory-share/model";
import type { ApiFact } from "@/modules/contracts";

export function GuidedEstatePortionsStep({ state, onStateChange }: { state: GuidedCaseState; onStateChange: (state: GuidedCaseState) => void }) {
  const activePeople = useMemo(() => new Set(state.latestResults["compulsory-share"]?.filter((result) => result.predicate === "compulsory-heir" && result.value === "true").map((result) => result.subject) ?? []), [state.latestResults]);
  const people = useMemo(() => [...activePeople].map((id) => ({ id, name: personLabel(state.case.facts, id) })), [activePeople, state.case.facts]);
  const initialPortions = useMemo(() => restoreCompulsoryPortions(state.case.facts), [state.case.facts]);
  const initialPortionIds = useRef(new Set(initialPortions.map((portion) => portion.id)));
  const [portions, setPortions] = useState<CompulsoryPortionDraft[]>(initialPortions);
  const [calculations, setCalculations] = useState<CompulsoryCalculationDraft[]>(() => restoreCompulsoryCalculations(state.case.facts, people, initialPortions));
  const [selectedRule, setSelectedRule] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const ready = portions.length > 0 && portions.every((portion) => portion.name.trim()) && people.every((person) => portions.every((portion) => calculations.some((calculation) => calculation.personId === person.id && calculation.portionId === portion.id && calculation.statutoryShare !== undefined && calculation.statutoryShare > 0 && calculation.testamentaryShare !== undefined && calculation.testamentaryShare >= 0)));

  function addPortion() {
    const id = `portion-${crypto.randomUUID()}`;
    const portion = { id, name: `Phần di sản ${portions.length + 1}` };
    setPortions((current) => [...current, portion]);
    setCalculations((current) => [...current, ...people.map((person) => ({ id: `calc-${crypto.randomUUID()}`, personId: person.id, portionId: id }))]);
  }

  function removePortion(portionId: string) {
    setPortions((current) => current.filter((portion) => portion.id !== portionId));
    setCalculations((current) => current.filter((calculation) => calculation.portionId !== portionId));
  }

  function updateCalculation(personId: string, portionId: string, field: "statutoryShare" | "testamentaryShare", raw: string) {
    const value = raw === "" ? undefined : Number(raw);
    setCalculations((current) => current.map((calculation) => calculation.personId === personId && calculation.portionId === portionId ? { ...calculation, [field]: Number.isFinite(value) ? value : undefined } : calculation));
  }

  function saveAndContinue() {
    if (!ready) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const currentPortionIds = new Set(portions.map((portion) => portion.id));
        const deletedPortionIds = new Set([...initialPortionIds.current].filter((id) => !currentPortionIds.has(id)));
        const retained = state.case.facts.filter((fact) => !compulsoryCalculationPredicates.has(fact.predicate)
          && fact.predicate !== "estate-portion" && fact.predicate !== "estate-portion-label"
          && !deletedPortionIds.has(fact.subject ?? "") && !(typeof fact.value === "string" && deletedPortionIds.has(fact.value)));
        const portionFacts: ApiFact[] = portions.flatMap((portion) => [
          { id: `${portion.id}-scope`, subject: portion.id, predicate: "estate-portion", value: true },
          { id: `${portion.id}-label`, subject: portion.id, predicate: "estate-portion-label", value: portion.name.trim() },
        ]);
        await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...portionFacts, ...buildCompulsoryCalculationFacts(calculations)] }) });
        onStateChange(await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided/inference`, { method: "POST", body: "{}" }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu phần di sản.");
      }
    });
  }

  return <div className="max-w-3xl space-y-4"><Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Điều 644 · ngưỡng 2/3</Badge><Button variant="ghost" size="sm" onClick={() => setSelectedRule("R-F01c")}>Xem công thức và căn cứ</Button></div><CardTitle className="text-lg">Các phần di sản cần đối chiếu</CardTitle><CardDescription>Mỗi cặp người–phần di sản là một calculation độc lập. Các giá trị dùng cùng một đơn vị; hệ thống không tự chia toàn bộ di sản.</CardDescription></CardHeader></Card>
    {portions.map((portion) => <Card key={portion.id}><CardHeader><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><label className="text-sm font-medium">Tên phần di sản<Input className="mt-2" value={portion.name} maxLength={80} onChange={(event) => setPortions((current) => current.map((item) => item.id === portion.id ? { ...item, name: event.target.value } : item))} /></label></div><Button variant="ghost" size="sm" onClick={() => removePortion(portion.id)}>Xóa</Button></div></CardHeader><CardContent className="space-y-4">{people.map((person) => { const calculation = calculations.find((item) => item.personId === person.id && item.portionId === portion.id); return <div key={person.id} className="rounded-xl border p-4"><p className="font-semibold">{person.name}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium">Suất theo pháp luật giả định<Input className="mt-1" type="number" min="0" step="any" value={calculation?.statutoryShare ?? ""} placeholder="Ví dụ: 300" onChange={(event) => updateCalculation(person.id, portion.id, "statutoryShare", event.target.value)} /></label><label className="text-xs font-medium">Phần đã nhận theo di chúc<Input className="mt-1" type="number" min="0" step="any" value={calculation?.testamentaryShare ?? ""} placeholder="0 nếu không được nhận" onChange={(event) => updateCalculation(person.id, portion.id, "testamentaryShare", event.target.value)} /></label></div></div>; })}</CardContent></Card>)}
    <Button variant="outline" className="w-full" onClick={addPortion}>+ Thêm phần di sản</Button>
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={saveAndContinue}>{isPending ? "Đang lưu và tính ngưỡng…" : "Lưu và tính ngưỡng 2/3"}</Button></div>
    <LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} /></div>;
}

function personLabel(facts: readonly ApiFact[], id: string): string { return String(facts.find((fact) => fact.subject === id && (fact.predicate === "heir-person-label" || fact.predicate === "person-label"))?.value ?? id); }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(20_000), headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
