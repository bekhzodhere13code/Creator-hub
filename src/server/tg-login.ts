import "server-only";
import { adminAuth } from "./firebase-admin";
import { admin } from "./supabase";

export const LOGIN_TTL_MS = 10 * 60 * 1000;

/** Telegram ID bo‘yicha Firebase uid: avval ulangan profil bo‘lsa shu, aks holda tg_<id>. */
export async function uidForTelegram(tgId: number, first: string, last: string): Promise<string> {
  const { data } = await admin().from("profiles").select("id").eq("tg_chat_id", tgId).maybeSingle();
  const uid = data?.id ?? `tg_${tgId}`;
  const auth = adminAuth();
  try {
    await auth.getUser(uid);
  } catch {
    await auth.createUser({ uid, displayName: `${first} ${last}`.trim().slice(0, 80) || "Telegram" });
  }
  return uid;
}
