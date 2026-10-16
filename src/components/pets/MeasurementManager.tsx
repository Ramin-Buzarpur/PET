"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Measurement = { id: string; type: "HEIGHT" | "WEIGHT"; value: number; unit: string; measuredAt: string };

export function MeasurementManager({ petId, measurements }: { petId: string; measurements: Measurement[] }) {
  const router = useRouter();
  const [type, setType] = useState<"HEIGHT" | "WEIGHT">("WEIGHT");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("کیلوگرم");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastHeight = measurements.find((m) => m.type === "HEIGHT");
  const lastWeight = measurements.find((m) => m.type === "WEIGHT");

  async function handleAdd() {
    if (!value) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/pets/${petId}/measurements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value: Number(value), unit, measuredAt: new Date().toISOString() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "خطایی رخ داد");
      return;
    }
    setValue("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface-muted p-3">
          <div className="text-xs text-muted-foreground">آخرین قد</div>
          <div className="font-bold">{lastHeight ? `${lastHeight.value} ${lastHeight.unit}` : "ثبت نشده"}</div>
        </div>
        <div className="rounded-xl bg-surface-muted p-3">
          <div className="text-xs text-muted-foreground">آخرین وزن</div>
          <div className="font-bold">{lastWeight ? `${lastWeight.value} ${lastWeight.unit}` : "ثبت نشده"}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "HEIGHT" | "WEIGHT")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="WEIGHT">وزن</option>
          <option value="HEIGHT">قد</option>
        </select>
        <input
          type="number"
          step="0.1"
          placeholder="مقدار"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="واحد"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          ثبت
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
