"use client";
import Link from "next/link";
import { ArrowRight, Camera, Flame, TrendingUp } from "lucide-react";
import { CreatorCard, ServiceCard } from "./cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";

export function HomeView() {
  const { t } = useT();
  const { me, data, withOwner } = useStore();
  const services = data.services.filter((s) => s.status === "active").sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 6).map(withOwner);
  const top = data.services.filter((s) => s.status === "active" && (s.sold_count ?? 0) > 0).sort((a, b) => (b.sold_count ?? 0) - (a.sold_count ?? 0)).slice(0, 3).map(withOwner);
  const creators = data.profiles.filter((p) => p.id !== me.id && (p.specialties?.length ?? 0) > 0).slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl hero-gradient p-6 text-white sm:p-10">
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{t.home.badge}</span>
          <h1 className="mt-4 text-balance text-3xl font-extrabold leading-[1.05] sm:text-5xl">{me.account_type === "client" ? t.extra.clientHome : t.home.title}</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">{t.home.text}</p>
          <div className="mt-7">
            <Link href="/xizmatlar" className="btn hero-btn">{t.home.browse} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/mobilograflar" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Camera className="h-5 w-5" /></span>
            <span className="font-display font-bold">{t.nav.mobilografs}</span>
          </Link>
          <Link href="/smm-mutaxassislari" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><TrendingUp className="h-5 w-5" /></span>
            <span className="font-display font-bold">{t.nav.smm}</span>
          </Link>
        </div>
      </section>

      {top.length > 0 && (
        <section className="rounded-3xl bg-gradient-to-br from-brand-50 to-white p-4 ring-1 ring-brand/10 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><Flame className="h-5 w-5" /></span>
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">{t.extra.topSold}</h2>
              <p className="text-sm text-ink-soft">{t.extra.topSoldText}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{top.map((s) => <ServiceCard key={s.id} s={s} t={t} />)}</div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold sm:text-2xl">{t.home.latest}</h2>
          <Link href="/xizmatlar" className="text-sm font-semibold text-brand hover:underline">{t.home.seeAll}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((s) => <ServiceCard key={s.id} s={s} t={t} />)}</div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">{t.home.creators}</h2>
        <div className="grid gap-4 md:grid-cols-2">{creators.map((p) => <CreatorCard key={p.id} p={p} t={t} />)}</div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">{t.home.howTitle}</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {t.home.how.map((s, i) => (
            <li key={s.t} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-display text-base font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
