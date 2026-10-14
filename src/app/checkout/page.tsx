"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import { formatToman } from "@/lib/format";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const { status } = useSession();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/checkout");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center text-muted-foreground">
        سبد خرید شما خالی است.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        phone,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "خطایی در ثبت سفارش رخ داد");
      return;
    }

    window.location.href = data.paymentUrl;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">نهایی‌سازی خرید</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">آدرس تحویل</label>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="استان، شهر، خیابان، پلاک..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">شماره تماس</label>
          <input
            required
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="09xxxxxxxxx"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-medium">مبلغ قابل پرداخت</span>
          <span className="text-lg font-bold text-primary">{formatToman(totalPrice)}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "در حال اتصال به درگاه..." : "پرداخت با زرین‌پال (sandbox)"}
        </button>
      </form>
    </div>
  );
}
