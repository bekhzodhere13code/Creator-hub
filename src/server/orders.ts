import "server-only";
import { admin } from "./supabase";
import { TG_TEXT, esc, tg, tgLang, telegramEnabled } from "./telegram";
import { formatPrice, fullName, normalizeUrl, splitPrice, DEFAULT_DEPOSIT } from "@/lib/utils";

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");

type P = { id: string; first_name: string | null; last_name: string | null; telegram: string | null; instagram: string | null; tg_chat_id: number | null; language: string | null; click_number: string | null };

/** Mutaxassisga: yangi buyurtma (avans) yoki yakuniy to‘lov haqida xabar. */
function orderMessage(lang: "uz" | "ru", stage: "deposit" | "final", o: { title: string | null; amount: number | null }, client: P) {
  const T = TG_TEXT[lang];
  const price = formatPrice(o.amount);
  const tgUrl = normalizeUrl(client.telegram, "telegram");
  const ig = normalizeUrl(client.instagram, "instagram");
  const profile = siteUrl() ? `${siteUrl()}/creator/${client.id}` : null;
  const lines = [
    stage === "deposit" ? T.newOrder : T.finalNew,
    stage === "deposit" ? `🔖 ${T.depositTag}` : null,
    "",
    `📦 ${T.service}: <b>${esc(o.title ?? "")}</b>`,
    price ? `💰 ${T.amount}: <b>${price} ${T.sum}</b>` : null,
    `👤 ${T.client}: <b>${esc(fullName(client))}</b>`,
    tgUrl ? `✈️ ${esc(tgUrl)}` : null,
    ig ? `📷 ${esc(ig)}` : null,
    profile ? `🔗 ${esc(profile)}` : null,
    "",
    stage === "deposit" ? T.askDeposit : T.askFinal,
  ].filter((x) => x !== null);
  return lines.join("\n");
}

export type CreateOrderResult =
  | { ok: true; id: string; notified: boolean }
  | { ok: false; error: "notFound" | "own" | "noClick" | "tooMany" | "profile" | "failed" | "notClient" };

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
  if (client.account_type !== "client") return { ok: false, error: "notClient" };
  if (!((client.first_name ?? "").trim())) return { ok: false, error: "profile" };

  // Shu xizmatga ochiq buyurtma bor bo‘lsa, yangisini ochmaymiz.
  const { data: open } = await db.from("orders").select("id, expires_at").eq("client_id", userId).eq("service_id", serviceId).in("status", ["new", "pending"]).gt("expires_at", new Date().toISOString()).limit(1);
  if (open?.length) return { ok: true, id: open[0].id as string, notified: false };

  const { count } = await db.from("orders").select("id", { count: "exact", head: true }).eq("client_id", userId).in("status", ["new", "pending"]).gt("expires_at", new Date().toISOString());
  if ((count ?? 0) >= 5) return { ok: false, error: "tooMany" };

  // Avans + qolgan summa buyurtma yaratilgan paytdagi shartlar bilan qotiriladi
  const percent = Number(s.deposit_percent ?? DEFAULT_DEPOSIT);
  const { deposit, final } = splitPrice(s.price == null ? null : Number(s.price), percent);
  const { data: order, error } = await db
    .from("orders")
    .insert({ service_id: s.id, service_title: s.title, price: s.price, client_id: userId, owner_id: s.owner_id, status: "new", deposit_percent: percent, deposit_amount: deposit, final_amount: final })
    .select("id")
    .single();
  if (error || !order) { console.error("[orders] insert", error); return { ok: false, error: "failed" }; }

  return { ok: true, id: order.id as string, notified: false };
}

export type PaidResult = { ok: true; notified: boolean } | { ok: false; error: "notFound" | "already" | "expired" };

