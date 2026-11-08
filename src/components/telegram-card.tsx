"use client";
import { useState, useTransition } from "react";
import { Bell, Check, Send } from "lucide-react";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { createTelegramLinkAction, unlinkTelegramAction } from "@/server/actions";

export function TelegramCard({ note }: { note?: string }) {
  const { t } = useT();
  const { me, refresh } = useStore();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);

  const connect = () => start(async () => {
    setError("");
    const r = await createTelegramLinkAction();
    if (r.ok) { setOpened(true); window.open(r.url, "_blank", "noopener,noreferrer"); } else setError(r.error);
  });
  const unlink = () => start(async () => { await unlinkTelegramAction(); refresh(); });

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand"><Bell className="h-5 w-5" /></span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold">{t.profile.tgBot}</h2>
          <p className="text-sm text-ink-soft">{me.tg_linked ? t.profile.tgConnected : (note ?? t.profile.tgBotText)}</p>
        </div>
      </div>
      {me.tg_linked ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"><Check className="h-4 w-4" /> Telegram</span>
          <button onClick={unlink} disabled={pending} className="text-sm font-semibold text-red-600 hover:underline">{t.onboard.unlink}</button>
        </div>
      ) : (
        <>
          <button onClick={connect} disabled={pending} className="btn btn-primary"><Send className="h-4 w-4" /> {t.profile.tgConnect}</button>
          {opened && <p className="text-xs text-ink-soft">{t.onboard.tgHint}</p>}
        </>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
