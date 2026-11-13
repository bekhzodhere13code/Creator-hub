import "server-only";

const token = () => process.env.TELEGRAM_BOT_TOKEN;
export const telegramEnabled = () => Boolean(token());

type TgResult<T = unknown> = { ok: boolean; result?: T; description?: string };

export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<TgResult<T>> {
  const t = token();
  if (!t) return { ok: false, description: "TELEGRAM_BOT_TOKEN yo‘q" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return (await res.json()) as TgResult<T>;
  } catch (e) {
    console.error("[telegram]", method, e);
    return { ok: false, description: "network" };
  }
}

let botUsername: string | null = process.env.TELEGRAM_BOT_USERNAME ?? null;
export async function getBotUsername(): Promise<string | null> {
  if (botUsername) return botUsername;
  const r = await tg<{ username: string }>("getMe", {});
  botUsername = r.ok ? (r.result?.username ?? null) : null;
  return botUsername;
}

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const TG_TEXT = {
  uz: {
    newOrder: "🆕 <b>Yangi buyurtma!</b>",
    service: "Xizmat",
    amount: "Summa",
    client: "Mijoz",
    ask: "Click raqamingizga to‘lov tushdimi?",
    yes: "✅ To‘landi",
    no: "❌ To‘lanmadi",
    done: "✅ <b>To‘lov tasdiqlandi</b> — mijozga Telegram havolangiz ko‘rsatildi.",
    rejected: "❌ <b>To‘lov tasdiqlanmadi</b>",
    already: "Bu buyurtma allaqachon hal qilingan.",
    sum: "so‘m",
    linked: "✅ Creator Hub botiga ulandingiz. Endi yangi buyurtmalar shu yerga keladi.",
    badCode: "Havola eskirgan. Saytdagi Profil bo‘limidan yangisini oling.",
    hello: "Creator Hub bot. Buyurtma xabarlarini olish uchun saytdagi Profil → “Botni ulash” tugmasidan foydalaning.",
    paidToClient: "✅ Mutaxassis to‘lovni tasdiqladi:",
    rejectedToClient: "❌ Mutaxassis to‘lov kelmaganini bildirdi:",
    expired: "Buyurtma muddati tugagan.",
    loginAsk: "🔐 Creator Hub saytiga kirishni tasdiqlaysizmi?\n\nFaqat o‘zingiz saytda “Telegram orqali kirish”ni bosgan bo‘lsangiz tasdiqlang.",
    loginYes: "✅ Ha, kirish",
    loginDone: "✅ Tasdiqlandi. Saytga qayting — kirish avtomatik bajariladi.",
    loginBad: "Havola eskirgan. Saytda qaytadan “Telegram orqali kirish”ni bosing.",
  },
  ru: {
    newOrder: "🆕 <b>Новый заказ!</b>",
    service: "Услуга",
    amount: "Сумма",
    client: "Клиент",
    ask: "Оплата поступила на ваш номер Click?",
    yes: "✅ Оплачено",
    no: "❌ Не оплачено",
    done: "✅ <b>Оплата подтверждена</b> — клиенту показан ваш Telegram.",
    rejected: "❌ <b>Оплата не подтверждена</b>",
    already: "Этот заказ уже обработан.",
    sum: "сум",
    linked: "✅ Вы подключили бота Creator Hub. Новые заказы будут приходить сюда.",
    badCode: "Ссылка устарела. Получите новую в разделе «Профиль» на сайте.",
    hello: "Бот Creator Hub. Чтобы получать заказы, нажмите на сайте Профиль → «Подключить бота».",
    paidToClient: "✅ Специалист подтвердил оплату:",
    rejectedToClient: "❌ Специалист сообщил, что оплата не поступила:",
    expired: "Срок заказа истёк.",
    loginAsk: "🔐 Подтвердить вход на сайт Creator Hub?\n\nПодтверждайте, только если вы сами нажали «Войти через Telegram» на сайте.",
    loginYes: "✅ Да, войти",
    loginDone: "✅ Подтверждено. Вернитесь на сайт — вход выполнится автоматически.",
    loginBad: "Ссылка устарела. Нажмите «Войти через Telegram» на сайте ещё раз.",
  },
} as const;
export type TgLang = keyof typeof TG_TEXT;
export const tgLang = (v: string | null | undefined): TgLang => (v === "ru" ? "ru" : "uz");
