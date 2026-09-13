"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { GuidedQuestionCard } from "@/components/guided/guided-question-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isGuidedAnswerQuestionId, type GuidedCaseState } from "@/domain/guided-conversation";

interface GuidedSessionProps {
  initialState: GuidedCaseState;
}

const GuidedFamilyGraphStep = dynamic(() => import("@/components/guided/guided-family-graph-step").then((module) => module.GuidedFamilyGraphStep));
const GuidedEligibilityStep = dynamic(() => import("@/components/guided/guided-eligibility-step").then((module) => module.GuidedEligibilityStep));
const GuidedRefusalStep = dynamic(() => import("@/components/guided/guided-refusal-step").then((module) => module.GuidedRefusalStep));

export function GuidedSession({ initialState }: GuidedSessionProps) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const deceased = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  const deceasedName = deceased ? String(state.case.facts.find((fact) => fact.subject === deceased && fact.predicate === "heir-person-label")?.value ?? deceased) : undefined;
  const willType = state.case.facts.find((fact) => fact.subject === "will-guided" && fact.predicate === "will-type")?.value;

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

  return <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><Badge variant="outline">Guided case · đã lưu</Badge><h1 className="mt-2 font-serif text-3xl font-semibold">{state.case.title}</h1></div><div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link href="/guided">Vấn đề khác</Link></Button><Button asChild variant="outline" size="sm"><Link href={`/cases/${state.case.id}`}>Chế độ kỹ thuật</Link></Button></div></header>
    <section className="mt-8 space-y-5">
      <AssistantMessage>Bạn muốn xác định: <strong>{state.topic.question}</strong></AssistantMessage>
      {deceasedName ? <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">Người để lại di sản là {deceasedName}.</div> : null}
      {willType ? <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">Di chúc được lập {willType === "written" ? "bằng văn bản" : "bằng miệng"}.</div> : null}
      {state.next?.resolution?.kind === "question" && isGuidedAnswerQuestionId(state.next.requirement.predicate) ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedQuestionCard key={state.next.requirement.predicate} question={state.next.resolution} pending={isPending} error={error} onAnswer={submitAnswer} /></>
        : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "family-tree" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedFamilyGraphStep key={state.latestRunIds["heir-rank"] ?? "initial-family-graph"} state={state} onStateChange={setState} /></>
          : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "eligibility-review" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedEligibilityStep key={state.next.requirement.subject} state={state} personId={state.next.requirement.subject} onStateChange={setState} /></>
            : state.next?.resolution?.kind === "interaction" && state.next.resolution.interaction === "refusal-review" ? <><AssistantMessage>{state.next.resolution.prompt}</AssistantMessage><GuidedRefusalStep key={state.next.requirement.subject} state={state} personId={state.next.requirement.subject} onStateChange={setState} /></>
          : state.next ? <><AssistantMessage>{state.next.resolution?.prompt ?? "Cần thêm dữ kiện trước khi hệ thống có thể tiếp tục suy luận."}</AssistantMessage><Card className="max-w-2xl"><CardHeader><CardTitle className="text-lg">Bước tiếp theo</CardTitle><CardDescription>Question planner đã chọn bước này từ topic, facts và missing requirements mới nhất. Presenter tương ứng sẽ được nhúng trực tiếp trong phase kế tiếp.</CardDescription></CardHeader><CardContent><Button asChild><Link href={`/cases/${state.case.id}/modules/${state.topic.recommendedStartModule}`}>Mở phần nhập dữ kiện hiện tại</Link></Button></CardContent></Card></> : <><AssistantMessage>Hệ thống không còn yêu cầu dữ kiện nào trong nhánh hiện tại. Kết quả CLIPS và căn cứ đã được lưu vào lịch sử hồ sơ.</AssistantMessage><Button asChild className="w-fit"><Link href={`/cases/${state.case.id}`}>Xem kết quả và căn cứ</Link></Button></>}
    </section>
  </main>;
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl rounded-2xl rounded-bl-sm border bg-muted/30 px-4 py-3 text-sm leading-6">{children}</div>;
}
