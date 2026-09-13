"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { GuidedQuestionCard } from "@/components/guided/guided-question-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isGuidedAnswerQuestionId, resolveGuidedRequirement, type GuidedCaseState, type GuidedRequirementResolution } from "@/domain/guided-conversation";

interface GuidedSessionProps {
  initialState: GuidedCaseState;
}

const GuidedFamilyGraphStep = dynamic(() => import("@/components/guided/guided-family-graph-step").then((module) => module.GuidedFamilyGraphStep));
const GuidedEligibilityStep = dynamic(() => import("@/components/guided/guided-eligibility-step").then((module) => module.GuidedEligibilityStep));
const GuidedRefusalStep = dynamic(() => import("@/components/guided/guided-refusal-step").then((module) => module.GuidedRefusalStep));
const GuidedCompulsoryShareStep = dynamic(() => import("@/components/guided/guided-compulsory-share-step").then((module) => module.GuidedCompulsoryShareStep));
const GuidedEstatePortionsStep = dynamic(() => import("@/components/guided/guided-estate-portions-step").then((module) => module.GuidedEstatePortionsStep));
const GuidedInheritancePortionsStep = dynamic(() => import("@/components/guided/guided-inheritance-portions-step").then((module) => module.GuidedInheritancePortionsStep));
const GuidedLimitationTimelineStep = dynamic(() => import("@/components/guided/guided-limitation-timeline-step").then((module) => module.GuidedLimitationTimelineStep));
const GuidedDivisionTimelineStep = dynamic(() => import("@/components/guided/guided-division-timeline-step").then((module) => module.GuidedDivisionTimelineStep));
const GuidedConclusion = dynamic(() => import("@/components/guided/guided-conclusion").then((module) => module.GuidedConclusion));

