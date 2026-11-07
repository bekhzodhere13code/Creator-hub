"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock, Copy, Send, X } from "lucide-react";
import { Empty } from "./cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { formatPrice, fullName, normalizeUrl } from "@/lib/utils";

const REDIRECT_MS = 6000;

export function OrderView({ id }: { id: string }) {
  const { t } = useT();
  const router = useRouter();
  const { me, data, profile, pollOrder, decideOrder, cancelOrder, refresh } = useStore();
  const order = data.orders.find((o) => o.id === id);
  const sawPending = useRef(false);
  const [busy, setBusy] = useState<"" | "y" | "n" | "c">("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const status = order?.status;

  if (status === "pending") sawPending.current = true;

  // Kutish: har 3 soniyada holatni tekshiramiz, o‘zgarsa sahifa ma’lumoti yangilanadi.
  useEffect(() => {
    if (status !== "pending") return;
    let alive = true;
    const tick = async () => {
      const o = await pollOrder(id);
      if (alive && o && o.status !== "pending") refresh();
    };
    const timer = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(timer); };
  }, [status, id, pollOrder, refresh]);

  // Mijoz uchun: to‘lov tasdiqlansa, bir necha soniyadan keyin Home'ga o‘tamiz.
  const isClient = order?.client_id === me.id;
  useEffect(() => {
    if (!(isClient && status === "confirmed" && sawPending.current)) return;
    const timer = setTimeout(() => router.push("/"), REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [isClient, status, router]);

  if (!order || !status) return <Empty text={t.order.notFound} />;

  const owner = profile(order.owner_id);
  const client = profile(order.client_id);
  const other = isClient ? owner : client;
  const price = formatPrice(order.price);
  const tgUrl = normalizeUrl(other?.telegram, "telegram");

  const copy = async () => {
    try { await navigator.clipboard.writeText((order.owner_click ?? "").replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard yo‘q */ }
  };
  const decide = async (yes: boolean) => {
    setBusy(yes ? "y" : "n"); setError("");
    const r = await decideOrder(order.id, yes);
    if (!r.ok) setError(r.error);
    setBusy("");
  };
  const cancel = async () => {
    if (!confirm(t.order.confirmCancel)) return;
    setBusy("c");
    const r = await cancelOrder(order.id);
    if (!r.ok) setError(r.error);
    setBusy("");
  };

  const Contact = () => (
    <div className="space-y-2 rounded-xl bg-surface p-4">
      <p className="text-sm font-semibold">{t.order.contact}: {fullName(other)}</p>
      {tgUrl ? <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full sm:w-auto"><Send className="h-4 w-4" /> {t.order.openTelegram}</a> : <p className="text-sm text-ink-soft">{t.order.noTelegram}</p>}
    </div>
  );

  const Banner = ({ tone, icon, title, text }: { tone: "green" | "red" | "gray"; icon: React.ReactNode; title: string; text?: string }) => (
    <div className={`animate-[pop_.35s_ease-out] space-y-1 rounded-2xl p-5 text-center ${tone === "green" ? "bg-emerald-50 text-emerald-800" : tone === "red" ? "bg-red-50 text-red-800" : "bg-slate-100 text-ink"}`}>
      <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white ${tone === "green" ? "bg-emerald-600" : tone === "red" ? "bg-red-600" : "bg-slate-500"}`}>{icon}</span>
      <p className="pt-2 font-display text-xl font-extrabold">{title}</p>
      {text && <p className="text-sm opacity-80">{text}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/buyurtmalar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> {t.order.title}</Link>
      <div className="card space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold text-ink-soft">{t.order.payTitle}</p>
          <h1 className="text-2xl font-extrabold">{order.service_title}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isClient ? t.order.creator : t.order.client}: <b className="text-ink">{fullName(other)}</b>
            {price && <> · <b className="text-ink">{price} {t.common.sum}</b></>}
          </p>
        </div>

        {status === "pending" && isClient && (
          <>
            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-ink-soft">{t.order.step1}</p>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3">
                <span className="break-all font-display text-xl font-extrabold tracking-wide">{order.owner_click}</span>
                <button onClick={copy} className="btn btn-outline !px-3 !py-2 shrink-0"><Copy className="h-4 w-4" /> {copied ? t.order.copied : t.order.copy}</button>
              </div>
              {price && <p className="text-sm">{t.order.amount}: <b>{price} {t.common.sum}</b></p>}
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-brand-50 p-4" role="status" aria-live="polite">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand/25" />
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
              </span>
              <span>
                <span className="block font-display font-bold text-brand">{t.order.waitingTitle}</span>
                <span className="block text-sm text-ink-soft">{t.order.waitingText}</span>
              </span>
            </div>
            <button onClick={cancel} disabled={busy !== ""} className="text-sm font-semibold text-ink-soft hover:text-red-600 hover:underline">{t.order.cancel}</button>
          </>
        )}

        {status === "pending" && !isClient && (
          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-brand" /> {t.order.sellerAsk}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => decide(true)} disabled={busy !== ""} className="btn btn-green"><Check className="h-4 w-4" /> {busy === "y" ? t.my.saving : t.order.confirmBtn}</button>
              <button onClick={() => decide(false)} disabled={busy !== ""} className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /> {busy === "n" ? t.my.saving : t.order.rejectBtn}</button>
            </div>
          </div>
        )}

        {status === "confirmed" && (
          <>
            <Banner tone="green" icon={<Check className="h-7 w-7" />} title={t.order.successTitle} text={isClient && sawPending.current ? t.order.successText : undefined} />
            <Contact />
            {isClient && <Link href="/" className="btn btn-outline w-full">{t.order.goHome}</Link>}
          </>
        )}
        {status === "rejected" && <Banner tone="red" icon={<X className="h-7 w-7" />} title={t.order.rejectedTitle} text={isClient ? t.order.rejectedText : undefined} />}
        {status === "expired" && <Banner tone="gray" icon={<Clock className="h-7 w-7" />} title={t.order.expiredTitle} />}
        {status === "cancelled" && <Banner tone="gray" icon={<X className="h-7 w-7" />} title={t.order.cancelledTitle} />}

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
