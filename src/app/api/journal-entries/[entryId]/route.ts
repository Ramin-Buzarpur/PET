import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedEntry(entryId: string, userId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId }, include: { pet: true } });
  if (!entry || entry.pet.userId !== userId) return null;
  return entry;
}

const schema = z.object({
  titleCipher: z.string().optional(),
  bodyCipher: z.string().min(1),
  iv: z.string().min(1),
});

export async function PUT(request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { entryId } = await params;
  const existing = await getOwnedEntry(entryId, session.user.id);
  if (!existing) return NextResponse.json({ error: "یادداشت یافت نشد" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  const entry = await prisma.journalEntry.update({ where: { id: entryId }, data: parsed.data });
  return NextResponse.json({ entry });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { entryId } = await params;
  const existing = await getOwnedEntry(entryId, session.user.id);
  if (!existing) return NextResponse.json({ error: "یادداشت یافت نشد" }, { status: 404 });

  await prisma.journalEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ success: true });
}
