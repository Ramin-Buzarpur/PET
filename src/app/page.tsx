import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";
import { getNavSections } from "@/lib/catalog";
import { PetHero } from "@/components/home/PetHero";
import { WaveDivider } from "@/components/home/WaveDivider";
import { Marquee } from "@/components/home/Marquee";
import { FieldNoteBadge } from "@/components/home/FieldNoteBadge";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/effects/Reveal";
import { SplitText } from "@/components/effects/SplitText";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { Parallax } from "@/components/effects/Parallax";
import { AnimalPickerBar, AnimalGreetingLine } from "@/components/layout/AnimalPickerBar";

const trustPhrases = [
  "پرداخت امن",
  "ارسال سریع به سراسر کشور",
  "دستیار هوشمند ۲۴ ساعته",
  "پکیج‌های آموزشی تخصصی",
  "پشتیبانی واقعی و انسانی",
];

export default async function HomePage() {
  const [products, courses, sections] = await Promise.all([
    prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { variants: true },
    }),
    prisma.coursePackage.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      include: { chapters: true },
    }),
    getNavSections(),
  ]);

  const sectionsLite = sections.map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
        <div>
          <Reveal y={16}>
            <span className="mb-4 inline-block rounded-full bg-highlight/50 px-3.5 py-1.5 text-xs font-bold text-highlight-foreground">
              🐾 فروشگاه و آموزشگاه آنلاین حیوانات خانگی
            </span>
          </Reveal>

          <SplitText
            text={"خانه‌ای گرم\nبرای یک پیوند واقعی"}
            highlight="واقعی"
            className="mb-5 text-4xl font-black leading-[1.15] tracking-tight md:text-6xl"
          />

          <Reveal delay={0.3}>
            <p className="mb-6 max-w-md text-base leading-7 text-muted-foreground">
              محصولات باکیفیت، پکیج‌های آموزشی کامل و یک دستیار هوشمند که ۲۴ ساعته به سؤالاتت
              درباره نگهداری، تغذیه و سلامت حیوان خانگی‌ات پاسخ می‌دهد.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mb-7 flex flex-wrap gap-3">
              <MagneticButton>
                <Link
                  href="/products"
                  className="hover-lift rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                >
                  بگرد و پیدا کن 🛍️
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/courses"
                  className="hover-lift rounded-full border border-border bg-surface px-6 py-3 text-sm font-bold hover:border-primary"
                >
                  یاد بگیر و مراقبت کن 🎓
                </Link>
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div>
              <div className="mb-2 text-xs font-bold text-muted-foreground">دوست کوچکت چیه؟</div>
              <AnimalPickerBar sections={sectionsLite} />
            </div>
          </Reveal>
        </div>

        <Parallax amount={24}>
          <div className="relative mx-auto max-w-sm rotate-2 rounded-[2rem] border-4 border-surface bg-surface p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[1.5rem] bg-surface-muted">
              <PetHero />
            </div>
            <FieldNoteBadge rotate="-6deg" className="absolute -left-4 -top-4 bg-surface px-3 py-2 text-sm shadow-lg">
              💛 عضو خانواده
            </FieldNoteBadge>
          </div>
        </Parallax>
      </section>

      <Marquee items={trustPhrases} className="border-y border-border bg-surface-muted/60" />

      <WaveDivider />

      {/* ویژگی‌ها */}
      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                emoji: "🤖",
                tag: "۲۴ ساعته",
                title: "دستیار هوشمند ۲۴ ساعته",
                desc: "هر سؤالی درباره مشکلات، تغذیه و رفتار پت‌تان دارید، همین الان از دستیار هوشمند بپرسید.",
                tone: "primary" as const,
                rotate: "-1.5deg",
              },
              {
                emoji: "🎓",
                tag: "آموزش کامل",
                title: "پکیج‌های آموزشی کامل",
                desc: "دوره‌های متن، صدا و ویدیو به تفکیک نوع حیوان، از مراقبت روزانه تا پیشگیری از بیماری.",
                tone: "accent" as const,
                rotate: "1.2deg",
              },
              {
                emoji: "🚚",
                tag: "ارسال سریع",
                title: "محصولات باکیفیت",
                desc: "غذا، اسباب‌بازی و اکسسوری منتخب برای راحتی و سلامت حیوان خانگی شما.",
                tone: "highlight" as const,
                rotate: "-0.8deg",
              },
            ].map((feature, i) => (
              <Reveal key={feature.title} index={i}>
                <FeatureCard {...feature} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* محصولات ویژه */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold">محصولات پرطرفدار 🔥</h2>
            <AnimalGreetingLine className="mt-1 text-sm text-muted-foreground" />
          </div>
          <Link href="/products" className="text-sm font-bold text-primary">
            مشاهده همه →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {products.map((product, i) => (
            <Reveal key={product.id} index={i}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      {/* پکیج‌های آموزشی — چیدمان ادیتوریال */}
      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">پکیج‌های آموزشی 📚</h2>
            <Link href="/courses" className="text-sm font-bold text-primary">
              مشاهده همه →
            </Link>
          </div>
          <div className="grid gap-6">
            {courses.map((pkg, i) => (
              <Reveal key={pkg.id} index={i}>
                <Link
                  href={`/courses/${pkg.slug}`}
                  className="hover-lift group grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2"
                >
                  <div
                    className={`aspect-[4/3] overflow-hidden bg-surface-muted md:aspect-auto ${
                      i % 2 === 1 ? "md:order-2" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pkg.coverImage ?? ""}
                      alt={pkg.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <div className="mb-2 text-xs font-bold text-accent">{pkg.chapters.length} چپتر</div>
                    <h3 className="mb-3 text-xl font-bold">{pkg.title}</h3>
                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {pkg.description}
                    </p>
                    <div className="text-lg font-extrabold text-primary">{formatToman(pkg.price)}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA چت هوشمند */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal scale={0.96}>
          <div className="blob-1 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-highlight px-8 py-12 text-center text-primary-foreground md:text-right">
            <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-extrabold">سؤالی درباره پت‌تان داری؟ 🐾</h2>
                <p className="text-sm opacity-90">
                  همین الان با دستیار هوشمند پت‌لند چت کن و جواب بگیر؛ کاملاً رایگان و بدون معطلی.
                </p>
              </div>
              <MagneticButton>
                <Link
                  href="/chat"
                  className="hover-lift whitespace-nowrap rounded-full bg-white/95 px-6 py-3 text-sm font-bold text-primary backdrop-blur"
                >
                  شروع گفتگو 💬
                </Link>
              </MagneticButton>
            </div>
            <span className="pointer-events-none absolute -left-4 -top-4 text-6xl opacity-20">🐾</span>
            <span className="pointer-events-none absolute -right-2 bottom-0 text-5xl opacity-20">🐾</span>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function FeatureCard({
  emoji,
  tag,
  title,
  desc,
  tone,
  rotate,
}: {
  emoji: string;
  tag: string;
  title: string;
  desc: string;
  tone: "primary" | "accent" | "highlight";
  rotate: string;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    highlight: "bg-highlight/40 text-highlight-foreground",
  }[tone];

  return (
    <SpotlightCard
      className="sticker-card border border-border bg-surface p-6"
      style={{ "--sticker-rotate": rotate } as React.CSSProperties}
    >
      <FieldNoteBadge rotate="-4deg" className={`mb-4 ${toneClass}`}>
        <span className="text-base">{emoji}</span>
        {tag}
      </FieldNoteBadge>
      <h3 className="mb-2 font-bold">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{desc}</p>
    </SpotlightCard>
  );
}
