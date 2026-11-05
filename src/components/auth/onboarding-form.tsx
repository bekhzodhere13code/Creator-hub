"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { EXPERIENCE_OPTIONS, ROLE_DESCRIPTION, ROLE_LABEL, isSpecialist, type AppRole } from "@/lib/roles";
import { submitOnboarding } from "@/server/actions/onboarding";

const ROLE_ICON = { mobilograf: Camera, smm: TrendingUp, mijoz: User } as const;
const ROLE_TINT = { mobilograf: "bg-peach", smm: "bg-sky", mijoz: "bg-mint" } as const;

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState(defaultName);
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState<string>("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  const specialist = role ? isSpecialist(role) : false;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!role) return setError("Avval rolingizni tanlang.");

    startTransition(async () => {
      const result = await submitOnboarding({
        role,
        fullName,
        city,
        experience: specialist ? experience || undefined : undefined,
        bio: specialist ? bio : undefined,
        instagramUrl: specialist ? instagramUrl : undefined,
      });
      if (result.ok) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  const err = (name: string) =>
    fieldErrors[name]?.[0] ? <p className="mt-1 text-xs text-red-600">{fieldErrors[name]![0]}</p> : null;

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-lg space-y-6 p-6 sm:p-8" noValidate>
      <div>
        <h1 className="text-2xl font-bold">Xush kelibsiz!</h1>
        <p className="mt-1 text-sm text-ink-soft">Avval siz kim ekanligingizni tanlang. Rolni keyin o‘zgartirib bo‘lmaydi.</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-xs font-semibold">Kategoriya</legend>
        {(["mobilograf", "smm", "mijoz"] as const).map((r) => {
          const Icon = ROLE_ICON[r];
          return (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition-colors",
                role === r ? "border-brand bg-brand-50" : "border-slate-200 hover:border-slate-300",
              )}
            >
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="accent-brand" />
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", ROLE_TINT[r])}>
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{ROLE_LABEL[r]}</span>
                <span className="block text-xs text-ink-soft">{ROLE_DESCRIPTION[r]}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-xs font-semibold">Ism va familiya</label>
          <input id="fullName" className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ism Familiya" autoComplete="name" />
          {err("fullName")}
        </div>
        <div>
          <label htmlFor="city" className="mb-1 block text-xs font-semibold">Shahar (ixtiyoriy)</label>
          <input id="city" className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toshkent" />
        </div>
      </div>

      {specialist && (
        <div className="space-y-4 rounded-xl bg-surface p-4">
          <p className="text-sm font-semibold">Mutaxassis ma’lumotlari</p>
          <div>
            <label htmlFor="experience" className="mb-1 block text-xs font-semibold">Tajriba muddati</label>
            <select id="experience" className="field" value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="">Tanlang</option>
              {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {err("experience")}
          </div>
          <div>
            <label htmlFor="bio" className="mb-1 block text-xs font-semibold">Tajribangiz haqida</label>
            <textarea id="bio" rows={3} className="field resize-none" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Qaysi yo‘nalishlarda va qanday brendlar bilan ishlagansiz" />
            {err("bio")}
          </div>
          <div>
            <label htmlFor="instagramUrl" className="mb-1 block text-xs font-semibold">Portfolio: Instagram havola</label>
            <input id="instagramUrl" className="field" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/username" inputMode="url" />
            <p className="mt-1 text-xs text-ink-soft">Portfolio sifatida Instagram sahifangiz ko‘rsatiladi.</p>
            {err("instagramUrl")}
          </div>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saqlanmoqda…" : "Davom etish"}
      </Button>
    </form>
  );
}
