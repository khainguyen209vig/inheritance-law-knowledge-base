"use client";

import Link from "next/link";
import { useState } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildGuidedConclusionExplanation, buildGuidedConclusions } from "@/domain/guided-conclusions";
import type { GuidedCaseState } from "@/domain/guided-conversation";

export function GuidedConclusion({ state }: { state: GuidedCaseState }) {
  const [ruleId, setRuleId] = useState<string>();
  const conclusions = buildGuidedConclusions(state);
  const status = state.inferenceStatus.status;
  const resolution = state.resolutionStatus.kind;
  const message = resolution === "conflict"
    ? "Hệ thống phát hiện các kết luận mâu thuẫn. Không sử dụng kết quả này trước khi kiểm tra lại dữ kiện."
    : resolution === "unknown"
      ? "CLIPS đã chạy với các facts hiện có nhưng vẫn trả UNKNOWN. Điều này khác với việc chưa nhập facts: rule base chưa đủ căn cứ để chọn một kết luận xác định."
      : resolution === "unmodeled"
        ? "Các package liên quan đã chạy nhưng không tạo được kết luận thuộc mục tiêu đang hỏi. Trường hợp này nằm ngoài phạm vi kết quả hiện được mô hình hóa trong đồ án."
        : "Hệ thống đã đạt kết luận cho vấn đề bạn đang hỏi.";
  const badge = resolution === "complete" ? "Đã có kết luận" : resolution === "conflict" ? "Dữ kiện mâu thuẫn" : resolution === "unmodeled" ? "Ngoài phạm vi mô hình" : "Kết quả chưa xác định";

  return <div className="space-y-4">
    <div className="max-w-2xl rounded-2xl rounded-bl-sm border bg-muted/30 px-4 py-3 text-sm leading-6">{message}</div>
    <Card className="max-w-3xl"><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant={status === "complete" ? "success" : status === "conflict" ? "destructive" : "warning"}>{badge}</Badge><span className="text-xs text-muted-foreground">Kết quả từ CLIPS forward chaining</span></div><CardTitle className="pt-2">Kết quả rà soát</CardTitle><CardDescription>Kết luận chỉ nằm trong phạm vi facts và các điều luật đã được mô hình hóa trong đồ án.</CardDescription></CardHeader><CardContent className="space-y-3">
      {conclusions.length ? conclusions.map((item) => { const explanation = buildGuidedConclusionExplanation(state, item); return <article key={item.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{item.title}</h3><Badge variant={item.status === "positive" ? "success" : item.status === "negative" || item.status === "conflict" ? "destructive" : item.status === "unknown" ? "warning" : "secondary"}>{item.status === "positive" ? "Đủ điều kiện" : item.status === "negative" ? "Không đủ điều kiện" : item.status === "conflict" ? "Mâu thuẫn" : item.status === "unknown" ? "Chưa xác định" : "Kết quả"}</Badge></div><p className="mt-2 text-sm leading-6 text-foreground/85">{item.statement}</p>{explanation.facts.length || explanation.steps.length ? <details className="mt-3 rounded-lg bg-muted/45 p-3"><summary className="font-medium">Vì sao có kết luận này?</summary>{explanation.facts.length ? <div className="mt-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dữ kiện đã dùng</p><ul className="mt-2 space-y-1 text-sm">{explanation.facts.map((fact) => <li key={fact.id}>• {fact.statement}</li>)}</ul></div> : null}{explanation.steps.length ? <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chuỗi rule đã kích hoạt</p><ol className="mt-2 space-y-2">{explanation.steps.map((step, index) => <li key={`${step.ruleId}-${index}`} className="flex items-start gap-2 text-sm"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-xs">{index + 1}</span><span><button type="button" className="font-semibold text-primary hover:underline" onClick={() => setRuleId(step.ruleId)}>{step.ruleId}</button><span className="block text-muted-foreground">{step.statement}</span></span></li>)}</ol></div> : null}</details> : null}<div className="mt-3 flex flex-wrap gap-2">{item.ruleIds.map((id) => <Button key={id} type="button" size="sm" variant="outline" onClick={() => setRuleId(id)}>{id} · xem căn cứ</Button>)}<Button asChild size="sm" variant="ghost"><Link href={`/cases/${state.case.id}/modules/${item.moduleId}`}>Mở mô-đun {item.moduleId}</Link></Button>{item.runId ? <Button asChild size="sm" variant="ghost"><Link href={`/cases/${state.case.id}/runs/${item.runId}`}>Mở snapshot kỹ thuật</Link></Button> : null}</div></article>; }) : <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Chưa có kết quả thuộc mục tiêu chính để diễn giải.</p>}
      <div className="flex flex-wrap gap-2 pt-2"><Button asChild><Link href={`/cases/${state.case.id}`}>Xem toàn bộ hồ sơ và căn cứ</Link></Button><Button asChild variant="outline"><Link href={`/cases/${state.case.id}/modules/${state.topic.recommendedStartModule}`}>Mở chế độ kỹ thuật</Link></Button></div>
    </CardContent></Card>
    <LegalRuleDialog ruleId={ruleId} onOpenChange={(open) => { if (!open) setRuleId(undefined); }} />
  </div>;
}
