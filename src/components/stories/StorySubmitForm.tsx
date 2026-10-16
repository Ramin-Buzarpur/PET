"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/effects/MagneticButton";

export function StorySubmitForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() || undefined, body: body.trim() }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "ارسال داستان با مشکل مواجه شد.");
      setSubmitting(false);
      return;
    }

    setTitle("");
    setBody("");
    setOpen(false);
    setSubmitting(false);
    router.refresh();
  }

  if (!open) {
    return (
      <MagneticButton className="mb-8 inline-block">
        <button
          onClick={() => setOpen(true)}
          className="hover-lift rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          + داستان پت‌ام را بنویسم
        </button>
      </MagneticButton>
    );
  }

  return (
    <div className="sticker-card mb-8 border border-border bg-surface p-5">
      <p className="mb-3 text-xs text-muted-foreground">
        داستان شما به‌صورت ناشناس منتشر می‌شود؛ هیچ نام یا مشخصاتی از شما نمایش داده نمی‌شود.
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان (اختیاری)"
        className="mb-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="داستانت را بنویس..."
        rows={5}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={submitting || body.trim().length < 10}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "در حال ارسال..." : "ارسال داستان"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-5 py-2 text-sm"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
