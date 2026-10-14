import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";
import { minVariantPrice } from "@/lib/catalog";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">همه محصولات</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        برای فیلتر دقیق‌تر، از منوی بالا ابتدا نوع حیوان و سپس دسته را انتخاب کنید.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="hover-lift group overflow-hidden rounded-2xl border border-border bg-surface transition"
          >
            <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2 line-clamp-2 font-medium">{product.title}</h3>
              <div className="font-bold text-primary">{formatToman(minVariantPrice(product.variants))}</div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">محصولی یافت نشد.</p>
      )}
    </div>
  );
}
