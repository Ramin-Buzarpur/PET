"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import { useAnimalPicker } from "@/components/providers/AnimalPickerProvider";
import { SECTION_ICONS } from "@/components/icons/AnimalIcons";
import type { getHelperSection, getNavSections } from "@/lib/catalog";

type Sections = Awaited<ReturnType<typeof getNavSections>>;
type HelperSection = Awaited<ReturnType<typeof getHelperSection>>;

const simpleLinks = [
  { href: "/courses", label: "آموزش‌ها" },
  { href: "/chat", label: "چت هوشمند" },
  { href: "/stories", label: "داستان‌های پت" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export function Header({
  sections,
  helperSection,
}: {
  sections: Sections;
  helperSection: HelperSection;
}) {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const { selectedSlug, select } = useAnimalPicker();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-primary">
          <span className="text-2xl">🐾</span>
          پت‌لند
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {simpleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-underline py-2 text-sm font-medium text-foreground/85 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          {helperSection && (
            <Link
              href={`/${helperSection.slug}`}
              className="nav-underline py-2 text-sm font-medium text-accent transition hover:opacity-80"
            >
              {helperSection.name}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm font-medium transition hover:border-primary"
          >
            سبد خرید
            {totalItems > 0 && (
              <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          {session?.user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="rounded-full bg-surface-muted px-3 py-1.5 text-sm font-medium hover:text-primary"
              >
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:border-primary"
              >
                خروج
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground lg:inline-block"
            >
              ورود / ثبت‌نام
            </Link>
          )}

          <button
            className="rounded-md border border-border p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="منو"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ردیف انتخاب‌گر حیوان دائمی — دسکتاپ */}
      <nav className="hidden border-t border-border/60 bg-surface-muted/60 lg:block" onMouseLeave={() => setOpenSection(null)}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.slug];
            const isOpen = openSection === section.slug;
            const active = selectedSlug === section.slug;
            return (
              <div key={section.id} className="relative" onMouseEnter={() => setOpenSection(section.slug)}>
                <Link
                  href={`/${section.slug}`}
                  onClick={() => select(section.slug, section.name)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/75 hover:bg-surface hover:text-primary"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {section.name}
                </Link>

                {isOpen && (
                  <div className="absolute right-0 top-full z-50 w-64 rounded-2xl border border-border bg-surface p-3 shadow-xl">
                    <div className="grid gap-1">
                      {section.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/${section.slug}/${category.slug}`}
                          onClick={() => select(section.slug, section.name)}
                          className="rounded-lg px-3 py-2 text-sm hover:bg-surface-muted hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* پنل کشویی موبایل */}
      <div
        className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-lg font-extrabold text-primary"
          >
            <span className="text-2xl">🐾</span>
            پت‌لند
          </Link>
          <button
            className="rounded-md border border-border p-2"
            onClick={() => setMobileOpen(false)}
            aria-label="بستن منو"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-4 py-5">
          <div>
            <div className="mb-2 text-xs font-bold text-muted-foreground">دنبال چی می‌گردی؟</div>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const Icon = SECTION_ICONS[section.slug];
                const active = selectedSlug === section.slug;
                return (
                  <Link
                    key={section.id}
                    href={`/${section.slug}`}
                    onClick={() => {
                      select(section.slug, section.name);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface hover:border-primary"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {section.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-1">
            {simpleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}

            {helperSection && (
              <Link
                href={`/${helperSection.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-accent hover:bg-surface-muted"
              >
                {helperSection.name}
              </Link>
            )}
          </div>

          <div className="h-px bg-border" />

          {session?.user ? (
            <div className="flex flex-col gap-1">
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-surface-muted"
              >
                پروفایل من
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-md px-2 py-2.5 text-right text-sm font-medium hover:bg-surface-muted"
              >
                خروج
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground"
            >
              ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
