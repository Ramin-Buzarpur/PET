"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewBrandForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9آ-ی\s-]/g, "")
      .replace(/\s+/g, "-");

    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || `brand-${Date.now()}` }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "خطایی رخ داد");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="نام برند جدید"
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        افزودن
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
