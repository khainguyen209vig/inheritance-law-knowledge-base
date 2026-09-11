"use client";

import { useState } from "react";
import { LegalRuleDialog } from "@/components/inference/legal-rule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRuleExplanation } from "@/domain/legal-knowledge";
import type { StoredInferenceRun } from "@/server/db/case-repository";
import { willValidityMissingLabels } from "@/modules/will-validity/definition";
import { resultBadge, resultStatusLabel, willValidityFactLabel } from "@/modules/will-validity/presentation";

export function InferenceRunSnapshot({ run, moduleTitle }: { run: StoredInferenceRun; moduleTitle: string }) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Dữ kiện snapshot</CardTitle><CardDescription>{run.inputSnapshot.length} facts đã được đưa vào CLIPS.</CardDescription></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {run.inputSnapshot.map((fact) => (
                <li key={fact.id} className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-sm font-medium">{willValidityFactLabel(fact)}</p>
                  <code className="mt-1 block break-all text-[10px] text-muted-foreground">{fact.predicate}={String(fact.value)}</code>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Thông tin lần chạy</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <p>Run: {run.id}</p><p>Module: {run.module}</p><p>Subject: {run.subject}</p><p>KB: {run.knowledgeBaseVersion}</p>
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-4">
        <Card>
          <CardHeader><CardTitle>{moduleTitle}</CardTitle><CardDescription>Kết quả được lưu bất biến tại {new Date(run.createdAt).toLocaleString("vi-VN")}.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {run.results.map((result) => (
              <div key={result.predicate} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><code className="text-xs">{result.predicate}</code><Badge variant={resultBadge(result.value)}>{resultStatusLabel(result.value)}</Badge></div>
                <p className="mt-2 text-sm">Dẫn xuất bởi {result.derivations.join(", ")}.</p>
              </div>
            ))}
            {run.missing.length ? (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">Dữ kiện còn thiếu</p>
                <ul className="mt-2 space-y-1">{run.missing.map((item) => <li key={item.predicate}>• {willValidityMissingLabels[item.predicate] ?? item.predicate}</li>)}</ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Luồng lập luận đã lưu</CardTitle><CardDescription>Trace này thuộc snapshot; thay đổi facts hiện tại không làm thay đổi nội dung bên dưới.</CardDescription></CardHeader>
          <CardContent>
            {run.traces.length === 0 ? <p className="text-sm text-muted-foreground">Không có derived trace trong lần chạy này.</p> : (
              <ol className="space-y-3">
                {run.traces.map((trace, index) => {
                  const explanation = getRuleExplanation(trace.ruleId);
                  return (
                    <li key={`${trace.ruleId}-${index}`} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2"><Badge>{index + 1}</Badge><strong className="text-sm">{explanation?.conclusion ?? trace.conclusionPredicate}</strong><Badge variant="outline">{trace.ruleId}</Badge></div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{explanation?.reasoning}</p>
                      <p className="mt-2 text-xs">Supports: {trace.supports.join(" · ") || "—"}</p>
                      {explanation ? <Button className="mt-3" variant="outline" size="sm" onClick={() => setSelectedRuleId(trace.ruleId)}>Xem {explanation.citation}</Button> : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>

      <LegalRuleDialog ruleId={selectedRuleId} onOpenChange={(open) => { if (!open) setSelectedRuleId(undefined); }} />
    </div>
  );
}
