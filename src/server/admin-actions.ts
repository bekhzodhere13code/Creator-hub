"use server";
import { revalidatePath } from "next/cache";
import { adminAuth } from "./firebase-admin";
import { admin } from "./supabase";
import { getSession, isAdminSession } from "./session";
import { CATEGORIES } from "@/lib/utils";

type R = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const s = await getSession();
  if (!isAdminSession(s)) throw new Error("Ruxsat yo‘q");
  return s!;
}
const run = async (fn: () => Promise<void>): Promise<R> => {
  try { await fn(); revalidatePath("/admin"); return { ok: true }; } catch (e) {
    console.error("[admin]", e);
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik yuz berdi" };
  }
};

export type ServiceEdit = { title: string; description: string; category: string; price: number | null; status: "active" | "inactive" };

export async function adminUpdateService(id: string, v: ServiceEdit): Promise<R> {
  return run(async () => {
    await requireAdmin();
    const title = v.title.trim();
    if (title.length < 3 || title.length > 120) throw new Error("Nom 3–120 belgi bo‘lsin");
    if (v.description.length > 4000) throw new Error("Tavsif juda uzun");
    if (!(CATEGORIES as readonly string[]).includes(v.category)) throw new Error("Kategoriya noto‘g‘ri");
    if (v.price != null && (!Number.isFinite(v.price) || v.price < 0)) throw new Error("Narx noto‘g‘ri");
    if (v.status !== "active" && v.status !== "inactive") throw new Error("Holat noto‘g‘ri");
    const { error } = await admin().from("services").update({ title, description: v.description.trim(), category: v.category, price: v.price, status: v.status }).eq("id", id);
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

/** Ban: Firebase’da kirishni o‘chiradi, sessiyalarni bekor qiladi va profilni saytdan yashiradi. */
export async function adminBanUser(uid: string, banned: boolean): Promise<R> {
  return run(async () => {
    const me = await requireAdmin();
    if (uid === me.uid) throw new Error("O‘zingizni ban qilib bo‘lmaydi");
    const { error } = await admin().from("profiles").update({ banned }).eq("id", uid);
    if (error) throw error;
    try {
      const auth = adminAuth();
      await auth.updateUser(uid, { disabled: banned });
      if (banned) await auth.revokeRefreshTokens(uid);
    } catch (e) {
      // Firebase’da hisobi yo‘q (eski, kirmagan profil) bo‘lsa — faqat bazadagi belgi yetarli
      if ((e as { code?: string }).code !== "auth/user-not-found") throw e;
    }
  });
}

/** Hali kirmagan (egasi yo‘q) eski profilni xizmatlari va portfoliosi bilan o‘chiradi. */
export async function adminDeleteUnclaimedProfile(id: string): Promise<R> {
  return run(async () => {
    await requireAdmin();
    const db = admin();
    const { data } = await db.from("profiles").select("claimed").eq("id", id).maybeSingle();
    if (!data) throw new Error("Profil topilmadi");
    if (data.claimed) throw new Error("Bu foydalanuvchi tizimga kirgan — o‘chirib bo‘lmaydi, ban qiling");
    for (const t of ["services", "portfolio"]) {
      const { error } = await db.from(t).delete().eq("owner_id", id);
      if (error) throw error;
    }
    const { error } = await db.from("profiles").delete().eq("id", id).eq("claimed", false);
    if (error) throw error;
  });
}
