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

  try {
    const db = admin();
    const client = await clerkClient();
    let userId: string | null = null;

    const { data: prof } = await db.from("profiles").select("id").eq("tg_chat_id", user.id).maybeSingle();
    if (prof) userId = prof.id as string;

    if (!userId) {
      // Telegram hisobi saytga ulanmagan: Telegram orqali yangi hisob ochamiz (yoki avvalgisini topamiz).
      const externalId = `tg_${user.id}`;
      const found = await client.users.getUserList({ externalId: [externalId], limit: 1 });
      let clerkUser = found.data[0];
      if (!clerkUser) {
        clerkUser = await client.users.createUser({
          externalId,
          firstName: (user.first_name ?? "").slice(0, 40) || undefined,
          lastName: (user.last_name ?? "").slice(0, 40) || undefined,
          emailAddress: [`tg${user.id}@telegram.creator-hub.app`],
          skipPasswordRequirement: true,
        });
      }
      userId = clerkUser.id;
      // Profil qatori va Telegram ulanishi (profil rasmi avtomatik qo‘yilmaydi)
      await db.from("profiles").upsert(
        { id: userId, first_name: (user.first_name ?? "").slice(0, 40), last_name: (user.last_name ?? "").slice(0, 40), specialties: [], avatar_url: null },
        { onConflict: "id", ignoreDuplicates: true },
      );
      await db.from("profiles").update({ tg_chat_id: user.id }).eq("id", userId);
    }

    const t = await client.signInTokens.createSignInToken({ userId, expiresInSeconds: 60 });
    return NextResponse.json({ ok: true, token: t.token });
  } catch (e) {
    console.error("[tg auth]", e);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
