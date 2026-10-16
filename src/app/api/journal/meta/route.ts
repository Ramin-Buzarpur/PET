import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const meta = await prisma.journalUnlockMeta.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({ meta });
}

const schema = z.object({
  salt: z.string(),
  wrappedKeyByPassphrase: z.string(),
  wrappedKeyByRecovery: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const existing = await prisma.journalUnlockMeta.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: "دفتر قبلاً راه‌اندازی شده است" }, { status: 409 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  const meta = await prisma.journalUnlockMeta.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  return NextResponse.json({ meta });
}