/** Mijoz avansni to‘lab “To‘landi” ni bosadi: buyurtma kutish holatiga o‘tadi va mutaxassisga Telegram xabari ketadi. */
export async function markOrderPaidFor(clientId: string, orderId: string): Promise<PaidResult> {
  const db = admin();
  const { data: o } = await db.from("orders").select("*").eq("id", orderId).eq("client_id", clientId).maybeSingle();
  if (!o) return { ok: false, error: "notFound" };
  if (o.status !== "new") return { ok: false, error: "already" };
  if (o.expires_at && new Date(o.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };

  const { data: upd } = await db.from("orders").update({ status: "pending", client_paid: true, client_paid_at: new Date().toISOString() }).eq("id", orderId).eq("status", "new").select("id");
  if (!upd?.length) return { ok: false, error: "already" };

  const notified = await askSeller(o, clientId, "deposit");
  return { ok: true, notified };
}

/** Mutaxassisga “To‘landi / To‘lanmadi” tugmalari bilan xabar yuboradi (avans yoki yakuniy to‘lov). */
async function askSeller(o: Record<string, unknown>, clientId: string, stage: "deposit" | "final"): Promise<boolean> {
  const db = admin();
  const [{ data: seller }, { data: client }] = await Promise.all([
    db.from("profiles").select("*").eq("id", o.owner_id as string).maybeSingle(),
    db.from("profiles").select("*").eq("id", clientId).maybeSingle(),
  ]);
  if (!(telegramEnabled() && seller?.tg_chat_id && client)) return false;
  const lang = tgLang(seller.language);
  const T = TG_TEXT[lang];
  const amountRaw = stage === "deposit" ? o.deposit_amount : o.final_amount;
  const prefix = stage === "deposit" ? "o" : "f";
  const r = await tg<{ message_id: number }>("sendMessage", {
    chat_id: seller.tg_chat_id,
    text: orderMessage(lang, stage, { title: o.service_title as string | null, amount: amountRaw == null ? (o.price == null ? null : Number(o.price)) : Number(amountRaw) }, client as P),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [[{ text: T.yes, callback_data: `${prefix}:${o.id}:y` }, { text: T.no, callback_data: `${prefix}:${o.id}:n` }]] },
  });
  if (!r.ok) console.error("[telegram] sendMessage failed", JSON.stringify(r));
  if (r.ok && r.result?.message_id) await db.from("orders").update({ tg_message_id: r.result.message_id }).eq("id", o.id as string);
  return r.ok;
}

export type DecideResult = { ok: true; status: "confirmed" | "rejected" } | { ok: false; error: "notFound" | "already" | "expired" | "forbidden" };

/** Mutaxassis (sayt yoki Telegram tugmasi orqali) AVANS to‘lovini tasdiqlaydi yoki rad etadi. */
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
      db.from("profiles").select("tg_chat_id, language, telegram").eq("id", sellerId).maybeSingle(),
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
      const link = yes ? normalizeUrl(seller?.telegram, "telegram") : null;
      await tg("sendMessage", { chat_id: client.tg_chat_id, text: `${yes ? T.paidToClient : T.rejectedToClient} ${o.service_title ?? ""}${link ? `\n✈️ ${link}` : ""}` });
    }
  }
  return { ok: true, status };
}

export type StageResult = { ok: true; status: string; notified?: boolean } | { ok: false; error: "notFound" | "already" | "forbidden" };

