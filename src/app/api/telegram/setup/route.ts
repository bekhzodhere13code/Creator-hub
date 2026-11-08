import { NextResponse } from "next/server";
import { admin } from "@/server/supabase";
import { tg } from "@/server/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Bir martalik: /api/telegram/setup?key=<TELEGRAM_WEBHOOK_SECRET> — webhook'ni shu domenga ulaydi. */
export async function GET(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const url = new URL(req.url);
  if (!secret || url.searchParams.get("key") !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  const hook = `${url.origin}/api/telegram/webhook`;
  const set = await tg("setWebhook", { url: hook, secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
  const me = await tg<{ username: string }>("getMe", {});
  const info = await tg("getWebhookInfo", {});
  let test: unknown = undefined;
  if (url.searchParams.get("test")) {
    const { data } = await admin().from("profiles").select("id, tg_chat_id").not("tg_chat_id", "is", null);
    test = await Promise.all((data ?? []).map(async (p) => ({ id: p.id, chat: p.tg_chat_id, res: await tg("sendMessage", { chat_id: p.tg_chat_id, text: "✅ Creator Hub test xabari" }) })));
  }
  return NextResponse.json({ webhook: hook, setWebhook: set, bot: me.ok ? me.result?.username : me, info, test });
}
