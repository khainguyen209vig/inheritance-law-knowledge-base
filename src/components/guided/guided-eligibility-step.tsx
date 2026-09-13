"use client";

import { useMemo, useState, useTransition } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { cn } from "@/lib/utils";
import { buildEligibilityFacts, eligibilityGrounds, eligibilityPredicates, restoreEligibilityPeople, type EligibilityGround, type EligibilityPersonDraft } from "@/modules/eligibility/model";

interface GuidedEligibilityStepProps {
  state: GuidedCaseState;
  personId: string;
  onStateChange: (state: GuidedCaseState) => void;
}

export function GuidedEligibilityStep({ state, personId, onStateChange }: GuidedEligibilityStepProps) {
  const wills = useMemo(() => [...new Set(state.case.facts.flatMap((fact) => fact.predicate === "will-type" && fact.subject ? [fact.subject] : []))], [state.case.facts]);
  const restored = useMemo(() => restoreEligibilityPeople(state.case.facts, personId, wills[0]).find((person) => person.id === personId)
    ?? { id: personId, name: personLabel(state, personId), exception: false, will: wills[0] }, [personId, state, wills]);
  const [person, setPerson] = useState<EligibilityPersonDraft>(restored);
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const selectedGround = eligibilityGrounds.find((ground) => ground.id === person.ground);

  function chooseGround(ground: EligibilityGround) {
    setPerson((current) => ({ ...current, ground, exception: ground === "clear" ? false : current.exception }));
  }

  function saveAndContinue() {
    if (!person.ground) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const retained = state.case.facts.filter((fact) => fact.subject !== person.id || !eligibilityPredicates.has(fact.predicate));
        await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...buildEligibilityFacts([person])] }) });
        await requestJson(`/api/cases/${state.case.id}/inference/eligibility`, { method: "POST", body: "{}" });
        if (state.topic.modules.includes("heir-rank")) await requestJson(`/api/cases/${state.case.id}/inference/heir-rank`, { method: "POST", body: "{}" });
        onStateChange(await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided`, { method: "GET" }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu rà soát Điều 621.");
      }
    });
  }

  return <Card className="max-w-3xl">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Điều 621 · {person.name}</Badge>{selectedGround ? <Button variant="ghost" size="sm" onClick={() => setSelectedRuleId(selectedGround.ruleId)}>Đọc căn cứ {selectedGround.ruleId}</Button> : null}</div><CardTitle className="text-lg">Có căn cứ loại trừ nào đã được xác nhận?</CardTitle><CardDescription>Chọn dữ kiện đã được rà soát, không chọn kết luận “được hưởng” hay “không được hưởng”. CLIPS sẽ suy ra kết quả.</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">{eligibilityGrounds.map((ground) => <button key={ground.id} type="button" aria-pressed={person.ground === ground.id} onClick={() => chooseGround(ground.id)} className={cn("rounded-xl border p-4 text-left outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", person.ground === ground.id && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="flex items-start justify-between gap-2 font-semibold"><span>{ground.title}</span><Badge variant="outline">{ground.ruleId}</Badge></span><span className="mt-2 block text-sm leading-5 text-muted-foreground">{ground.detail}</span></button>)}</div>
      {person.ground && person.ground !== "clear" ? <div className="rounded-xl border p-4"><p className="font-semibold">Ngoại lệ tại khoản 2 Điều 621</p><p className="mt-1 text-sm text-muted-foreground">Người để lại di sản đã biết hành vi nhưng vẫn cho người này hưởng theo di chúc?</p><div className="mt-3 flex flex-wrap gap-2"><Button variant={person.exception ? "secondary" : "outline"} disabled={wills.length === 0} onClick={() => setPerson((current) => ({ ...current, exception: true, will: current.will ?? wills[0] }))}>Có ngoại lệ</Button><Button variant={!person.exception ? "secondary" : "outline"} onClick={() => setPerson((current) => ({ ...current, exception: false }))}>Không có ngoại lệ</Button><Button variant="ghost" onClick={() => setSelectedRuleId("R-D05")}>Đọc khoản 2</Button></div>{wills.length === 0 ? <p className="mt-2 text-xs text-amber-800">Hồ sơ chưa có di chúc, vì vậy chưa thể chọn ngoại lệ này.</p> : null}</div> : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <div className="flex justify-end"><Button disabled={!person.ground || isPending || (person.exception && !person.will)} onClick={saveAndContinue}>{isPending ? "Đang lưu và suy luận…" : "Lưu rà soát và tiếp tục"}</Button></div>
    </CardContent>
    <LegalRuleDialog ruleId={selectedRuleId} onOpenChange={(open) => { if (!open) setSelectedRuleId(undefined); }} />
  </Card>;
}

function personLabel(state: GuidedCaseState, personId: string): string {
  return String(state.case.facts.find((fact) => fact.subject === personId && (fact.predicate === "person-label" || fact.predicate === "heir-person-label"))?.value ?? personId);
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init.headers } });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`);
  return data;
}
