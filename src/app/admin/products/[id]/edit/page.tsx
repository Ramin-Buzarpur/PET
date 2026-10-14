import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { categories: true, variants: true },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ include: { section: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ویرایش محصول</h1>
      <div className="mb-10">
        <ProductForm
          brands={brands}
          categories={categories.map((c) => ({ id: c.id, name: c.name, sectionName: c.section.name }))}
          productId={product.id}
          initial={{
            title: product.title,
            slug: product.slug,
            description: product.description,
            images: product.images[0] ?? "",
            brandId: product.brandId ?? "",
            ageGroup: product.ageGroup ?? "",
            dogSize: product.dogSize ?? "",
            waterType: product.waterType ?? "",
            animalSubtype: product.animalSubtype ?? "",
            productType: product.productType ?? "",
            categoryIds: product.categories.map((c) => c.categoryId),
          }}
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold">تنوع‌ها</h2>
      <VariantManager productId={product.id} variants={product.variants} />
    </div>
  );
}
