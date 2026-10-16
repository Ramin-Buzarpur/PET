import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StorySubmitForm } from "@/components/stories/StorySubmitForm";
import { ReportButton } from "@/components/stories/ReportButton";
import { Reveal } from "@/components/effects/Reveal";

export default async function StoriesPage() {
  const session = await auth();
  const stories = await prisma.petStory.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, body: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold">داستان‌های پت‌ها 🐾</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        خاطره‌ها و داستان‌های ناشناس صاحبان پت از پت‌لند؛ بدون نام و مشخصات.
      </p>

      {session?.user ? (
        <StorySubmitForm />
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          برای نوشتن داستان خودت{" "}
          <Link href="/login?callbackUrl=/stories" className="font-bold text-primary">
            وارد شو
          </Link>
          .
        </p>
      )}

      <div className="space-y-4">
        {stories.map((story, i) => (
          <Reveal key={story.id} index={i} y={18}>
            <div
              className="sticker-card border border-border bg-surface p-5"
              style={{ "--sticker-rotate": `${i % 2 === 0 ? -0.6 : 0.6}deg` } as React.CSSProperties}
            >
              {story.title && <h2 className="mb-1.5 font-bold">{story.title}</h2>}
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">{story.body}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {story.createdAt.toLocaleDateString("fa-IR")}
                </span>
                {session?.user && <ReportButton storyId={story.id} />}
              </div>
            </div>
          </Reveal>
        ))}

        {stories.length === 0 && (
          <p className="text-sm text-muted-foreground">هنوز داستانی منتشر نشده است.</p>
        )}
      </div>
    </div>
  );
}
