import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChapterProgressTracker } from "@/components/courses/ChapterProgressTracker";

export default async function ChapterLearnPage({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}) {
  const { slug, chapterId } = await params;
  const session = await auth();

  const pkg = await prisma.coursePackage.findUnique({
    where: { slug },
    include: { chapters: { orderBy: { order: "asc" } } },
  });
  if (!pkg) notFound();

  const chapterIndex = pkg.chapters.findIndex((c) => c.id === chapterId);
  if (chapterIndex === -1) notFound();
  const chapter = pkg.chapters[chapterIndex];

  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { userId_packageId: { userId: session.user.id, packageId: pkg.id } },
      })
    : null;

  if (!chapter.isFreePreview && !enrollment) {
    redirect(`/courses/${pkg.slug}`);
  }

  const prevChapter = pkg.chapters[chapterIndex - 1];
  const nextChapter = pkg.chapters[chapterIndex + 1];
  const progressPercent = Math.round(((chapterIndex + 1) / pkg.chapters.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {enrollment && (
        <ChapterProgressTracker packageId={pkg.id} progress={progressPercent} />
      )}

      <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
        <Link href={`/courses/${pkg.slug}`} className="hover:text-primary">
          ← بازگشت به پکیج {pkg.title}
        </Link>
        <span>
          چپتر {chapterIndex + 1} از {pkg.chapters.length}
        </span>
      </div>

      <h1 className="mb-4 text-2xl font-bold">{chapter.title}</h1>

      {chapter.videoUrl && (
        <div className="mb-5 overflow-hidden rounded-2xl bg-black">
          <video controls className="w-full" src={chapter.videoUrl} />
        </div>
      )}

      {chapter.audioUrl && (
        <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 text-sm font-medium">نسخه صوتی این چپتر</div>
          <audio controls className="w-full" src={chapter.audioUrl} />
        </div>
      )}

      <div className="mb-8 whitespace-pre-wrap rounded-2xl border border-border bg-surface p-6 leading-7">
        {chapter.textContent}
      </div>

      <div className="flex items-center justify-between">
        {prevChapter ? (
          <Link
            href={`/courses/${pkg.slug}/learn/${prevChapter.id}`}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary"
          >
            ← چپتر قبلی
          </Link>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <Link
            href={`/courses/${pkg.slug}/learn/${nextChapter.id}`}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            چپتر بعدی →
          </Link>
        ) : (
          <span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            پایان پکیج 🎉
          </span>
        )}
      </div>
    </div>
  );
}
