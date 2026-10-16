import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarApp } from "@/components/pets/CalendarApp";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ petId?: string }>;
}) {
  const session = await auth();
  const { petId } = await searchParams;

  const pets = await prisma.pet.findMany({
    where: { userId: session!.user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">تقویم مراقبت 📅</h1>
      <CalendarApp pets={pets} initialPetId={petId} />
    </div>
  );
}
