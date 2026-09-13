"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GuidedRequirementResolution } from "@/domain/guided-conversation";

type QuestionResolution = Extract<GuidedRequirementResolution, { kind: "question" }>;

interface GuidedQuestionCardProps {
  question: QuestionResolution;
  pending: boolean;
  error?: string;
  initialValue?: string | number | boolean;
  submitLabel?: string;
  onAnswer: (value: string | number | boolean) => void;
}

export function GuidedQuestionCard({ question, pending, error, initialValue, submitLabel = "Lưu và tiếp tục", onAnswer }: GuidedQuestionCardProps) {
  const [input, setInput] = useState(() => typeof initialValue === "string" || typeof initialValue === "number" ? String(initialValue) : "");
  const numeric = question.answerKind === "number";
  const inputType = question.answerKind === "date" ? "date" : numeric ? "number" : "text";

  if (question.choices?.length) {
    return <Card className="ml-auto max-w-2xl"><CardHeader><CardTitle className="text-lg">Chọn câu trả lời</CardTitle><CardDescription>Câu trả lời sẽ được lưu thành fact có kiểu và dùng để chạy lại suy luận.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2">{question.choices.map((choice) => <Button key={String(choice.value)} type="button" variant="outline" className="h-auto min-h-11 whitespace-normal py-2" disabled={pending} onClick={() => onAnswer(choice.value)}>{choice.label}</Button>)}{pending ? <p className="col-span-full text-sm text-muted-foreground">Đang lưu và chạy CLIPS…</p> : null}{error ? <p className="col-span-full text-sm text-red-700">{error}</p> : null}</CardContent></Card>;
  }

  return <Card className="ml-auto max-w-2xl"><CardHeader><CardTitle className="text-lg">Nhập câu trả lời</CardTitle><CardDescription>Giá trị được kiểm tra kiểu và giới hạn trước khi ghi vào hồ sơ.</CardDescription></CardHeader><CardContent><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (!input) return; onAnswer(numeric ? Number(input) : input); }}><Input autoFocus type={inputType} value={input} min={question.min} max={question.max} placeholder={question.placeholder} onChange={(event) => setInput(event.target.value)} />{error ? <p className="text-sm text-red-700">{error}</p> : null}<Button className="w-full" type="submit" disabled={pending || !input}>{pending ? "Đang xử lý…" : submitLabel}</Button></form></CardContent></Card>;
}
