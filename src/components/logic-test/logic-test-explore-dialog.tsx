"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LogicReasoningStep } from "@/domain/logic-test";

interface RuleSourcePayload { implementation: string; file: string; source: string }

export function LogicTestExploreDialog({
  step,
  onOpenChange,
  onOpenLegalRule,
}: {
  step?: LogicReasoningStep;
  onOpenChange: (open: boolean) => void;
  onOpenLegalRule: (ruleId: string) => void;
}) {
  const [source, setSource] = useState<RuleSourcePayload>();
  const [error, setError] = useState<string>();
  const [implementation, setImplementation] = useState<string>();

  useEffect(() => {
    setImplementation(step?.codeReferences[0]?.implementation);
  }, [step]);

  useEffect(() => {
    setSource(undefined);
    setError(undefined);
    if (!implementation) return;
    const controller = new AbortController();
    fetch(`/api/logic-tests/rules/${encodeURIComponent(implementation)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được source của rule.");
        setSource(await response.json() as RuleSourcePayload);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Không tải được source của rule.");
      });
    return () => controller.abort();
  }, [implementation]);

  return (
    <Dialog open={Boolean(step)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{step?.ruleId}</Badge>
            {source ? <Badge variant="secondary">{source.file}</Badge> : null}
          </div>
          <DialogTitle>Chi tiết bước suy luận</DialogTitle>
          <DialogDescription>{step?.plainExplanation}</DialogDescription>
        </DialogHeader>

        <section className="mt-5">
          <h3 className="text-sm font-semibold">Dữ kiện hỗ trợ</h3>
          {step?.supports.length ? (
            <ul className="mt-2 space-y-2">
              {step.supports.map((support) => (
                <li key={`${support.kind}:${support.id}`} className="rounded-lg border bg-muted/35 p-3 text-sm">
                  <p>{support.statement}</p>
                  <code className="mt-1 block text-xs text-muted-foreground">{support.machineExpression}</code>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">Bước này không có support chi tiết trong trace.</p>}
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold">Rule CLIPS (chỉ đọc)</h3>
          {(step?.codeReferences.length ?? 0) > 1 ? (
            <label className="mt-2 block text-xs font-medium text-muted-foreground">Implementation đã khớp Rule ID
              <select value={implementation ?? ""} onChange={(event) => setImplementation(event.target.value)} className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground">
                {step?.codeReferences.map((reference) => <option key={reference.implementation} value={reference.implementation}>{reference.implementation}</option>)}
              </select>
            </label>
          ) : null}
          {implementation && !source && !error ? <p className="mt-2 text-sm text-muted-foreground">Đang tải source…</p> : null}
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          {!implementation ? <p className="mt-2 text-sm text-muted-foreground">Bước hệ thống này không có source CLIPS riêng.</p> : null}
          {source ? <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100"><code>{source.source}</code></pre> : null}
        </section>

        {step ? (
          <div className="mt-5 flex justify-end border-t pt-4">
            <Button variant="outline" onClick={() => onOpenLegalRule(step.ruleId)}>Xem nội dung điều luật</Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
