import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/CourseCard";
import { Reveal } from "@/components/effects/Reveal";

export default async function CoursesPage() {
  const packages = await prisma.coursePackage.findMany({
    include: { chapters: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">پکیج‌های آموزشی</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        دوره‌های کامل متن، صدا و ویدیو برای نگهداری درست و حرفه‌ای از حیوان خانگی‌تان.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg, i) => (
          <Reveal key={pkg.id} index={i}>
            <CourseCard pkg={pkg} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
