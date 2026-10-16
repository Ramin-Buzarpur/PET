import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/effects/Reveal";

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
        {products.map((product, i) => (
          <Reveal key={product.id} index={i}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">محصولی یافت نشد.</p>
      )}
    </div>
  );
}
