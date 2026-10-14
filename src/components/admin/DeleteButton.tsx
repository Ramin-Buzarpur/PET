"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ url, confirmText = "این مورد حذف شود؟" }: { url: string; confirmText?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmText)) return;
    setLoading(true);
    await fetch(url, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-600 disabled:opacity-50">
      حذف
    </button>
  );
}
