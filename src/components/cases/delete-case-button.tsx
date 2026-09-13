"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteCaseButtonProps {
  caseId: string;
  caseTitle: string;
  redirectTo?: string;
}

export function DeleteCaseButton({ caseId, caseTitle, redirectTo }: DeleteCaseButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function deleteCase() {
    startTransition(async () => {
      setError(undefined);
      try {
        const response = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Không thể xóa hồ sơ (${response.status}).`);
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể xóa hồ sơ.");
      }
    });
  }

  return <>
    <Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setOpen(true)}>Xóa hồ sơ</Button>
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isPending) setOpen(nextOpen); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Xóa hồ sơ “{caseTitle}”?</DialogTitle>
          <DialogDescription>Facts hiện tại và toàn bộ snapshot suy luận của hồ sơ sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.</DialogDescription>
        </DialogHeader>
        {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>Hủy</Button>
          <Button type="button" className="bg-red-600 text-white hover:bg-red-700" disabled={isPending} onClick={deleteCase}>{isPending ? "Đang xóa…" : "Xóa vĩnh viễn"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
