import { NextResponse } from "next/server";
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
  return NextResponse.json({ webhook: hook, setWebhook: set, bot: me.ok ? me.result?.username : me });
}
