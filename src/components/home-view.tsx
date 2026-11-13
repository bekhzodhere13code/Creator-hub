"use client";
import Link from "next/link";
import { Camera, LayoutGrid, TrendingUp } from "lucide-react";
import { CAT_ICONS, CreatorCard, ServiceCard, catLabel } from "./cards";
import { Hero } from "./hero";
import { Item, Stagger } from "./motion";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/utils";

export function HomeView() {
  const { t } = useT();
  const { me, data, withOwner } = useStore();
  const active = data.services.filter((s) => s.status === "active");
  const services = [...active].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 6).map(withOwner);
  const creators = data.profiles.filter((p) => p.id !== me.id && (p.specialties?.length ?? 0) > 0).slice(0, 4);
  const countOf = (sp: string) => data.profiles.filter((p) => p.specialties?.includes(sp)).length;

  return (
    <div className="space-y-12">
      <Hero
        primary={{ href: "/xizmatlar", label: t.home.browse }}
        tiles={[
          { href: "/mobilograflar", label: t.nav.mobilografs, Icon: Camera, count: countOf("mobilograf") },
          { href: "/smm-mutaxassislari", label: t.nav.smm, Icon: TrendingUp, count: countOf("smm") },
          { href: "/xizmatlar", label: t.nav.allServices, Icon: LayoutGrid, count: active.length },
        ]}
      />

      <div className="no-scrollbar -mx-4 -mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICONS[c];
          return (
            <Link key={c} href={`/xizmatlar?c=${c}`} className="card card-hover inline-flex shrink-0 items-center gap-2 !rounded-full px-4 py-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-brand" aria-hidden="true" />{catLabel(t, c)}
            </Link>
          );
        })}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold sm:text-2xl">{t.home.latest}</h2>
          <Link href="/xizmatlar" className="text-sm font-semibold text-brand hover:underline">{t.home.seeAll}</Link>
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((s) => <Item key={s.id}><ServiceCard s={s} t={t} /></Item>)}</Stagger>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">{t.home.creators}</h2>
        <Stagger className="grid gap-4 md:grid-cols-2">{creators.map((p) => <Item key={p.id}><CreatorCard p={p} t={t} /></Item>)}</Stagger>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">{t.home.howTitle}</h2>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {t.home.how.map((s, i) => (
            <Item key={s.t}>
              <div className="card card-hover relative h-full overflow-hidden p-5">
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-extrabold text-brand/[0.07]" aria-hidden="true">{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-md shadow-brand/30">{i + 1}</span>
                <h3 className="mt-3 font-display text-base font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-ink-soft">{s.d}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
