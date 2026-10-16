import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  showPhoto: z.boolean().default(false),
  showSpecies: z.boolean().default(false),
  showBreed: z.boolean().default(false),
});

async function getOwnedPet(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== userId) return null;
  return pet;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const pet = await getOwnedPet(id, session.user.id);
  if (!pet) return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  // ساخت لینک تازه، لینک قبلی را باطل می‌کند
  await prisma.petCardShare.updateMany({
    where: { petId: id, isActive: true },
    data: { isActive: false },
  });

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const share = await prisma.petCardShare.create({
    data: { petId: id, ...parsed.data, expiresAt },
  });

  return NextResponse.json({ share });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const pet = await getOwnedPet(id, session.user.id);
  if (!pet) return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });

  await prisma.petCardShare.updateMany({
    where: { petId: id, isActive: true },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
