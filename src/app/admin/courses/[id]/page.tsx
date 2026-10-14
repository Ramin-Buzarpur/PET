import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoursePackageForm } from "@/components/admin/CoursePackageForm";
import { ChapterManager } from "@/components/admin/ChapterManager";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await prisma.coursePackage.findUnique({
    where: { id },
    include: { chapters: { orderBy: { order: "asc" } } },
  });
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{pkg.title}</h1>

      <h2 className="mb-3 text-lg font-semibold">اطلاعات پکیج</h2>
      <div className="mb-10">
        <CoursePackageForm
          packageId={pkg.id}
          initial={{
            title: pkg.title,
            slug: pkg.slug,
            description: pkg.description,
            price: pkg.price,
            coverImage: pkg.coverImage ?? "",
            species: pkg.species,
          }}
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold">چپترها</h2>
      <ChapterManager packageId={pkg.id} chapters={pkg.chapters} />
    </div>
  );
}
