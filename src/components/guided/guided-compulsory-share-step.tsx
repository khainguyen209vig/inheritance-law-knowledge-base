"use client";

import { useMemo, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { cn } from "@/lib/utils";
import { buildCompulsoryAssessmentFacts, compulsoryAssessmentPredicates, compulsoryRoleLabel, restoreCompulsoryPeople, type CompulsoryPersonDraft } from "@/modules/compulsory-share/model";

export function GuidedCompulsoryShareStep({ state, onStateChange }: { state: GuidedCaseState; onStateChange: (state: GuidedCaseState) => void }) {
  const initialPeople = useMemo(() => restoreCompulsoryPeople(state.case.facts), [state.case.facts]);
  const [people, setPeople] = useState(initialPeople);
  const [selectedRule, setSelectedRule] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const ready = people.length > 0 && people.every((person) => !isChild(person) || (person.age && (person.age === "minor" || person.workCapacity)));

  function update(personId: string, change: Partial<CompulsoryPersonDraft>) {
    setPeople((current) => current.map((person) => person.id === personId ? { ...person, ...change } : person));
  }

  function saveAndContinue() {
    if (!ready) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = state.case.facts.filter((fact) => !compulsoryAssessmentPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...buildCompulsoryAssessmentFacts(people)] }) });
        onStateChange(await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided/inference`, { method: "POST", body: "{}" }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu rà soát Điều 644.");
      }
    });
  }

  return <div className="max-w-3xl space-y-4">
    <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Điều 644 · rà soát theo người</Badge><Button variant="ghost" size="sm" onClick={() => setSelectedRule("R-F01a")}>Đọc căn cứ Điều 644</Button></div><CardTitle className="text-lg">Xác định nhóm được bảo vệ</CardTitle><CardDescription>Cha, mẹ và vợ/chồng được nhận diện từ cây gia đình. Với con, cần thêm nhóm tuổi và khả năng lao động để hệ thống phân loại.</CardDescription></CardHeader></Card>
    {people.map((person) => <Card key={person.id}><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-lg">{person.name}</CardTitle><Badge variant="secondary">{compulsoryRoleLabel(person.role)}</Badge></div></CardHeader><CardContent className="space-y-4">
      {isChild(person) ? <><Question title="Nhóm tuổi tại thời điểm mở thừa kế"><Choice selected={person.age === "minor"} onClick={() => update(person.id, { age: "minor", workCapacity: undefined })}>Chưa thành niên</Choice><Choice selected={person.age === "adult"} onClick={() => update(person.id, { age: "adult" })}>Đã thành niên</Choice></Question>{person.age === "adult" ? <Question title="Khả năng lao động"><Choice selected={person.workCapacity === "incapable"} onClick={() => update(person.id, { workCapacity: "incapable" })}>Không có khả năng lao động</Choice><Choice selected={person.workCapacity === "capable"} onClick={() => update(person.id, { workCapacity: "capable" })}>Có khả năng lao động</Choice></Question> : null}</> : <p className="rounded-lg bg-muted/50 p-3 text-sm">{person.role === "parent" || person.role === "spouse" ? "Không cần nhập tuổi hoặc khả năng lao động; quan hệ được lấy trực tiếp từ cây gia đình." : "Quan hệ này không thuộc nhóm được liệt kê trực tiếp tại khoản 1 Điều 644."}</p>}
    </CardContent></Card>)}
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <div className="flex justify-end"><Button disabled={!ready || isPending} onClick={saveAndContinue}>{isPending ? "Đang lưu và suy luận…" : "Lưu rà soát và xem kết quả"}</Button></div>
    <LegalRuleDialog ruleId={selectedRule} onOpenChange={(open) => { if (!open) setSelectedRule(undefined); }} />
  </div>;
}

function isChild(person: CompulsoryPersonDraft) { return person.role === "biological-child" || person.role === "adopted-child"; }
function Question({ title, children }: { title: string; children: React.ReactNode }) { return <div><p className="text-sm font-medium">{title}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div></div>; }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06] ring-1 ring-primary")}>{children}</button>; }
async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`); return data; }
