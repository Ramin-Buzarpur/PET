"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";

type Share = { token: string; showPhoto: boolean; showSpecies: boolean; showBreed: boolean } | null;

export function ShareManager({ petId, activeShare }: { petId: string; activeShare: Share }) {
  const router = useRouter();
  const [showPhoto, setShowPhoto] = useState(activeShare?.showPhoto ?? false);
  const [showSpecies, setShowSpecies] = useState(activeShare?.showSpecies ?? false);
  const [showBreed, setShowBreed] = useState(activeShare?.showBreed ?? false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // window.location فقط سمت کلاینت موجود است؛ برای جلوگیری از عدم‌تطابق hydration بعد از mount ست می‌شود.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = activeShare ? `${origin}/pet-card/${activeShare.token}` : null;

  async function publish() {
    setLoading(true);
    await fetch(`/api/pets/${petId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showPhoto, showSpecies, showBreed }),
    });
    setLoading(false);
    router.refresh();
  }

  async function revoke() {
    if (!confirm("لینک عمومی غیرفعال شود؟ نسخه‌هایی که دیگران قبلاً دانلود کرده‌اند حذف نمی‌شوند.")) return;
    setLoading(true);
    await fetch(`/api/pets/${petId}/share`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function downloadPng() {
    const el = document.getElementById("pet-card-exportable");
    if (!el) return;
    const dataUrl = await Promise.race([
      toPng(el, { pixelRatio: 2, cacheBust: true, skipFonts: true }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
    ]).catch((err) => {
      console.error("PNG export failed:", err);
      return null;
    });
    if (!dataUrl) {
      alert("دانلود عکس کارت با مشکل مواجه شد. دوباره تلاش کن.");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "pet-card.png";
    a.click();
  }

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showPhoto} onChange={(e) => setShowPhoto(e.target.checked)} />
          نمایش عکس
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showSpecies} onChange={(e) => setShowSpecies(e.target.checked)} />
          نمایش نوع حیوان
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showBreed} onChange={(e) => setShowBreed(e.target.checked)} />
          نمایش نژاد
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={publish}
          disabled={loading}
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {activeShare ? "به‌روزرسانی و ساخت لینک تازه" : "اشتراک کارت"}
        </button>
        <button
          onClick={downloadPng}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary"
        >
          دانلود PNG
        </button>
        {activeShare && (
          <button
            onClick={revoke}
            disabled={loading}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:border-red-400"
          >
            لغو اشتراک
          </button>
        )}
      </div>

      {activeShare && shareUrl && (
        <div className="flex items-center gap-2 rounded-xl bg-surface-muted p-3 text-xs">
          <span dir="ltr" className="flex-1 truncate text-muted-foreground">
            {shareUrl}
          </span>
          <button onClick={copyLink} className="font-bold text-primary">
            {copied ? "کپی شد ✓" : "کپی لینک"}
          </button>
        </div>
      )}
    </div>
  );
}
