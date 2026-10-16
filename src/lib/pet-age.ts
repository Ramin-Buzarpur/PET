export function computeAgeLabel(pet: {
  birthDateValue?: string | null;
  birthPrecision?: string | null;
  approxAgeYears?: number | null;
  approxAgeMonths?: number | null;
  approxAgeAsOf?: Date | null;
}): string | null {
  if (pet.birthDateValue && pet.birthPrecision === "EXACT") {
    const parts = pet.birthDateValue.split("-").map(Number);
    if (parts[0] && parts[0] > 1000) {
      const birth = new Date(pet.birthDateValue);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--;
      if (years >= 0) return `${years.toLocaleString("fa-IR")} ساله`;
    }
  }

  if (pet.approxAgeYears || pet.approxAgeMonths) {
    const base = pet.approxAgeAsOf ?? new Date();
    const elapsedMonths = Math.floor((Date.now() - base.getTime()) / (30 * 24 * 60 * 60 * 1000));
    let months = (pet.approxAgeYears ?? 0) * 12 + (pet.approxAgeMonths ?? 0) + elapsedMonths;
    const years = Math.floor(months / 12);
    months = months % 12;
    if (years > 0) return `حدود ${years.toLocaleString("fa-IR")} سال و ${months.toLocaleString("fa-IR")} ماه`;
    return `حدود ${months.toLocaleString("fa-IR")} ماه`;
  }

  return null;
}
