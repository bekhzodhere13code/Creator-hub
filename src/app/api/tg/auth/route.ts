import { NextResponse } from "next/server";
import { adminAuth } from "@/server/firebase-admin";
import { admin } from "@/server/supabase";
import { verifyInitData } from "@/server/tg-auth";
import { uidForTelegram } from "@/server/tg-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mini App: Telegram foydalanuvchisini tekshirib, Firebase uchun bir martalik kirish tokenini beradi. */
export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ ok: false, reason: "disabled" }, { status: 503 });
  let initData = "";
  try { initData = String(((await req.json()) as { initData?: string }).initData ?? ""); } catch { /* bo‘sh */ }
  const user = initData ? verifyInitData(initData, botToken) : null;
  if (!user) return NextResponse.json({ ok: false, reason: "invalid" }, { status: 401 });

  try {
    const db = admin();
    const first = (user.first_name ?? "").slice(0, 40);
    const last = (user.last_name ?? "").slice(0, 40);
    // Ulangan profil bo‘lsa — shu hisob, aks holda tg_<id> (Firebase’da yaratiladi)
    const userId = await uidForTelegram(user.id, first, last);
    // Yangi Telegram hisobi: profil qatori va Telegram ulanishi (profil rasmi avtomatik qo‘yilmaydi)
    await db.from("profiles").upsert({ id: userId, first_name: first, last_name: last, specialties: [], avatar_url: null }, { onConflict: "id", ignoreDuplicates: true });
    if (userId.startsWith("tg_")) await db.from("profiles").update({ tg_chat_id: user.id }).eq("id", userId).is("tg_chat_id", null);
    const token = await adminAuth().createCustomToken(userId);
    return NextResponse.json({ ok: true, token });
  } catch (e) {
    console.error("[tg auth]", e);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
