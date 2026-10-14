import { prisma } from "@/lib/prisma";
import { NewBrandForm } from "@/components/admin/NewBrandForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">برندها</h1>

      <div className="mb-8 max-w-sm">
        <NewBrandForm />
      </div>

      <div className="space-y-2">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <span>{brand.name}</span>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{brand._count.products} محصول</span>
              {brand._count.products === 0 && (
                <DeleteButton url={`/api/admin/brands/${brand.id}`} confirmText="این برند حذف شود؟" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
