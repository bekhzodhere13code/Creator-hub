"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Copy, PackageCheck, Send, X } from "lucide-react";
import { Empty } from "./cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { formatPrice, fullName, normalizeUrl, type Order } from "@/lib/utils";

type Busy = "" | "y" | "n" | "c" | "p" | "d" | "fp" | "fy" | "fn";

/** Avans → ish → yakuniy to‘lov: hozirgi bosqich (0, 1, 2) va tugaganmi. */
function stageOf(status: Order["status"]): { current: number; done: boolean } | null {
  switch (status) {
    case "new": case "pending": return { current: 0, done: false };
    case "confirmed": return { current: 1, done: false };
    case "delivered": case "final_pending": return { current: 2, done: false };
    case "completed": return { current: 2, done: true };
    default: return null;
  }
}

export function OrderView({ id }: { id: string }) {
  const { t } = useT();
  const { me, data, profile, pollOrder, decideOrder, cancelOrder, markPaid, markDelivered, markFinalPaid, decideFinal, refresh } = useStore();
  const order = data.orders.find((o) => o.id === id);
  const [busy, setBusy] = useState<Busy>("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const status = order?.status;

  // Kutish bosqichlarida har 4 soniyada holatni tekshiramiz; o‘zgarsa sahifa ma’lumoti yangilanadi.
  useEffect(() => {
    if (!status || !["pending", "confirmed", "delivered", "final_pending"].includes(status)) return;
    let alive = true;
    const tick = async () => {
      const o = await pollOrder(id);
      if (alive && o && o.status !== status) refresh();
    };
    const timer = setInterval(tick, 4000);
    return () => { alive = false; clearInterval(timer); };
  }, [status, id, pollOrder, refresh]);

  if (!order || !status) return <Empty text={t.order.notFound} />;

  const isClient = order.client_id === me.id;
  const owner = profile(order.owner_id);
  const client = profile(order.client_id);
  const other = isClient ? owner : client;
  const price = formatPrice(order.price);
  const tgUrl = normalizeUrl(other?.telegram, "telegram");
  const hasFinal = order.deposit_percent < 100;
  const depositStr = formatPrice(order.deposit_amount ?? order.price);
  const finalStr = formatPrice(order.final_amount);
  const stage = stageOf(status);

  const copy = async () => {
    try { await navigator.clipboard.writeText((order.owner_click ?? "").replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard yo‘q */ }
  };
  const run = async (b: Busy, fn: () => Promise<{ ok: boolean } & { error?: string }>) => {
    setBusy(b); setError("");
    const r = await fn();
    if (!r.ok) setError(r.error ?? t.common.error);
    setBusy("");
  };
  const decide = (yes: boolean) => run(yes ? "y" : "n", () => decideOrder(order.id, yes));
  const paid = () => run("p", () => markPaid(order.id));
  const deliver = () => { if (confirm(t.pay.deliverConfirm)) void run("d", () => markDelivered(order.id)); };
  const finalPaid = () => run("fp", () => markFinalPaid(order.id));
  const decideFin = (yes: boolean) => run(yes ? "fy" : "fn", () => decideFinal(order.id, yes));
  const cancel = async () => {
    if (!confirm(t.order.confirmCancel)) return;
    await run("c", () => cancelOrder(order.id));
  };

  const Contact = () => (
    <div className="space-y-2 rounded-xl bg-surface p-4">
      <p className="text-sm font-semibold">{t.order.contact}: {fullName(other)}</p>
      {tgUrl ? <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full sm:w-auto"><Send className="h-4 w-4" /> {t.order.openTelegram}</a> : <p className="text-sm text-ink-soft">{t.order.noTelegram}</p>}
    </div>
  );

  const Banner = ({ tone, icon, title, text }: { tone: "green" | "red" | "gray" | "amber"; icon: React.ReactNode; title: string; text?: string }) => (
    <div className={`animate-[pop_.35s_ease-out] space-y-1 rounded-2xl p-5 text-center ${tone === "green" ? "bg-emerald-50 text-emerald-800" : tone === "red" ? "bg-red-50 text-red-800" : tone === "amber" ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-ink"}`}>
      <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white ${tone === "green" ? "bg-emerald-600" : tone === "red" ? "bg-red-600" : tone === "amber" ? "bg-amber-500" : "bg-slate-500"}`}>{icon}</span>
      <p className="pt-2 font-display text-xl font-extrabold">{title}</p>
      {text && <p className="text-sm opacity-80">{text}</p>}
    </div>
  );

  /** Click raqami + to‘lanadigan summa (avans yoki qolgan summa). */
  const PayBox = ({ step, amount, children }: { step: string; amount: string | null; children?: React.ReactNode }) => (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <p className="text-sm text-ink-soft">{step}</p>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3">
        <span className="break-all font-display text-xl font-extrabold tracking-wide">{order.owner_click}</span>
        <button onClick={copy} className="btn btn-outline !px-3 !py-2 shrink-0"><Copy className="h-4 w-4" /> {copied ? t.order.copied : t.order.copy}</button>
      </div>
      {amount && <p className="text-sm">{t.pay.amountNow}: <b>{amount} {t.common.sum}</b></p>}
      {children}
    </div>
  );

  const Waiting = ({ title, text }: { title: string; text: string }) => (
    <div className="flex items-center gap-4 rounded-2xl bg-brand-50 p-4" role="status" aria-live="polite">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/25" />
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
      </span>
      <span>
        <span className="block font-display font-bold text-brand">{title}</span>
        <span className="block text-sm text-ink-soft">{text}</span>
      </span>
    </div>
  );

  const Decision = ({ question, onYes, onNo, yesBusy, noBusy }: { question: string; onYes: () => void; onNo: () => void; yesBusy: boolean; noBusy: boolean }) => (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-brand" /> {question}</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onYes} disabled={busy !== ""} className="btn btn-green"><Check className="h-4 w-4" /> {yesBusy ? t.my.saving : t.order.confirmBtn}</button>
        <button onClick={onNo} disabled={busy !== ""} className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /> {noBusy ? t.my.saving : t.order.rejectBtn}</button>
      </div>
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

        {stage && (
          <ol className="grid grid-cols-3 gap-2" aria-label={t.pay.stepsTitle}>
            {[t.pay.st1, t.pay.st2, t.pay.st3].map((label, i) => {
              const done = stage.done || i < stage.current;
              const active = !stage.done && i === stage.current;
              return (
                <li key={label} className="space-y-1.5">
                  <span className={cn("block h-1.5 rounded-full", done ? "bg-emerald-500" : active ? "bg-brand" : "bg-slate-200")} />
                  <span className={cn("block text-xs font-semibold", done ? "text-emerald-700" : active ? "text-brand" : "text-ink-soft")}>{label}</span>
                </li>
              );
            })}
          </ol>
        )}

        {/* To‘lov shartlari */}
        {price && status !== "rejected" && status !== "cancelled" && status !== "expired" && (
          <div className="space-y-1 rounded-xl bg-surface p-3 text-sm">
            <p className="flex justify-between gap-3"><span className="text-ink-soft">{hasFinal ? `${t.pay.depositNow} · ${order.deposit_percent}%` : t.pay.fullNow}</span><b>{depositStr} {t.common.sum}</b></p>
            {hasFinal && <p className="flex justify-between gap-3"><span className="text-ink-soft">{t.pay.finalLater} · {100 - order.deposit_percent}%</span><b>{finalStr} {t.common.sum}</b></p>}
          </div>
        )}

        {/* 1-bosqich: avans */}
        {status === "new" && isClient && (
          <>
            <PayBox step={hasFinal ? t.pay.stepDeposit : t.order.step1} amount={depositStr}>
              <p className="text-xs text-ink-soft">{t.order.newHint}</p>
            </PayBox>
            <button onClick={paid} disabled={busy !== ""} className="btn btn-green w-full"><Check className="h-4 w-4" /> {busy === "p" ? t.common.loading : t.order.iPaid}</button>
            <button onClick={cancel} disabled={busy !== ""} className="text-sm font-semibold text-ink-soft hover:text-red-600 hover:underline">{t.order.cancel}</button>
          </>
        )}
        {status === "new" && !isClient && <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"><Clock className="h-4 w-4" /> {t.order.sellerNew}</p>}

        {status === "pending" && isClient && (
          <>
            <PayBox step={hasFinal ? t.pay.stepDeposit : t.order.step1} amount={depositStr} />
            <Waiting title={t.order.waitingTitle} text={t.order.waitingText} />
          </>
        )}
        {status === "pending" && !isClient && <Decision question={t.order.sellerAsk} onYes={() => decide(true)} onNo={() => decide(false)} yesBusy={busy === "y"} noBusy={busy === "n"} />}

        {/* 2-bosqich: ish jarayoni */}
        {status === "confirmed" && (
          <>
            <Banner tone="green" icon={<Check className="h-7 w-7" />} title={t.pay.inProgressTitle} text={isClient ? t.pay.inProgressClient : t.pay.inProgressSeller} />
            <Contact />
            {!isClient && (
              <button onClick={deliver} disabled={busy !== ""} className="btn btn-primary w-full"><PackageCheck className="h-4 w-4" /> {busy === "d" ? t.my.saving : t.pay.deliverBtn}</button>
            )}
          </>
        )}

        {/* 3-bosqich: yakuniy to‘lov */}
        {status === "delivered" && isClient && (
          <>
            <Banner tone="amber" icon={<PackageCheck className="h-7 w-7" />} title={t.pay.deliveredClientTitle} text={t.pay.deliveredClientText} />
            <PayBox step={t.pay.stepFinal} amount={finalStr} />
            <button onClick={finalPaid} disabled={busy !== ""} className="btn btn-green w-full"><Check className="h-4 w-4" /> {busy === "fp" ? t.common.loading : t.pay.finalPaidBtn}</button>
            <Contact />
          </>
        )}
        {status === "delivered" && !isClient && (
          <>
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"><Clock className="h-4 w-4" /> {t.pay.deliveredSeller}</p>
            <Contact />
          </>
        )}
        {status === "final_pending" && isClient && (
          <>
            <PayBox step={t.pay.stepFinal} amount={finalStr} />
            <Waiting title={t.pay.finalWaitingTitle} text={t.pay.finalWaitingText} />
          </>
        )}
        {status === "final_pending" && !isClient && <Decision question={t.pay.finalAsk} onYes={() => decideFin(true)} onNo={() => decideFin(false)} yesBusy={busy === "fy"} noBusy={busy === "fn"} />}

        {status === "completed" && (
          <>
            <Banner tone="green" icon={<Check className="h-7 w-7" />} title={t.pay.completedTitle} text={t.pay.completedText} />
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
