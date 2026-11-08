import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { admin } from "@/server/supabase";
import { verifyInitData } from "@/server/tg-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mini App: Telegram foydalanuvchisini tekshirib, saytdagi (Clerk) hisobi uchun bir martalik kirish tokeni beradi. */
export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ ok: false, reason: "disabled" }, { status: 503 });
  let initData = "";
  try { initData = String(((await req.json()) as { initData?: string }).initData ?? ""); } catch { /* bo‘sh */ }
  const user = initData ? verifyInitData(initData, botToken) : null;
  if (!user) return NextResponse.json({ ok: false, reason: "invalid" }, { status: 401 });

  const { data: prof } = await admin().from("profiles").select("id").eq("tg_chat_id", user.id).maybeSingle();
  if (!prof) return NextResponse.json({ ok: false, reason: "not_linked" });

  try {
    const client = await clerkClient();
    const t = await client.signInTokens.createSignInToken({ userId: prof.id as string, expiresInSeconds: 60 });
    return NextResponse.json({ ok: true, token: t.token });
  } catch (e) {
    console.error("[tg auth]", e);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
