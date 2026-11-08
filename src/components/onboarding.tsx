"use client";
import { useState } from "react";
import { Camera, ShoppingBag, TrendingUp } from "lucide-react";
import { FormError, Label, useFormAction } from "./form-bits";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";

type Pick = "mobilograf" | "smm" | "client";

/** Yangi foydalanuvchi turini tanlamaguncha ko‘rinadigan oyna: Mijoz yoki Mobilograf/SMM (ikkalasini ham tanlash mumkin). */
export function Onboarding() {
  const { t } = useT();
  const { me, saveProfile } = useStore();
  const [picked, setPicked] = useState<Pick[]>([]);
  const { pending, error, submit } = useFormAction(async (fd) => {
    const first = String(fd.get("first_name") ?? "").trim();
    if (first.length < 2) return { ok: false, error: t.profile.firstName };
    if (!picked.length) return { ok: false, error: t.onboard.text };
    const client = picked.includes("client");
    return saveProfile({
      first_name: first, last_name: String(fd.get("last_name") ?? "").trim(), bio: me.bio ?? "", work_area: me.work_area,
      click_number: me.click_number, account_type: client ? "client" : "creator",
      specialties: client ? [] : picked.filter((p): p is "mobilograf" | "smm" => p !== "client"),
    });
  });

  if (me.account_type) return null;
  const toggle = (v: Pick) => setPicked((cur) => {
    if (v === "client") return cur.includes("client") ? [] : ["client"];
    const base = cur.filter((c) => c !== "client");
    return base.includes(v) ? base.filter((c) => c !== v) : [...base, v];
  });
  const opts: { v: Pick; Icon: typeof Camera; label: string; sub: string }[] = [
    { v: "client", Icon: ShoppingBag, label: t.extra.clientTitle, sub: t.extra.clientText },
    { v: "mobilograf", Icon: Camera, label: t.specialty.mobilograf, sub: t.extra.creatorText },
    { v: "smm", Icon: TrendingUp, label: t.specialty.smm, sub: t.extra.creatorText },
  ];
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t.onboard.title}>
      <form onSubmit={submit} className="card my-4 w-full max-w-md space-y-4 p-6 shadow-2xl">
        <div>
          <h2 className="text-2xl font-extrabold">{t.onboard.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t.onboard.text}</p>
        </div>
        <div className="space-y-2">
          {opts.map(({ v, Icon, label, sub }) => {
            const on = picked.includes(v);
            return (
              <button type="button" key={v} onClick={() => toggle(v)} aria-pressed={on}
                className={cn("flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors", on ? "border-brand bg-brand-50" : "border-slate-200 hover:border-slate-300")}>
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", on ? "bg-brand text-white" : "bg-slate-100 text-ink-soft")}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-sm font-bold">{label}</span><span className="block text-xs text-ink-soft">{sub}</span></span>
              </button>
            );
          })}
          <p className="text-xs text-ink-soft">{t.extra.chooseHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Label text={t.profile.firstName}><input name="first_name" required maxLength={40} defaultValue={me.first_name ?? ""} placeholder={t.extra.phFirst} className="field" /></Label>
          <Label text={t.profile.lastName}><input name="last_name" maxLength={40} defaultValue={me.last_name ?? ""} placeholder={t.extra.phLast} className="field" /></Label>
        </div>
        <FormError error={error} />
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? t.my.saving : t.onboard.start}</button>
      </form>
    </div>
  );
}
