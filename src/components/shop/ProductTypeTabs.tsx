"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProductTypeTabs({ basePath, types }: { basePath: string; types: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("type");

  function select(type: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (type) params.set("type", type);
    else params.delete("type");
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="mb-5 flex flex-wrap gap-2 border-b border-border pb-4">
      <button
        onClick={() => select(null)}
        className={`rounded-full px-4 py-1.5 text-sm transition ${
          !active ? "bg-accent text-accent-foreground" : "bg-surface-muted hover:bg-accent-soft"
        }`}
      >
        همه
      </button>
      {types.map((type) => (
        <button
          key={type}
          onClick={() => select(type)}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            active === type ? "bg-accent text-accent-foreground" : "bg-surface-muted hover:bg-accent-soft"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
