import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appSecret = () => process.env.APP_DB_SECRET;

export const hasBackend = () => Boolean(url() && (serviceKey() || (anonKey() && appSecret())));

/**
 * Faqat serverda. Afzal: service role kaliti. Bo‘lmasa: anon kalit + `x-app-secret` sarlavhasi
 * (bazadagi RLS siyosatlari shu maxfiy sarlavhasiz hech narsaga ruxsat bermaydi).
 */
export function admin(): SupabaseClient {
  if (!client) {
    const u = url();
    if (!u) throw new Error("Supabase sozlanmagan");
    const opts = { auth: { persistSession: false, autoRefreshToken: false } };
    if (serviceKey()) client = createClient(u, serviceKey()!, opts);
    else if (anonKey() && appSecret()) client = createClient(u, anonKey()!, { ...opts, global: { headers: { "x-app-secret": appSecret()! } } });
    else throw new Error("Supabase sozlanmagan");
  }
  return client;
}

export const MEDIA_BUCKET = "media";

/** Ochiq (public) bucket fayli uchun to‘g‘ridan-to‘g‘ri URL. */
export const mediaUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
