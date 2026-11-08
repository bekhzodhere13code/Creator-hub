import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export type TgWebUser = { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string };

/** Telegram Mini App initData imzosini tekshiradi (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app). */
export function verifyInitData(initData: string, botToken: string, maxAgeSec = 86400): TgWebUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dcs = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calc = createHmac("sha256", secret).update(dcs).digest("hex");
  const a = Buffer.from(calc, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null;
  try {
    const u = JSON.parse(params.get("user") ?? "") as TgWebUser;
    return typeof u?.id === "number" ? u : null;
  } catch { return null; }
}
