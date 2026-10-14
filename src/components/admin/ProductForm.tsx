"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Brand = { id: string; name: string };
type CategoryOption = { id: string; name: string; sectionName: string };

type DraftVariant = {
  size: string;
  color: string;
  packageWeight: string;
  price: number;
  stock: number;
};

type ProductFormValues = {
  title: string;
  slug: string;
  description: string;
  images: string;
  brandId: string;
  ageGroup: "" | "BABY" | "ADULT" | "SENIOR";
  dogSize: "" | "SMALL" | "MEDIUM" | "LARGE";
  waterType: "" | "FRESH" | "SALT";
  animalSubtype: string;
  productType: string;
  categoryIds: string[];
};

export function ProductForm({
  brands,
  categories,
  initial,
  productId,
}: {
  brands: Brand[];
  categories: CategoryOption[];
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    images: initial?.images ?? "/images/products/dog-food.svg",
    brandId: initial?.brandId ?? "",
    ageGroup: initial?.ageGroup ?? "",
    dogSize: initial?.dogSize ?? "",
    waterType: initial?.waterType ?? "",
    animalSubtype: initial?.animalSubtype ?? "",
    productType: initial?.productType ?? "",
    categoryIds: initial?.categoryIds ?? [],
  });
  const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([
    { size: "", color: "", packageWeight: "", price: 0, stock: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleCategory(id: string) {
    setValues((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  }

  function updateVariant(index: number, patch: Partial<DraftVariant>) {
    setDraftVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariantRow() {
    setDraftVariants((prev) => [...prev, { size: "", color: "", packageWeight: "", price: 0, stock: 0 }]);
  }

  function removeVariantRow(index: number) {
    setDraftVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      images: [values.images],
      brandId: values.brandId || undefined,
      ageGroup: values.ageGroup || undefined,
      dogSize: values.dogSize || undefined,
      waterType: values.waterType || undefined,
      animalSubtype: values.animalSubtype || undefined,
      productType: values.productType || undefined,
      categoryIds: values.categoryIds,
      ...(productId
        ? {}
        : {
            variants: draftVariants.map((v) => ({
              size: v.size || undefined,
              color: v.color || undefined,
              packageWeight: v.packageWeight || undefined,
              price: Number(v.price),
              stock: Number(v.stock),
            })),
          }),
    };

    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "خطایی رخ داد");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <Field label="عنوان">
        <input
          required
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="اسلاگ (برای URL، فقط حروف انگلیسی و خط فاصله)">
        <input
          required
          dir="ltr"
          value={values.slug}
          onChange={(e) => setValues({ ...values, slug: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="توضیحات">
        <textarea
          required
          rows={3}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="آدرس تصویر">
        <input
          dir="ltr"
          value={values.images}
          onChange={(e) => setValues({ ...values, images: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="دسته‌ها (انتخاب چند دسته برای محصول مشترک مجاز است)">
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.categoryIds.includes(c.id)}
                onChange={() => toggleCategory(c.id)}
              />
              {c.sectionName} · {c.name}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="برند (اختیاری)">
          <select
            value={values.brandId}
            onChange={(e) => setValues({ ...values, brandId: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">بدون برند</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="نوع محصول کوتاه (اختیاری)">
          <input
            value={values.productType}
            onChange={(e) => setValues({ ...values, productType: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="گروه سنی (اختیاری)">
          <select
            value={values.ageGroup}
            onChange={(e) => setValues({ ...values, ageGroup: e.target.value as ProductFormValues["ageGroup"] })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="BABY">بچه/توله</option>
            <option value="ADULT">بالغ</option>
            <option value="SENIOR">مسن</option>
          </select>
        </Field>
        <Field label="جثه سگ (اختیاری)">
          <select
            value={values.dogSize}
            onChange={(e) => setValues({ ...values, dogSize: e.target.value as ProductFormValues["dogSize"] })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="SMALL">کوچک</option>
            <option value="MEDIUM">متوسط</option>
            <option value="LARGE">بزرگ</option>
          </select>
        </Field>
        <Field label="نوع آب (اختیاری)">
          <select
            value={values.waterType}
            onChange={(e) => setValues({ ...values, waterType: e.target.value as ProductFormValues["waterType"] })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="FRESH">آب شیرین</option>
            <option value="SALT">آب شور</option>
          </select>
        </Field>
      </div>

      <Field label="گونه/نوع حیوان (اختیاری، مثلاً «مرغ عشق» یا «خرگوش»)">
        <input
          value={values.animalSubtype}
          onChange={(e) => setValues({ ...values, animalSubtype: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      {!productId && (
        <Field label="تنوع‌های محصول (سایز/رنگ/وزن + قیمت و موجودی)">
          <div className="space-y-2">
            {draftVariants.map((v, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 rounded-lg border border-border p-2">
                <input placeholder="سایز" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} className="col-span-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <input placeholder="رنگ" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} className="col-span-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <input placeholder="وزن بسته" value={v.packageWeight} onChange={(e) => updateVariant(i, { packageWeight: e.target.value })} className="col-span-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <input type="number" placeholder="قیمت" value={v.price} onChange={(e) => updateVariant(i, { price: Number(e.target.value) })} className="col-span-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <input type="number" placeholder="موجودی" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} className="col-span-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <button type="button" onClick={() => removeVariantRow(i)} className="col-span-1 text-sm text-red-600">
                  حذف
                </button>
              </div>
            ))}
            <button type="button" onClick={addVariantRow} className="text-sm font-medium text-primary">
              + افزودن ردیف تنوع
            </button>
          </div>
        </Field>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "در حال ذخیره..." : "ذخیره"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
