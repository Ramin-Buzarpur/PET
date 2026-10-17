# PetLand — Pet Shop, Courses & AI Assistant

A full-stack pet-care platform built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and Prisma/PostgreSQL. Persian-language (RTL) interface.

## Features

**Shop & courses**
- Product catalog browsable by animal → category → filters, cart, Zarinpal sandbox checkout
- Course packages with text/audio/video chapters and progress-based enrollment
- AI assistant chat with lightweight RAG (Postgres full-text search over chapters/FAQ) streaming from Anthropic or OpenAI
- Email/password auth (Auth.js) and an admin panel (`/admin`) for products, courses, orders and messages

**Pet family panel** (`/dashboard/pets`)
- Pet membership cards with a shareable public link
- Zero-knowledge encrypted private journal (AES-GCM, key never leaves the browser)
- Care calendar with reminders, idempotent birthday/welcome/anniversary notifications (mock SMS, real infrastructure)
- Course-completion certificates, pet-aware AI chat with explicit consent, anonymous pet stories with moderation

**Design & interaction**
- Lenis smooth scrolling + GSAP scroll reveals, spotlight-hover cards and magnetic buttons throughout
- A persistent animal picker (remembers the visitor's chosen animal across the whole site)
- A small interactive "companion pets" widget (toggleable, customizable cat/dog mascots that wander, play and react to petting/device shake)

## Getting started

1. Start Postgres (the Docker container is already created; after a reboot just start it again):

```bash
docker start pet_shop_postgres
```

   First time only:

```bash
docker run -d --name pet_shop_postgres \
  -e POSTGRES_USER=pet_shop -e POSTGRES_PASSWORD=pet_shop -e POSTGRES_DB=pet_shop \
  -p 5432:5432 -v pet_shop_pgdata:/var/lib/postgresql/data \
  public.ecr.aws/docker/library/postgres:16-alpine
```

2. Install dependencies:

```bash
npm install
```

3. Run migrations and seed data (first run, or after a schema change):

```bash
npx prisma migrate dev
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

## Seeded accounts

- Admin: `admin@petshop.test` / `Admin@123`
- Regular user: `user@petshop.test` / `User@123`

## Enabling the AI chat

Set one of these in `.env`:

```
ANTHROPIC_API_KEY="..."
# or
OPENAI_API_KEY="..."
```

While both are empty, the chat widget shows a "key not configured" message; it activates as soon as a key is set and the server restarts.

## Zarinpal payments

Configured in **sandbox** mode with a public test merchant ID (`ZARINPAL_MERCHANT_ID` in `.env`). For production:

```
ZARINPAL_SANDBOX="false"
ZARINPAL_MERCHANT_ID="<your real merchant id>"
```

## Notes for future work

- `NEXT_PUBLIC_BASE_URL` and `NEXTAUTH_URL` in `.env` must always match the actual address the server runs on, or payment/login redirects break.
- The admin panel (`/admin`) is only reachable by users with the `ADMIN` role.
- Product/course images and chapter media are placeholders; replace the URLs from the admin panel.
- Successful real payments require a real merchant ID over HTTPS; sandbox mode only exercises the checkout flow with test cards.
- The companion pets widget is purely client-side decoration (`localStorage`, no backend) — distinct from the real `Pet` model used in the dashboard.
