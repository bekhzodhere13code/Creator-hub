"use client";
import { Camera, TrendingUp } from "lucide-react";
import { Hero } from "./hero";
import { Item, Stagger } from "./motion";
import { useT } from "@/lib/i18n-client";

export function Landing() {
  const { t } = useT();
  return (
    <div className="space-y-12">
      <Hero
        primary={{ href: "/sign-up", label: t.onboard.landingCta }}
        secondary={{ href: "/sign-in", label: t.nav.signIn }}
        tiles={[{ Icon: Camera, label: t.nav.mobilografs }, { Icon: TrendingUp, label: t.nav.smm }]}
      />
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
