"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { formatToman } from "@/lib/format";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  packageWeight: string | null;
  price: number;
  stock: number;
};

function uniq<T>(values: (T | null)[]): T[] {
  return Array.from(new Set(values.filter((v): v is T => v !== null)));
}

function variantLabel(variant: Variant): string | undefined {
  const parts = [variant.size, variant.color, variant.packageWeight].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : undefined;
}

export function AddToCartButton({
  productTitle,
  image,
  variants,
}: {
  productTitle: string;
  image: string;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const sizes = useMemo(() => uniq(variants.map((v) => v.size)), [variants]);
  const colors = useMemo(() => uniq(variants.map((v) => v.color)), [variants]);
  const weights = useMemo(() => uniq(variants.map((v) => v.packageWeight)), [variants]);

  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [weight, setWeight] = useState<string | null>(weights[0] ?? null);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) =>
          (sizes.length === 0 || v.size === size) &&
          (colors.length === 0 || v.color === color) &&
          (weights.length === 0 || v.packageWeight === weight)
      ),
    [variants, sizes, colors, weights, size, color, weight]
  );

  function handleAdd(goToCart: boolean) {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      title: productTitle,
      variantLabel: variantLabel(selectedVariant),
      price: selectedVariant.price,
      image,
    });
    if (goToCart) {
      router.push("/cart");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  }

  return (
    <div>
      {sizes.length > 1 && (
        <div className="mb-3">
          <div className="mb-1.5 text-sm font-medium">سایز</div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface hover:border-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 1 && (
        <div className="mb-3">
          <div className="mb-1.5 text-sm font-medium">رنگ</div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  color === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {weights.length > 1 && (
        <div className="mb-3">
          <div className="mb-1.5 text-sm font-medium">وزن بسته</div>
          <div className="flex flex-wrap gap-2">
            {weights.map((w) => (
              <button
                key={w}
                onClick={() => setWeight(w)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  weight === w
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface hover:border-primary"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedVariant ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          این ترکیب موجود نیست؛ گزینه دیگری را انتخاب کنید.
        </div>
      ) : (
        <>
          <div className="mb-3 text-2xl font-bold text-primary">
            {formatToman(selectedVariant.price)}
          </div>

          {selectedVariant.stock > 0 ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleAdd(false)}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {added ? "به سبد افزوده شد ✓" : "افزودن به سبد خرید"}
              </button>
              <button
                onClick={() => handleAdd(true)}
                className="rounded-full border border-border bg-surface px-4 py-3 text-sm font-medium hover:border-primary"
              >
                خرید سریع
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              این تنوع موقتاً ناموجود است.
            </div>
          )}

          <div className="mt-3 text-sm text-muted-foreground">
            موجودی: {selectedVariant.stock} عدد
          </div>
        </>
      )}
    </div>
  );
}
