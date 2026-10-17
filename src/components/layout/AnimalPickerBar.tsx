"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAnimalPicker } from "@/components/providers/AnimalPickerProvider";
import { SECTION_ICONS } from "@/components/icons/AnimalIcons";

type SectionLite = { slug: string; name: string };

export function AnimalPickerBar({
  sections,
  className,
}: {
  sections: SectionLite[];
  className?: string;
}) {
  const { selectedSlug, select } = useAnimalPicker();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {sections.map((s) => {
        const Icon = SECTION_ICONS[s.slug];
        const active = selectedSlug === s.slug;
        return (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            onClick={() => select(s.slug, s.name)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:border-primary"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {s.name}
          </Link>
        );
      })}
    </div>
  );
}

/** هنگام بازدید از یک صفحهٔ دسته، انتخاب کاربر را برای کل سایت به‌خاطر می‌سپارد. */
export function AnimalPickerSync({ slug, name }: { slug: string; name: string }) {
  const { select } = useAnimalPicker();
  useEffect(() => {
    select(slug, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, name]);
  return null;
}

/** یک خط شخصی‌سازی‌شده بر اساس حیوان انتخابی کاربر؛ اگر هنوز انتخابی ثبت نشده، چیزی رندر نمی‌کند. */
export function AnimalGreetingLine({ className }: { className?: string }) {
  const { selectedName } = useAnimalPicker();
  if (!selectedName) return null;
  return (
    <p className={className}>
      چون گفتی <span className="font-bold text-primary">{selectedName}</span> داری، این‌ها رو برات مناسب‌تر چیدیم 🐾
    </p>
  );
}
