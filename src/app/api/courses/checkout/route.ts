import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestZarinpalPayment } from "@/lib/zarinpal";

const schema = z.object({ packageId: z.string() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "برای ادامه وارد حساب خود شوید" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const pkg = await prisma.coursePackage.findUnique({ where: { id: parsed.data.packageId } });
  if (!pkg) {
    return NextResponse.json({ error: "پکیج یافت نشد" }, { status: 404 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_packageId: { userId: session.user.id, packageId: pkg.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "شما قبلاً این پکیج را خریده‌اید" }, { status: 409 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      address: "-",
      phone: "-",
      totalAmount: pkg.price,
      items: {
        create: [{ packageId: pkg.id, quantity: 1, unitPrice: pkg.price }],
      },
      payment: { create: { provider: "zarinpal", status: "PENDING" } },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const callbackUrl = `${baseUrl}/api/checkout/verify?orderId=${order.id}`;

  const result = await requestZarinpalPayment({
    amount: pkg.price * 10,
    description: `خرید پکیج آموزشی: ${pkg.title}`,
    callbackUrl,
  });

  if (!result.ok) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: { authority: result.authority },
  });

  return NextResponse.json({ paymentUrl: result.paymentUrl });
}
