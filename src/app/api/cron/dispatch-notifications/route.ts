import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dispatchAllDueNotifications } from "@/lib/notifications";

/**
 * این پروژه زیرساخت کرون همیشه‌روشن ندارد. این مسیر برای اتصال به یک
 * تریگر دوره‌ای بیرونی (Vercel Cron، OS cron، یا فراخوانی دستی ادمین) است.
 * اگر CRON_SECRET در .env تنظیم شده باشد، با آن احراز هویت می‌شود؛
 * در غیر این صورت فقط ادمین وارد‌شده می‌تواند آن را اجرا کند.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = new URL(request.url).searchParams.get("secret");
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
  } else {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
  }

  const result = await dispatchAllDueNotifications();
  return NextResponse.json(result);
}
