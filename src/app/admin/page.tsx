import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminAuth } from "@/server/firebase-admin";
import { BanButton, DeleteProfileButton, ServiceActions } from "@/components/admin-actions";
import { Logo } from "@/components/logo";
import { getSession } from "@/server/session";
import { isAdmin } from "@/server/admin";
import { effectiveStatus } from "@/server/data";
import { admin } from "@/server/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin panel", robots: { index: false, follow: false } };

type P = { id: string; first_name: string | null; last_name: string | null; specialties: string[] | null; account_type: string | null; tg_chat_id: number | null; telegram: string | null; click_number: string | null; created_at: string; claimed: boolean; banned: boolean };
type S = { id: string; owner_id: string; title: string; description: string | null; category: string | null; price: number | null; status: string; created_at: string };
type O = { id: string; service_id: string | null; service_title: string; price: number | null; client_id: string; owner_id: string; status: string; expires_at: string | null; created_at: string };

const fmt = (d?: string | number | Date | null) => (d ? new Date(d).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "short", timeStyle: "short" }) : "—");
const sum = (n?: number | null) => (n ? `${new Intl.NumberFormat("ru-RU").format(n)} so‘m` : "—");
const ROLE: Record<string, string> = { client: "Mijoz", creator: "Ijodkor" };
const STATUS: Record<string, string> = { new: "Yangi", pending: "Kutilmoqda", confirmed: "To‘langan", rejected: "Rad etilgan", cancelled: "Bekor", expired: "Muddati o‘tgan" };

