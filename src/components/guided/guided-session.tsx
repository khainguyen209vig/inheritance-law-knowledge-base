"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GuidedCaseState } from "@/domain/guided-conversation";

interface GuidedSessionProps {
  initialState: GuidedCaseState;
}

export function GuidedSession({ initialState }: GuidedSessionProps) {
  const [state, setState] = useState(initialState);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const deceased = state.case.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject;
  const deceasedName = deceased ? String(state.case.facts.find((fact) => fact.subject === deceased && fact.predicate === "heir-person-label")?.value ?? deceased) : undefined;
  const willType = state.case.facts.find((fact) => fact.subject === "will-guided" && fact.predicate === "will-type")?.value;

  function saveDeceased(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const response = await fetch(`/api/cases/${state.case.id}/guided/answers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: "guided-deceased-name", value: name.trim() }) });
        if (!response.ok) throw new Error(`Không thể lưu câu trả lời (${response.status}).`);
        setState(await response.json() as GuidedCaseState);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể lưu câu trả lời.");
      }
    });
  }

  function saveWillType(value: "written" | "oral") {
    startTransition(async () => {
      setError(undefined);
      try {
        const response = await fetch(`/api/cases/${state.case.id}/guided/answers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: "will-type", value }) });
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
      {state.next?.requirement.predicate === "guided-deceased-name" ? <><AssistantMessage>{state.next.resolution?.prompt}</AssistantMessage><Card className="ml-auto max-w-2xl"><CardHeader><CardTitle className="text-lg">Người để lại di sản</CardTitle><CardDescription>Thông tin này tạo node gốc dùng chung cho các bước sau.</CardDescription></CardHeader><CardContent><form className="space-y-3" onSubmit={saveDeceased}><Input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Nhập họ tên" />{error ? <p className="text-sm text-red-700">{error}</p> : null}<Button className="w-full" type="submit" disabled={isPending || !name.trim()}>{isPending ? "Đang lưu…" : "Lưu và tiếp tục"}</Button></form></CardContent></Card></> : state.next?.requirement.predicate === "will-type" ? <><AssistantMessage>{state.next.resolution?.prompt}</AssistantMessage><Card className="ml-auto max-w-2xl"><CardHeader><CardTitle className="text-lg">Hình thức di chúc</CardTitle><CardDescription>Câu trả lời được lưu thành fact `will-type`; CLIPS sẽ chạy ngay để xác định dữ kiện tiếp theo.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2"><Button type="button" variant="outline" disabled={isPending} onClick={() => saveWillType("written")}>Di chúc bằng văn bản</Button><Button type="button" variant="outline" disabled={isPending} onClick={() => saveWillType("oral")}>Di chúc bằng miệng</Button>{isPending ? <p className="col-span-full text-sm text-muted-foreground">Đang lưu và chạy CLIPS…</p> : null}{error ? <p className="col-span-full text-sm text-red-700">{error}</p> : null}</CardContent></Card></> : <><AssistantMessage>{state.next?.resolution?.prompt ?? "Cần thêm dữ kiện trước khi hệ thống có thể tiếp tục suy luận."}</AssistantMessage><Card className="max-w-2xl"><CardHeader><CardTitle className="text-lg">Bước tiếp theo</CardTitle><CardDescription>Question planner đã chọn bước này từ topic, facts và missing requirements mới nhất. Presenter tương ứng sẽ được nhúng trực tiếp trong phase kế tiếp.</CardDescription></CardHeader><CardContent><Button asChild><Link href={`/cases/${state.case.id}/modules/${state.topic.recommendedStartModule}`}>Mở phần nhập dữ kiện hiện tại</Link></Button></CardContent></Card></>}
    </section>
  </main>;
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl rounded-2xl rounded-bl-sm border bg-muted/30 px-4 py-3 text-sm leading-6">{children}</div>;
}
