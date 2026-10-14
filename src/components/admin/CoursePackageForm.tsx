"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Values = {
  title: string;
  slug: string;
  description: string;
  price: number;
  coverImage: string;
  species: "DOG" | "CAT" | "BIRD" | "RABBIT" | "OTHER";
};

const speciesOptions: { value: Values["species"]; label: string }[] = [
  { value: "DOG", label: "سگ" },
  { value: "CAT", label: "گربه" },
  { value: "BIRD", label: "پرنده" },
  { value: "RABBIT", label: "خرگوش" },
  { value: "OTHER", label: "سایر" },
];

export function CoursePackageForm({
  initial,
  packageId,
}: {
  initial?: Partial<Values>;
  packageId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    coverImage: initial?.coverImage ?? "/images/courses/dog-course.svg",
    species: initial?.species ?? "DOG",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = packageId ? `/api/admin/courses/${packageId}` : "/api/admin/courses";
    const method = packageId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, price: Number(values.price) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "خطایی رخ داد");
      return;
    }

    router.push(packageId ? `/admin/courses/${packageId}` : `/admin/courses/${data.package.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <Field label="عنوان پکیج">
        <input
          required
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="اسلاگ">
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
      <div className="grid grid-cols-2 gap-4">
        <Field label="قیمت (تومان)">
          <input
            required
            type="number"
            value={values.price}
            onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="نوع حیوان">
          <select
            value={values.species}
            onChange={(e) => setValues({ ...values, species: e.target.value as Values["species"] })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {speciesOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="آدرس تصویر کاور">
        <input
          dir="ltr"
          value={values.coverImage}
          onChange={(e) => setValues({ ...values, coverImage: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

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
