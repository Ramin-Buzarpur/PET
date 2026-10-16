"use client";

import { useState } from "react";

export function SettingsForm({
  initialPhone,
  initialFriendly,
  initialMarketing,
}: {
  initialPhone: string;
  initialFriendly: boolean;
  initialMarketing: boolean;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [friendly, setFriendly] = useState(initialFriendly);
  const [marketing, setMarketing] = useState(initialMarketing);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/account/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, friendlySmsOptIn: friendly, marketingSmsOptIn: marketing }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "خطایی رخ داد" });
      return;
    }
    setMessage({ type: "ok", text: "ذخیره شد." });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">شماره تماس (برای پیامک)</label>
        <input
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xxxxxxxxx"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">
        <input
          type="checkbox"
          checked={friendly}
          onChange={(e) => setFriendly(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium">پیامک‌های دوستانه</span>
          <span className="block text-xs text-muted-foreground">
            خوشامدگویی، تولد، اولین ماه همراهی و یادآوری‌های تکمیل کارت
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium">پیامک محصولات و تخفیف‌ها</span>
          <span className="block text-xs text-muted-foreground">خبرهای فروشگاه و تخفیف‌های ویژه</span>
        </span>
      </label>

      <p className="text-xs text-muted-foreground">
        خاموش‌کردن این گزینه‌ها دسترسی به کارت، دفتر، تقویم و پیام‌های داخل پنل را قطع نمی‌کند — فقط پیامک ارسال
        نمی‌شود. یادآوری‌های تقویم مراقبت، جداگانه روی هر تسک تنظیم می‌شوند.
      </p>

      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-accent" : "text-red-600"}`}>{message.text}</p>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>
    </div>
  );
}
