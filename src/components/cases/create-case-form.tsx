"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateCaseForm() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      setError(undefined);
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await response.json() as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(data.error ?? "Không thể tạo hồ sơ.");
        return;
      }
      router.push(`/cases/${data.id}`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={200}
        placeholder="Ví dụ: Hồ sơ thừa kế gia đình A"
        aria-label="Tên hồ sơ mới"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={isPending || title.trim().length === 0} className="w-full">
        {isPending ? "Đang tạo…" : "Tạo hồ sơ"}
      </Button>
    </form>
  );
}
