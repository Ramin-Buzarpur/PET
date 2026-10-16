import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  text: z.string().min(1),
  petId: z.string().optional().nullable(),
  dueAt: z.string(),
  hasTime: z.boolean().default(true),
  reminderOffsets: z.array(z.number().int().min(0)).default([]),
});

async function getOwnedTask(id: string, userId: string) {
  const task = await prisma.petCalendarTask.findUnique({ where: { id } });
  if (!task || task.userId !== userId) return null;
  return task;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedTask(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  const task = await prisma.petCalendarTask.update({
    where: { id },
    data: { ...parsed.data, dueAt: new Date(parsed.data.dueAt), petId: parsed.data.petId ?? null },
  });

  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedTask(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  await prisma.petCalendarTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
