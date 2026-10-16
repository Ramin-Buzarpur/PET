import { PetSpeciesIcon } from "@/components/icons/PetSpeciesIcon";

const speciesLabel: Record<string, string> = {
  DOG: "سگ",
  CAT: "گربه",
  BIRD: "پرنده",
  FISH: "ماهی",
  REPTILE: "خزنده",
  RODENT: "جوندگان",
  OTHER: "سایر",
};

export function PetMembershipCard({
  name,
  species,
  breed,
  photoUrl,
  membershipCode,
  joinedAt,
  ageLabel,
  showPhoto = true,
  showSpecies = true,
  showBreed = true,
}: {
  name?: string | null;
  species?: string | null;
  breed?: string | null;
  photoUrl?: string | null;
  membershipCode: string;
  joinedAt: Date;
  ageLabel?: string | null;
  showPhoto?: boolean;
  showSpecies?: boolean;
  showBreed?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-primary/30 p-6"
      style={{ backgroundColor: "#fdf0e8" }}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-primary">
        <span className="text-lg">🐾</span>
        پت‌لند · کارت عضویت
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-surface p-3.5 text-primary shadow">
          {showPhoto && photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name ?? "پت"} className="h-full w-full object-cover" />
          ) : (
            <PetSpeciesIcon species={species} className="h-full w-full" />
          )}
        </div>
        <div>
          <div className="text-xl font-extrabold">{name || "عضو کوچک خانواده"}</div>
          {showSpecies && species && (
            <div className="text-sm text-muted-foreground">
              {speciesLabel[species] ?? species}
              {showBreed && breed ? ` · ${breed}` : ""}
            </div>
          )}
          {ageLabel && <div className="text-xs text-muted-foreground">{ageLabel}</div>}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
        <span>شماره عضویت: {membershipCode.slice(-8).toUpperCase()}</span>
        <span>عضویت از {joinedAt.toLocaleDateString("fa-IR")}</span>
      </div>
    </div>
  );
}
