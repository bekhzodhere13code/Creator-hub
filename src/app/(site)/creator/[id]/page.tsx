"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Instagram, MapPin, Send, Youtube } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Empty, ServiceCard } from "@/components/cards";
import { PortfolioGrid } from "@/components/portfolio";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { fullName } from "@/lib/utils";

export default function CreatorPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useT();
  const { me, data, profile, withOwner } = useStore();
  const p = profile(id);
  if (!p) return <Empty text={t.profile.notFound} />;
  const services = data.services.filter((s) => s.owner_id === id && s.status === "active").map(withOwner);
  const portfolio = data.portfolio.filter((x) => x.owner_id === id);
  const links = [
    { href: p.instagram, Icon: Instagram, label: "Instagram" },
    { href: p.telegram, Icon: Send, label: "Telegram" },
    { href: p.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((l) => l.href);

  return (
    <div className="space-y-8">
      <section className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar p={p} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">{fullName(p)}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(p.specialties ?? []).map((s) => (
              <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand">{t.specialty[s as "mobilograf" | "smm"] ?? s}</span>
            ))}
          </div>
          {p.work_area && <p className="mt-3 flex items-center gap-1.5 text-sm font-medium"><MapPin className="h-4 w-4 text-brand" /> {p.work_area}</p>}
          {p.bio && <p className="mt-3 max-w-xl whitespace-pre-line text-sm text-ink-soft">{p.bio}</p>}
          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map(({ href, Icon, label }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className="btn btn-outline !px-3 !py-2"><Icon className="h-4 w-4" /> {label}</a>
              ))}
            </div>
          )}
        </div>
        {me.id === p.id && <Link href="/profil" className="btn btn-primary self-start">{t.my.edit}</Link>}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold">{t.profile.services}</h2>
        {services.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((s) => <ServiceCard key={s.id} s={s} t={t} />)}</div> : <Empty text={t.lists.emptyServices} />}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold">{t.profile.portfolio}</h2>
        <PortfolioGrid items={portfolio} empty={t.profile.noPortfolio} />
      </section>
    </div>
  );
}
