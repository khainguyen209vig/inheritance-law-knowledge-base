"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { guidedTopics, type GuidedTopicId } from "@/domain/guided-conversation";

export function GuidedIntake() {
  const router = useRouter();
  const [topicId, setTopicId] = useState<GuidedTopicId>();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const topic = topicId ? guidedTopics[topicId] : undefined;

  function createCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic) return;
    startTransition(async () => {
      setError(undefined);
      try {
        const response = await fetch("/api/guided-sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, topicId: topic.id }) });
        const data = await response.json() as { case?: { id?: string }; error?: string };
        if (!response.ok || !data.case?.id) throw new Error(data.error ?? "Không thể tạo hồ sơ.");
        router.push(`/cases/${data.case.id}/guided`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tạo hồ sơ.");
      }
    });
  }

  return <div className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
    <header className="mx-auto max-w-3xl text-center"><Badge variant="outline">Hỏi đáp có hướng dẫn · không sử dụng LLM</Badge><h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Bạn muốn tìm hiểu vấn đề gì về thừa kế?</h1><p className="mt-4 leading-7 text-muted-foreground">Hệ thống sẽ hỏi từng thông tin cần thiết, đối chiếu với bộ quy tắc pháp lý và giải thích căn cứ của kết quả.</p></header>
    <div className="mt-10 space-y-5">
      <AssistantMessage>Chọn vấn đề gần nhất với điều bạn đang cần xác định.</AssistantMessage>
      <div className="grid gap-3 md:grid-cols-2">{Object.values(guidedTopics).map((item) => <button key={item.id} type="button" aria-pressed={topicId === item.id} onClick={() => { setTopicId(item.id); setError(undefined); }} className={cn("rounded-xl border bg-card p-4 text-left shadow-sm outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring", topicId === item.id && "border-primary bg-primary/[0.04] ring-2 ring-primary/20")}><span className="font-semibold">{item.question}</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.description}</span></button>)}</div>
      {topic ? <><div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">{topic.question}</div><AssistantMessage>Tôi sẽ tạo một hồ sơ để lưu câu trả lời. Bạn muốn đặt tên hồ sơ là gì?</AssistantMessage><Card className="ml-auto max-w-2xl"><CardHeader><CardTitle className="text-lg">Tạo hồ sơ có hướng dẫn</CardTitle><CardDescription>Bạn có thể quay lại và tiếp tục bổ sung dữ kiện sau.</CardDescription></CardHeader><CardContent><form className="space-y-3" onSubmit={createCase}><Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Ví dụ: Hồ sơ thừa kế gia đình Nguyễn" />{error ? <p className="text-sm text-red-700">{error}</p> : null}<Button className="w-full" type="submit" disabled={isPending || !title.trim()}>{isPending ? "Đang tạo…" : "Bắt đầu trả lời"}</Button></form></CardContent></Card></> : null}
    </div>
  </div>;
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl rounded-2xl rounded-bl-sm border bg-muted/30 px-4 py-3 text-sm leading-6">{children}</div>;
}
