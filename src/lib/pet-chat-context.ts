import { prisma } from "@/lib/prisma";
import { computeAgeLabel } from "@/lib/pet-age";

const speciesLabel: Record<string, string> = {
  DOG: "سگ",
  CAT: "گربه",
  BIRD: "پرنده",
  FISH: "ماهی",
  REPTILE: "خزنده",
  RODENT: "جوندگان",
  OTHER: "سایر",
};

/**
 * فقط فیلدهای صریحاً مجاز طبق سند را برمی‌گرداند. عکس، دفتر پیشرفت، تقویم،
 * شماره تماس، نشانی، شناسه حساب/عضویت و پرونده پت‌های دیگر هرگز اینجا نیستند.
 */
export async function buildPetContext(petId: string, userId: string): Promise<string | null> {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: { measurements: { orderBy: { measuredAt: "desc" } } },
  });
  if (!pet || pet.userId !== userId) return null;

  const lines: string[] = [`نام: ${pet.name || "ثبت نشده"}`];
  if (pet.species) lines.push(`نوع: ${speciesLabel[pet.species] ?? pet.speciesOther ?? pet.species}`);
  if (pet.breed) lines.push(`نژاد: ${pet.breed}`);
  lines.push(`جنسیت: ${pet.gender === "MALE" ? "نر" : pet.gender === "FEMALE" ? "ماده" : "نامشخص"}`);

  const age = computeAgeLabel(pet);
  if (age) lines.push(`سن تقریبی: ${age}`);
  if (pet.birthPrecision === "EXACT") lines.push("(تاریخ تولد دقیق ثبت شده است)");

  const lastWeight = pet.measurements.find((m) => m.type === "WEIGHT");
  if (lastWeight) {
    lines.push(
      `آخرین وزن: ${lastWeight.value} ${lastWeight.unit} (ثبت‌شده در ${lastWeight.measuredAt.toLocaleDateString("fa-IR")})`
    );
  }
  const lastHeight = pet.measurements.find((m) => m.type === "HEIGHT");
  if (lastHeight) {
    lines.push(
      `آخرین قد: ${lastHeight.value} ${lastHeight.unit} (ثبت‌شده در ${lastHeight.measuredAt.toLocaleDateString("fa-IR")})`
    );
  }

  if (pet.illness) lines.push(`بیماری/سوابق (به گفتهٔ صاحب پت): ${pet.illness}`);
  if (pet.allergies) lines.push(`حساسیت‌ها (به گفتهٔ صاحب پت): ${pet.allergies}`);
  if (pet.medications) lines.push(`داروهای فعلی (به گفتهٔ صاحب پت): ${pet.medications}`);
  if (pet.chatNotes) lines.push(`یادداشت آزاد صاحب پت: ${pet.chatNotes}`);

  return lines.join("\n");
}

export function petChatSummaryFields(pet: {
  name: string | null;
  species: string | null;
  breed: string | null;
  gender: string;
  illness: string | null;
  allergies: string | null;
  medications: string | null;
}) {
  return {
    name: pet.name,
    species: pet.species ? (speciesLabel[pet.species] ?? pet.species) : null,
    breed: pet.breed,
    gender: pet.gender === "MALE" ? "نر" : pet.gender === "FEMALE" ? "ماده" : "نامشخص",
    illness: pet.illness,
    allergies: pet.allergies,
    medications: pet.medications,
  };
}

