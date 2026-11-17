"use client";
import { useState } from "react";
import { Empty, PageHead, ServiceCard } from "./cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { byFeaturedThenNew, fullName, serviceSpecialties, type Specialty } from "@/lib/utils";

/** Mobilograflar / SMM bo‘limi: foydalanuvchilar emas, shu yo‘nalishdagi faol XIZMATLAR ko‘rinadi. */
export function CreatorsView({ specialty }: { specialty: Specialty }) {
  const { t } = useT();
  const { data, withOwner, profile } = useStore();
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = data.services
    .filter((x) => x.status === "active" && serviceSpecialties(x.category, profile(x.owner_id)?.specialties).includes(specialty))
    .map(withOwner)
    .filter((x) => !s || `${x.title} ${x.description} ${fullName(x.owner)}`.toLowerCase().includes(s))
    .sort(byFeaturedThenNew);
  const head = specialty === "mobilograf" ? [t.lists.mobilografsTitle, t.lists.mobilografsText] : [t.lists.smmTitle, t.lists.smmText];
  return (
    <>
      <PageHead title={head[0]} text={head[1]} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.extra.phSearch} className="field mb-5 max-w-sm" aria-label={t.lists.search} />
      {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((x) => <ServiceCard key={x.id} s={x} t={t} />)}</div> : <Empty text={t.lists.emptyServices} />}
    </>
  );
}
