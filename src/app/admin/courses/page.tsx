import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminCoursesPage() {
  const packages = await prisma.coursePackage.findMany({
    include: { chapters: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">پکیج‌های آموزشی</h1>
        <Link href="/admin/courses/new" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          + پکیج جدید
        </Link>
      </div>

      <div className="space-y-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <div>
              <div className="font-medium">{pkg.title}</div>
              <div className="text-sm text-muted-foreground">
                {pkg.chapters.length} چپتر · {formatToman(pkg.price)}
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/courses/${pkg.id}`} className="text-primary">
                مدیریت چپترها
              </Link>
              <DeleteButton url={`/api/admin/courses/${pkg.id}`} confirmText="این پکیج و تمام چپترهایش حذف شود؟" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
