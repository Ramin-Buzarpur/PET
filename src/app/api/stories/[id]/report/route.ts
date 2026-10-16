import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  reason: z.string().trim().min(2).max(120),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "برای گزارش باید وارد شوید" }, { status: 401 });
  }

  const { id: storyId } = await params;
  const story = await prisma.petStory.findUnique({ where: { id: storyId } });
  if (!story) {
    return NextResponse.json({ error: "داستان پیدا نشد" }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  try {
    await prisma.storyReport.create({
      data: {
        storyId,
        reporterUserId: session.user.id,
        reason: parsed.data.reason,
        note: parsed.data.note || null,
      },
    });
  } catch {
    return NextResponse.json({ error: "شما قبلاً این داستان را گزارش کرده‌اید." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
