"use server";
import { randomBytes } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { admin } from "./supabase";
import { ensureProfile, loadOrder } from "./data";
import { createOrderFor, decideOrderFor } from "./orders";
import { removeMedia, uploadDataUrl } from "./media";
import { getBotUsername, telegramEnabled } from "./telegram";
import { CATEGORIES, normalizeUrl, youtubeId, type Order } from "@/lib/utils";

type Ok<T = object> = { ok: true } & T;
type Fail = { ok: false; error: string };

async function uid(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Kirish talab qilinadi");
  return userId;
}

const wrap = async <T>(fn: () => Promise<T | Fail>): Promise<T | Fail> => {
  try { return await fn(); } catch (e) {
    console.error("[action]", e);
    return { ok: false, error: e instanceof Error && e.message && !/supabase|postgres|jwt/i.test(e.message) ? e.message : "Xatolik yuz berdi" };
  }
};

const text = (max: number) => z.string().trim().max(max);
const dataUrl = z.string().max(4_500_000).nullish();

/* ---------- Profil ---------- */
const profileSchema = z.object({
  first_name: text(40).min(2),
  last_name: text(40),
  bio: text(500),
  click_number: z.string().trim().max(30).regex(/^[\d+ ]*$/).nullish(),
  specialties: z.array(z.enum(["mobilograf", "smm"])).max(2),
  avatar: dataUrl,
});

export async function saveProfileAction(input: z.input<typeof profileSchema>): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const p = profileSchema.safeParse(input);
    if (!p.success) return { ok: false, error: "Ma’lumotlarni tekshiring" };
    const cur = await ensureProfile(userId);
    const patch: Record<string, unknown> = {
      first_name: p.data.first_name, last_name: p.data.last_name, bio: p.data.bio,
      click_number: p.data.click_number?.trim() || null, specialties: [...new Set(p.data.specialties)],
      updated_at: new Date().toISOString(),
    };
    if (p.data.avatar) {
      patch.avatar_url = await uploadDataUrl(userId, p.data.avatar, "avatar");
      await removeMedia(cur.avatar_url);
    }
    const { error } = await admin().from("profiles").update(patch).eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });
}

const socialsSchema = z.object({
  instagram: z.string().max(200).nullable(),
  telegram: z.string().max(200).nullable(),
  youtube: z.string().max(200).nullable(),
});

export async function saveSocialsAction(input: z.input<typeof socialsSchema>): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const p = socialsSchema.safeParse(input);
    if (!p.success) return { ok: false, error: "Havola noto‘g‘ri" };
    const ig = normalizeUrl(p.data.instagram, "instagram");
    const tgu = normalizeUrl(p.data.telegram, "telegram");
    const yt = normalizeUrl(p.data.youtube, "youtube");
    if (ig && !/^https?:\/\/(www\.)?instagram\.com\//i.test(ig)) return { ok: false, error: "Instagram: havola noto‘g‘ri" };
    if (tgu && !/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i.test(tgu)) return { ok: false, error: "Telegram: havola noto‘g‘ri" };
    if (yt && !/^https?:\/\/(www\.|m\.)?youtube\.com\/|^https?:\/\/youtu\.be\//i.test(yt)) return { ok: false, error: "YouTube: havola noto‘g‘ri" };
    await ensureProfile(userId);
    const { error } = await admin().from("profiles").update({ instagram: ig, telegram: tgu, youtube: yt, updated_at: new Date().toISOString() }).eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });
}

/* ---------- Xizmatlar ---------- */
const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  title: text(100).min(3),
  description: text(1000).min(10),
  category: z.enum(CATEGORIES),
  price: z.number().int().positive().max(1_000_000_000).nullable(),
  status: z.enum(["active", "inactive"]),
  image: dataUrl,
});

export async function saveServiceAction(input: z.input<typeof serviceSchema>): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const p = serviceSchema.safeParse(input);
    if (!p.success) return { ok: false, error: "Ma’lumotlarni tekshiring" };
    await ensureProfile(userId);
    const db = admin();
    const row: Record<string, unknown> = { title: p.data.title, description: p.data.description, category: p.data.category, price: p.data.price, status: p.data.status };
    if (p.data.id) {
      const { data: cur } = await db.from("services").select("owner_id,image_url").eq("id", p.data.id).maybeSingle();
      if (!cur || cur.owner_id !== userId) return { ok: false, error: "Topilmadi" };
      if (p.data.image) { row.image_url = await uploadDataUrl(userId, p.data.image, "services"); await removeMedia(cur.image_url); }
      const { error } = await db.from("services").update(row).eq("id", p.data.id).eq("owner_id", userId);
      if (error) throw error;
    } else {
      if (p.data.image) row.image_url = await uploadDataUrl(userId, p.data.image, "services");
      const { error } = await db.from("services").insert({ ...row, owner_id: userId });
      if (error) throw error;
    }
    return { ok: true };
  });
}

