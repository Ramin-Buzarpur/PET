import { prisma } from "@/lib/prisma";

export type RetrievedContext = {
  source: string;
  text: string;
};

/**
 * بازیابی سبک محتوا (RAG): به‌جای embeddings، از جستجوی متنی خود Postgres
 * روی چپترهای آموزشی و پرسش‌های پرتکرار استفاده می‌کنیم. این روش بدون نیاز
 * به کلید API اضافه یا دیتابیس برداری کار می‌کند و برای محتوای فعلی سایت کافی است.
 */
export async function retrieveContext(query: string): Promise<RetrievedContext[]> {
  if (!query.trim()) return [];

  const [faqs, chapters] = await Promise.all([
    prisma.$queryRaw<{ question: string; answer: string }[]>`
      SELECT question, answer
      FROM "FaqEntry"
      WHERE to_tsvector('simple', question || ' ' || answer) @@ plainto_tsquery('simple', ${query})
      LIMIT 3
    `,
    prisma.$queryRaw<{ title: string; textContent: string }[]>`
      SELECT title, "textContent"
      FROM "Chapter"
      WHERE to_tsvector('simple', title || ' ' || "textContent") @@ plainto_tsquery('simple', ${query})
      LIMIT 3
    `,
  ]);

  const results: RetrievedContext[] = [];
  for (const faq of faqs) {
    results.push({ source: `پرسش پرتکرار: ${faq.question}`, text: faq.answer });
  }
  for (const chapter of chapters) {
    results.push({ source: `چپتر آموزشی: ${chapter.title}`, text: chapter.textContent });
  }
  return results;
}

export function buildSystemPrompt(context: RetrievedContext[]): string {
  const base =
    "تو دستیار هوشمند فروشگاه و آموزشگاه آنلاین حیوانات خانگی «پت‌لند» هستی. " +
    "به زبان فارسی، دوستانه و مفید پاسخ بده. در مورد مراقبت، تغذیه، رفتار و سلامت حیوانات خانگی راهنمایی کن. " +
    "اگر سؤال پزشکی جدی یا اورژانسی بود، حتماً توصیه کن که در اسرع وقت به دامپزشک مراجعه کنند. " +
    "پاسخ‌ها را کوتاه، شفاف و کاربردی نگه دار.";

  if (context.length === 0) return base;

  const contextText = context
    .map((c, i) => `[${i + 1}] ${c.source}:\n${c.text}`)
    .join("\n\n");

  return `${base}\n\nاز اطلاعات زیر (در صورت ارتباط با سؤال کاربر) برای دقیق‌تر پاسخ دادن استفاده کن:\n\n${contextText}`;
}
