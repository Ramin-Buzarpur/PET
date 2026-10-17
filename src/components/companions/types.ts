export type CompanionSpecies = "cat" | "dog";

export type Companion = {
  id: string;
  species: CompanionSpecies;
  name: string;
  createdAt: number;
};

export type CompanionSettings = {
  enabled: boolean;
  myCompanionId: string | null;
  companions: Companion[];
  shakePermissionAsked: boolean;
};

export type CompanionState =
  | "idle"
  | "wander"
  | "chase"
  | "play"
  | "fight"
  | "petted-happy"
  | "petted-annoyed"
  | "waving"
  | "shaken";

export const MAX_COMPANIONS = 6;
