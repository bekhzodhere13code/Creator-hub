# Creator Hub

Mobilograf va SMM mutaxassislari platformasi. Next.js 15 (App Router) + Firebase Auth + Supabase (Postgres, Storage) + Telegram bot.

## Oqim
Mijoz xizmatda **Sotib olish** ni bosadi -> buyurtma yaratiladi, Click raqami ko‘rinadi, mutaxassisga Telegram botdan
xabar boradi (**To‘landi / To‘lanmadi** tugmalari bilan). Mutaxassis tasdiqlaguncha mijozda kutish animatsiyasi,
tasdiqlangach Telegram havolasi ochiladi va Home’ga o‘tiladi. To‘lov Click API orqali tekshirilmaydi — mutaxassisning tasdig‘iga tayanadi.

## Ishga tushirish
`.env.example` dagi o‘zgaruvchilarni to‘ldiring, `npm i && npm run dev`.
Telegram webhook: deploydan keyin `https://<domen>/api/telegram/setup?key=<TELEGRAM_WEBHOOK_SECRET>` ni bir marta oching.
Ma’lumotlar bazasi sxemasi Supabase migratsiyalarida (profiles, services, portfolio, orders, storage bucket `media`).

## Firebase Auth sozlamasi
1. Firebase Console → Authentication → Sign-in method: **Email/Password** va **Google** ni yoqing.
2. Project settings → Service accounts → *Generate new private key* → `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` ni `.env.local` ga yozing.
3. Authorized domains ga deploy domeningizni qo‘shing.
4. Supabase → SQL Editor da `supabase/tg_logins.sql` ni bir marta ishga tushiring (Telegram orqali kirish uchun).

## Admin panel
`/admin` — faqat `ADMIN_EMAILS` dagi **tasdiqlangan** email (Google bilan kirganda avtomatik tasdiqlangan). Statistika, tushum, buyurtmalar, xizmatlar va foydalanuvchilar ro‘yxati.

## Telegram bilan kirish
- Telegram ichidagi (Mini App) `/tg` sahifasi avtomatik kiritadi.
- Saytda **Telegram orqali kirish** tugmasi (bot tasdiqlaydi) — Google Telegram ichidagi brauzerda ishlamaydi, shuning uchun kerak.
- Telegram ulangan profil bo‘lsa, shu profilga kiradi; aks holda yangi `tg_<id>` hisobi ochiladi.

## Deploy
Bu ilova serverli (Next.js server actions, API routes), shuning uchun statik hosting yetmaydi.
- **Vercel (bepul Hobby, karta shart emas):** `npm i -g vercel && vercel login && vercel --prod`, so‘ng Project → Settings → Environment Variables ga `.env.example` dagi hamma qiymatlarni kiriting va qayta deploy qiling. (Hobby reja tijoriy bo‘lmagan loyihalar uchun.)
- **Firebase App Hosting:** `npm i -g firebase-tools && firebase login && firebase init apphosting && firebase deploy`. Blaze (karta bog‘lanadigan) reja talab qilinadi.
Deploydan keyin: Telegram webhook — `https://<domen>/api/telegram/setup?key=<TELEGRAM_WEBHOOK_SECRET>` ni bir marta oching.
