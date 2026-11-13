import { NextResponse } from "next/server";
import { adminAuth } from "@/server/firebase-admin";
import { admin } from "@/server/supabase";
import { LOGIN_TTL_MS, uidForTelegram } from "@/server/tg-login";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(code)) return NextResponse.json({ status: "expired" });
  const db = admin();
  const { data: row } = await db.from("tg_logins").select("*").eq("code", code).maybeSingle();
  if (!row || Date.now() - new Date(row.created_at).getTime() > LOGIN_TTL_MS) return NextResponse.json({ status: "expired" });
  if (!row.tg_id || row.used) return NextResponse.json({ status: row.used ? "expired" : "pending" });
  // bir martalik: faqat bitta so‘rov used=false ni true qila oladi
  const { data: claimed } = await db.from("tg_logins").update({ used: true }).eq("code", code).eq("used", false).select("code");
  if (!claimed?.length) return NextResponse.json({ status: "expired" });
  try {
    const uid = await uidForTelegram(Number(row.tg_id), row.first_name ?? "", row.last_name ?? "");
    const token = await adminAuth().createCustomToken(uid);
    return NextResponse.json({ status: "ok", token });
  } catch (e) {
    console.error("[tg poll]", e);
    return NextResponse.json({ status: "expired" });
  }
}
