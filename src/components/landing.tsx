"use client";
import Link from "next/link";
import { ArrowRight, Camera, TrendingUp } from "lucide-react";
import { useT } from "@/lib/i18n-client";

export function Landing() {
  const { t } = useT();
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-[#0A0A1F] p-6 text-white sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-pulse rounded-full bg-brand/50 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#FF6B6B]/25 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{t.home.badge}</span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl">{t.home.title}</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">{t.home.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-up" className="btn bg-white text-ink hover:bg-slate-100">{t.onboard.landingCta} <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/sign-in" className="btn border border-white/25 text-white hover:bg-white/10">{t.nav.signIn}</Link>
          </div>
        </div>
        <div className="relative mt-10 grid gap-3 sm:grid-cols-2">
          {[{ Icon: Camera, label: t.nav.mobilografs }, { Icon: TrendingUp, label: t.nav.smm }].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Icon className="h-5 w-5" /></span>
              <span className="font-display font-bold">{label}</span>
            </div>
          ))}
        </div>
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
