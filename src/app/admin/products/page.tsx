import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";
import { minVariantPrice, totalStock } from "@/lib/catalog";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { categories: { include: { category: true } }, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">محصولات</h1>
        <Link href="/admin/products/new" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          + محصول جدید
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-right">
            <tr>
              <th className="p-3">عنوان</th>
              <th className="p-3">دسته‌ها</th>
              <th className="p-3">قیمت از</th>
              <th className="p-3">موجودی کل</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-muted-foreground">
                  {p.categories.map((c) => c.category.name).join("، ")}
                </td>
                <td className="p-3">{formatToman(minVariantPrice(p.variants))}</td>
                <td className="p-3">{totalStock(p.variants)}</td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary">
                      ویرایش
                    </Link>
                    <DeleteButton url={`/api/admin/products/${p.id}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
