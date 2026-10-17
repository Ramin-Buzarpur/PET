import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SECTION_ICONS } from "@/components/icons/AnimalIcons";
import { AnimalPickerSync } from "@/components/layout/AnimalPickerBar";
import { Reveal } from "@/components/effects/Reveal";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ sectionSlug: string }>;
}) {
  const { sectionSlug } = await params;

  const section = await prisma.animalSection.findUnique({
    where: { slug: sectionSlug },
    include: {
      categories: {
        where: { products: { some: {} } },
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  if (!section || section.categories.length === 0) notFound();

  const Icon = SECTION_ICONS[section.slug];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AnimalPickerSync slug={section.slug} name={section.name} />
      <div className="mb-8 flex items-center gap-3">
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon className="h-7 w-7" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold">{section.name}</h1>
          <p className="text-sm text-muted-foreground">دسته‌ها را انتخاب کنید تا کالاها را ببینید.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.categories.map((category, i) => (
          <Reveal key={category.id} index={i}>
            <Link
              href={`/${section.slug}/${category.slug}`}
              className="hover-lift blob-2 flex items-center justify-between border border-border bg-surface px-6 py-5 transition hover:border-primary"
            >
              <span className="font-medium">{category.name}</span>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-muted-foreground">
                {category._count.products} کالا
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
