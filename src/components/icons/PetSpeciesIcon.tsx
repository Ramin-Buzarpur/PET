import {
  CatIcon,
  DogIcon,
  FeatherIcon,
  FishIcon,
  TurtleIcon,
  HamsterIcon,
  PawIcon,
} from "@/components/icons/AnimalIcons";

const SPECIES_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  DOG: DogIcon,
  CAT: CatIcon,
  BIRD: FeatherIcon,
  FISH: FishIcon,
  REPTILE: TurtleIcon,
  RODENT: HamsterIcon,
  OTHER: PawIcon,
};

export function PetSpeciesIcon({
  species,
  className,
}: {
  species?: string | null;
  className?: string;
}) {
  const Icon = SPECIES_ICONS[species ?? "OTHER"] ?? PawIcon;
  return <Icon className={className} />;
}
