import { NextResponse } from "next/server";
import { adminAuth, hasFirebase } from "@/server/firebase-admin";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/server/session";

export async function POST(req: Request) {
  if (!hasFirebase()) return NextResponse.json({ error: "Firebase sozlanmagan" }, { status: 500 });
  const { idToken } = (await req.json().catch(() => ({}))) as { idToken?: string };
  if (!idToken) return NextResponse.json({ error: "Token yo‘q" }, { status: 400 });
  try {
    const auth = adminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    // Faqat yaqinda kirgan token bilan sessiya ochiladi (5 daqiqa)
    if (Date.now() / 1000 - decoded.auth_time > 300) return NextResponse.json({ error: "Qayta kiring" }, { status: 401 });
    const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE * 1000 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
    return res;
  } catch (e) {
    console.error("[session]", e);
    return NextResponse.json({ error: "Token yaroqsiz" }, { status: 401 });
  }
}
