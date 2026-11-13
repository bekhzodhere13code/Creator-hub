"use server";
import { revalidatePath } from "next/cache";
import { adminAuth } from "./firebase-admin";
import { admin } from "./supabase";
import { getSession, isAdminSession } from "./session";

type R = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const s = await getSession();
  if (!isAdminSession(s)) throw new Error("Ruxsat yo‘q");
  return s!;
}
const run = async (fn: () => Promise<void>): Promise<R> => {
  try { await fn(); revalidatePath("/admin"); return { ok: true }; } catch (e) {
    console.error("[admin]", e);
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
};

export async function adminSetServiceStatus(id: string, status: "active" | "inactive"): Promise<R> {
  return run(async () => {
    await requireAdmin();
    const { error } = await admin().from("services").update({ status }).eq("id", id);
    if (error) throw error;
  });
}

export async function adminDeleteService(id: string): Promise<R> {
  return run(async () => {
    await requireAdmin();
    const { error } = await admin().from("services").delete().eq("id", id);
    if (error) throw error;
  });
}

/** Foydalanuvchini bloklash/ochish: Firebase’da disabled + sessiyalarni bekor qilish. */
export async function adminBlockUser(uid: string, blocked: boolean): Promise<R> {
  return run(async () => {
    const me = await requireAdmin();
    if (uid === me.uid) throw new Error("O‘zingizni bloklab bo‘lmaydi");
    const auth = adminAuth();
    await auth.updateUser(uid, { disabled: blocked });
    if (blocked) await auth.revokeRefreshTokens(uid);
  });
}
