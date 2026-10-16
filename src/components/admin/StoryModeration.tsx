"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Report = { id: string; reason: string; note: string | null; status: string; createdAt: string };
type Story = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  createdAt: string;
  reports: Report[];
};

export function StoryModeration({ stories }: { stories: Story[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleStory(id: string, status: "PUBLISHED" | "HIDDEN") {
    setBusy(id);
    await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  }

  async function resolveReport(id: string, status: "DISMISSED" | "ACTED") {
    setBusy(id);
    await fetch(`/api/admin/stories/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  }

  if (stories.length === 0) {
    return <p className="text-sm text-muted-foreground">هنوز داستانی ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-4">
      {stories.map((story) => {
        const openReports = story.reports.filter((r) => r.status === "OPEN");
        return (
          <div key={story.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {new Date(story.createdAt).toLocaleDateString("fa-IR")} ·{" "}
                {story.status === "PUBLISHED" ? "منتشرشده" : "پنهان"}
                {openReports.length > 0 && (
                  <span className="mr-2 rounded-full bg-red-100 px-2 py-0.5 text-red-600">
                    {openReports.length} گزارش باز
                  </span>
                )}
              </span>
              <button
                disabled={busy === story.id}
                onClick={() => toggleStory(story.id, story.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED")}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary disabled:opacity-50"
              >
                {story.status === "PUBLISHED" ? "پنهان کردن" : "بازنمایی"}
              </button>
            </div>

            {story.title && <h3 className="mb-1 font-bold">{story.title}</h3>}
            <p className="whitespace-pre-wrap text-sm leading-6">{story.body}</p>

            {story.reports.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {story.reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span>
                      {r.reason}
                      {r.note ? ` — ${r.note}` : ""} ·{" "}
                      <span className="text-muted-foreground">
                        {r.status === "OPEN" ? "باز" : r.status === "DISMISSED" ? "رد شده" : "اقدام شده"}
                      </span>
                    </span>
                    {r.status === "OPEN" && (
                      <div className="flex gap-1.5">
                        <button
                          disabled={busy === r.id}
                          onClick={() => resolveReport(r.id, "ACTED")}
                          className="rounded-full bg-red-500 px-2.5 py-1 font-medium text-white disabled:opacity-50"
                        >
                          پنهان کردن داستان
                        </button>
                        <button
                          disabled={busy === r.id}
                          onClick={() => resolveReport(r.id, "DISMISSED")}
                          className="rounded-full border border-border px-2.5 py-1 disabled:opacity-50"
                        >
                          رد گزارش
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
