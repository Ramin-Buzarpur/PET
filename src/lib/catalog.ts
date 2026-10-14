import { prisma } from "@/lib/prisma";

export async function getNavSections() {
  const sections = await prisma.animalSection.findMany({
    where: { isHelper: false },
    orderBy: { order: "asc" },
    include: {
      categories: {
        where: { products: { some: {} } },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
  return sections.filter((section) => section.categories.length > 0);
}

export async function getHelperSection() {
  const section = await prisma.animalSection.findFirst({
    where: { isHelper: true },
    include: {
      categories: {
        where: { products: { some: {} } },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
  if (!section || section.categories.length === 0) return null;
  return section;
}

export type NavSection = Awaited<ReturnType<typeof getNavSections>>[number];

export function minVariantPrice(variants: { price: number }[]): number {
  return Math.min(...variants.map((v) => v.price));
}

export function totalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}
