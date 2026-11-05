# KreatorHub

Mobilograf va SMM mutaxassislari platformasi. **1-bosqich**: Clerk auth, rol tanlash (onboarding), rolga qarab dashboard.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · Clerk · Prisma · Supabase (PostgreSQL)

## Ishga tushirish

```bash
npm install
cp .env.example .env.local      # Windows (cmd): copy .env.example .env.local — keyin CLERK_SECRET_KEY, DATABASE_URL, DIRECT_URL ni to‘ldiring
npx prisma db push              # jadvallarni Supabase'ga yaratadi
npm run dev                     # http://localhost:3000
npm run typecheck && npm run build
```

## Oqim

`/` (ochiq) → `/sign-up` yoki `/sign-in` (Clerk) → rol yo‘q bo‘lsa `/onboarding` → `/dashboard` (rolga qarab).
Login qilmagan foydalanuvchi boshqa har qanday sahifada `/sign-in`'ga yuboriladi (`src/middleware.ts`).

## Xavfsizlik

- Rol faqat server tomonda (`src/server/services/onboarding.ts`) Clerk `publicMetadata.role` ga yoziladi va qayta o‘zgartirilmaydi.
- Sahifalar rolni har so‘rovda Clerk'dan o‘qiydi (`src/lib/auth.ts`).
- Kelajakdagi mobil ilova uchun: `GET /api/v1/me`, `POST /api/v1/onboarding`.

## Keyingi bosqichlar

2: katalog, mutaxassis profili, xizmatlar, portfolio · 3: buyurtmalar.

## Vercel'ga deploy

1. `package.json` repo **ildizida** turishi kerak (papka ichida emas). Aks holda Vercel → Settings → General → Root Directory ni to'g'ri papkaga o'zgartiring.
2. Vercel → Settings → Environment Variables ga `.env.example` dagi hamma o'zgaruvchilarni kiriting:
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL` va Clerk URL'lari.
3. Deploy'ni qayta ishga tushiring.
