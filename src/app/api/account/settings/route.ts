import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  phone: z.string().min(8).optional().or(z.literal("")),
  friendlySmsOptIn: z.boolean(),
  marketingSmsOptIn: z.boolean(),
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  const { phone, friendlySmsOptIn, marketingSmsOptIn } = parsed.data;

  if ((friendlySmsOptIn || marketingSmsOptIn) && !phone) {
    return NextResponse.json(
      { error: "برای فعال‌کردن پیامک، ابتدا شماره تماس خود را وارد کنید" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: phone || undefined, friendlySmsOptIn, marketingSmsOptIn },
  });

  return NextResponse.json({ user: { phone: user.phone, friendlySmsOptIn: user.friendlySmsOptIn, marketingSmsOptIn: user.marketingSmsOptIn } });
}
