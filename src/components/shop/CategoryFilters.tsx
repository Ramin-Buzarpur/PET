"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type FilterOptions = {
  brands: { slug: string; name: string }[];
  ages: string[];
  dogSizes: string[];
  waterTypes: string[];
  animalTypes: string[];
  sizes: string[];
  colors: string[];
  weights: string[];
  availableFilters: string[];
  productTypes: string[];
  priceBounds: { min: number; max: number };
};

const AGE_LABEL: Record<string, string> = { BABY: "بچه/توله", ADULT: "بالغ", SENIOR: "مسن" };
const DOGSIZE_LABEL: Record<string, string> = { SMALL: "کوچک", MEDIUM: "متوسط", LARGE: "بزرگ" };
const WATER_LABEL: Record<string, string> = { FRESH: "آب شیرین", SALT: "آب شور" };

export function CategoryFilters({ basePath, options }: { basePath: string; options: FilterOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(() => Object.fromEntries(searchParams.entries()));
  const [mobileOpen, setMobileOpen] = useState(false);

  function update(key: string, value: string | null) {
    setDraft((prev) => {
      const next = { ...prev };
      if (value === null || value === "") delete next[key];
      else next[key] = value;
      return next;
    });
  }

  function apply() {
    const params = new URLSearchParams(draft);
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
    setMobileOpen(false);
  }

  function clearAll() {
    setDraft({});
    router.push(basePath);
    setMobileOpen(false);
  }

  const has = (key: string) => options.availableFilters.includes(key);

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold">قیمت (تومان)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`از ${options.priceBounds.min.toLocaleString("fa-IR")}`}
            value={draft.min ?? ""}
            onChange={(e) => update("min", e.target.value)}
            className="w-1/2 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder={`تا ${options.priceBounds.max.toLocaleString("fa-IR")}`}
            value={draft.max ?? ""}
            onChange={(e) => update("max", e.target.value)}
            className="w-1/2 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {options.brands.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-bold">برند</h3>
          <div className="space-y-1.5">
            {options.brands.map((brand) => {
              const selected = (draft.brand ?? "").split(",").filter(Boolean);
              const checked = selected.includes(brand.slug);
              return (
                <label key={brand.slug} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? selected.filter((s) => s !== brand.slug)
                        : [...selected, brand.slug];
                      update("brand", next.join(","));
                    }}
                  />
                  {brand.name}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={draft.stock === "1"}
            onChange={(e) => update("stock", e.target.checked ? "1" : null)}
          />
          فقط کالاهای موجود
        </label>
      </div>

      {has("age") && options.ages.length > 1 && (
        <ChoiceGroup
          title="سن"
          options={options.ages.map((a) => ({ value: a, label: AGE_LABEL[a] ?? a }))}
          value={draft.age}
          onChange={(v) => update("age", v)}
        />
      )}

      {has("dogSize") && options.dogSizes.length > 1 && (
        <ChoiceGroup
          title="جثه سگ"
          options={options.dogSizes.map((s) => ({ value: s, label: DOGSIZE_LABEL[s] ?? s }))}
          value={draft.dogSize}
          onChange={(v) => update("dogSize", v)}
        />
      )}

      {has("waterType") && options.waterTypes.length > 1 && (
        <ChoiceGroup
          title="نوع آب"
          options={options.waterTypes.map((w) => ({ value: w, label: WATER_LABEL[w] ?? w }))}
          value={draft.waterType}
          onChange={(v) => update("waterType", v)}
        />
      )}

      {has("animalType") && options.animalTypes.length > 1 && (
        <ChoiceGroup
          title="نوع حیوان"
          options={options.animalTypes.map((t) => ({ value: t, label: t }))}
          value={draft.animalType}
          onChange={(v) => update("animalType", v)}
        />
      )}

      {has("size") && options.sizes.length > 1 && (
        <ChoiceGroup
          title="سایز"
          options={options.sizes.map((s) => ({ value: s, label: s }))}
          value={draft.size}
          onChange={(v) => update("size", v)}
        />
      )}

      {has("color") && options.colors.length > 1 && (
        <ChoiceGroup
          title="رنگ"
          options={options.colors.map((c) => ({ value: c, label: c }))}
          value={draft.color}
          onChange={(v) => update("color", v)}
        />
      )}

      {has("packageWeight") && options.weights.length > 1 && (
        <ChoiceGroup
          title="وزن بسته"
          options={options.weights.map((w) => ({ value: w, label: w }))}
          value={draft.weight}
          onChange={(v) => update("weight", v)}
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={apply}
          className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
        >
          نمایش نتایج
        </button>
        <button onClick={clearAll} className="rounded-full border border-border px-4 py-2.5 text-sm">
          پاک کردن
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block lg:w-64 lg:shrink-0">{content}</div>

      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full rounded-full border border-border bg-surface py-2.5 text-sm font-medium"
        >
          فیلترها
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">فیلترها</h2>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function ChoiceGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(value === opt.value ? null : opt.value)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              value === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:border-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