export function GuidedSession({ initialState }: GuidedSessionProps) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<string>();
  const [editingQuestionId, setEditingQuestionId] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const deceased = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  const deceasedName = deceased ? String(state.case.facts.find((fact) => fact.subject === deceased && fact.predicate === "heir-person-label")?.value ?? deceased) : undefined;
  const willType = state.case.facts.find((fact) => fact.subject === "will-guided" && fact.predicate === "will-type")?.value;
  const hasWill = state.case.facts.find((fact) => fact.subject === state.case.id && fact.predicate === "has-will")?.value;
  const eligibilityPersonName = state.case.facts.find((fact) => fact.subject === "eligibility-guided-person" && fact.predicate === "person-label")?.value;
  const nextPersonName = state.next ? personLabel(state, state.next.requirement.subject) : undefined;
  const editableAnswers = state.completedStepIds.flatMap((questionId) => {
    const resolution = resolveGuidedRequirement({ subject: state.case.id, predicate: questionId });
    const value = guidedAnswerValue(state, questionId);
    return resolution?.kind === "question" && value !== undefined ? [{ questionId, resolution, value }] : [];
  });
  const editingAnswer = editableAnswers.find((answer) => answer.questionId === editingQuestionId);

  function submitAnswer(value: string | number | boolean) {
    const questionId = state.next?.requirement.predicate;
    if (!questionId || !isGuidedAnswerQuestionId(questionId)) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const response = await fetch(`/api/cases/${state.case.id}/guided/answers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId, value }) });
        if (!response.ok) throw new Error(`Không thể lưu câu trả lời (${response.status}).`);
        setState(await response.json() as GuidedCaseState);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu câu trả lời.");
      }
    });
  }

  function reviseAnswer(value: string | number | boolean) {
    if (!editingQuestionId || !isGuidedAnswerQuestionId(editingQuestionId)) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const response = await fetch(`/api/cases/${state.case.id}/guided/answers`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: editingQuestionId, value }) });
        if (!response.ok) throw new Error(`Không thể sửa câu trả lời (${response.status}).`);
        setState(await response.json() as GuidedCaseState);
        setEditingQuestionId(undefined);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể sửa câu trả lời.");
      }
    });
  }

  return <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><Badge variant="outline">Guided case · đã lưu</Badge><h1 className="mt-2 font-serif text-3xl font-semibold">{state.case.title}</h1></div><div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link href="/guided">Vấn đề khác</Link></Button><Button asChild variant="outline" size="sm"><Link href={`/cases/${state.case.id}`}>Chế độ kỹ thuật</Link></Button></div></header>
    <section className="mt-8 space-y-5">
      <AssistantMessage>Bạn muốn xác định: <strong>{state.topic.question}</strong></AssistantMessage>
      {deceasedName ? <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">Người để lại di sản là {deceasedName}.</div> : null}
      {typeof hasWill === "boolean" ? <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">{hasWill ? "Hồ sơ có di chúc." : "Hồ sơ không có di chúc."}</div> : null}
      {willType ? <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">Di chúc được lập {willType === "written" ? "bằng văn bản" : "bằng miệng"}.</div> : null}
      {eligibilityPersonName ? <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">Tôi muốn rà soát quyền hưởng của {String(eligibilityPersonName)}.</div> : null}
      {editableAnswers.length ? <Card className="max-w-2xl"><CardHeader><CardTitle className="text-base">Thông tin đã cung cấp</CardTitle><CardDescription>Bạn có thể sửa một câu trả lời. Các bước phụ thuộc phía sau sẽ được hỏi lại và kết quả cũ không được dùng cho facts mới.</CardDescription></CardHeader><CardContent className="space-y-2">{editableAnswers.map((answer) => <div key={answer.questionId} className="flex items-start justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm text-muted-foreground">{answer.resolution.prompt}</p><p className="mt-1 text-sm font-semibold">{guidedAnswerLabel(answer.resolution, answer.value)}</p></div><Button type="button" size="sm" variant="ghost" onClick={() => { setError(undefined); setEditingQuestionId(answer.questionId); }}>Sửa</Button></div>)}</CardContent></Card> : null}
      {editingAnswer ? <><AssistantMessage>Đang sửa: {editingAnswer.resolution.prompt}</AssistantMessage><div className="flex max-w-2xl justify-end"><Button type="button" size="sm" variant="ghost" onClick={() => { setEditingQuestionId(undefined); setError(undefined); }}>Hủy sửa</Button></div><GuidedQuestionCard key={`edit-${editingAnswer.questionId}-${String(editingAnswer.value)}`} question={editingAnswer.resolution} initialValue={editingAnswer.value} submitLabel="Lưu thay đổi" pending={isPending} error={error} onAnswer={reviseAnswer} /></>
      : state.next?.resolution?.kind === "question" && isGuidedAnswerQuestionId(state.next.requirement.predicate) ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedQuestionCard key={state.next.requirement.predicate} question={state.next.resolution} pending={isPending} error={error} onAnswer={submitAnswer} /></>
        : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "family-tree" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedFamilyGraphStep key={state.case.id} state={state} onStateChange={setState} /></>
          : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "eligibility-review" ? <><AssistantMessage>Cần rà soát các căn cứ về quyền hưởng của <strong>{nextPersonName}</strong>.</AssistantMessage><GuidedEligibilityStep key={state.next.requirement.subject} state={state} personId={state.next.requirement.subject} onStateChange={setState} /></>
            : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "refusal-review" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedRefusalStep key={state.next.requirement.subject} state={state} personId={state.next.requirement.subject} onStateChange={setState} /></>
              : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "compulsory-share-review" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedCompulsoryShareStep state={state} onStateChange={setState} /></>
                : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "estate-portions" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedEstatePortionsStep state={state} onStateChange={setState} /></>
                  : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "inheritance-portions" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedInheritancePortionsStep state={state} onStateChange={setState} /></>
                    : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "timeline" && state.topic.id === "limitation" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedLimitationTimelineStep state={state} onStateChange={setState} /></>
                      : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "timeline" && state.topic.id === "estate-settlement" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedDivisionTimelineStep state={state} onStateChange={setState} /></>
          : state.next ? <GuidedPresenterBoundary state={state} /> : <GuidedConclusion state={state} />}
    </section>
  </main>;
}

function GuidedPresenterBoundary({ state }: { state: GuidedCaseState }) {
  const requirements = state.resolutionStatus.kind === "missing-presenter" ? state.resolutionStatus.requirements : [state.next!.requirement];
  const moduleId = requirements[0]?.module ?? state.topic.recommendedStartModule;
  return <><AssistantMessage>Rule base đã xác định cần thêm dữ kiện, nhưng guided flow hiện chưa có cách hỏi phù hợp. Đây là giới hạn của giao diện prototype, không phải kết luận “không được hưởng” hoặc “không có quyền”.</AssistantMessage><Card className="max-w-2xl border-amber-300"><CardHeader><Badge variant="warning" className="w-fit">Chưa được mô hình hóa trong guided UI</Badge><CardTitle className="text-lg">Cần nhập dữ kiện ở chế độ kỹ thuật</CardTitle><CardDescription>Kết quả hiện tại được giữ ở trạng thái thiếu dữ kiện; hệ thống không tự suy đoán giá trị còn thiếu.</CardDescription></CardHeader><CardContent className="space-y-4"><ul className="space-y-2 text-sm">{requirements.map((requirement) => <li key={`${requirement.module}:${requirement.subject}:${requirement.predicate}`} className="rounded-lg bg-muted p-3"><span className="font-medium">Dữ kiện cần bổ sung</span><code className="mt-1 block text-xs text-muted-foreground">{requirement.predicate} · {personLabel(state, requirement.subject)}</code></li>)}</ul><Button asChild><Link href={`/cases/${state.case.id}/modules/${moduleId}`}>Bổ sung trong mô-đun {moduleId}</Link></Button></CardContent></Card></>;
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl rounded-2xl rounded-bl-sm border bg-muted/30 px-4 py-3 text-sm leading-6">{children}</div>;
}

function personLabel(state: GuidedCaseState, personId: string): string {
  return String(state.case.facts.find((fact) => fact.subject === personId && (fact.predicate === "person-label" || fact.predicate === "heir-person-label"))?.value ?? personId);
}

type GuidedQuestionResolution = Extract<GuidedRequirementResolution, { kind: "question" }>;

function guidedAnswerValue(state: GuidedCaseState, questionId: string): string | number | boolean | undefined {
  if (questionId === "guided-deceased-name") {
    const deceased = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
    return state.case.facts.find((fact) => fact.subject === deceased && fact.predicate === "heir-person-label")?.value;
  }
  if (questionId === "guided-eligibility-person-name") return state.case.facts.find((fact) => fact.subject === "eligibility-guided-person" && fact.predicate === "person-label")?.value;
  if (questionId === "inheritance-has-will") return state.case.facts.find((fact) => fact.subject === state.case.id && fact.predicate === "has-will")?.value;
  return state.case.facts.find((fact) => fact.subject === "will-guided" && fact.predicate === questionId)?.value;
}

function guidedAnswerLabel(question: GuidedQuestionResolution, value: string | number | boolean): string {
  return question.choices?.find((choice) => choice.value === value)?.label ?? (typeof value === "boolean" ? value ? "Có" : "Không" : String(value));
}
