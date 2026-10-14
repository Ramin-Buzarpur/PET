"use client";

import { useRouter, useSearchParams } from "next/navigation";

const LABELS: Record<string, string> = {
  min: "حداقل قیمت",
  max: "حداکثر قیمت",
  brand: "برند",
  stock: "فقط موجود",
  age: "سن",
  dogSize: "جثه",
  waterType: "نوع آب",
  animalType: "نوع حیوان",
  size: "سایز",
  color: "رنگ",
  weight: "وزن",
  type: "نوع محصول",
};

const SORT_OPTIONS = [
  { value: "relevant", label: "مرتبط‌ترین" },
  { value: "new", label: "جدیدترین" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
];

export function ActiveFiltersBar({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entries = Array.from(searchParams.entries()).filter(([key]) => key !== "sort");
  const sort = searchParams.get("sort") ?? "relevant";

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
  }

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevant") params.delete("sort");
    else params.set("sort", value);
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <button
            key={key}
            onClick={() => removeFilter(key)}
            className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs text-primary"
          >
            {LABELS[key] ?? key}: {value}
            <span>✕</span>
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => changeSort(e.target.value)}
        className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
