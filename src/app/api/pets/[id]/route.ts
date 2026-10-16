import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  isArchived: z.boolean().optional(),
});

async function getOwnedPet(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== userId) return null;
  return pet;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const pet = await getOwnedPet(id, session.user.id);
  if (!pet) return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });
  return NextResponse.json({ pet });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedPet(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });

  const parsed = petSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const pet = await prisma.pet.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ pet });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedPet(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });

  await prisma.pet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