function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>; }
function Td({ children, strong }: { children: React.ReactNode; strong?: boolean }) { return <td className={`whitespace-nowrap px-3 py-2 text-sm ${strong ? "font-semibold" : ""}`}>{children}</td>; }
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] divide-y divide-slate-100">
        <thead><tr>{head.map((h) => <Th key={h}>{h}</Th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) notFound();
  const myUid = (await getSession())?.uid;

  const db = admin();
  const [fb, profiles, services, orders, portfolio] = await Promise.all([
    adminAuth().listUsers(1000),
    db.from("profiles").select("id,first_name,last_name,specialties,account_type,tg_chat_id,telegram,click_number,created_at,claimed,banned").order("created_at", { ascending: false }).limit(1000),
    db.from("services").select("id,owner_id,title,description,category,price,status,created_at").order("created_at", { ascending: false }).limit(1000),
    db.from("orders").select("id,service_id,service_title,price,client_id,owner_id,status,expires_at,created_at").order("created_at", { ascending: false }).limit(1000),
    db.from("portfolio").select("owner_id").limit(5000),
  ]);
  for (const r of [profiles, services, orders, portfolio]) if (r.error) throw r.error;

  const fbUsers = fb.users
    .map((u) => ({ id: u.uid, email: u.email ?? "", name: u.displayName ?? "", createdAt: Date.parse(u.metadata.creationTime) || 0, lastSignInAt: Date.parse(u.metadata.lastSignInTime ?? "") || 0, disabled: u.disabled }))
    .sort((a, b) => b.createdAt - a.createdAt);
  const users = { data: fbUsers.slice(0, 200), totalCount: fbUsers.length };
  const P = profiles.data as P[], S = services.data as S[];
  const O = (orders.data as O[]).map((o) => ({ ...o, eff: effectiveStatus(o) }));
  const pById = new Map(P.map((p) => [p.id, p]));
  const fbIds = new Set(fbUsers.map((u) => u.id));
  const unclaimed = P.filter((p) => !p.claimed && !fbIds.has(p.id));
  const name = (id: string) => { const p = pById.get(id); return [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Nomsiz"; };
  const countBy = (rows: { owner_id: string }[]) => { const m = new Map<string, number>(); for (const r of rows) m.set(r.owner_id, (m.get(r.owner_id) ?? 0) + 1); return m; };
  const svcCount = countBy(S), portCount = countBy(portfolio.data as { owner_id: string }[]);
  const soldBy = new Map<string, number>();
  for (const o of O) if (o.eff === "confirmed" && o.service_id) soldBy.set(o.service_id, (soldBy.get(o.service_id) ?? 0) + 1);
  const confirmed = O.filter((o) => o.eff === "confirmed");
  const revenue = confirmed.reduce((a, o) => a + (o.price ?? 0), 0);
  const day = Date.now() - 864e5;

  const stats: [string, string][] = [
    ["Foydalanuvchilar", String(users.totalCount)],
    ["Kirmagan profillar", String(unclaimed.length)],
    ["Ijodkorlar / Mijozlar", `${P.filter((p) => p.account_type !== "client" && p.account_type).length} / ${P.filter((p) => p.account_type === "client").length}`],
    ["Telegram ulangan", String(P.filter((p) => p.tg_chat_id).length)],
    ["Xizmatlar", String(S.length)],
    ["Buyurtmalar", String(O.length)],
    ["Sotilgan (to‘langan)", String(confirmed.length)],
    ["Jami tushum", sum(revenue)],
    ["Oxirgi 24 soatda kirgan", String(fbUsers.filter((u) => u.lastSignInAt > day).length)],
  ];

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3"><Logo /><span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">ADMIN</span></div>
          <Link href="/" className="btn btn-outline">Saytga qaytish</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="card p-4"><p className="text-xs text-ink-soft">{k}</p><p className="mt-1 font-display text-2xl font-extrabold">{v}</p></div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Buyurtmalar</h2>
          <Table head={["Sana", "Xizmat", "Mijoz", "Ijodkor", "Summa", "Holat"]}>
            {O.slice(0, 200).map((o) => (
              <tr key={o.id}><Td>{fmt(o.created_at)}</Td><Td strong>{o.service_title}</Td><Td>{name(o.client_id)}</Td><Td>{name(o.owner_id)}</Td><Td>{sum(o.price)}</Td><Td>{STATUS[o.eff] ?? o.eff}</Td></tr>
            ))}
          </Table>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Xizmatlar</h2>
          <Table head={["Qo‘yilgan", "Xizmat", "Ijodkor", "Kategoriya", "Narx", "Sotilgan", "Holat", "Amallar"]}>
            {S.slice(0, 200).map((s) => (
              <tr key={s.id}><Td>{fmt(s.created_at)}</Td><Td strong>{s.title}</Td><Td>{name(s.owner_id)}</Td><Td>{s.category ?? "—"}</Td><Td>{sum(s.price)}</Td><Td>{soldBy.get(s.id) ?? 0}</Td><Td>{s.status === "active" ? "Faol" : "Nofaol"}</Td>
                <Td><ServiceActions s={{ id: s.id, title: s.title, description: s.description ?? "", category: s.category ?? "boshqa", price: s.price, status: s.status }} /></Td></tr>
            ))}
          </Table>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Foydalanuvchilar</h2>
          <Table head={["Ro‘yxatdan o‘tgan", "Oxirgi kirish", "Ism", "Email", "Rol", "Yo‘nalish", "Telegram", "Xizmat", "Portfolio", "Karta", "Amallar"]}>
            {users.data.map((u) => {
              const p = pById.get(u.id);
              const email = u.email;
              const tgOnly = !email && u.id.startsWith("tg_");
              return (
                <tr key={u.id}>
                  <Td>{fmt(u.createdAt)}</Td><Td>{fmt(u.lastSignInAt)}</Td>
                  <Td strong>{name(u.id) !== "Nomsiz" ? name(u.id) : u.name || "Nomsiz"}{u.disabled || p?.banned ? " (ban)" : ""}</Td>
                  <Td>{tgOnly ? "Telegram orqali" : email || "—"}</Td>
                  <Td>{p?.account_type ? ROLE[p.account_type] ?? p.account_type : "Tanlamagan"}</Td>
                  <Td>{p?.specialties?.join(", ") || "—"}</Td>
                  <Td>{p?.tg_chat_id ? "Ulangan" : "—"}{p?.telegram ? ` · ${p.telegram.replace(/^https?:\/\/t\.me\//, "@")}` : ""}</Td>
                  <Td>{svcCount.get(u.id) ?? 0}</Td><Td>{portCount.get(u.id) ?? 0}</Td>
                  <Td>{p?.click_number ? "Bor" : "—"}</Td>
                  <Td><BanButton id={u.id} name={name(u.id) !== "Nomsiz" ? name(u.id) : u.name || u.email || "Foydalanuvchi"} banned={u.disabled || Boolean(p?.banned)} self={u.id === myUid} /></Td>
                </tr>
              );
            })}
          </Table>
          {users.totalCount > users.data.length && <p className="text-xs text-ink-soft">Oxirgi {users.data.length} ta foydalanuvchi ko‘rsatildi (jami {users.totalCount}).</p>}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Kirmagan profillar <span className="text-sm font-normal text-ink-soft">(eski/demo, saytda ko‘rinmaydi)</span></h2>
          {unclaimed.length === 0 ? <p className="text-sm text-ink-soft">Yo‘q.</p> : (
            <Table head={["Yaratilgan", "Ism", "Rol", "Yo‘nalish", "Telegram", "Xizmat", "Portfolio", "Amallar"]}>
              {unclaimed.slice(0, 300).map((p) => (
                <tr key={p.id}>
                  <Td>{fmt(p.created_at)}</Td><Td strong>{name(p.id)}</Td><Td>{p.account_type ? ROLE[p.account_type] ?? p.account_type : "—"}</Td>
                  <Td>{p.specialties?.join(", ") || "—"}</Td><Td>{p.tg_chat_id ? "Ulangan" : "—"}</Td>
                  <Td>{svcCount.get(p.id) ?? 0}</Td><Td>{portCount.get(p.id) ?? 0}</Td>
                  <Td><DeleteProfileButton id={p.id} name={name(p.id)} /></Td>
                </tr>
              ))}
            </Table>
          )}
        </section>
      </main>
    </div>
  );
}
