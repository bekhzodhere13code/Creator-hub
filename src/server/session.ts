import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { adminAuth, hasFirebase } from "./firebase-admin";

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 kun

export type Session = { uid: string; email: string | null; emailVerified: boolean; firstName: string; lastName: string };

/** Cookie’dagi sessiyani tekshiradi (bloklangan/bekor qilingan bo‘lsa null). Bir so‘rov ichida bir marta hisoblanadi. */
export const getSession = cache(async (): Promise<Session | null> => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value || !hasFirebase()) return null;
  try {
    const d = await adminAuth().verifySessionCookie(value, true);
    const [first = "", ...rest] = String(d.name ?? "").trim().split(/\s+/);
    return { uid: d.uid, email: d.email ?? null, emailVerified: d.email_verified === true, firstName: first, lastName: rest.join(" ") };
  } catch {
    return null;
  }
});

/** Admin emaillari (.env: ADMIN_EMAILS, vergul bilan). Email tasdiqlangan bo‘lishi shart. */
const adminEmails = () => (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "bekhzod.here13@gmail.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdminSession = (s: Session | null) => Boolean(s?.email && s.emailVerified && adminEmails().includes(s.email.toLowerCase()));
