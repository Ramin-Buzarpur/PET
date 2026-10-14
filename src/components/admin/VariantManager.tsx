"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatToman } from "@/lib/format";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  packageWeight: string | null;
  price: number;
  stock: number;
};

export function VariantManager({ productId, variants }: { productId: string; variants: Variant[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function handleDelete(id: string) {
    if (variants.length <= 1) {
      alert("هر محصول باید حداقل یک تنوع داشته باشد.");
      return;
    }
    if (!confirm("این تنوع حذف شود؟")) return;
    await fetch(`/api/admin/variants/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {variants.map((variant) =>
        editingId === variant.id ? (
          <VariantFormRow
            key={variant.id}
            initial={variant}
            url={`/api/admin/variants/${variant.id}`}
            method="PUT"
            onSaved={() => {
              setEditingId(null);
              router.refresh();
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={variant.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm">
            <span>
              {[variant.size, variant.color, variant.packageWeight].filter(Boolean).join(" / ") || "پیش‌فرض"}
              {" — "}
              {formatToman(variant.price)} · موجودی {variant.stock}
            </span>
            <div className="flex gap-3">
              <button onClick={() => setEditingId(variant.id)} className="text-primary">
                ویرایش
              </button>
              <button onClick={() => handleDelete(variant.id)} className="text-red-600">
                حذف
              </button>
            </div>
          </div>
        )
      )}

      {showNew ? (
        <VariantFormRow
          url={`/api/admin/products/${productId}/variants`}
          method="POST"
          onSaved={() => {
            setShowNew(false);
            router.refresh();
          }}
          onCancel={() => setShowNew(false)}
        />
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full rounded-lg border border-dashed border-border py-2 text-sm font-medium text-primary hover:bg-surface-muted"
        >
          + افزودن تنوع جدید
        </button>
      )}
    </div>
  );
}

function VariantFormRow({
  initial,
  url,
  method,
  onSaved,
  onCancel,
}: {
  initial?: Partial<Variant>;
  url: string;
  method: "POST" | "PUT";
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [size, setSize] = useState(initial?.size ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [packageWeight, setPackageWeight] = useState(initial?.packageWeight ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        size: size || undefined,
        color: color || undefined,
        packageWeight: packageWeight || undefined,
        price: Number(price),
        stock: Number(stock),
      }),
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
    <div className="space-y-2 rounded-lg border border-primary bg-surface p-3">
      <div className="grid grid-cols-3 gap-2">
        <input placeholder="سایز" value={size} onChange={(e) => setSize(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
        <input placeholder="رنگ" value={color} onChange={(e) => setColor(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
        <input placeholder="وزن بسته" value={packageWeight} onChange={(e) => setPackageWeight(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="قیمت" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
        <input type="number" placeholder="موجودی" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading} className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {loading ? "در حال ذخیره..." : "ذخیره"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-border px-4 py-1.5 text-sm">
          انصراف
        </button>
      </div>
    </div>
  );
}
