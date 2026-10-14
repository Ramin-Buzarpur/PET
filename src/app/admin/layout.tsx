import Link from "next/link";

const links = [
  { href: "/admin", label: "نمای کلی" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/brands", label: "برندها" },
  { href: "/admin/courses", label: "پکیج‌های آموزشی" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/messages", label: "پیام‌های تماس" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      <aside className="w-48 shrink-0 space-y-1">
        <div className="mb-3 px-2 text-sm font-bold text-primary">پنل مدیریت</div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-muted"
          >
            {link.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
