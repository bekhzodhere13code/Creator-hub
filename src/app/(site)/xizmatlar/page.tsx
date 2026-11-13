"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CAT_ICONS, Empty, PageHead, SearchBox, ServiceCard, catLabel } from "@/components/cards";
import { Item, Stagger } from "@/components/motion";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/utils";

export default function ServicesPage() {
  const { t } = useT();
  const { data, withOwner } = useStore();
  const initial = useSearchParams().get("c") ?? "";
  const [category, setCategory] = useState<string | null>((CATEGORIES as readonly string[]).includes(initial) ? initial : null);
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const services = data.services
    .filter((x) => x.status === "active" && (!category || x.category === category) && (!s || `${x.title} ${x.description}`.toLowerCase().includes(s)))
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .map(withOwner);
  const chip = (active: boolean) => cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors", active ? "border-ink bg-ink text-white shadow-md" : "border-slate-200/70 bg-white text-ink-soft hover:border-brand/30 hover:text-ink");

  return (
    <>
      <PageHead title={t.lists.servicesTitle} text={t.lists.servicesText} />
      <SearchBox value={q} onChange={setQ} placeholder={t.lists.search} clearLabel={t.nav.close} className="mb-4 max-w-sm" />
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <button onClick={() => setCategory(null)} className={chip(!category)}>{t.lists.allCategories}</button>
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICONS[c];
          return <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}><Icon className="h-4 w-4" aria-hidden="true" />{catLabel(t, c)}</button>;
        })}
      </div>
      {services.length ? (
        <Stagger key={`${category}-${s}`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((x) => <Item key={x.id}><ServiceCard s={x} t={t} /></Item>)}
        </Stagger>
      ) : <Empty text={t.lists.emptyServices} />}
    </>
  );
}
