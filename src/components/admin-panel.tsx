"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminBlockUser, adminDeleteService, adminSetServiceStatus } from "@/server/admin-actions";
import { formatPrice } from "@/lib/utils";

type U = { id: string; name: string; email: string | null; blocked: boolean; specialties: string[]; tg: boolean; created: string | null };
type S = { id: string; title: string; category: string; price: number | null; status: string; owner: string; created: string | null };
type O = { id: string; title: string; price: number | null; status: string; client: string; owner: string; created: string | null };
type Tab = "users" | "services" | "orders";

const date = (v: string | null) => (v ? new Date(v).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const STATUS: Record<string, string> = { new: "Yangi", pending: "Kutilmoqda", confirmed: "To‘langan", rejected: "Rad etilgan", cancelled: "Bekor", expired: "Muddati tugagan", active: "Faol", inactive: "Nofaol" };

export function AdminPanel({ stats, users, services, orders }: { stats: { users: number; services: number; orders: number; paid: number }; users: U[]; services: S[]; orders: O[] }) {
  const [tab, setTab] = useState<Tab>("users");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, ask?: string) => {
    if (ask && !window.confirm(ask)) return;
    setErr("");
    start(async () => { const r = await fn(); if (!r.ok) setErr(r.error ?? "Xatolik"); else router.refresh(); });
  };
  const has = (...v: (string | null)[]) => v.some((x) => (x ?? "").toLowerCase().includes(q.trim().toLowerCase()));

  const cards = [["Foydalanuvchilar", stats.users], ["Xizmatlar", stats.services], ["Buyurtmalar", stats.orders], ["To‘langan", stats.paid]] as const;
  const tabs: [Tab, string][] = [["users", "Foydalanuvchilar"], ["services", "Xizmatlar"], ["orders", "Buyurtmalar"]];
  const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft";
  const td = "px-3 py-2.5 text-sm align-middle";
  const row = "border-t border-slate-200/70";
  const small = "btn btn-outline !px-3 !py-1.5 !text-xs";

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Admin panel</h1>
      <p className="mt-1 text-sm text-ink-soft">Faqat siz ko‘rasiz. Oxirgi 200 ta yozuv ko‘rsatiladi.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([l, n]) => (
          <div key={l} className="card p-4"><p className="text-xs font-semibold text-ink-soft">{l}</p><p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{n}</p></div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
          {tabs.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === k ? "bg-white text-ink shadow-sm dark:bg-[#1D1C1A]" : "text-ink-soft hover:text-ink"}`}>{l}</button>
          ))}
        </div>
        <input className="field !w-full sm:!w-64" placeholder="Qidirish…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidirish" />
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p>}

      <div className={`card mt-4 overflow-x-auto ${pending ? "opacity-70" : ""}`}>
        {tab === "users" && (
          <table className="w-full min-w-[640px]"><thead><tr><th className={th}>Ism</th><th className={th}>Email</th><th className={th}>Mutaxassislik</th><th className={th}>Telegram</th><th className={th}>Sana</th><th className={th} /></tr></thead>
            <tbody>{users.filter((u) => has(u.name, u.email, u.id)).map((u) => (
              <tr key={u.id} className={row}>
                <td className={`${td} font-semibold`}>{u.name}{u.blocked && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">bloklangan</span>}</td>
                <td className={td}>{u.email ?? "—"}</td><td className={td}>{u.specialties.join(", ") || "—"}</td><td className={td}>{u.tg ? "ulangan" : "—"}</td><td className={td}>{date(u.created)}</td>
                <td className={`${td} text-right`}><button className={small} disabled={pending} onClick={() => act(() => adminBlockUser(u.id, !u.blocked), u.blocked ? undefined : `${u.name} bloklansinmi?`)}>{u.blocked ? "Ochish" : "Bloklash"}</button></td>
              </tr>))}</tbody></table>
        )}
        {tab === "services" && (
          <table className="w-full min-w-[640px]"><thead><tr><th className={th}>Xizmat</th><th className={th}>Muallif</th><th className={th}>Narx</th><th className={th}>Holat</th><th className={th}>Sana</th><th className={th} /></tr></thead>
            <tbody>{services.filter((s) => has(s.title, s.owner, s.category)).map((s) => (
              <tr key={s.id} className={row}>
                <td className={`${td} font-semibold`}>{s.title}<span className="block text-xs font-normal text-ink-soft">{s.category}</span></td>
                <td className={td}>{s.owner}</td><td className={td}>{formatPrice(s.price) ?? "—"}</td><td className={td}>{STATUS[s.status] ?? s.status}</td><td className={td}>{date(s.created)}</td>
                <td className={`${td} space-x-2 text-right`}>
                  <button className={small} disabled={pending} onClick={() => act(() => adminSetServiceStatus(s.id, s.status === "active" ? "inactive" : "active"))}>{s.status === "active" ? "O‘chirib qo‘yish" : "Yoqish"}</button>
                  <button className={`${small} !text-red-600 dark:!text-red-400`} disabled={pending} onClick={() => act(() => adminDeleteService(s.id), `“${s.title}” butunlay o‘chirilsinmi?`)}>O‘chirish</button>
                </td>
              </tr>))}</tbody></table>
        )}
        {tab === "orders" && (
          <table className="w-full min-w-[640px]"><thead><tr><th className={th}>Xizmat</th><th className={th}>Mijoz</th><th className={th}>Mutaxassis</th><th className={th}>Summa</th><th className={th}>Holat</th><th className={th}>Sana</th></tr></thead>
            <tbody>{orders.filter((o) => has(o.title, o.client, o.owner)).map((o) => (
              <tr key={o.id} className={row}><td className={`${td} font-semibold`}>{o.title}</td><td className={td}>{o.client}</td><td className={td}>{o.owner}</td><td className={td}>{formatPrice(o.price) ?? "—"}</td><td className={td}>{STATUS[o.status] ?? o.status}</td><td className={td}>{date(o.created)}</td></tr>))}</tbody></table>
        )}
      </div>
    </div>
  );
}
