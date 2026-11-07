"use client";
import { useState, useTransition } from "react";
import { Instagram, Send, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n-client";

const MAX = 8 * 1024 * 1024;
export type ActionResult = { ok: true } | { ok: false; error: string };

export function useFormAction(action: (fd: FormData) => Promise<ActionResult> | ActionResult, onOk?: () => void) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    for (const [, v] of fd.entries()) {
      if (v instanceof File && v.size > MAX) { setError("Rasm 8 MB dan oshmasin / Фото не больше 8 МБ"); return; }
    }
    setError(""); setSaved(false);
    start(async () => {
      try {
        const r = await action(fd);
        if (r.ok) { setSaved(true); onOk?.(); } else setError(r.error);
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : t.common.error);
      }
    });
  };
  return { pending, error, saved, submit };
}

export function FormError({ error }: { error: string }) {
  return error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null;
}

export function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{text}</span>
      {children}
      {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function SocialFields({ defaults }: { defaults: { instagram?: string | null; telegram?: string | null; youtube?: string | null } }) {
  const { t } = useT();
  return (
    <div className="space-y-3">
      <Label text={t.social.instagram}>
        <span className="relative block"><Instagram className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-soft" />
          <input name="instagram" defaultValue={defaults.instagram ?? ""} placeholder="https://instagram.com/username" className="field pl-9" /></span>
      </Label>
      <Label text={t.social.telegram}>
        <span className="relative block"><Send className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-soft" />
          <input name="telegram" defaultValue={defaults.telegram ?? ""} placeholder="@username" className="field pl-9" /></span>
      </Label>
      <Label text={t.social.youtube}>
        <span className="relative block"><Youtube className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-soft" />
          <input name="youtube" defaultValue={defaults.youtube ?? ""} placeholder="https://youtube.com/@kanal" className="field pl-9" /></span>
      </Label>
    </div>
  );
}
