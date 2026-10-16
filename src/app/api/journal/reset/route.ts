import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const count = await prisma.journalEntry.count({
    where: { pet: { userId: session.user.id } },
  });
  return NextResponse.json({ entryCount: count });
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const pets = await prisma.pet.findMany({ where: { userId: session.user.id }, select: { id: true } });
  await prisma.journalEntry.deleteMany({ where: { petId: { in: pets.map((p) => p.id) } } });
  await prisma.journalUnlockMeta.delete({ where: { userId: session.user.id } }).catch(() => null);

  return NextResponse.json({ success: true });
}
