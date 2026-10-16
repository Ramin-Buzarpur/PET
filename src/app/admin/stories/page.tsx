import { prisma } from "@/lib/prisma";
import { StoryModeration } from "@/components/admin/StoryModeration";

export default async function AdminStoriesPage() {
  const stories = await prisma.petStory.findMany({
    include: { reports: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">داستان‌های پت</h1>
      <StoryModeration
        stories={stories.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
          reports: s.reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        }))}
      />
    </div>
  );
}
