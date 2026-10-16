import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const entries = await prisma.journalEntry.findMany({
    where: { petId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ entries });
}

const schema = z.object({
  titleCipher: z.string().optional(),
  bodyCipher: z.string().min(1),
  iv: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const pet = await getOwnedPet(id, session.user.id);
  if (!pet) return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  const entry = await prisma.journalEntry.create({ data: { petId: id, ...parsed.data } });
  return NextResponse.json({ entry });
}
