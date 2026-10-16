import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PetMembershipCard } from "@/components/pets/PetMembershipCard";

export default async function PublicPetCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const share = await prisma.petCardShare.findUnique({
    where: { token },
    include: { pet: true },
  });

  if (!share || !share.isActive || share.expiresAt < new Date()) notFound();

  const { pet } = share;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="mb-6 text-center text-sm text-muted-foreground">
        این کارت عضویت رسمی پت‌لند است 🐾
      </p>
      <PetMembershipCard
        name={pet.name}
        species={pet.species}
        breed={pet.breed}
        photoUrl={pet.photoUrl}
        membershipCode={pet.membershipCode}
        joinedAt={pet.createdAt}
        showPhoto={share.showPhoto}
        showSpecies={share.showSpecies}
        showBreed={share.showBreed}
      />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        پت‌لند · فروشگاه و آموزشگاه آنلاین حیوانات خانگی
      </p>
    </div>
  );
}
