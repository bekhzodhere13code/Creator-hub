export type Specialty = "mobilograf" | "smm";
export const SPECIALTIES: Specialty[] = ["mobilograf", "smm"];
export const CATEGORIES = ["mobilografiya", "foto", "smm", "kontent", "montaj", "dizayn", "boshqa"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  specialties: string[] | null;
  bio: string | null;
  telegram: string | null;
  instagram: string | null;
  youtube: string | null;
  click_number: string | null; // faqat o‘z profilingiz uchun; boshqalarda null
  avatar_url: string | null;
  has_click?: boolean; // boshqa foydalanuvchida Click raqami bor-yo‘qligi
  tg_linked?: boolean; // faqat o‘z profilingiz: Telegram bot ulanganmi
};

export type Service = {
  id: string;
  owner_id: string | null;
  title: string;
  description: string;
  category: string;
  price: number | null;
  status: string | null;
  image_url: string | null;
  created_at: string | null;
};

export type ServiceWithOwner = Service & { owner: Pick<Profile, "id" | "first_name" | "last_name" | "avatar_url"> | null };

export type PortfolioItem = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  youtube_url: string | null;
  created_at: string | null;
};

export type Order = {
  id: string;
  service_id: string | null;
  service_title: string | null;
  price: number | null;
  client_id: string | null;
  owner_id: string | null;
  status: OrderStatus;
  expires_at: string | null;
  created_at: string | null;
  decided_at: string | null;
  owner_click?: string | null; // faqat mijoz uchun va faqat kutilayotgan buyurtmada
};
export type OrderStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "expired";

export const fullName = (p?: { first_name?: string | null; last_name?: string | null } | null) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() || "—";

export function initials(p?: { first_name?: string | null; last_name?: string | null } | null) {
  const a = (p?.first_name ?? "").trim()[0] ?? "";
  const b = (p?.last_name ?? "").trim()[0] ?? "";
  return (a + b).toUpperCase() || "CH";
}

/** Tayyor gradient juftliklari: bir xil id doim bir xil rang beradi. */
export const GRADIENTS = [
  "from-[#3A14FF] to-[#8B5CF6]",
  "from-[#FF6B6B] to-[#FFA94D]",
  "from-[#0EA5E9] to-[#22D3EE]",
  "from-[#10B981] to-[#84CC16]",
  "from-[#EC4899] to-[#F43F5E]",
  "from-[#0F172A] to-[#475569]",
] as const;

export function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export const formatPrice = (n: number | null | undefined) =>
  n == null ? null : new Intl.NumberFormat("ru-RU").format(Number(n)).replace(/\u00a0/g, " ");

export function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function normalizeUrl(v: string | null | undefined, kind: "instagram" | "telegram" | "youtube"): string | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  const handle = s.replace(/^@/, "").replace(/^\/+/, "");
  if (kind === "instagram") return `https://instagram.com/${handle}`;
  if (kind === "telegram") return `https://t.me/${handle.replace(/^t\.me\//i, "")}`;
  return `https://youtube.com/${s.startsWith("@") ? s : handle}`;
}
