import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [productCount, courseCount, orderCount, messageCount, pendingOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.coursePackage.count(),
      prisma.order.count(),
      prisma.contactMessage.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">نمای کلی</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="محصولات" value={productCount} />
        <StatCard label="پکیج‌های آموزشی" value={courseCount} />
        <StatCard label="سفارش‌ها" value={orderCount} sub={`${pendingOrders} در انتظار پرداخت`} />
        <StatCard label="پیام‌های تماس" value={messageCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
