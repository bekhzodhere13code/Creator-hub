"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Empty, PageHead, ServiceCard, catLabel } from "./cards";
import { FormError, Label, SocialFields, useFormAction } from "./form-bits";
import { Modal } from "./modal";
import { readImage } from "@/lib/image";
import { useT } from "@/lib/i18n-client";
import { L3 } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { CATEGORIES, normalizeUrl, type ServiceWithOwner } from "@/lib/utils";

export function ServiceManager() {
  const { t } = useT();
  const { me, data, withOwner, deleteService } = useStore();
  const services = data.services.filter((s) => s.owner_id === me.id).map(withOwner);
  const [editing, setEditing] = useState<ServiceWithOwner | "new" | null>(null);
  const [socialOpen, setSocialOpen] = useState(false);

  // Birinchi xizmat qo‘shishda ijtimoiy tarmoqlarni ulash modali
  const needsSocials = services.length === 0 && !me.instagram && !me.telegram && !me.youtube;
  const add = () => (needsSocials ? setSocialOpen(true) : setEditing("new"));
  const afterSocial = () => { setSocialOpen(false); setEditing("new"); };

  return (
    <>
      <PageHead title={t.my.title} action={<button onClick={add} className="btn btn-primary"><Plus className="h-4 w-4" /> {t.my.add}</button>} />
      {services.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="space-y-2">
              <ServiceCard s={s} t={t} />
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="btn btn-outline flex-1 !py-2"><Pencil className="h-4 w-4" /> {t.my.edit}</button>
                <button onClick={() => { if (confirm(t.my.confirmDelete)) void deleteService(s.id); }} className="btn btn-outline !py-2 text-red-600" aria-label={t.my.delete}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty text={t.my.empty} />
      )}

      <Modal open={socialOpen} onClose={() => setSocialOpen(false)} title={t.social.title}>
        <SocialModalBody onDone={afterSocial} />
      </Modal>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={t.my.formTitle}>
        {editing && <ServiceForm key={editing === "new" ? "new" : editing.id} service={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}

export function useSocialsAction() {
  const { lang } = useT();
  const { saveSocials } = useStore();
  return (fd: FormData) => {
    const val = (k: string) => String(fd.get(k) ?? "").trim();
    const instagram = normalizeUrl(val("instagram"), "instagram");
    const telegram = normalizeUrl(val("telegram"), "telegram");
    const youtube = normalizeUrl(val("youtube"), "youtube");
    const bad = L3(lang, "Havola noto‘g‘ri", "Неверная ссылка", "Invalid link");
    if (instagram && !/^https?:\/\/(www\.)?instagram\.com\//i.test(instagram)) return { ok: false as const, error: `Instagram: ${bad}` };
    if (telegram && !/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i.test(telegram)) return { ok: false as const, error: `Telegram: ${bad}` };
    if (youtube && !/^https?:\/\/(www\.|m\.)?youtube\.com\/|^https?:\/\/youtu\.be\//i.test(youtube)) return { ok: false as const, error: `YouTube: ${bad}` };
    return saveSocials({ instagram, telegram, youtube });
  };
}

function SocialModalBody({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const { me } = useStore();
  const { pending, error, submit } = useFormAction(useSocialsAction(), onDone);
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-ink-soft">{t.social.text}</p>
      <SocialFields defaults={me} />
      <FormError error={error} />
      <div className="flex gap-2">
        <button type="button" onClick={onDone} className="btn btn-outline flex-1">{t.social.skip}</button>
        <button className="btn btn-primary flex-[2]" disabled={pending}>{pending ? t.my.saving : t.social.save}</button>
      </div>
    </form>
  );
}

function ServiceForm({ service, onDone }: { service: ServiceWithOwner | null; onDone: () => void }) {
  const { t, lang } = useT();
  const { me, saveService } = useStore();
  const { pending, error, submit } = useFormAction(async (fd) => {
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    if (title.length < 3) return { ok: false, error: L3(lang, "Nomi kamida 3 belgi", "Название: минимум 3 символа", "Title: at least 3 characters") };
    if (description.length < 10) return { ok: false, error: L3(lang, "Tavsif kamida 10 belgi", "Описание: минимум 10 символов", "Description: at least 10 characters") };
    if (!me.click_number && String(fd.get("click_number") ?? "").replace(/\D/g, "").length < 9) return { ok: false, error: L3(lang, "Karta yoki Click raqamini kiriting", "Введите номер карты или телефон Click", "Enter your Click card or phone number") };
    const priceRaw = String(fd.get("price") ?? "").replace(/\s/g, "");
    const image = await readImage(fd.get("image"));
    return saveService({
      id: service?.id,
      title, description,
      category: String(fd.get("category")) as (typeof CATEGORIES)[number],
      price: priceRaw ? Number(priceRaw) : null,
      status: fd.get("active") === "on" ? "active" : "inactive",
      click_number: String(fd.get("click_number") ?? "").replace(/[^\d+ ]/g, "").trim() || null,
      image,
    });
  }, onDone);

  return (
    <form onSubmit={submit} className="space-y-4">
      <Label text={t.my.fTitle}><input name="title" required maxLength={100} defaultValue={service?.title} className="field" /></Label>
      <Label text={t.my.fDesc}><textarea name="description" required maxLength={1000} rows={4} defaultValue={service?.description} className="field" /></Label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label text={t.my.fCategory}>
          <select name="category" defaultValue={service?.category ?? "mobilografiya"} className="field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(t, c)}</option>)}
          </select>
        </Label>
        <Label text={t.my.fPrice}><input name="price" inputMode="numeric" pattern="[0-9 ]*" defaultValue={service?.price ?? ""} placeholder="500000" className="field" /></Label>
      </div>
      {!me.click_number && (
        <Label text={t.profile.click} hint={t.profile.clickHint}><input name="click_number" required inputMode="tel" maxLength={30} placeholder="8600 0000 0000 0000" className="field" /></Label>
      )}
      <Label text={t.my.fImage}><input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="field file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-brand" /></Label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="active" defaultChecked={service ? service.status === "active" : true} className="h-4 w-4 rounded accent-[#3A14FF]" /> {t.my.fActive}
      </label>
      <FormError error={error} />
      <div className="flex gap-2">
        <button type="button" onClick={onDone} className="btn btn-outline flex-1">{t.my.cancel}</button>
        <button className="btn btn-primary flex-[2]" disabled={pending}>{pending ? t.my.saving : t.my.save}</button>
      </div>
    </form>
  );
}
