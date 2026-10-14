"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import { SECTION_ICONS } from "@/components/icons/AnimalIcons";
import type { getHelperSection, getNavSections } from "@/lib/catalog";

type Sections = Awaited<ReturnType<typeof getNavSections>>;
type HelperSection = Awaited<ReturnType<typeof getHelperSection>>;

const simpleLinks = [
  { href: "/courses", label: "آموزش‌ها" },
  { href: "/chat", label: "چت هوشمند" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-primary">
          <span className="text-2xl">🐾</span>
          پت‌لند
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" onMouseLeave={() => setOpenSection(null)}>
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.slug];
            const isOpen = openSection === section.slug;
            return (
              <div key={section.id} className="relative" onMouseEnter={() => setOpenSection(section.slug)}>
                <Link
                  href={`/${section.slug}`}
                  className="nav-underline flex items-center gap-1.5 py-2 text-sm font-medium text-foreground/85 transition hover:text-primary"
                >
                  {Icon && <Icon className="h-4 w-4 text-primary" />}
                  {section.name}
                </Link>

                {isOpen && (
                  <div className="absolute right-0 top-full z-50 w-64 rounded-2xl border border-border bg-surface p-3 shadow-xl">
                    <div className="grid gap-1">
                      {section.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/${section.slug}/${category.slug}`}
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

          <span className="h-5 w-px bg-border" />

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
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="منو"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border bg-surface px-4 py-3 lg:hidden">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.slug];
            const isOpen = openSection === section.slug;
            return (
              <div key={section.id}>
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.slug)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-surface-muted"
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    {section.name}
                  </span>
                  <span>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="mr-4 flex flex-col gap-1 border-r border-border pr-3">
                    {section.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/${section.slug}/${category.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-surface-muted"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="my-1 h-px bg-border" />

          {simpleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              {link.label}
            </Link>
          ))}

          {helperSection && (
            <Link
              href={`/${helperSection.slug}`}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-accent hover:bg-surface-muted"
            >
              {helperSection.name}
            </Link>
          )}

          {session?.user ? (
            <>
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-surface-muted"
              >
                پروفایل من
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-md px-2 py-2 text-right text-sm font-medium hover:bg-surface-muted"
              >
                خروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-surface-muted"
            >
              ورود / ثبت‌نام
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
