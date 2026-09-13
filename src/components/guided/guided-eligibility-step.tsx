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
  const deceasedId = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  const wills = useMemo(() => [...new Set(state.case.facts.flatMap((fact) => fact.predicate === "will-type" && fact.subject ? [fact.subject] : []))], [state.case.facts]);
  const restored = useMemo(() => restoreEligibilityPeople(state.case.facts, personId, wills[0]).find((person) => person.id === personId)
    ?? { id: personId, name: personLabel(state, personId), exception: false, will: wills[0] }, [personId, state, wills]);
  const [person, setPerson] = useState<EligibilityPersonDraft>(restored);
  const hasWill = state.case.facts.find((fact) => fact.subject === state.case.id && fact.predicate === "has-will")?.value;
  const willValidity = state.latestResults["will-validity"]?.find((result) => result.predicate === "valid-will")?.value;
  const [deceasedKnew, setDeceasedKnew] = useState<boolean | undefined>(() => state.case.facts.find((fact) => fact.subject === personId && fact.predicate === "deceased-knew-disqualifying-act")?.value as boolean | undefined);
  const [namedAfterKnowledge, setNamedAfterKnowledge] = useState<boolean | undefined>(() => state.case.facts.find((fact) => fact.subject === personId && fact.predicate === "named-in-will-after-knowledge")?.value as boolean | undefined);
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const selectedGround = eligibilityGrounds.find((ground) => ground.id === person.ground);

  if (personId === deceasedId) return <Card className="max-w-3xl border-red-200 bg-red-50/60"><CardHeader><CardTitle className="text-lg">Không thể rà soát Điều 621 cho người để lại di sản</CardTitle><CardDescription>Người để lại di sản không phải ứng viên hưởng di sản của chính mình. Hãy tải lại hồ sơ; planner sẽ yêu cầu chọn đúng người cần đánh giá.</CardDescription></CardHeader></Card>;

  function chooseGround(ground: EligibilityGround) {
    setPerson((current) => ({ ...current, ground, exception: ground === "clear" ? false : current.exception }));
    if (ground === "clear") { setDeceasedKnew(undefined); setNamedAfterKnowledge(undefined); }
  }

  function saveAndContinue() {
    if (!person.ground) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const exceptionApplies = person.ground !== "clear" && hasWill === true && willValidity === "true" && deceasedKnew === true && namedAfterKnowledge === true;
        const assessed = { ...person, exception: exceptionApplies, will: exceptionApplies ? person.will ?? wills[0] : person.will };
        const retained = state.case.facts.filter((fact) => fact.subject !== person.id || !eligibilityPredicates.has(fact.predicate));
        const observationFacts = person.ground !== "clear" && hasWill === true && willValidity === "true" && deceasedKnew !== undefined && !exceptionApplies
          ? [
              { id: `${person.id}-knew`, subject: person.id, predicate: "deceased-knew-disqualifying-act", value: deceasedKnew },
              ...(deceasedKnew && namedAfterKnowledge !== undefined ? [{ id: `${person.id}-named`, subject: person.id, predicate: "named-in-will-after-knowledge", value: namedAfterKnowledge }] : []),
            ]
          : [];
        await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...buildEligibilityFacts([assessed]), ...observationFacts] }) });
        onStateChange(await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided/inference`, { method: "POST", body: "{}" }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu rà soát Điều 621.");
      }
    });
  }

  return <Card className="max-w-3xl">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Điều 621 · {person.name}</Badge>{selectedGround ? <Button variant="ghost" size="sm" onClick={() => setSelectedRuleId(selectedGround.ruleId)}>Đọc căn cứ {selectedGround.ruleId}</Button> : null}</div><CardTitle className="text-lg">Đối với {person.name}, căn cứ loại trừ nào đã được xác nhận?</CardTitle><CardDescription>Các lựa chọn bên dưới đều áp dụng cho {person.name}. Chọn dữ kiện đã được rà soát; CLIPS sẽ suy ra người này có quyền hưởng hay không.</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">{eligibilityGrounds.map((ground) => <button key={ground.id} type="button" aria-pressed={person.ground === ground.id} onClick={() => chooseGround(ground.id)} className={cn("rounded-xl border p-4 text-left outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", person.ground === ground.id && "border-primary bg-primary/[0.06] ring-1 ring-primary")}><span className="flex items-start justify-between gap-2 font-semibold"><span>{ground.title}</span><Badge variant="outline">{ground.ruleId}</Badge></span><span className="mt-2 block text-sm leading-5 text-muted-foreground">{ground.detail}</span></button>)}</div>
      {person.ground && person.ground !== "clear" && hasWill === false ? <div className="rounded-xl border bg-muted/30 p-4"><p className="font-semibold">Khoản 2 Điều 621 không cần rà soát</p><p className="mt-1 text-sm text-muted-foreground">Bạn đã xác nhận hồ sơ không có di chúc, nên nhánh ngoại lệ theo di chúc không thể áp dụng cho {person.name}.</p><Button className="mt-2 px-0" variant="ghost" onClick={() => setSelectedRuleId("R-D05")}>Đọc khoản 2</Button></div> : null}
      {person.ground && person.ground !== "clear" && hasWill === true && willValidity === "false" ? <div className="rounded-xl border bg-muted/30 p-4"><p className="font-semibold">Ngoại lệ theo di chúc không được mở</p><p className="mt-1 text-sm text-muted-foreground">CLIPS đã xác định di chúc không hợp lệ, nên guided flow không dùng di chúc đó làm căn cứ cho ngoại lệ khoản 2 đối với {person.name}.</p><Button className="mt-2 px-0" variant="ghost" onClick={() => setSelectedRuleId("R-D05")}>Đọc khoản 2</Button></div> : null}
      {person.ground && person.ground !== "clear" && hasWill === true && willValidity === "true" ? <div className="space-y-4 rounded-xl border p-4"><div><p className="font-semibold">Dữ kiện cho ngoại lệ tại khoản 2 Điều 621</p><p className="mt-1 text-sm text-muted-foreground">Không chọn trực tiếp kết luận “có ngoại lệ”. Hãy xác nhận từng dữ kiện để CLIPS suy ra.</p></div><div><p className="text-sm font-medium">Người để lại di sản có biết hành vi của {person.name} không?</p><div className="mt-2 flex gap-2"><Button variant={deceasedKnew === true ? "secondary" : "outline"} onClick={() => { setDeceasedKnew(true); setNamedAfterKnowledge(undefined); }}>Có biết</Button><Button variant={deceasedKnew === false ? "secondary" : "outline"} onClick={() => { setDeceasedKnew(false); setNamedAfterKnowledge(undefined); }}>Không biết</Button></div></div>{deceasedKnew === true ? <div><p className="text-sm font-medium">Sau khi biết, người để lại di sản vẫn cho {person.name} hưởng theo di chúc?</p><div className="mt-2 flex gap-2"><Button variant={namedAfterKnowledge === true ? "secondary" : "outline"} onClick={() => setNamedAfterKnowledge(true)}>Có</Button><Button variant={namedAfterKnowledge === false ? "secondary" : "outline"} onClick={() => setNamedAfterKnowledge(false)}>Không</Button></div></div> : null}<Button className="px-0" variant="ghost" onClick={() => setSelectedRuleId("R-D05")}>Đọc khoản 2</Button></div> : null}
      {person.ground && person.ground !== "clear" && (typeof hasWill !== "boolean" || (hasWill === true && willValidity !== "true" && willValidity !== "false")) ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Chưa có kết luận rõ ràng về di chúc, nên chưa thể đánh giá ngoại lệ khoản 2 Điều 621.</p> : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <div className="flex justify-end"><Button disabled={!person.ground || isPending || (person.ground !== "clear" && typeof hasWill !== "boolean") || (person.ground !== "clear" && hasWill === true && willValidity !== "true" && willValidity !== "false") || (person.ground !== "clear" && hasWill === true && willValidity === "true" && (deceasedKnew === undefined || (deceasedKnew && namedAfterKnowledge === undefined) || (deceasedKnew && namedAfterKnowledge && wills.length === 0)))} onClick={saveAndContinue}>{isPending ? "Đang lưu và suy luận…" : "Lưu rà soát và tiếp tục"}</Button></div>
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
