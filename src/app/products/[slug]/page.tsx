import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

const ageLabel: Record<string, string> = { BABY: "بچه/توله", ADULT: "بالغ", SENIOR: "مسن" };
const dogSizeLabel: Record<string, string> = { SMALL: "کوچک", MEDIUM: "متوسط", LARGE: "بزرگ" };
const waterLabel: Record<string, string> = { FRESH: "آب شیرین", SALT: "آب شور" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      variants: true,
      categories: { include: { category: { include: { section: true } } } },
    },
  });

  if (!product) notFound();

  const specs: { label: string; value: string }[] = [];
  if (product.brand) specs.push({ label: "برند", value: product.brand.name });
  if (product.ageGroup) specs.push({ label: "گروه سنی", value: ageLabel[product.ageGroup] });
  if (product.dogSize) specs.push({ label: "جثه سگ", value: dogSizeLabel[product.dogSize] });
  if (product.waterType) specs.push({ label: "نوع آب", value: waterLabel[product.waterType] });
  if (product.animalSubtype) specs.push({ label: "گونه", value: product.animalSubtype });
  if (product.productType) specs.push({ label: "نوع محصول", value: product.productType });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {product.categories.map(({ category }) => (
          <Link
            key={category.id}
            href={`/${category.section.slug}/${category.slug}`}
            className="rounded-full bg-surface-muted px-3 py-1 hover:text-primary"
          >
            {category.section.name} · {category.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h1 className="mb-5 text-2xl font-bold">{product.title}</h1>
          <p className="mb-6 leading-7 text-foreground/90">{product.description}</p>

          <AddToCartButton
            productTitle={product.title}
            image={product.images[0]}
            variants={product.variants}
          />
        </div>
      </div>

      {specs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">مشخصات محصول</h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            {specs.map((spec, i) => (
              <div
                key={spec.label}
                className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? "bg-surface" : "bg-surface-muted"}`}
              >
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
