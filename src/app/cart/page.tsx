"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { formatToman } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 text-lg">سبد خرید شما خالی است.</p>
        <Link href="/products" className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">سبد خرید</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} className="h-20 w-20 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              {item.variantLabel && (
                <div className="text-xs text-muted-foreground">{item.variantLabel}</div>
              )}
              <div className="text-sm text-muted-foreground">{formatToman(item.price)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                className="h-8 w-8 rounded-full border border-border hover:border-primary"
              >
                -
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                className="h-8 w-8 rounded-full border border-border hover:border-primary"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-sm text-red-600 hover:underline"
            >
              حذف
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-surface-muted p-5">
        <span className="font-medium">جمع کل</span>
        <span className="text-xl font-bold text-primary">{formatToman(totalPrice)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
      >
        ادامه به پرداخت
      </Link>
    </div>
  );
}
