/**
 * لایهٔ ارسال پیامک. تا وقتی SMS_PROVIDER_API_KEY در .env تنظیم نشده،
 * پیامک واقعی ارسال نمی‌شود؛ فقط در NotificationLog با status=SENT_MOCK ثبت می‌شود
 * تا بعداً با یک سرویس واقعی (مثلاً کاوه‌نگار) جایگزین شود.
 */
export function isSmsProviderConfigured(): boolean {
  return !!process.env.SMS_PROVIDER_API_KEY;
}

export async function sendSms(to: string, text: string): Promise<{ ok: boolean; mocked: boolean }> {
  if (!isSmsProviderConfigured()) {
    console.log(`[SMS mock] to=${to} text=${text}`);
    return { ok: true, mocked: true };
  }

  // TODO: اتصال به سرویس واقعی پیامک (کاوه‌نگار/ملی‌پیامک) اینجا اضافه شود.
  console.log(`[SMS] to=${to} text=${text}`);
  return { ok: true, mocked: false };
}
