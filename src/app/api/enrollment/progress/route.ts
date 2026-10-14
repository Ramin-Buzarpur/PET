import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ packageId: z.string(), progress: z.number().min(0).max(100) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { packageId, progress } = parsed.data;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_packageId: { userId: session.user.id, packageId } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "شما در این پکیج ثبت‌نام نکرده‌اید" }, { status: 403 });
  }

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress: Math.max(enrollment.progress, progress) },
  });

  return NextResponse.json({ success: true });
}
