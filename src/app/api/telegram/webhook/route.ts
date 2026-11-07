import { NextResponse } from "next/server";
import { admin } from "@/server/supabase";
import { decideOrderFor } from "@/server/orders";
import { TG_TEXT, tg, tgLang } from "@/server/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Update = {
  message?: { chat: { id: number; type: string }; text?: string };
  callback_query?: { id: string; data?: string; from: { id: number }; message?: { chat: { id: number }; message_id: number } };
};

export async function POST(req: Request) {
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
      const m = /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{6,64})$/.exec(u.message.text.trim());
      if (m) {
        const { data: prof } = await db.from("profiles").select("id, language").eq("tg_link_code", m[1]).maybeSingle();
        if (prof) {
          await db.from("profiles").update({ tg_chat_id: null }).eq("tg_chat_id", chatId).neq("id", prof.id);
          await db.from("profiles").update({ tg_chat_id: chatId, tg_link_code: null }).eq("id", prof.id);
          await tg("sendMessage", { chat_id: chatId, text: TG_TEXT[tgLang(prof.language)].linked });
        } else {
          await tg("sendMessage", { chat_id: chatId, text: TG_TEXT.uz.badCode });
        }
      } else if (u.message.text.startsWith("/start")) {
        await tg("sendMessage", { chat_id: chatId, text: TG_TEXT.uz.hello });
      }
    }

    // Tugma: o:<orderId>:y|n
    const cb = u.callback_query;
    if (cb?.data) {
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
