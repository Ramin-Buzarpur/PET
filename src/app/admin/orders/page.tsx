import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";

const statusLabel: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  FAILED: "ناموفق",
  CANCELLED: "لغو شده",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">سفارش‌ها</h1>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-right">
            <tr>
              <th className="p-3">کاربر</th>
              <th className="p-3">اقلام</th>
              <th className="p-3">مبلغ</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">کد پیگیری</th>
              <th className="p-3">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="p-3">{order.user.name}</td>
                <td className="p-3">{order.items.length}</td>
                <td className="p-3">{formatToman(order.totalAmount)}</td>
                <td className="p-3">{statusLabel[order.status]}</td>
                <td className="p-3 text-muted-foreground">{order.payment?.refId ?? "-"}</td>
                <td className="p-3 text-muted-foreground">
                  {order.createdAt.toLocaleDateString("fa-IR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
