import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyZarinpalPayment } from "@/lib/zarinpal";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("Status");
  const authority = url.searchParams.get("Authority");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const resultUrl = new URL("/checkout/result", baseUrl);

  if (!orderId || !authority) {
    resultUrl.searchParams.set("status", "failed");
    return NextResponse.redirect(resultUrl);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order || !order.payment || order.payment.authority !== authority) {
    resultUrl.searchParams.set("status", "failed");
    return NextResponse.redirect(resultUrl);
  }

  if (order.payment.status === "SUCCESS") {
    resultUrl.searchParams.set("orderId", orderId);
    resultUrl.searchParams.set("status", "success");
    resultUrl.searchParams.set("refId", order.payment.refId ?? "");
    return NextResponse.redirect(resultUrl);
  }

  resultUrl.searchParams.set("orderId", orderId);

  if (status !== "OK") {
    await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    await prisma.payment.update({
      where: { orderId },
      data: { status: "FAILED" },
    });
    resultUrl.searchParams.set("status", "cancelled");
    return NextResponse.redirect(resultUrl);
  }

  const verifyResult = await verifyZarinpalPayment({
    // باید دقیقاً همان مبلغ به ریال ارسال‌شده هنگام request باشد.
    amount: order.totalAmount * 10,
    authority,
  });

  if (verifyResult.ok) {
    const coursePackageIds = order.items
      .map((item) => item.packageId)
      .filter((id): id is string => !!id);

    await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
      prisma.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", refId: verifyResult.refId },
      }),
      ...coursePackageIds.map((packageId) =>
        prisma.enrollment.upsert({
          where: { userId_packageId: { userId: order.userId, packageId } },
          create: { userId: order.userId, packageId },
          update: {},
        })
      ),
    ]);
    resultUrl.searchParams.set("status", "success");
    resultUrl.searchParams.set("refId", verifyResult.refId);
  } else {
    await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } }),
      prisma.payment.update({ where: { orderId }, data: { status: "FAILED" } }),
    ]);
    resultUrl.searchParams.set("status", "failed");
  }

  return NextResponse.redirect(resultUrl);
}
