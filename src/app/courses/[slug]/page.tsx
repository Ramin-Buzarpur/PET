import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatToman } from "@/lib/format";
import { BuyCourseButton } from "@/components/courses/BuyCourseButton";
import { CertificateSection } from "@/components/courses/CertificateSection";
import { Reveal } from "@/components/effects/Reveal";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const pkg = await prisma.coursePackage.findUnique({
    where: { slug },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!pkg) notFound();

  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { userId_packageId: { userId: session.user.id, packageId: pkg.id } },
      })
    : null;

  const pets = session?.user
    ? await prisma.pet.findMany({
        where: { userId: session.user.id, isArchived: false },
        select: { id: true, name: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Reveal y={16} scale={0.98}>
        <div className="mb-8 overflow-hidden rounded-2xl bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pkg.coverImage ?? ""} alt={pkg.title} className="h-64 w-full object-cover" />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <h1 className="mb-3 text-2xl font-bold">{pkg.title}</h1>
        <p className="mb-6 leading-7 text-foreground/90">{pkg.description}</p>
      </Reveal>

      {enrollment?.progress === 100 && (
        <CertificateSection enrollmentId={enrollment.id} courseTitle={pkg.title} pets={pets} />
      )}

      <div className="mb-8 rounded-2xl border border-border bg-surface p-5">
        {enrollment ? (
          <Link
            href={`/courses/${pkg.slug}/learn/${pkg.chapters[0]?.id}`}
            className="block rounded-full bg-accent py-3 text-center text-sm font-semibold text-accent-foreground"
          >
            ادامه یادگیری ({enrollment.progress}٪ پیشرفت)
          </Link>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">قیمت کامل پکیج</span>
              <span className="text-xl font-bold text-primary">{formatToman(pkg.price)}</span>
            </div>
            <BuyCourseButton packageId={pkg.id} />
          </>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold">فهرست چپترها</h2>
      <div className="space-y-2">
        {pkg.chapters.map((chapter, idx) => {
          const unlocked = chapter.isFreePreview || !!enrollment;
          const content = (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-sm font-medium">
                  {idx + 1}
                </span>
                <span className={unlocked ? "" : "text-muted-foreground"}>{chapter.title}</span>
              </div>
              {chapter.isFreePreview && (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                  پیش‌نمایش رایگان
                </span>
              )}
              {!unlocked && <span className="text-muted-foreground">🔒</span>}
            </div>
          );

          return (
            <Reveal key={chapter.id} index={idx} y={10}>
              {unlocked ? (
                <Link href={`/courses/${pkg.slug}/learn/${chapter.id}`}>{content}</Link>
              ) : (
                <div>{content}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
