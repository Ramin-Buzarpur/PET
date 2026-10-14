import Link from "next/link";

const content: Record<string, { title: string; desc: string; emoji: string }> = {
  success: {
    title: "پرداخت با موفقیت انجام شد 🎉",
    desc: "سفارش شما ثبت شد و به‌زودی پردازش می‌شود.",
    emoji: "✅",
  },
  cancelled: {
    title: "پرداخت لغو شد",
    desc: "شما از درگاه پرداخت انصراف دادید.",
    emoji: "✋",
  },
  failed: {
    title: "پرداخت ناموفق بود",
    desc: "مشکلی در پردازش پرداخت رخ داد. لطفاً دوباره تلاش کنید.",
    emoji: "⚠️",
  },
};

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; refId?: string; orderId?: string }>;
}) {
  const { status = "failed", refId } = await searchParams;
  const info = content[status] ?? content.failed;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-4 text-5xl">{info.emoji}</div>
      <h1 className="mb-2 text-2xl font-bold">{info.title}</h1>
      <p className="mb-6 text-muted-foreground">{info.desc}</p>
      {refId && (
        <p className="mb-6 text-sm text-muted-foreground">کد پیگیری: {refId}</p>
      )}
      <div className="flex justify-center gap-3">
        <Link href="/dashboard" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          پیشخان من
        </Link>
        <Link href="/products" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
          ادامه خرید
        </Link>
      </div>
    </div>
  );
}
