import Link from "next/link";
import { formatToman } from "@/lib/format";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

const speciesLabel: Record<string, string> = {
  DOG: "سگ",
  CAT: "گربه",
  BIRD: "پرنده",
  RABBIT: "خرگوش",
  OTHER: "سایر",
};

export function CourseCard({
  pkg,
}: {
  pkg: {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    price: number;
    species: string;
    chapters: { id: string }[];
  };
}) {
  return (
    <SpotlightCard>
      <Link
        href={`/courses/${pkg.slug}`}
        className="hover-lift group block overflow-hidden rounded-2xl border border-border bg-surface transition"
      >
        <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.coverImage ?? ""}
            alt={pkg.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <div className="mb-1 text-xs font-medium text-accent">
            {speciesLabel[pkg.species] ?? pkg.species} · {pkg.chapters.length} چپتر
          </div>
          <h3 className="mb-2 font-medium">{pkg.title}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{pkg.description}</p>
          <div className="font-bold text-primary">{formatToman(pkg.price)}</div>
        </div>
      </Link>
    </SpotlightCard>
  );
}
