import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";

const speciesLabel: Record<string, string> = {
  DOG: "سگ",
  CAT: "گربه",
  BIRD: "پرنده",
  RABBIT: "خرگوش",
  OTHER: "سایر",
};

export default async function CoursesPage() {
  const packages = await prisma.coursePackage.findMany({
    include: { chapters: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">پکیج‌های آموزشی</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        دوره‌های کامل متن، صدا و ویدیو برای نگهداری درست و حرفه‌ای از حیوان خانگی‌تان.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Link
            key={pkg.id}
            href={`/courses/${pkg.slug}`}
            className="hover-lift group overflow-hidden rounded-2xl border border-border bg-surface transition"
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
                {speciesLabel[pkg.species]} · {pkg.chapters.length} چپتر
              </div>
              <h3 className="mb-2 font-medium">{pkg.title}</h3>
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{pkg.description}</p>
              <div className="font-bold text-primary">{formatToman(pkg.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
