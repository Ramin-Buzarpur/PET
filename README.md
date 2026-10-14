# پت‌لند — فروشگاه و آموزشگاه آنلاین حیوانات خانگی

پروژه‌ای فول‌استک با Next.js 16 (App Router) + TypeScript + Tailwind + Prisma/PostgreSQL، شامل:

- فروشگاه محصولات (دسته‌بندی، سبد خرید، پرداخت با زرین‌پال sandbox)
- آموزشگاه آنلاین: پکیج‌های آموزشی به تفکیک نوع حیوان، چپترهای متن + صدا + ویدیو، enrollment بعد از خرید موفق
- چت هوشمند با RAG سبک (جستجوی متنی Postgres روی چپترها و FAQ) + استریم پاسخ از Anthropic/OpenAI
- احراز هویت (ثبت‌نام/ورود) با Auth.js
- پنل مدیریت (`/admin`) برای CRUD محصولات، پکیج‌ها/چپترها و مشاهده سفارش‌ها/پیام‌ها

## راه‌اندازی اولیه

1. دیتابیس Postgres را بالا بیاور (کانتینر Docker از قبل با دستور زیر ساخته شده؛ در دفعات بعد فقط `docker start` کافی است):

```bash
docker run -d --name pet_shop_postgres \
  -e POSTGRES_USER=pet_shop -e POSTGRES_PASSWORD=pet_shop -e POSTGRES_DB=pet_shop \
  -p 5432:5432 -v pet_shop_pgdata:/var/lib/postgresql/data \
  public.ecr.aws/docker/library/postgres:16-alpine
```

اگر کانتینر از قبل ساخته شده (معمولاً هست)، کافی است:

```bash
docker start pet_shop_postgres
```

2. نصب پکیج‌ها (اگر قبلاً نصب نشده):

```bash
npm install
```

3. اجرای migration و seed (فقط بار اول یا بعد از تغییر schema):

```bash
npx prisma migrate dev
npm run db:seed
```

4. اجرای سرور توسعه:

```bash
npm run dev
```

سایت روی [http://localhost:3000](http://localhost:3000) بالا می‌آید.

## حساب‌های نمونه (از seed)

- مدیر: `admin@petshop.test` / `Admin@123`
- کاربر عادی: `user@petshop.test` / `User@123`

## تنظیم کلید هوش مصنوعی

فایل `.env` را باز کن و یکی از این دو مقدار را پر کن:

```
ANTHROPIC_API_KEY="..."
# یا
OPENAI_API_KEY="..."
```

تا وقتی خالی باشند، ویجت چت پیام «کلید تنظیم نشده» نشان می‌دهد؛ همین که کلید را بگذاری و سرور را دوباره اجرا کنی، چت فعال می‌شود.

## زرین‌پال

درگاه در حالت **sandbox** با merchant عمومی تست پیش‌فرض پیکربندی شده (`ZARINPAL_MERCHANT_ID` در `.env`). برای رفتن به حالت واقعی:

```
ZARINPAL_SANDBOX="false"
ZARINPAL_MERCHANT_ID="<merchant id واقعی خودتان>"
```

## نکات مهم برای ادامه کار

- `NEXT_PUBLIC_BASE_URL` و `NEXTAUTH_URL` در `.env` باید همیشه با آدرسی که سرور واقعاً رویش اجرا می‌شود یکی باشند (در غیر این صورت ریدایرکت پرداخت/ورود خراب می‌شود).
- پنل مدیریت (`/admin`) فقط برای کاربر با نقش `ADMIN` باز می‌شود.
- تصاویر محصولات/پکیج‌ها و فایل‌های صوتی/ویدیویی چپترها فعلاً placeholder هستند؛ از پنل مدیریت می‌توانید آدرس فایل واقعی را جایگزین کنید.
- پرداخت‌های موفق واقعی فقط وقتی merchant واقعی و HTTPS داشته باشید کار می‌کنند؛ در sandbox می‌توانید مسیر پرداخت را تست کنید اما تکمیل تراکنش به کارت تست نیاز دارد.
