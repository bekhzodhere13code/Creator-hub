"use client";
import { useEffect, useState } from "react";
import { Camera, TrendingUp } from "lucide-react";
import { FormError, Label, useFormAction } from "./form-bits";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";

const SKIP = "ch:onboard-skip";

/** Yangi foydalanuvchi mutaxassisligini tanlamaguncha ko‘rinadigan oyna. */
export function Onboarding() {
  const { t } = useT();
  const { me, saveProfile } = useStore();
  const [skipped, setSkipped] = useState(true);
  useEffect(() => { try { setSkipped(sessionStorage.getItem(SKIP) === "1"); } catch { setSkipped(false); } }, []);
  const { pending, error, submit } = useFormAction(async (fd) => {
    const first = String(fd.get("first_name") ?? "").trim();
    const specialties = fd.getAll("specialties").map(String).filter((s): s is "mobilograf" | "smm" => s === "mobilograf" || s === "smm");
    if (first.length < 2) return { ok: false, error: t.profile.firstName };
    if (!specialties.length) return { ok: false, error: t.onboard.text };
    return saveProfile({ first_name: first, last_name: String(fd.get("last_name") ?? "").trim(), bio: me.bio ?? "", work_area: me.work_area, click_number: me.click_number, specialties });
  });

  if (skipped || (me.specialties?.length ?? 0) > 0) return null;
  const skip = () => { try { sessionStorage.setItem(SKIP, "1"); } catch { /* storage yo‘q */ } setSkipped(true); };
  const opts = [
    { v: "mobilograf", Icon: Camera, label: t.specialty.mobilograf },
    { v: "smm", Icon: TrendingUp, label: t.specialty.smm },
  ];
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t.onboard.title}>
      <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-6 shadow-2xl">
        <div>
          <h2 className="text-2xl font-extrabold">{t.onboard.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t.onboard.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {opts.map(({ v, Icon, label }) => (
            <label key={v} className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-slate-200 p-4 text-center text-sm font-bold transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-50 has-[:checked]:text-brand">
              <input type="checkbox" name="specialties" value={v} className="sr-only" />
              <Icon className="h-6 w-6" /> {label}
            </label>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Label text={t.profile.firstName}><input name="first_name" required maxLength={40} defaultValue={me.first_name ?? ""} className="field" /></Label>
          <Label text={t.profile.lastName}><input name="last_name" maxLength={40} defaultValue={me.last_name ?? ""} className="field" /></Label>
        </div>
        <FormError error={error} />
        <div className="flex gap-2">
          <button type="button" onClick={skip} className="btn btn-outline flex-1">{t.onboard.skip}</button>
          <button className="btn btn-primary flex-[2]" disabled={pending}>{pending ? t.my.saving : t.onboard.start}</button>
        </div>
      </form>
    </div>
  );
}