export async function deleteServiceAction(id: string): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const db = admin();
    const { data: cur } = await db.from("services").select("owner_id,image_url").eq("id", id).maybeSingle();
    if (!cur || cur.owner_id !== userId) return { ok: false, error: "Topilmadi" };
    // Buyurtmalar tarixi saqlansin: service_id bo‘shatiladi (sarlavha buyurtmada saqlangan).
    await db.from("orders").update({ service_id: null }).eq("service_id", id);
    const { error } = await db.from("services").delete().eq("id", id).eq("owner_id", userId);
    if (error) throw error;
    await removeMedia(cur.image_url);
    return { ok: true };
  });
}

/* ---------- Portfolio ---------- */
const portfolioSchema = z.object({
  title: text(100).min(2),
  description: text(400).nullish(),
  youtube_url: z.string().trim().max(200).nullish(),
  image: dataUrl,
});

export async function addPortfolioAction(input: z.input<typeof portfolioSchema>): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const p = portfolioSchema.safeParse(input);
    if (!p.success) return { ok: false, error: "Ma’lumotlarni tekshiring" };
    const yt = p.data.youtube_url || null;
    if (yt && !youtubeId(yt)) return { ok: false, error: "YouTube havolasi noto‘g‘ri" };
    if (!yt && !p.data.image) return { ok: false, error: "YouTube havolasi yoki rasm kerak" };
    await ensureProfile(userId);
    const image_url = p.data.image ? await uploadDataUrl(userId, p.data.image, "portfolio") : null;
    const { error } = await admin().from("portfolio").insert({ owner_id: userId, title: p.data.title, description: p.data.description || null, youtube_url: yt, image_url });
    if (error) throw error;
    return { ok: true };
  });
}

export async function deletePortfolioAction(id: string): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const db = admin();
    const { data: cur } = await db.from("portfolio").select("owner_id,image_url").eq("id", id).maybeSingle();
    if (!cur || cur.owner_id !== userId) return { ok: false, error: "Topilmadi" };
    const { error } = await db.from("portfolio").delete().eq("id", id).eq("owner_id", userId);
    if (error) throw error;
    await removeMedia(cur.image_url);
    return { ok: true };
  });
}

/* ---------- Buyurtmalar ---------- */
export async function createOrderAction(serviceId: string): Promise<Ok<{ id: string; notified: boolean }> | { ok: false; error: string; code: string }> {
  try {
    const userId = await uid();
    if (!z.string().uuid().safeParse(serviceId).success) return { ok: false, error: "notFound", code: "notFound" };
    await ensureProfile(userId);
    const r = await createOrderFor(userId, serviceId);
    return r.ok ? r : { ok: false, error: r.error, code: r.error };
  } catch (e) {
    console.error("[createOrder]", e);
    return { ok: false, error: "failed", code: "failed" };
  }
}

export async function decideOrderAction(orderId: string, yes: boolean): Promise<Ok<{ status: string }> | { ok: false; error: string }> {
  try {
    const userId = await uid();
    const r = await decideOrderFor(userId, orderId, yes);
    return r;
  } catch (e) {
    console.error("[decideOrder]", e);
    return { ok: false, error: "failed" };
  }
}

export async function cancelOrderAction(orderId: string): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const { data } = await admin().from("orders").update({ status: "cancelled", decided_at: new Date().toISOString() }).eq("id", orderId).eq("client_id", userId).eq("status", "pending").select("id");
    return data?.length ? { ok: true } : { ok: false, error: "Buyurtmani bekor qilib bo‘lmadi" };
  });
}

/** Buyurtma sahifasi polling uchun: faqat o‘zingizning buyurtmangiz. */
export async function getOrderAction(orderId: string): Promise<Order | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return loadOrder(userId, orderId);
}

/* ---------- Telegram ulash ---------- */
export async function createTelegramLinkAction(): Promise<Ok<{ url: string }> | Fail> {
  return wrap(async () => {
    const userId = await uid();
    if (!telegramEnabled()) return { ok: false, error: "Telegram bot hali sozlanmagan" };
    const bot = await getBotUsername();
    if (!bot) return { ok: false, error: "Bot topilmadi" };
    await ensureProfile(userId);
    const code = randomBytes(9).toString("base64url");
    const { error } = await admin().from("profiles").update({ tg_link_code: code }).eq("id", userId);
    if (error) throw error;
    return { ok: true, url: `https://t.me/${bot}?start=${code}` };
  });
}

export async function unlinkTelegramAction(): Promise<Ok | Fail> {
  return wrap(async () => {
    const userId = await uid();
    const { error } = await admin().from("profiles").update({ tg_chat_id: null, tg_link_code: null }).eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });
}
