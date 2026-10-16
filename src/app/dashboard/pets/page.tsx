import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PetSpeciesIcon } from "@/components/icons/PetSpeciesIcon";
import { Reveal } from "@/components/effects/Reveal";

export default async function MyPetsPage() {
  const session = await auth();
  const pets = await prisma.pet.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
  });

  const active = pets.filter((p) => !p.isArchived);
  const archived = pets.filter((p) => p.isArchived);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">پت‌های من 🐾</h1>
        <Link
          href="/dashboard/pets/new"
          className="hover-lift rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          + افزودن پت
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="sticker-card border border-border bg-surface p-8 text-center">
          <p className="mb-4 text-muted-foreground">هنوز هیچ پتی اضافه نکرده‌اید.</p>
          <Link href="/dashboard/pets/new" className="font-bold text-primary">
            ساخت اولین کارت عضویت ←
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((pet, i) => (
            <Reveal key={pet.id} index={i} y={14}>
              <Link
                href={`/dashboard/pets/${pet.id}`}
                className="sticker-card flex items-center gap-4 border border-border bg-surface p-4"
                style={{ "--sticker-rotate": `${i % 2 === 0 ? -1 : 1}deg` } as React.CSSProperties}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted p-3 text-primary">
                  {pet.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pet.photoUrl} alt={pet.name ?? "پت"} className="h-full w-full object-cover" />
                  ) : (
                    <PetSpeciesIcon species={pet.species} className="h-full w-full" />
                  )}
                </div>
                <div>
                  <div className="font-bold">{pet.name || "فرزند عزیزت"}</div>
                  <div className="text-sm text-muted-foreground">
                    {pet.species ? speciesLabel(pet.species) : "نوع ثبت نشده"}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-bold text-muted-foreground">پت‌های بایگانی‌شده</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {archived.map((pet) => (
              <Link
                key={pet.id}
                href={`/dashboard/pets/${pet.id}`}
                className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted p-3 opacity-70"
              >
                <PetSpeciesIcon species={pet.species} className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{pet.name || "فرزند عزیزت"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function speciesLabel(species: string) {
  const labels: Record<string, string> = {
    DOG: "سگ",
    CAT: "گربه",
    BIRD: "پرنده",
    FISH: "ماهی",
    REPTILE: "خزنده",
    RODENT: "جوندگان",
    OTHER: "سایر",
  };
  return labels[species] ?? species;
}
