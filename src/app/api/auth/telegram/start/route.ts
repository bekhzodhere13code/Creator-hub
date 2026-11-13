import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { admin } from "@/server/supabase";
import { getBotUsername, telegramEnabled } from "@/server/telegram";
import { LOGIN_TTL_MS } from "@/server/tg-login";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!telegramEnabled()) return NextResponse.json({ error: "Telegram bot sozlanmagan" }, { status: 500 });
  const bot = await getBotUsername();
  if (!bot) return NextResponse.json({ error: "Bot topilmadi" }, { status: 500 });
  const db = admin();
  await db.from("tg_logins").delete().lt("created_at", new Date(Date.now() - LOGIN_TTL_MS).toISOString());
  const code = randomBytes(16).toString("base64url");
  const { error } = await db.from("tg_logins").insert({ code });
  if (error) { console.error("[tg start]", error); return NextResponse.json({ error: "Xatolik" }, { status: 500 }); }
  return NextResponse.json({ code, url: `https://t.me/${bot}?start=login_${code}` });
}
