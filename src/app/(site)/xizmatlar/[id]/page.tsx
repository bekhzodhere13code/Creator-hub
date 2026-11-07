"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Empty, catLabel } from "@/components/cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { formatPrice, fullName, gradientFor } from "@/lib/utils";

export default function ServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useT();
  const { me, data, withOwner, profile, createOrder } = useStore();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const raw = data.services.find((s) => s.id === id);
  if (!raw) return <Empty text={t.common.notFound} />;
  const service = withOwner(raw);
  const price = formatPrice(service.price);
  const own = service.owner_id === me.id;
  const hasClick = Boolean(profile(service.owner_id)?.has_click);

  const order = async () => {
    setError(""); setBusy(true);
    const r = await createOrder(service.id);
    if (r.ok) router.push(`/buyurtmalar/${r.id}`);
    else { setError(r.error); setBusy(false); }
  };

  return (
    <article className="mx-auto max-w-3xl">
      <div className="card overflow-hidden">
        <div className="relative aspect-[16/8]">
          {service.image_url ? (
            <Image src={service.image_url} alt={service.title} fill sizes="768px" className="object-cover" priority />
          ) : (
            <div className={`flex h-full items-end bg-gradient-to-br p-6 text-white ${gradientFor(service.id)}`}>
              <p className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">{service.title}</p>
            </div>
          )}
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand">{catLabel(t, service.category)}</span>
              {service.image_url && <h1 className="mt-2 text-2xl font-extrabold">{service.title}</h1>}
            </div>
            <p className="font-display text-2xl font-extrabold">{price ? `${price} ${t.common.sum}` : t.service.negotiable}</p>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{service.description}</p>
          {service.owner && (
            <Link href={`/creator/${service.owner.id}`} className="flex items-center gap-3 rounded-xl bg-surface p-3">
              <Avatar p={service.owner} size={40} />
              <span className="text-sm"><span className="block text-xs text-ink-soft">{t.service.by}</span><span className="font-semibold">{fullName(service.owner)}</span></span>
            </Link>
          )}
          {own ? (
            <p className="text-sm text-ink-soft">{t.service.own}</p>
          ) : !hasClick ? (
            <p className="text-sm text-amber-700">{t.service.noClick}</p>
          ) : (
            <div>
              <button onClick={order} disabled={busy} className="btn btn-primary w-full sm:w-auto">{busy ? t.common.loading : t.service.order}</button>
              {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
