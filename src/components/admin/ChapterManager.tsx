"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Chapter = {
  id: string;
  title: string;
  order: number;
  textContent: string;
  audioUrl: string | null;
  videoUrl: string | null;
  isFreePreview: boolean;
};

export function ChapterManager({ packageId, chapters }: { packageId: string; chapters: Chapter[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("این چپتر حذف شود؟")) return;
    await fetch(`/api/admin/chapters/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) =>
        editingId === chapter.id ? (
          <ChapterFormCard
            key={chapter.id}
            initial={chapter}
            onSaved={() => {
              setEditingId(null);
              router.refresh();
            }}
            onCancel={() => setEditingId(null)}
            updateUrl={`/api/admin/chapters/${chapter.id}`}
          />
        ) : (
          <div key={chapter.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <div className="font-medium">
                {chapter.order}. {chapter.title}
                {chapter.isFreePreview && (
                  <span className="mr-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">رایگان</span>
                )}
              </div>
              <div className="line-clamp-1 text-sm text-muted-foreground">{chapter.textContent}</div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => setEditingId(chapter.id)} className="text-primary">
                ویرایش
              </button>
              <button onClick={() => handleDelete(chapter.id)} className="text-red-600">
                حذف
              </button>
            </div>
          </div>
        )
      )}

      {showNew ? (
        <ChapterFormCard
          onSaved={() => {
            setShowNew(false);
            router.refresh();
          }}
          onCancel={() => setShowNew(false)}
          updateUrl={`/api/admin/courses/${packageId}/chapters`}
        />
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full rounded-xl border border-dashed border-border py-3 text-sm font-medium text-primary hover:bg-surface-muted"
        >
          + افزودن چپتر جدید
        </button>
      )}
    </div>
  );
}

function ChapterFormCard({
  initial,
  updateUrl,
  onSaved,
  onCancel,
}: {
  initial?: Partial<Chapter>;
  updateUrl: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [textContent, setTextContent] = useState(initial?.textContent ?? "");
  const [audioUrl, setAudioUrl] = useState(initial?.audioUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [isFreePreview, setIsFreePreview] = useState(initial?.isFreePreview ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(updateUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, textContent, audioUrl, videoUrl, isFreePreview }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "خطایی رخ داد");
      return;
    }
    onSaved();
  }

  return (
    <div className="space-y-3 rounded-xl border border-primary bg-surface p-4">
      <input
        placeholder="عنوان چپتر"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <textarea
        placeholder="محتوای متنی"
        rows={4}
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        placeholder="آدرس فایل صوتی (اختیاری)"
        dir="ltr"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        placeholder="آدرس فایل ویدیو (اختیاری)"
        dir="ltr"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFreePreview}
          onChange={(e) => setIsFreePreview(e.target.checked)}
        />
        پیش‌نمایش رایگان
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? "در حال ذخیره..." : "ذخیره"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-border px-4 py-2 text-sm">
          انصراف
        </button>
      </div>
    </div>
  );
}
