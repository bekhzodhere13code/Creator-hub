import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

const projectUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Ikki rejim:
 *  1) SUPABASE_SERVICE_ROLE_KEY bor bo‘lsa — to‘g‘ridan-to‘g‘ri Supabase'ga.
 *  2) Yo‘q bo‘lsa — SUPABASE_GATEWAY_SECRET bilan Supabase Edge Function ("gateway") orqali:
 *     u xuddi shu huquqda (service role) so‘rovlarni o‘tkazadi, lekin kalit Vercel'ga ko‘chirilmaydi.
 */
export const hasBackend = () =>
  Boolean(projectUrl() && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_GATEWAY_SECRET));

/** Faqat serverda ishlatiladi. RLS yopiq, barcha ruxsat tekshiruvlari serverda. */
export function admin(): SupabaseClient {
  if (!client) {
    const url = projectUrl();
    const direct = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const gateway = process.env.SUPABASE_GATEWAY_SECRET;
    if (!url || !(direct || gateway)) throw new Error("Supabase sozlanmagan");
    client = createClient(direct ? url : `${url}/functions/v1/gateway`, (direct || gateway)!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const MEDIA_BUCKET = "media";
export const mediaUrl = (path: string) => `${projectUrl()}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
