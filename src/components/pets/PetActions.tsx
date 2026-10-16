"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PetActions({ petId, isArchived }: { petId: string; isArchived: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleArchive() {
    setLoading(true);
    await fetch(`/api/pets/${petId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !isArchived }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("این پت و کارت، دفتر و رویدادهای آن برای همیشه حذف می‌شود. مطمئنی؟")) return;
    setLoading(true);
    await fetch(`/api/pets/${petId}`, { method: "DELETE" });
    router.push("/dashboard/pets");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={toggleArchive}
        disabled={loading}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary disabled:opacity-60"
      >
        {isArchived ? "بازگرداندن از بایگانی" : "بایگانی کردن"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:border-red-400 disabled:opacity-60"
      >
        حذف قطعی
      </button>
    </div>
  );
}
