import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["HEIGHT", "WEIGHT"]),
  value: z.number().positive(),
  unit: z.string().min(1).max(10),
  measuredAt: z.string(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { id } = await params;
  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet || pet.userId !== session.user.id) {
    return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const measuredAt = new Date(parsed.data.measuredAt);
  if (measuredAt.getTime() > Date.now()) {
    return NextResponse.json({ error: "تاریخ اندازه‌گیری نمی‌تواند در آینده باشد" }, { status: 400 });
  }

  const measurement = await prisma.petMeasurement.create({
    data: { petId: id, type: parsed.data.type, value: parsed.data.value, unit: parsed.data.unit, measuredAt },
  });

  return NextResponse.json({ measurement });
}
