"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminBanUser, adminDeleteService, adminDeleteUnclaimedProfile, adminUpdateService } from "@/server/admin-actions";
import { CATEGORIES } from "@/lib/utils";

type R = { ok: true } | { ok: false; error: string };
const CAT: Record<string, string> = { mobilografiya: "Mobilografiya", foto: "Foto", smm: "SMM", kontent: "Kontent", montaj: "Montaj", dizayn: "Dizayn", boshqa: "Boshqa" };
const small = "btn btn-outline !px-2.5 !py-1 !text-xs";
const danger = `${small} !text-red-600 hover:!bg-red-50 dark:!text-red-400`;

function useAct() {
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const router = useRouter();
  const act = (fn: () => Promise<R>, ask?: string, after?: () => void) => {
    if (ask && !window.confirm(ask)) return;
    setErr("");
    start(async () => { const r = await fn(); if (r.ok) { after?.(); router.refresh(); } else setErr(r.error); });
  };
  return { pending, err, act };
}

export function BanButton({ id, name, banned, self }: { id: string; name: string; banned: boolean; self?: boolean }) {
  const { pending, err, act } = useAct();
  if (self) return <span className="text-xs text-ink-soft">siz</span>;
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button className={banned ? small : danger} disabled={pending} onClick={() => act(() => adminBanUser(id, !banned), banned ? undefined : `${name} ban qilinsinmi? U saytga kira olmaydi va profili yashiriladi.`)}>{banned ? "Banni olish" : "Ban"}</button>
      {err && <span role="alert" className="max-w-40 whitespace-normal text-[11px] text-red-600 dark:text-red-400">{err}</span>}
    </span>
  );
}

export function DeleteProfileButton({ id, name }: { id: string; name: string }) {
  const { pending, err, act } = useAct();
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button className={danger} disabled={pending} onClick={() => act(() => adminDeleteUnclaimedProfile(id), `${name} profili, xizmatlari va portfoliosi o‘chirilsinmi?`)}>O‘chirish</button>
      {err && <span role="alert" className="max-w-40 whitespace-normal text-[11px] text-red-600 dark:text-red-400">{err}</span>}
    </span>
  );
}

export type ServiceRow = { id: string; title: string; description: string; category: string; price: number | null; status: string };

export function ServiceActions({ s }: { s: ServiceRow }) {
  const { pending, err, act } = useAct();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: s.title, description: s.description, category: s.category, price: s.price == null ? "" : String(s.price), status: s.status === "active" ? "active" : "inactive" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const price = f.price.trim() === "" ? null : Number(f.price);
    act(() => adminUpdateService(s.id, { title: f.title, description: f.description, category: f.category, price, status: f.status as "active" | "inactive" }), undefined, () => setOpen(false));
  };
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex gap-2">
        <button className={small} onClick={() => setOpen(true)}>Tahrirlash</button>
        <button className={danger} disabled={pending} onClick={() => act(() => adminDeleteService(s.id), `“${s.title}” xizmati butunlay o‘chirilsinmi?`)}>O‘chirish</button>
      </span>
      {err && !open && <span role="alert" className="max-w-40 whitespace-normal text-[11px] text-red-600 dark:text-red-400">{err}</span>}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Xizmatni tahrirlash" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <form onSubmit={save} className="card w-full max-w-lg space-y-4 whitespace-normal p-6 text-left">
            <h3 className="font-display text-lg font-bold">Xizmatni tahrirlash</h3>
            <label className="block text-sm font-semibold">Nomi<input className="field mt-1.5 font-normal" value={f.title} onChange={set("title")} required minLength={3} maxLength={120} /></label>
            <label className="block text-sm font-semibold">Tavsif<textarea className="field mt-1.5 min-h-28 font-normal" value={f.description} onChange={set("description")} maxLength={4000} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">Kategoriya
                <select className="field mt-1.5 font-normal" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c} value={c}>{CAT[c]}</option>)}</select>
              </label>
              <label className="block text-sm font-semibold">Narx (so‘m)<input className="field mt-1.5 font-normal" type="number" min={0} inputMode="numeric" value={f.price} onChange={set("price")} /></label>
            </div>
            <label className="block text-sm font-semibold">Holat
              <select className="field mt-1.5 font-normal" value={f.status} onChange={set("status")}><option value="active">Faol (saytda ko‘rinadi)</option><option value="inactive">Nofaol (yashirin)</option></select>
            </label>
            {err && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{err}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Bekor qilish</button>
              <button type="submit" className="btn btn-primary" disabled={pending}>Saqlash</button>
            </div>
          </form>
        </div>
      )}
    </span>
  );
}
