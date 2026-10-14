import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ include: { section: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">محصول جدید</h1>
      <ProductForm
        brands={brands}
        categories={categories.map((c) => ({ id: c.id, name: c.name, sectionName: c.section.name }))}
      />
    </div>
  );
}
