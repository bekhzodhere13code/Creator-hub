import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { adminAuth } from "@/server/firebase-admin";
import { getSession, isAdminSession } from "@/server/session";
import { admin } from "@/server/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  if (!isAdminSession(await getSession())) notFound();
  const db = admin();
  const count = (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const q = db.from(t).select("*", { count: "exact", head: true });
    return (f ? f(q) : q).then((r: { count: number | null }) => r.count ?? 0);
  };
  const [users, services, orders, paid, profiles, svc, ord] = await Promise.all([
    count("profiles"), count("services"), count("orders"), count("orders", (q) => q.eq("status", "confirmed")),
    db.from("profiles").select("id, first_name, last_name, specialties, tg_chat_id, created_at").order("created_at", { ascending: false }).limit(200),
    db.from("services").select("id, title, category, price, status, owner_id, created_at").order("created_at", { ascending: false }).limit(200),
    db.from("orders").select("id, service_title, price, status, client_id, owner_id, created_at").order("created_at", { ascending: false }).limit(200),
  ]);
  const rows = profiles.data ?? [];
  const nameOf = new Map(rows.map((p) => [p.id as string, [p.first_name, p.last_name].filter(Boolean).join(" ") || "—"]));

  // Email va bloklangan holat Firebase’dan (200 tagacha)
  const info = new Map<string, { email: string | null; disabled: boolean }>();
  try {
    const r = await adminAuth().getUsers(rows.slice(0, 100).map((p) => ({ uid: p.id as string })));
    r.users.forEach((u) => info.set(u.uid, { email: u.email ?? null, disabled: u.disabled }));
  } catch (e) { console.error("[admin] getUsers", e); }

  return (
    <AdminPanel
      stats={{ users, services, orders, paid }}
      users={rows.map((p) => ({ id: p.id, name: nameOf.get(p.id) ?? "—", email: info.get(p.id)?.email ?? null, blocked: info.get(p.id)?.disabled ?? false, specialties: p.specialties ?? [], tg: Boolean(p.tg_chat_id), created: p.created_at }))}
      services={(svc.data ?? []).map((s) => ({ id: s.id, title: s.title, category: s.category, price: s.price, status: s.status ?? "active", owner: nameOf.get(s.owner_id as string) ?? "—", created: s.created_at }))}
      orders={(ord.data ?? []).map((o) => ({ id: o.id, title: o.service_title ?? "—", price: o.price, status: o.status, client: nameOf.get(o.client_id as string) ?? "—", owner: nameOf.get(o.owner_id as string) ?? "—", created: o.created_at }))}
    />
  );
}
