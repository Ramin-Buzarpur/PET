import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "نام را کامل وارد کنید"),
  email: z.string().email("ایمیل معتبر نیست"),
  subject: z.string().min(2, "موضوع را وارد کنید"),
  message: z.string().min(5, "پیام خیلی کوتاه است"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" },
      { status: 400 }
    );
  }

  await prisma.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ success: true });
}
