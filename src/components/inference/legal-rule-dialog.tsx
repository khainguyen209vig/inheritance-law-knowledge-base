"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getRuleExplanation, legalProvisions } from "@/domain/legal-knowledge";
import { cn } from "@/lib/utils";

export function LegalRuleDialog({ ruleId, onOpenChange }: { ruleId?: string; onOpenChange: (open: boolean) => void }) {
  const explanation = ruleId ? getRuleExplanation(ruleId) : undefined;
  const provision = explanation?.provisionId ? legalProvisions[explanation.provisionId] : undefined;

  return (
    <Dialog open={Boolean(ruleId)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={explanation?.kind === "internal" ? "warning" : "outline"}>{ruleId === "ARTICLE-627" ? "Căn cứ câu hỏi" : ruleId}</Badge>
            {explanation ? <Badge variant="secondary">{explanation.citation}</Badge> : null}
            {explanation?.reviewState ? <Badge variant={explanation.reviewState === "TEAM_REVIEW" ? "warning" : "success"}>{explanation.reviewState}</Badge> : null}
          </div>
          <DialogTitle>{explanation?.title ?? "Thông tin căn cứ"}</DialogTitle>
          <DialogDescription>{explanation?.reasoning ?? "Chưa có nội dung giải thích dành cho rule này."}</DialogDescription>
        </DialogHeader>

        {explanation?.kind === "internal" ? (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {ruleId === "FORM-ASSESSMENT-ACCEPTED"
              ? "Đây là quy tắc kỹ thuật chuyển tiếp, đang thay cho phần tiêu chí hình thức tại Điều 627–636 chưa được mô hình hóa đầy đủ."
              : "Đây là quy tắc kiểm soát hoặc kết nối nội bộ của knowledge base, không phải một điều luật độc lập. Hãy đọc căn cứ pháp lý và giới hạn kết luận đi kèm."}
          </div>
        ) : null}

        {explanation?.reviewState === "TEAM_REVIEW" ? (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Rule này đã được đưa vào prototype để kiểm thử luồng suy luận nhưng vẫn cần team rà soát điều kiện và căn cứ pháp lý trước khi đổi trạng thái.
          </div>
        ) : null}

        {provision ? (
          <div className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Bộ luật Dân sự 2015</p>
                <h3 className="mt-1 font-serif text-xl font-semibold">{provision.number}. {provision.title}</h3>
              </div>
              <Badge variant="outline">Nguồn local: {provision.sourceDocument}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {provision.sections.map((section) => {
                const relevant = explanation?.relevantSections.includes(section.id) ?? false;
                return (
                  <section key={section.id} className={cn("rounded-lg border p-4", relevant ? "border-primary/40 bg-primary/[0.055]" : "bg-muted/35")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{section.label}</p>
                      {relevant ? <Badge variant="success">Rule đang sử dụng</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-foreground/85">{section.text}</p>
                  </section>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">Nội dung lấy từ tài liệu luật của dự án; knowledge base hiện ở trạng thái draft.</p>
              <Button asChild variant="outline" size="sm">
                <a href={provision.officialUrl} target="_blank" rel="noreferrer">Mở văn bản trên Cổng Chính phủ ↗</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">Rule hệ thống này không viện dẫn trực tiếp một điều luật.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
