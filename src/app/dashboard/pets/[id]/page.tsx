import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAgeLabel } from "@/lib/pet-age";
import { PetMembershipCard } from "@/components/pets/PetMembershipCard";
import { PetForm } from "@/components/pets/PetForm";
import { PetActions } from "@/components/pets/PetActions";
import { MeasurementManager } from "@/components/pets/MeasurementManager";
import { ShareManager } from "@/components/pets/ShareManager";

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      measurements: { orderBy: { measuredAt: "desc" } },
      cardShares: { where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!pet || pet.userId !== session!.user.id) notFound();

  const activeShare = pet.cardShares[0] ?? null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/dashboard/pets" className="mb-4 inline-block text-sm text-muted-foreground hover:text-primary">
        ← پت‌های من
      </Link>

      <div id="pet-card-exportable">
        <PetMembershipCard
          name={pet.name}
          species={pet.species}
          breed={pet.breed}
          photoUrl={pet.photoUrl}
          membershipCode={pet.membershipCode}
          joinedAt={pet.createdAt}
          ageLabel={computeAgeLabel(pet)}
        />
      </div>

      <div className="my-6 grid grid-cols-2 gap-3">
        <Link
          href={`/dashboard/pets/${pet.id}/journal`}
          className="hover-lift rounded-xl border border-border bg-surface p-4 text-center text-sm font-bold"
        >
          📓 دفتر پیشرفت خصوصی
        </Link>
        <Link
          href={`/dashboard/calendar?petId=${pet.id}`}
          className="hover-lift rounded-xl border border-border bg-surface p-4 text-center text-sm font-bold"
        >
          📅 تقویم مراقبت
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold">اشتراک‌گذاری کارت</h2>
        <ShareManager petId={pet.id} activeShare={activeShare} />
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold">اندازه‌گیری‌ها</h2>
        <MeasurementManager
          petId={pet.id}
          measurements={pet.measurements.map((m) => ({ ...m, measuredAt: m.measuredAt.toISOString() }))}
        />
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold">ویرایش مشخصات</h2>
        <PetForm
          petId={pet.id}
          initial={{
            name: pet.name ?? "",
            species: pet.species ?? "",
            speciesOther: pet.speciesOther ?? "",
            breed: pet.breed ?? "",
            gender: pet.gender,
            birthDateValue: pet.birthDateValue ?? "",
            birthCalendar: pet.birthCalendar ?? "JALALI",
            birthPrecision: pet.birthPrecision ?? "ESTIMATED",
            approxAgeYears: pet.approxAgeYears?.toString() ?? "",
            approxAgeMonths: pet.approxAgeMonths?.toString() ?? "",
            photoUrl: pet.photoUrl ?? "",
            illness: pet.illness ?? "",
            allergies: pet.allergies ?? "",
            medications: pet.medications ?? "",
            chatNotes: pet.chatNotes ?? "",
          }}
        />
      </div>

      <PetActions petId={pet.id} isArchived={pet.isArchived} />
    </div>
  );
}
