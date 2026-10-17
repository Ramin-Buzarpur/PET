import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";
import { minVariantPrice, totalStock } from "@/lib/catalog";
import { CategoryFilters } from "@/components/shop/CategoryFilters";
import { ActiveFiltersBar } from "@/components/shop/ActiveFiltersBar";
import { ProductTypeTabs } from "@/components/shop/ProductTypeTabs";
import { AnimalPickerSync } from "@/components/layout/AnimalPickerBar";
import { Reveal } from "@/components/effects/Reveal";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

type SearchParams = Record<string, string | undefined>;

export default async function CategoryListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ sectionSlug: string; categorySlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { sectionSlug, categorySlug } = await params;
  const sp = await searchParams;

  const category = await prisma.category.findFirst({
    where: { slug: categorySlug, section: { slug: sectionSlug } },
    include: { section: true },
  });
  if (!category) notFound();

  const productLinks = await prisma.productCategory.findMany({
    where: { categoryId: category.id },
    include: { product: { include: { brand: true, variants: true } } },
  });
  const allProducts = productLinks.map((link) => link.product);

  // --- گزینه‌های فیلتر واقعی موجود در این دسته ---
  const brandMap = new Map<string, string>();
  const ages = new Set<string>();
  const dogSizes = new Set<string>();
  const waterTypes = new Set<string>();
  const animalTypes = new Set<string>();
  const sizes = new Set<string>();
  const colors = new Set<string>();
  const weights = new Set<string>();
  let priceMin = Infinity;
  let priceMax = 0;

  for (const product of allProducts) {
    if (product.brand) brandMap.set(product.brand.slug, product.brand.name);
    if (product.ageGroup) ages.add(product.ageGroup);
    if (product.dogSize) dogSizes.add(product.dogSize);
    if (product.waterType) waterTypes.add(product.waterType);
    if (product.animalSubtype) animalTypes.add(product.animalSubtype);
    for (const variant of product.variants) {
      if (variant.size) sizes.add(variant.size);
      if (variant.color) colors.add(variant.color);
      if (variant.packageWeight) weights.add(variant.packageWeight);
      priceMin = Math.min(priceMin, variant.price);
      priceMax = Math.max(priceMax, variant.price);
    }
  }
  if (!Number.isFinite(priceMin)) priceMin = 0;

  // --- اعمال فیلترها ---
  const selectedBrands = (sp.brand ?? "").split(",").filter(Boolean);
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;

  let filtered = allProducts.filter((product) => {
    if (sp.type && product.productType !== sp.type) return false;
    if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand.slug))) return false;
    if (sp.stock === "1" && totalStock(product.variants) === 0) return false;
    if (sp.age && product.ageGroup !== sp.age) return false;
    if (sp.dogSize && product.dogSize !== sp.dogSize) return false;
    if (sp.waterType && product.waterType !== sp.waterType) return false;
    if (sp.animalType && product.animalSubtype !== sp.animalType) return false;

    if (min !== undefined || max !== undefined) {
      const inRange = product.variants.some(
        (v) => (min === undefined || v.price >= min) && (max === undefined || v.price <= max)
      );
      if (!inRange) return false;
    }

    // ترکیب واقعی سایز+رنگ: باید روی یک تنوع هم‌زمان برقرار باشد
    if (sp.size || sp.color) {
      const matches = product.variants.some(
        (v) => (!sp.size || v.size === sp.size) && (!sp.color || v.color === sp.color)
      );
      if (!matches) return false;
    }

    if (sp.weight) {
      const matches = product.variants.some((v) => v.packageWeight === sp.weight);
      if (!matches) return false;
    }

    return true;
  });

  const sort = sp.sort ?? "relevant";
  if (sort === "cheap") {
    filtered = [...filtered].sort((a, b) => minVariantPrice(a.variants) - minVariantPrice(b.variants));
  } else if (sort === "expensive") {
    filtered = [...filtered].sort((a, b) => minVariantPrice(b.variants) - minVariantPrice(a.variants));
  } else if (sort === "new") {
    filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const basePath = `/${sectionSlug}/${categorySlug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AnimalPickerSync slug={sectionSlug} name={category.section.name} />
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href={`/${sectionSlug}`} className="hover:text-primary">
          {category.section.name}
        </Link>{" "}
        / {category.name}
      </div>
      <h1 className="mb-6 text-2xl font-extrabold">{category.name}</h1>

      {category.productTypes.length > 0 && (
        <ProductTypeTabs basePath={basePath} types={category.productTypes} />
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <CategoryFilters
          basePath={basePath}
          options={{
            brands: Array.from(brandMap.entries()).map(([slug, name]) => ({ slug, name })),
            ages: Array.from(ages),
            dogSizes: Array.from(dogSizes),
            waterTypes: Array.from(waterTypes),
            animalTypes: Array.from(animalTypes),
            sizes: Array.from(sizes),
            colors: Array.from(colors),
            weights: Array.from(weights),
            availableFilters: category.availableFilters,
            productTypes: category.productTypes,
            priceBounds: { min: priceMin, max: priceMax },
          }}
        />

        <div className="flex-1">
          <ActiveFiltersBar basePath={basePath} />

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              با این فیلترها نتیجه‌ای پیدا نشد. فیلترها را تغییر دهید یا پاک کنید.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, i) => (
                <Reveal key={product.id} index={i}>
                  <SpotlightCard className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <Link href={`/products/${product.slug}`} className="hover-lift group block">
                      <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        {product.brand && (
                          <div className="mb-1 text-xs text-muted-foreground">{product.brand.name}</div>
                        )}
                        <h3 className="mb-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
                        <div className="font-bold text-primary">
                          {formatToman(minVariantPrice(product.variants))}
                        </div>
                      </div>
                    </Link>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
