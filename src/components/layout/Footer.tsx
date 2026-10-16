import Link from "next/link";
import { CurrentYear } from "@/components/layout/CurrentYear";
import { WaveDivider } from "@/components/home/WaveDivider";
import { Reveal } from "@/components/effects/Reveal";

const quickLinks = [
  { href: "/products", label: "همه محصولات" },
  { href: "/courses", label: "پکیج‌های آموزشی" },
  { href: "/chat", label: "چت هوشمند" },
];

const companyLinks = [
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

const badges = [
  { emoji: "🔒", label: "پرداخت امن با زرین‌پال" },
  { emoji: "💬", label: "دستیار هوشمند ۲۴ ساعته" },
  { emoji: "🚚", label: "ارسال سریع به سراسر کشور" },
];

export function Footer() {
  return (
    <footer className="relative mt-20">
      <WaveDivider />

      <div className="bg-surface-muted">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 pb-8 sm:grid-cols-3">
          {badges.map((badge, i) => (
            <Reveal key={badge.label} index={i} y={14}>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <span className="text-xl">{badge.emoji}</span>
                {badge.label}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-extrabold text-primary">
              <span className="text-2xl">🐾</span>
              پت‌لند
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              فروشگاه و آموزشگاه آنلاین حیوانات خانگی؛ هر چیزی که برای نگهداری بهتر از دوست کوچکت
              لازم داری، یک‌جا.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">شرکت</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">تماس</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>تهران، ایران</li>
              <li dir="ltr" className="text-right">021-00000000</li>
              <li dir="ltr" className="text-right">info@petland.test</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          ساخته‌شده با ❤️ برای دوستان چارپا · © <CurrentYear /> پت‌لند
        </div>
      </div>
    </footer>
  );
}
