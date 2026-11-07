import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { admin } from "./supabase";
import type { Order, OrderStatus, PortfolioItem, Profile, Service } from "@/lib/utils";

export type AppData = {
  me: Profile;
  profiles: Profile[];
  services: Service[];
  portfolio: PortfolioItem[];
  orders: Order[];
};

type ProfileRow = Profile & { tg_chat_id: number | null; tg_link_code: string | null; language: string | null };

/** Clerk foydalanuvchisi uchun profil yozuvi yo‘q bo‘lsa yaratadi (birinchi kirishda). */
export async function ensureProfile(userId: string): Promise<ProfileRow> {
  const db = admin();
  const { data: existing } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (existing) return existing as ProfileRow;
  const u = await currentUser();
  const row = {
    id: userId,
    first_name: (u?.firstName ?? u?.username ?? "").slice(0, 40),
    last_name: (u?.lastName ?? "").slice(0, 40),
    specialties: [] as string[],
    avatar_url: null, // profil rasmini foydalanuvchining o‘zi yuklaydi
  };
  const { data, error } = await db.from("profiles").upsert(row, { onConflict: "id", ignoreDuplicates: true }).select("*").maybeSingle();
  if (error) throw error;
  if (data) return data as ProfileRow;
  const { data: again } = await db.from("profiles").select("*").eq("id", userId).single();
  return again as ProfileRow;
}

const publicProfile = (r: ProfileRow): Profile => ({
  id: r.id, first_name: r.first_name, last_name: r.last_name, specialties: r.specialties, bio: r.bio,
  telegram: r.telegram, instagram: r.instagram, youtube: r.youtube, avatar_url: r.avatar_url,
  click_number: null, has_click: Boolean(r.click_number),
});

export function effectiveStatus(o: { status: string; expires_at: string | null }): OrderStatus {
  if (o.status === "pending" && o.expires_at && new Date(o.expires_at).getTime() < Date.now()) return "expired";
  return o.status as OrderStatus;
}

export async function loadOrder(userId: string, id: string): Promise<Order | null> {
  const { data } = await admin().from("orders").select("*").eq("id", id).or(`client_id.eq.${userId},owner_id.eq.${userId}`).maybeSingle();
  if (!data) return null;
  return shapeOrder(userId, data as Record<string, unknown>, null);
}

async function shapeOrder(userId: string, o: Record<string, unknown>, ownerClick: string | null): Promise<Order> {
  const status = effectiveStatus(o as { status: string; expires_at: string | null });
  let owner_click: string | null = null;
  if (status === "pending" && o.client_id === userId) {
    owner_click = ownerClick;
    if (owner_click === null) {
      const { data } = await admin().from("profiles").select("click_number").eq("id", o.owner_id as string).maybeSingle();
      owner_click = (data?.click_number as string | null) ?? null;
    }
  }
  return {
    id: o.id as string, service_id: (o.service_id as string | null) ?? null, service_title: (o.service_title as string | null) ?? null,
    price: o.price == null ? null : Number(o.price), client_id: (o.client_id as string | null) ?? null, owner_id: (o.owner_id as string | null) ?? null,
    status, expires_at: (o.expires_at as string | null) ?? null, created_at: (o.created_at as string | null) ?? null,
    decided_at: (o.decided_at as string | null) ?? null, owner_click,
  };
}

export async function loadAppData(userId: string): Promise<AppData> {
  const db = admin();
  const meRow = await ensureProfile(userId);
  const [profiles, services, portfolio, orders] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("services").select("*").or(`status.eq.active,owner_id.eq.${userId}`).order("created_at", { ascending: false }).limit(500),
    db.from("portfolio").select("*").order("created_at", { ascending: false }).limit(1000),
    db.from("orders").select("*").or(`client_id.eq.${userId},owner_id.eq.${userId}`).order("created_at", { ascending: false }).limit(200),
  ]);
  for (const r of [profiles, services, portfolio, orders]) if (r.error) throw r.error;

  const clickByOwner = new Map<string, string | null>();
  for (const p of profiles.data as ProfileRow[]) clickByOwner.set(p.id, p.click_number);

  const me: Profile = { ...publicProfile(meRow), click_number: meRow.click_number, tg_linked: Boolean(meRow.tg_chat_id) };
  const list = (profiles.data as ProfileRow[])
    .filter((p) => p.id !== userId && ((p.first_name ?? "").trim() || (p.last_name ?? "").trim()))
    .map(publicProfile);

  return {
    me,
    profiles: [me, ...list],
    services: (services.data as Service[]).map((s) => ({ ...s, price: s.price == null ? null : Number(s.price) })),
    portfolio: portfolio.data as PortfolioItem[],
    orders: await Promise.all((orders.data as Record<string, unknown>[]).map((o) => shapeOrder(userId, o, clickByOwner.get(o.owner_id as string) ?? null))),
  };
}
