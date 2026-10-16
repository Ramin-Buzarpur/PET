import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAndDispatchForUser } from "@/lib/notifications";

const petSchema = z.object({
  name: z.string().max(60).optional(),
  species: z.enum(["DOG", "CAT", "BIRD", "FISH", "REPTILE", "RODENT", "OTHER"]).optional(),
  speciesOther: z.string().max(60).optional(),
  breed: z.string().max(80).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  birthDateValue: z.string().optional(),
  birthCalendar: z.enum(["JALALI", "GREGORIAN"]).optional(),
  birthPrecision: z.enum(["EXACT", "ESTIMATED"]).optional(),
  approxAgeYears: z.number().int().min(0).max(100).optional(),
  approxAgeMonths: z.number().int().min(0).max(11).optional(),
  photoUrl: z.string().optional(),
  illness: z.string().max(2000).optional(),
  allergies: z.string().max(1000).optional(),
  medications: z.string().max(1000).optional(),
  chatNotes: z.string().max(3000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ pets });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const data = parsed.data;
  if (data.birthDateValue) {
    const today = new Date().toISOString().slice(0, 10);
    if (data.birthCalendar === "GREGORIAN" && data.birthDateValue > today) {
      return NextResponse.json({ error: "تاریخ تولد نمی‌تواند در آینده باشد" }, { status: 400 });
    }
  }

  const pet = await prisma.pet.create({
    data: {
      userId: session.user.id,
      ...data,
      approxAgeAsOf: data.approxAgeYears !== undefined || data.approxAgeMonths !== undefined ? new Date() : undefined,
    },
  });

  await computeAndDispatchForUser(session.user.id);

  return NextResponse.json({ pet });
}
