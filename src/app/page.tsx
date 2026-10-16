import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PetHero } from "@/components/home/PetHero";
import { WaveDivider } from "@/components/home/WaveDivider";
import { ProductCard } from "@/components/shop/ProductCard";
import { CourseCard } from "@/components/courses/CourseCard";
import { Reveal } from "@/components/effects/Reveal";
import { SplitText } from "@/components/effects/SplitText";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { Parallax } from "@/components/effects/Parallax";

export default async function HomePage() {
  const [products, courses] = await Promise.all([
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
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <Reveal y={16}>
            <span className="mb-4 inline-block rounded-full bg-highlight/50 px-3.5 py-1.5 text-xs font-bold text-highlight-foreground">
              🐾 فروشگاه و آموزشگاه آنلاین حیوانات خانگی
            </span>
          </Reveal>

          <SplitText
            text={"هر چیزی که دوست کوچکت لازم دارد،\nیک‌جا در پت‌لند"}
            highlight="پت‌لند"
            className="mb-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl"
          />

          <Reveal delay={0.3}>
            <p className="mb-7 text-base leading-7 text-muted-foreground">
              محصولات باکیفیت، پکیج‌های آموزشی کامل و یک دستیار هوشمند که ۲۴ ساعته به سؤالاتت
              درباره نگهداری، تغذیه و سلامت حیوان خانگی‌ات پاسخ می‌دهد.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-wrap gap-3">
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
        </div>

        <Parallax amount={24}>
          <PetHero />
        </Parallax>
      </section>

      <WaveDivider />

      {/* ویژگی‌ها */}
      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                emoji: "🤖",
                title: "دستیار هوشمند ۲۴ ساعته",
                desc: "هر سؤالی درباره مشکلات، تغذیه و رفتار پت‌تان دارید، همین الان از دستیار هوشمند بپرسید.",
                tone: "primary" as const,
                rotate: "-1.5deg",
              },
              {
                emoji: "🎓",
                title: "پکیج‌های آموزشی کامل",
                desc: "دوره‌های متن، صدا و ویدیو به تفکیک نوع حیوان، از مراقبت روزانه تا پیشگیری از بیماری.",
                tone: "accent" as const,
                rotate: "1.2deg",
              },
              {
                emoji: "🚚",
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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">محصولات پرطرفدار 🔥</h2>
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

      {/* پکیج‌های آموزشی */}
      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">پکیج‌های آموزشی 📚</h2>
            <Link href="/courses" className="text-sm font-bold text-primary">
              مشاهده همه →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((pkg, i) => (
              <Reveal key={pkg.id} index={i}>
                <CourseCard pkg={pkg} />
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
  title,
  desc,
  tone,
  rotate,
}: {
  emoji: string;
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
      <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-2xl ${toneClass}`}>
        {emoji}
      </div>
      <h3 className="mb-2 font-bold">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{desc}</p>
    </SpotlightCard>
  );
}
