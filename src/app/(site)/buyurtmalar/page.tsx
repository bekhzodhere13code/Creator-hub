"use client";
import Link from "next/link";
import { Empty, PageHead } from "@/components/cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { formatPrice, fullName, type Order } from "@/lib/utils";

export default function OrdersPage() {
  const { t } = useT();
  const { me, data, profile } = useStore();
  const asOwner = data.orders.filter((o) => o.owner_id === me.id);
  const asClient = data.orders.filter((o) => o.client_id === me.id);

  const Row = ({ o, other }: { o: Order; other: string }) => {
    const price = formatPrice(o.price);
    const STATE = {
      pending: [o.owner_id === me.id ? t.order.pendingBadge : t.order.sPending, "bg-amber-50 text-amber-800"],
      confirmed: [t.order.sConfirmed, "bg-emerald-50 text-emerald-700"],
      rejected: [t.order.sRejected, "bg-red-50 text-red-700"],
      expired: [t.order.sExpired, "bg-slate-100 text-ink-soft"],
      cancelled: [t.order.sCancelled, "bg-slate-100 text-ink-soft"],
    } as const;
    const state = STATE[o.status];
    return (
      <Link href={`/buyurtmalar/${o.id}`} className="card flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-lg hover:shadow-brand/10">
        <span className="min-w-0">
          <span className="block truncate font-display font-bold">{o.service_title}</span>
          <span className="block truncate text-xs text-ink-soft">{other}{price ? ` · ${price} ${t.common.sum}` : ""}</span>
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${state[1]}`}>{state[0]}</span>
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHead title={t.order.title} />
      {!asClient.length && !asOwner.length && <Empty text={t.order.empty} />}
      {asOwner.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">{t.order.asOwner}</h2>
          {asOwner.map((o) => <Row key={o.id} o={o} other={`${t.order.client}: ${fullName(profile(o.client_id))}`} />)}
        </section>
      )}
      {asClient.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">{t.order.asClient}</h2>
          {asClient.map((o) => <Row key={o.id} o={o} other={`${t.order.creator}: ${fullName(profile(o.owner_id))}`} />)}
        </section>
      )}
    </div>
  );
}
