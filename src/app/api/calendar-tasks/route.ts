import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const petId = url.searchParams.get("petId") ?? undefined;

  const range = from && to ? { gte: new Date(from), lt: new Date(to) } : undefined;

  const tasks = await prisma.petCalendarTask.findMany({
    where: { userId: session.user.id, petId, ...(range ? { dueAt: range } : {}) },
    include: { pet: { select: { id: true, name: true } } },
    orderBy: { dueAt: "asc" },
  });

  return NextResponse.json({ tasks });
}

const schema = z.object({
  text: z.string().min(1),
  petId: z.string().optional(),
  dueAt: z.string(),
  hasTime: z.boolean().default(true),
  reminderOffsets: z.array(z.number().int().min(0)).default([]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  if (parsed.data.petId) {
    const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
    if (!pet || pet.userId !== session.user.id) {
      return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });
    }
  }

  const task = await prisma.petCalendarTask.create({
    data: { ...parsed.data, dueAt: new Date(parsed.data.dueAt), userId: session.user.id },
  });

  return NextResponse.json({ task });
}
