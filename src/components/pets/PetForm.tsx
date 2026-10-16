"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Species = "DOG" | "CAT" | "BIRD" | "FISH" | "REPTILE" | "RODENT" | "OTHER";
type Gender = "MALE" | "FEMALE" | "UNKNOWN";
type CalendarType = "JALALI" | "GREGORIAN";
type Precision = "EXACT" | "ESTIMATED";

export type PetFormValues = {
  name: string;
  species: Species | "";
  speciesOther: string;
  breed: string;
  gender: Gender;
  birthDateValue: string;
  birthCalendar: CalendarType;
  birthPrecision: Precision;
  approxAgeYears: string;
  approxAgeMonths: string;
  photoUrl: string;
  illness: string;
  allergies: string;
  medications: string;
  chatNotes: string;
};

const EMPTY: PetFormValues = {
  name: "",
  species: "",
  speciesOther: "",
  breed: "",
  gender: "UNKNOWN",
  birthDateValue: "",
  birthCalendar: "JALALI",
  birthPrecision: "ESTIMATED",
  approxAgeYears: "",
  approxAgeMonths: "",
  photoUrl: "",
  illness: "",
  allergies: "",
  medications: "",
  chatNotes: "",
};

const speciesOptions: { value: Species; label: string }[] = [
  { value: "DOG", label: "سگ" },
  { value: "CAT", label: "گربه" },
  { value: "BIRD", label: "پرنده" },
  { value: "FISH", label: "ماهی" },
  { value: "REPTILE", label: "خزنده" },
  { value: "RODENT", label: "جوندگان" },
  { value: "OTHER", label: "سایر" },
];

export function PetForm({
  petId,
  initial,
}: {
  petId?: string;
  initial?: Partial<PetFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PetFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PetFormValues>(key: K, value: PetFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      name: values.name || undefined,
      species: values.species || undefined,
      speciesOther: values.species === "OTHER" ? values.speciesOther || undefined : undefined,
      breed: values.breed || undefined,
      gender: values.gender,
      photoUrl: values.photoUrl || undefined,
      illness: values.illness || undefined,
      allergies: values.allergies || undefined,
      medications: values.medications || undefined,
      chatNotes: values.chatNotes || undefined,
    };

    if (values.birthDateValue) {
      payload.birthDateValue = values.birthDateValue;
      payload.birthCalendar = values.birthCalendar;
      payload.birthPrecision = values.birthPrecision;
    } else {
      if (values.approxAgeYears) payload.approxAgeYears = Number(values.approxAgeYears);
      if (values.approxAgeMonths) payload.approxAgeMonths = Number(values.approxAgeMonths);
    }

    const url = petId ? `/api/pets/${petId}` : "/api/pets";
    const method = petId ? "PUT" : "POST";

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

    router.push(`/dashboard/pets/${petId ?? data.pet.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
        همهٔ فیلدها اختیاری‌اند؛ می‌توانید همین الان بدون پرکردن چیزی ثبت کنید و هر وقت خواستید تکمیلش کنید 🐾
      </p>

      <Field label="نام پت">
        <input
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="مثلاً لئو"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="نوع حیوان">
          <select
            value={values.species}
            onChange={(e) => update("species", e.target.value as Species)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {speciesOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="جنسیت">
          <select
            value={values.gender}
            onChange={(e) => update("gender", e.target.value as Gender)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="UNKNOWN">نامشخص</option>
            <option value="MALE">نر</option>
            <option value="FEMALE">ماده</option>
          </select>
        </Field>
      </div>

      {values.species === "OTHER" && (
        <Field label="توضیح نوع حیوان">
          <input
            value={values.speciesOther}
            onChange={(e) => update("speciesOther", e.target.value)}
            maxLength={60}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      )}

      <Field label="نژاد (اختیاری)">
        <input
          value={values.breed}
          onChange={(e) => update("breed", e.target.value)}
          maxLength={80}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="آدرس عکس پت (اختیاری)">
        <input
          dir="ltr"
          value={values.photoUrl}
          onChange={(e) => update("photoUrl", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </Field>

      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 text-sm font-bold">تاریخ تولد (اختیاری)</div>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="date"
            value={values.birthDateValue}
            onChange={(e) => update("birthDateValue", e.target.value)}
            className="col-span-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={values.birthCalendar}
            onChange={(e) => update("birthCalendar", e.target.value as CalendarType)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="JALALI">شمسی</option>
            <option value="GREGORIAN">میلادی</option>
          </select>
          <select
            value={values.birthPrecision}
            onChange={(e) => update("birthPrecision", e.target.value as Precision)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="EXACT">دقیق</option>
            <option value="ESTIMATED">تخمینی</option>
          </select>
        </div>

        {!values.birthDateValue && (
          <div className="mt-3">
            <div className="mb-1 text-xs text-muted-foreground">یا سن تقریبی (اگر تاریخ دقیق را نمی‌دانید)</div>
            <div className="flex gap-3">
              <input
                type="number"
                min={0}
                placeholder="سال"
                value={values.approxAgeYears}
                onChange={(e) => update("approxAgeYears", e.target.value)}
                className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                max={11}
                placeholder="ماه"
                value={values.approxAgeMonths}
                onChange={(e) => update("approxAgeMonths", e.target.value)}
                className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <Field label="بیماری و سوابق (اختیاری)">
        <textarea
          value={values.illness}
          onChange={(e) => update("illness", e.target.value)}
          maxLength={2000}
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="حساسیت‌ها (اختیاری)">
          <textarea
            value={values.allergies}
            onChange={(e) => update("allergies", e.target.value)}
            maxLength={1000}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="داروهای فعلی (اختیاری)">
          <textarea
            value={values.medications}
            onChange={(e) => update("medications", e.target.value)}
            maxLength={1000}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="اطلاعات بیشتر برای چت (اختیاری)">
        <textarea
          value={values.chatNotes}
          onChange={(e) => update("chatNotes", e.target.value)}
          maxLength={3000}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          این بخش با اجازهٔ تو برای پاسخ مرتبط‌تر به چت فرستاده می‌شود. نوشته‌های شخصی را در دفتر پیشرفت بنویس.
        </p>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "در حال ذخیره..." : "ثبت پت"}
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
