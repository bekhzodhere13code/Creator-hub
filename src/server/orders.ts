import "server-only";
import { admin } from "./supabase";
import { TG_TEXT, esc, tg, tgLang, telegramEnabled } from "./telegram";
import { formatPrice, fullName, normalizeUrl } from "@/lib/utils";

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");

type P = { id: string; first_name: string | null; last_name: string | null; telegram: string | null; instagram: string | null; tg_chat_id: number | null; language: string | null; click_number: string | null };

function orderMessage(lang: "uz" | "ru", o: { title: string | null; price: number | null }, client: P) {
  const T = TG_TEXT[lang];
  const price = formatPrice(o.price);
  const tgUrl = normalizeUrl(client.telegram, "telegram");
  const ig = normalizeUrl(client.instagram, "instagram");
  const profile = siteUrl() ? `${siteUrl()}/creator/${client.id}` : null;
  const lines = [
    T.newOrder,
    "",
    `📦 ${T.service}: <b>${esc(o.title ?? "")}</b>`,
    price ? `💰 ${T.amount}: <b>${price} ${T.sum}</b>` : null,
    `👤 ${T.client}: <b>${esc(fullName(client))}</b>`,
    tgUrl ? `✈️ ${esc(tgUrl)}` : null,
    ig ? `📷 ${esc(ig)}` : null,
    profile ? `🔗 ${esc(profile)}` : null,
    "",
    T.ask,
  ].filter((x) => x !== null);
  return lines.join("\n");
}

export type CreateOrderResult =
  | { ok: true; id: string; notified: boolean }
  | { ok: false; error: "notFound" | "own" | "noClick" | "tooMany" | "profile" | "failed" };

export async function createOrderFor(userId: string, serviceId: string): Promise<CreateOrderResult> {
  const db = admin();
  const { data: s } = await db.from("services").select("*").eq("id", serviceId).maybeSingle();
  if (!s || s.status !== "active" || !s.owner_id) return { ok: false, error: "notFound" };
  if (s.owner_id === userId) return { ok: false, error: "own" };

  const [{ data: seller }, { data: client }] = await Promise.all([
    db.from("profiles").select("*").eq("id", s.owner_id).maybeSingle(),
    db.from("profiles").select("*").eq("id", userId).maybeSingle(),
  ]);
  if (!seller || !client) return { ok: false, error: "notFound" };
  if (!seller.click_number) return { ok: false, error: "noClick" };
  if (!((client.first_name ?? "").trim())) return { ok: false, error: "profile" };

  // Shu xizmatga ochiq buyurtma bor bo‘lsa, yangisini ochmaymiz.
  const { data: open } = await db.from("orders").select("id, expires_at").eq("client_id", userId).eq("service_id", serviceId).eq("status", "pending").gt("expires_at", new Date().toISOString()).limit(1);
  if (open?.length) return { ok: true, id: open[0].id as string, notified: false };

  const { count } = await db.from("orders").select("id", { count: "exact", head: true }).eq("client_id", userId).eq("status", "pending").gt("expires_at", new Date().toISOString());
  if ((count ?? 0) >= 5) return { ok: false, error: "tooMany" };

  const { data: order, error } = await db
    .from("orders")
    .insert({ service_id: s.id, service_title: s.title, price: s.price, client_id: userId, owner_id: s.owner_id, status: "pending" })
    .select("id")
    .single();
  if (error || !order) { console.error("[orders] insert", error); return { ok: false, error: "failed" }; }

  let notified = false;
  if (telegramEnabled() && seller.tg_chat_id) {
    const lang = tgLang(seller.language);
    const T = TG_TEXT[lang];
    const r = await tg<{ message_id: number }>("sendMessage", {
      chat_id: seller.tg_chat_id,
      text: orderMessage(lang, { title: s.title, price: s.price == null ? null : Number(s.price) }, client as P),
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[{ text: T.yes, callback_data: `o:${order.id}:y` }, { text: T.no, callback_data: `o:${order.id}:n` }]] },
    });
    notified = r.ok;
    if (r.ok && r.result?.message_id) await db.from("orders").update({ tg_message_id: r.result.message_id }).eq("id", order.id);
  }
  return { ok: true, id: order.id as string, notified };
}

export type DecideResult = { ok: true; status: "confirmed" | "rejected" } | { ok: false; error: "notFound" | "already" | "expired" | "forbidden" };

/** Mutaxassis (sayt yoki Telegram tugmasi orqali) to‘lovni tasdiqlaydi yoki rad etadi. */
export async function decideOrderFor(sellerId: string, orderId: string, yes: boolean): Promise<DecideResult> {
  const db = admin();
  const { data: o } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!o) return { ok: false, error: "notFound" };
  if (o.owner_id !== sellerId) return { ok: false, error: "forbidden" };
  if (o.status !== "pending") return { ok: false, error: "already" };
  if (o.expires_at && new Date(o.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };

  const status = yes ? "confirmed" : "rejected";
  const { data: upd } = await db
    .from("orders")
    .update({ status, decided_at: new Date().toISOString(), owner_confirmed: yes, owner_confirmed_at: yes ? new Date().toISOString() : null })
    .eq("id", orderId).eq("status", "pending").select("id");
  if (!upd?.length) return { ok: false, error: "already" };

  // Telegramdagi xabarni yangilash va mijozga xabar berish (bot ulangan bo‘lsa).
  if (telegramEnabled()) {
    const [{ data: seller }, { data: client }] = await Promise.all([
      db.from("profiles").select("tg_chat_id, language").eq("id", sellerId).maybeSingle(),
      db.from("profiles").select("tg_chat_id, language").eq("id", o.client_id).maybeSingle(),
    ]);
    if (seller?.tg_chat_id && o.tg_message_id) {
      const T = TG_TEXT[tgLang(seller.language)];
      await tg("editMessageText", {
        chat_id: seller.tg_chat_id, message_id: o.tg_message_id, parse_mode: "HTML",
        text: `${yes ? T.done : T.rejected}\n\n📦 ${esc(o.service_title ?? "")}`,
        reply_markup: { inline_keyboard: [] },
      });
    }
    if (client?.tg_chat_id) {
      const T = TG_TEXT[tgLang(client.language)];
      await tg("sendMessage", { chat_id: client.tg_chat_id, text: `${yes ? T.paidToClient : T.rejectedToClient} ${o.service_title ?? ""}` });
    }
  }
  return { ok: true, status };
}
