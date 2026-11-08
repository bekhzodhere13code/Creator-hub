"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Avatar } from "./avatar";
import { FormError, Label, SocialFields, useFormAction } from "./form-bits";
import { Modal } from "./modal";
import { PortfolioGrid } from "./portfolio";
import { useSocialsAction } from "./service-manager";
import { readImage } from "@/lib/image";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { SPECIALTIES, youtubeId } from "@/lib/utils";

export function ProfileForm() {
  const { t, lang } = useT();
  const { me, saveProfile } = useStore();
  const { pending, error, saved, submit } = useFormAction(async (fd) => {
    const first = String(fd.get("first_name") ?? "").trim();
    if (first.length < 2) return { ok: false, error: lang === "ru" ? "Введите имя" : "Ismni kiriting" };
    const avatar = await readImage(fd.get("avatar"), 480);
    const client = me.account_type === "client";
    return saveProfile({
      account_type: client ? "client" : "creator",
      first_name: first,
      last_name: String(fd.get("last_name") ?? "").trim(),
      bio: String(fd.get("bio") ?? "").trim(),
      work_area: me.work_area ?? null,
      click_number: client ? null : String(fd.get("click_number") ?? "").replace(/[^\d+ ]/g, "").trim() || null,
      specialties: client ? [] : fd.getAll("specialties").map(String).filter((s) => s === "mobilograf" || s === "smm"),
      avatar,
    });
  });
  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div className="flex items-center gap-4">
        <Avatar p={me} size={64} />
        <Label text={t.profile.avatar} hint={t.profile.avatarHint}>
          <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand" />
        </Label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label text={t.profile.firstName}><input name="first_name" required maxLength={40} defaultValue={me.first_name ?? ""} placeholder={t.extra.phFirst} className="field" /></Label>
        <Label text={t.profile.lastName}><input name="last_name" maxLength={40} defaultValue={me.last_name ?? ""} placeholder={t.extra.phLast} className="field" /></Label>
      </div>
      {me.account_type !== "client" && <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">{t.profile.specialties}</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold has-[:checked]:border-brand has-[:checked]:bg-brand-50 has-[:checked]:text-brand">
              <input type="checkbox" name="specialties" value={s} defaultChecked={me.specialties?.includes(s)} className="sr-only" />
              {t.specialty[s]}
            </label>
          ))}
        </div>
      </fieldset>}
      {me.account_type !== "client" && <Label text={t.profile.bio}><textarea name="bio" rows={3} maxLength={500} defaultValue={me.bio ?? ""} placeholder={t.extra.phBio} className="field" /></Label>}
      {me.account_type !== "client" && <Label text={t.profile.click} hint={t.profile.clickHint}><input name="click_number" inputMode="tel" maxLength={30} defaultValue={me.click_number ?? ""} placeholder={t.extra.phCard} className="field" /></Label>}
      <FormError error={error} />
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>{pending ? t.my.saving : t.profile.save}</button>
        {saved && !pending && <span className="text-sm font-semibold text-emerald-600">{t.profile.saved}</span>}
      </div>
    </form>
  );
}

export function SocialsForm() {
  const { t } = useT();
  const { me } = useStore();
  const { pending, error, saved, submit } = useFormAction(useSocialsAction());
  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="font-display text-lg font-bold">{t.profile.links}</h2>
      <SocialFields defaults={me} />
      <FormError error={error} />
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>{pending ? t.my.saving : t.profile.save}</button>
        {saved && !pending && <span className="text-sm font-semibold text-emerald-600">{t.profile.saved}</span>}
      </div>
    </form>
  );
}

export function PortfolioManager() {
  const { t, lang } = useT();
  const { me, data, addPortfolio, deletePortfolio } = useStore();
  const items = data.portfolio.filter((p) => p.owner_id === me.id);
  const [open, setOpen] = useState(false);
  const { pending, error, submit } = useFormAction(async (fd) => {
    const title = String(fd.get("title") ?? "").trim();
    const yt = String(fd.get("youtube_url") ?? "").trim();
    if (title.length < 2) return { ok: false, error: lang === "ru" ? "Введите название" : "Ish nomini kiriting" };
    if (yt && !youtubeId(yt)) return { ok: false, error: lang === "ru" ? "Неверная ссылка YouTube" : "YouTube havolasi noto‘g‘ri" };
    const image = await readImage(fd.get("image"));
    if (!yt && !image) return { ok: false, error: lang === "ru" ? "Нужна ссылка YouTube или фото" : "YouTube havolasi yoki rasm kerak" };
    return addPortfolio({ title, description: String(fd.get("description") ?? "").trim() || null, youtube_url: yt || null, image });
  }, () => setOpen(false));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{t.profile.portfolio}</h2>
        <button onClick={() => setOpen(true)} className="btn btn-outline !py-2"><Plus className="h-4 w-4" /> {t.profile.addWork}</button>
      </div>
      <PortfolioGrid
        items={items}
        empty={t.profile.noPortfolio}
        renderAction={(id) => (
          <button className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label={t.profile.deleteWork} onClick={() => { if (confirm(t.profile.deleteWork + "?")) void deletePortfolio(id); }}>
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t.profile.addWork}>
        <form onSubmit={submit} className="space-y-4">
          <Label text={t.profile.workTitle}><input name="title" required maxLength={100} placeholder={t.extra.phWorkTitle} className="field" /></Label>
          <Label text={t.profile.workDesc}><textarea name="description" rows={2} maxLength={400} placeholder={t.extra.phWorkDesc} className="field" /></Label>
          <Label text={t.profile.workYoutube}><input name="youtube_url" placeholder="https://youtu.be/…" className="field" /></Label>
          <Label text={t.my.fImage}><input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="field" /></Label>
          <FormError error={error} />
          <button className="btn btn-primary w-full" disabled={pending}>{pending ? t.my.saving : t.my.save}</button>
        </form>
      </Modal>
    </section>
  );
}
