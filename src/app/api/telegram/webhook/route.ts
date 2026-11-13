import { NextResponse } from "next/server";
import { admin } from "@/server/supabase";
import { decideOrderFor } from "@/server/orders";
import { LOGIN_TTL_MS } from "@/server/tg-login";
import { TG_TEXT, tg, tgLang } from "@/server/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Update = {
  message?: { chat: { id: number; type: string }; text?: string; from?: { id: number; language_code?: string } };
  callback_query?: { id: string; data?: string; from: { id: number; first_name?: string; last_name?: string; language_code?: string }; message?: { chat: { id: number }; message_id: number } };
};

const openBtn = (origin: string, text: string) => ({ inline_keyboard: [[{ text, web_app: { url: `${origin}/tg` } }]] });

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let u: Update;
  try { u = (await req.json()) as Update; } catch { return NextResponse.json({ ok: true }); }
  const db = admin();

  try {
    // /start <kod>: profilni Telegram chat'ga bog‘lash
    if (u.message?.text && u.message.chat.type === "private") {
      const chatId = u.message.chat.id;
      const text = u.message.text.trim();
      const lg = /^\/start(?:@\w+)?\s+login_([A-Za-z0-9_-]{16,40})$/.exec(text);
      const m = lg ? null : /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{6,64})$/.exec(text);
      if (lg) {
        // Saytga Telegram orqali kirish: avval tasdiqlash tugmasi
        const T = TG_TEXT[u.message.from?.language_code === "ru" ? "ru" : "uz"];
        await tg("sendMessage", { chat_id: chatId, text: T.loginAsk, reply_markup: { inline_keyboard: [[{ text: T.loginYes, callback_data: `l:${lg[1]}` }]] } });
      } else if (m) {
        const { data: prof } = await db.from("profiles").select("id, language").eq("tg_link_code", m[1]).maybeSingle();
        if (prof) {
          await db.from("profiles").update({ tg_chat_id: null }).eq("tg_chat_id", chatId).neq("id", prof.id);
          await db.from("profiles").update({ tg_chat_id: chatId, tg_link_code: null }).eq("id", prof.id);
          await tg("sendMessage", { chat_id: chatId, text: TG_TEXT[tgLang(prof.language)].linked, reply_markup: openBtn(origin, TG_TEXT[tgLang(prof.language)].open) });
        } else {
          await tg("sendMessage", { chat_id: chatId, text: TG_TEXT.uz.badCode });
        }
      } else if (u.message.text.startsWith("/start")) {
        await tg("sendMessage", { chat_id: chatId, text: TG_TEXT.uz.hello, reply_markup: openBtn(origin, TG_TEXT.uz.open) });
      }
    }

    // Tugma: o:<orderId>:y|n
    const cb = u.callback_query;
    const lc = cb?.data ? /^l:([A-Za-z0-9_-]{16,40})$/.exec(cb.data) : null;
    if (cb && lc) {
      const T = TG_TEXT[cb.from.language_code === "ru" ? "ru" : "uz"];
      const since = new Date(Date.now() - LOGIN_TTL_MS).toISOString();
      const { data: ok } = await db.from("tg_logins").update({ tg_id: cb.from.id, first_name: (cb.from.first_name ?? "").slice(0, 40), last_name: (cb.from.last_name ?? "").slice(0, 40) })
        .eq("code", lc[1]).eq("used", false).is("tg_id", null).gte("created_at", since).select("code");
      await tg("answerCallbackQuery", { callback_query_id: cb.id, text: ok?.length ? T.loginDone : T.loginBad, show_alert: !ok?.length });
      if (ok?.length && cb.message) {
        await tg("editMessageText", { chat_id: cb.message.chat.id, message_id: cb.message.message_id, text: T.loginDone });
      }
    } else if (cb?.data) {
      const m = /^o:([0-9a-f-]{36}):(y|n)$/.exec(cb.data);
      if (m) {
        const { data: seller } = await db.from("profiles").select("id, language").eq("tg_chat_id", cb.from.id).maybeSingle();
        const T = TG_TEXT[tgLang(seller?.language)];
        if (!seller) {
          await tg("answerCallbackQuery", { callback_query_id: cb.id, text: T.badCode, show_alert: true });
        } else {
          const r = await decideOrderFor(seller.id, m[1], m[2] === "y");
          const note = r.ok ? (r.status === "confirmed" ? T.yes : T.no) : r.error === "expired" ? T.expired : T.already;
          await tg("answerCallbackQuery", { callback_query_id: cb.id, text: note.replace(/<[^>]+>/g, "") });
          if (!r.ok && cb.message) {
            await tg("editMessageReplyMarkup", { chat_id: cb.message.chat.id, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
          }
        }
      } else {
        await tg("answerCallbackQuery", { callback_query_id: cb.id });
      }
    }
  } catch (e) {
    console.error("[tg webhook]", e);
  }
  // Telegram qayta yubormasligi uchun doim 200
  return NextResponse.json({ ok: true });
}
