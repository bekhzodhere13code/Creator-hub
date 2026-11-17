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
  work_area?: string | null;
  account_type?: "client" | "creator" | null;
  has_click?: boolean; // boshqa foydalanuvchida Click raqami bor-yo‘qligi
  tg_linked?: boolean; // faqat o‘z profilingiz: Telegram bot ulanganmi
  balance?: number; // faqat o‘z profilingiz: ichki balans (so‘m)
  is_admin?: boolean; // faqat o‘z profilingiz: admin (bosh sahifaga chiqarish bepul)
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
  work_area?: string | null; // qayerda ishlay olishi
  sold_count?: number; // tasdiqlangan buyurtmalar soni
  featured_until?: string | null; // bosh sahifada ko‘rsatilish muddati
  deposit_percent?: number; // boshlang‘ich to‘lov foizi (qolgani ish oxirida)
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
  owner_click?: string | null; // faqat mijoz uchun va to‘lov kutilayotgan bosqichlarda
  deposit_percent: number;
  deposit_amount: number | null;
  final_amount: number | null;
};
/**
 * new: avans to‘lovi kutilmoqda · pending: avansni mutaxassis tekshirmoqda · confirmed: avans tasdiqlandi, ish jarayonda
 * delivered: ish tayyor, yakuniy to‘lov kutilmoqda · final_pending: yakuniy to‘lovni mutaxassis tekshirmoqda · completed: yakunlandi
 */
export type OrderStatus = "new" | "pending" | "confirmed" | "delivered" | "final_pending" | "completed" | "rejected" | "cancelled" | "expired";
/** Avans to‘langandan keyingi (mutaxassis bilan aloqa ochiq) holatlar */
export const PAID_STATUSES: OrderStatus[] = ["confirmed", "delivered", "final_pending", "completed"];
export const LIVE_STATUSES: OrderStatus[] = ["new", "pending", "confirmed", "delivered", "final_pending"];

/** Xizmatni bosh sahifaga chiqarish: narx va muddat (ichki balansdan yechiladi; admin uchun bepul). */
export const FEATURE_PRICE = 50_000;
export const FEATURE_DAYS = 7;
export const SIGNUP_BONUS = 100_000;
export const DEPOSIT_OPTIONS = [30, 50, 70, 100] as const;
export const DEFAULT_DEPOSIT = 30;

export const isFeatured = (s: { featured_until?: string | null }) => Boolean(s.featured_until && new Date(s.featured_until).getTime() > Date.now());

/** Avans va qolgan summa. Narx kelishiladigan bo‘lsa (null) summalar ham null. */
export function splitPrice(price: number | null | undefined, percent: number): { deposit: number | null; final: number | null } {
  if (price == null) return { deposit: null, final: null };
  const deposit = percent >= 100 ? Number(price) : Math.round((Number(price) * percent) / 100);
  return { deposit, final: Number(price) - deposit };
}

const MOBILE_CATS = ["mobilografiya", "foto", "montaj"];
const SMM_CATS = ["smm", "kontent"];
/** Xizmat qaysi bo‘limda ko‘rinadi: kategoriya bo‘yicha, aniq bo‘lmasa (dizayn/boshqa) egasining yo‘nalishi bo‘yicha. */
export function serviceSpecialties(category: string, ownerSpecialties: string[] | null | undefined): Specialty[] {
  if (MOBILE_CATS.includes(category)) return ["mobilograf"];
  if (SMM_CATS.includes(category)) return ["smm"];
  const own = (ownerSpecialties ?? []).filter((x): x is Specialty => x === "mobilograf" || x === "smm");
  return own.length ? own : ["mobilograf", "smm"];
}

/** Bosh sahifada ko‘rinadiganlar birinchi, keyin yangilari. */
export const byFeaturedThenNew = (a: { featured_until?: string | null; created_at: string | null }, b: { featured_until?: string | null; created_at: string | null }) =>
  Number(isFeatured(b)) - Number(isFeatured(a)) || (b.created_at ?? "").localeCompare(a.created_at ?? "");

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
