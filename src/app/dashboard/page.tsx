import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatToman } from "@/lib/format";
import { computeAndDispatchForUser } from "@/lib/notifications";
import { PetSpeciesIcon } from "@/components/icons/PetSpeciesIcon";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  await computeAndDispatchForUser(userId);

  const [orders, enrollments, pets, panelNotifications] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      include: { coursePackage: true },
    }),
    prisma.pet.findMany({ where: { userId, isArchived: false }, orderBy: { createdAt: "asc" }, take: 4 }),
    prisma.notificationLog.findMany({
      where: { userId, channel: "PANEL" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">سلام {session!.user.name} 👋</h1>
          <p className="text-sm text-muted-foreground">پیشخان حساب کاربری شما</p>
        </div>
        <Link href="/dashboard/settings" className="text-sm font-medium text-muted-foreground hover:text-primary">
          ⚙️ تنظیمات
        </Link>
      </div>

      {panelNotifications.length > 0 && (
        <section className="mb-8 space-y-2">
          {panelNotifications.map((n) => (
            <div key={n.id} className="sticker-card border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
              {n.message}
            </div>
          ))}
        </section>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">پت‌های من</h2>
          <Link href="/dashboard/pets" className="text-sm font-bold text-primary">
            مدیریت پت‌ها →
          </Link>
        </div>
        {pets.length === 0 ? (
          <Link
            href="/dashboard/pets/new"
            className="block rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            + ساخت اولین کارت عضویت پت
          </Link>
        ) : (
          <div className="flex flex-wrap gap-3">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/dashboard/pets/${pet.id}`}
                className="hover-lift flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm"
              >
                <PetSpeciesIcon species={pet.species} className="h-5 w-5 text-primary" />
                {pet.name || "فرزند عزیزت"}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">پکیج‌های آموزشی من</h2>
        {enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            هنوز در هیچ پکیج آموزشی ثبت‌نام نکرده‌اید.{" "}
            <Link href="/courses" className="text-primary">
              مشاهده پکیج‌ها
            </Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enrollments.map((e) => (
              <Link
                key={e.id}
                href={`/courses/${e.coursePackage.slug}`}
                className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary"
              >
                <div className="font-medium">{e.coursePackage.title}</div>
                <div className="mt-2 h-2 w-full rounded-full bg-surface-muted">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{e.progress}% پیشرفت</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">سفارش‌های من</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">سفارش #{order.id.slice(-6)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {order.items.length} قلم کالا · {formatToman(order.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  const labels: Record<string, string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت‌شده",
    FAILED: "ناموفق",
    CANCELLED: "لغو شده",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}
