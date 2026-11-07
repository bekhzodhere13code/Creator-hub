# Creator Hub

Mobilograf va SMM mutaxassislari platformasi. Next.js 15 (App Router) + Clerk + Supabase (Postgres, Storage) + Telegram bot.

## Oqim
Mijoz xizmatda **Sotib olish** ni bosadi -> buyurtma yaratiladi, Click raqami ko‘rinadi, mutaxassisga Telegram botdan
xabar boradi (**To‘landi / To‘lanmadi** tugmalari bilan). Mutaxassis tasdiqlaguncha mijozda kutish animatsiyasi,
tasdiqlangach Telegram havolasi ochiladi va Home’ga o‘tiladi. To‘lov Click API orqali tekshirilmaydi — mutaxassisning tasdig‘iga tayanadi.

## Ishga tushirish
`.env.example` dagi o‘zgaruvchilarni to‘ldiring, `npm i && npm run dev`.
Telegram webhook: deploydan keyin `https://<domen>/api/telegram/setup?key=<TELEGRAM_WEBHOOK_SECRET>` ni bir marta oching.
Ma’lumotlar bazasi sxemasi Supabase migratsiyalarida (profiles, services, portfolio, orders, storage bucket `media`).