/** Mutaxassis ishni topshirdi (“Ish tayyor”): qolgan summa bo‘lsa mijozdan yakuniy to‘lov so‘raladi, bo‘lmasa buyurtma yakunlanadi. */
export async function markDeliveredFor(sellerId: string, orderId: string): Promise<StageResult> {
  const db = admin();
  const { data: o } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!o) return { ok: false, error: "notFound" };
  if (o.owner_id !== sellerId) return { ok: false, error: "forbidden" };
  if (o.status !== "confirmed") return { ok: false, error: "already" };

  const hasFinal = Number(o.deposit_percent ?? 100) < 100;
  const now = new Date().toISOString();
  const status = hasFinal ? "delivered" : "completed";
  const { data: upd } = await db.from("orders").update(hasFinal ? { status, delivered_at: now } : { status, delivered_at: now, final_paid_at: now }).eq("id", orderId).eq("status", "confirmed").select("id");
  if (!upd?.length) return { ok: false, error: "already" };

  let notified = false;
  if (hasFinal && telegramEnabled()) {
    const [{ data: seller }, { data: client }] = await Promise.all([
      db.from("profiles").select("click_number").eq("id", sellerId).maybeSingle(),
      db.from("profiles").select("tg_chat_id, language").eq("id", o.client_id).maybeSingle(),
    ]);
    if (client?.tg_chat_id) {
      const T = TG_TEXT[tgLang(client.language)];
      const amount = o.final_amount == null ? null : formatPrice(Number(o.final_amount));
      const r = await tg("sendMessage", { chat_id: client.tg_chat_id, text: `${T.deliveredToClient} ${o.service_title ?? ""}${amount ? `\n💰 ${amount} ${T.sum}` : ""}${seller?.click_number ? `\n💳 ${seller.click_number}` : ""}` });
      notified = r.ok;
    }
  }
  return { ok: true, status, notified };
}

/** Mijoz yakuniy to‘lovni qilib “To‘landi” ni bosadi: mutaxassisga Telegram xabari ketadi. */
export async function markFinalPaidFor(clientId: string, orderId: string): Promise<StageResult> {
  const db = admin();
  const { data: o } = await db.from("orders").select("*").eq("id", orderId).eq("client_id", clientId).maybeSingle();
  if (!o) return { ok: false, error: "notFound" };
  if (o.status !== "delivered") return { ok: false, error: "already" };

  const { data: upd } = await db.from("orders").update({ status: "final_pending" }).eq("id", orderId).eq("status", "delivered").select("id");
  if (!upd?.length) return { ok: false, error: "already" };
  const notified = await askSeller(o, clientId, "final");
  return { ok: true, status: "final_pending", notified };
}

/** Mutaxassis (sayt yoki Telegram tugmasi orqali) YAKUNIY to‘lovni tasdiqlaydi (buyurtma yakunlanadi) yoki rad etadi (mijozga qayta to‘lash so‘raladi). */
export async function decideFinalFor(sellerId: string, orderId: string, yes: boolean): Promise<StageResult> {
  const db = admin();
  const { data: o } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!o) return { ok: false, error: "notFound" };
  if (o.owner_id !== sellerId) return { ok: false, error: "forbidden" };
  if (o.status !== "final_pending") return { ok: false, error: "already" };

  const status = yes ? "completed" : "delivered";
  const { data: upd } = await db.from("orders").update(yes ? { status, final_paid_at: new Date().toISOString() } : { status }).eq("id", orderId).eq("status", "final_pending").select("id");
  if (!upd?.length) return { ok: false, error: "already" };

  if (telegramEnabled()) {
    const [{ data: seller }, { data: client }] = await Promise.all([
      db.from("profiles").select("tg_chat_id, language, telegram").eq("id", sellerId).maybeSingle(),
      db.from("profiles").select("tg_chat_id, language").eq("id", o.client_id).maybeSingle(),
    ]);
    if (seller?.tg_chat_id && o.tg_message_id) {
      const T = TG_TEXT[tgLang(seller.language)];
      await tg("editMessageText", {
        chat_id: seller.tg_chat_id, message_id: o.tg_message_id, parse_mode: "HTML",
        text: `${yes ? T.finalDone : T.finalRejected}\n\n📦 ${esc(o.service_title ?? "")}`,
        reply_markup: { inline_keyboard: [] },
      });
    }
    if (client?.tg_chat_id) {
      const T = TG_TEXT[tgLang(client.language)];
      await tg("sendMessage", { chat_id: client.tg_chat_id, text: `${yes ? T.finalPaidToClient : T.finalRejectedToClient} ${o.service_title ?? ""}` });
    }
  }
  return { ok: true, status };
}
