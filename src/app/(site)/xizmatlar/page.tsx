"use client";
import { useState } from "react";
import { Empty, PageHead, ServiceCard, catLabel } from "@/components/cards";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/utils";

export default function ServicesPage() {
  const { t } = useT();
  const { data, withOwner } = useStore();
  const [category, setCategory] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const services = data.services
    .filter((x) => x.status === "active" && (!category || x.category === category) && (!s || `${x.title} ${x.description}`.toLowerCase().includes(s)))
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .map(withOwner);
  const chip = (active: boolean) => cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", active ? "bg-ink text-white" : "bg-white text-ink-soft hover:text-ink");

  return (
    <>
      <PageHead title={t.lists.servicesTitle} text={t.lists.servicesText} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.extra.phSearch} className="field mb-4 max-w-sm" aria-label={t.lists.search} />
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <button onClick={() => setCategory(null)} className={chip(!category)}>{t.lists.allCategories}</button>
        {CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>{catLabel(t, c)}</button>)}
      </div>
      {services.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((x) => <ServiceCard key={x.id} s={x} t={t} />)}</div> : <Empty text={t.lists.emptyServices} />}
    </>
  );
}
