"use client";

import { useState } from "react";

const reasons = ["نامناسب یا توهین‌آمیز", "اسپم یا تبلیغاتی", "اطلاعات نادرست", "سایر"];

export function ReportButton({ storyId }: { storyId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const res = await fetch(`/api/stories/${storyId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "گزارش ارسال نشد.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return <span className="text-xs text-muted-foreground">گزارش شما ثبت شد</span>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-muted-foreground hover:text-red-500">
        گزارش این داستان
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-border bg-surface-muted p-3 text-xs">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mb-2 w-full rounded-full border border-border bg-background px-2 py-1.5"
      >
        {reasons.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p className="mb-2 text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} className="rounded-full bg-red-500 px-3 py-1.5 font-medium text-white">
          ارسال گزارش
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full border border-border px-3 py-1.5">
          انصراف
        </button>
      </div>
    </div>
  );
}
