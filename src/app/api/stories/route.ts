import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAILY_LIMIT = 3;

export async function GET() {
  const stories = await prisma.petStory.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, body: true, createdAt: true },
  });
  return NextResponse.json({ stories });
}

const createSchema = z.object({
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().min(10, "داستان باید حداقل ۱۰ نویسه باشد").max(3000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "برای ارسال داستان باید وارد شوید" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { title, body } = parsed.data;
  const authorUserId = session.user.id;

  const duplicate = await prisma.petStory.findFirst({
    where: { authorUserId, body },
  });
  if (duplicate) {
    return NextResponse.json({ error: "این داستان را قبلاً فرستاده‌اید." }, { status: 409 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = await prisma.petStory.count({
    where: { authorUserId, createdAt: { gte: todayStart } },
  });
  if (todayCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `در هر روز حداکثر ${DAILY_LIMIT} داستان می‌توانید بفرستید.` },
      { status: 429 },
    );
  }

  const story = await prisma.petStory.create({
    data: { authorUserId, title: title || null, body },
  });

  return NextResponse.json({ story });
}
