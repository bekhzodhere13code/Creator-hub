"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-client";

export type HeroTile = { label: string; Icon: LucideIcon; href?: string; count?: number };
type Cta = { href: string; label: string };

function Tile({ label, Icon, href, count }: HeroTile) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1 truncate font-display font-bold">{label}</span>
      {count != null && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-sm font-bold tabular-nums">{count}</span>}
      {href && <ArrowRight className="h-4 w-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
    </>
  );
  const cls = "group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition-colors";
  return href ? <Link href={href} className={cn(cls, "hover:bg-white/15")}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export function Hero({ primary, secondary, tiles }: { primary: Cta; secondary?: Cta; tiles: HeroTile[] }) {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden hero-surface rounded-3xl bg-[#0A0A1F] p-6 text-white shadow-2xl shadow-brand/20 sm:p-12">
      <div className="bg-grid dark:hidden pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="animate-float dark:hidden pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/60 blur-3xl" aria-hidden="true" />
      <div className="dark:hidden pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#FF6B6B]/25 blur-3xl" aria-hidden="true" />
      <motion.div className="relative max-w-2xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-[#FFB38A]" aria-hidden="true" /> {t.home.badge}
        </span>
        <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl">{t.home.title}</h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">{t.home.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={primary.href} className="btn hero-btn bg-white text-ink shadow-lg shadow-black/20 hover:bg-slate-100">{primary.label} <ArrowRight className="h-4 w-4" /></Link>
          {secondary && <Link href={secondary.href} className="btn border border-white/25 text-white hover:bg-white/10">{secondary.label}</Link>}
        </div>
      </motion.div>
      <div className={cn("relative mt-10 grid gap-3", tiles.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {tiles.map((x) => <Tile key={x.label} {...x} />)}
      </div>
    </section>
  );
}
