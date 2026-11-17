"use client";
import { Wallet } from "lucide-react";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

/** Ichki balans: faqat sayt ichidagi pullik xizmatlar uchun (haqiqiy pul emas). */
export function WalletCard() {
  const { t } = useT();
  const { me } = useStore();
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand"><Wallet className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink-soft">{t.wallet.title}</p>
        <p className="font-display text-2xl font-extrabold">{formatPrice(me.balance ?? 0)} {t.wallet.sum}</p>
        <p className="text-xs text-ink-soft">{t.wallet.text}</p>
      </div>
    </div>
  );
}
