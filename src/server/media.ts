import "server-only";
import { randomUUID } from "node:crypto";
import { admin, mediaUrl, MEDIA_BUCKET } from "./supabase";

const MAX_BYTES = 3 * 1024 * 1024;

/** Baytlarni Supabase Storage'ga yuklab, ochiq URL qaytaradi. */
export async function uploadBuffer(userId: string, buf: Buffer, mime: "image/jpeg" | "image/png" | "image/webp", folder: string): Promise<string> {
  if (buf.length > MAX_BYTES) throw new Error("Rasm juda katta");
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${folder}/${randomUUID()}.${ext}`;
  const { error } = await admin().storage.from(MEDIA_BUCKET).upload(path, buf, { contentType: mime, cacheControl: "31536000", upsert: false });
  if (error) throw new Error("Rasmni yuklashda xatolik");
  return mediaUrl(path);
}

/** Brauzerda kichraytirilgan data-URL rasmni yuklaydi. */
export async function uploadDataUrl(userId: string, dataUrl: string, folder: string): Promise<string> {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new Error("Faqat JPG, PNG yoki WEBP rasm");
  return uploadBuffer(userId, Buffer.from(m[2], "base64"), m[1] as "image/jpeg" | "image/png" | "image/webp", folder);
}

/** Eski rasmni (faqat o‘zimizning bucket'dagini) o‘chiradi; xato bo‘lsa e’tibor bermaydi. */
export async function removeMedia(url: string | null | undefined) {
  if (!url) return;
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return;
  try { await admin().storage.from(MEDIA_BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))]); } catch { /* e’tiborsiz */ }
}
