import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestZarinpalPayment } from "@/lib/zarinpal";

const checkoutSchema = z.object({
  address: z.string().min(5, "آدرس را کامل وارد کنید"),
  phone: z.string().min(8, "شماره تماس معتبر نیست"),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "سبد خرید خالی است"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "برای ادامه وارد حساب خود شوید" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" },
      { status: 400 }
    );
  }

  const { address, phone, items } = parsed.data;

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const missing = items.find((item) => !variantMap.has(item.variantId));
  if (missing) {
    return NextResponse.json({ error: "یکی از محصولات سبد خرید یافت نشد" }, { status: 400 });
  }

  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const variant = variantMap.get(item.variantId)!;
    totalAmount += variant.price * item.quantity;
    return {
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price,
    };
  });

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      address,
      phone,
      totalAmount,
      items: { create: orderItemsData },
      payment: { create: { provider: "zarinpal", status: "PENDING" } },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const callbackUrl = `${baseUrl}/api/checkout/verify?orderId=${order.id}`;

  const result = await requestZarinpalPayment({
    // زرین‌پال مبلغ را به ریال می‌خواهد؛ قیمت‌های داخلی ما بر اساس تومان است.
    amount: totalAmount * 10,
    description: `سفارش #${order.id}`,
    callbackUrl,
    mobile: phone,
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
