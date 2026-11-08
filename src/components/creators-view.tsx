"use client";
import { useState } from "react";
import { CreatorCard, Empty, PageHead } from "./cards";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { fullName, type Specialty } from "@/lib/utils";

export function CreatorsView({ specialty }: { specialty: Specialty }) {
  const { t } = useT();
  const { data } = useStore();
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = data.profiles.filter((p) => p.specialties?.includes(specialty) && (!s || `${fullName(p)} ${p.bio ?? ""}`.toLowerCase().includes(s)));
  const head = specialty === "mobilograf" ? [t.lists.mobilografsTitle, t.lists.mobilografsText] : [t.lists.smmTitle, t.lists.smmText];
  return (
    <>
      <PageHead title={head[0]} text={head[1]} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.extra.phSearch} className="field mb-5 max-w-sm" aria-label={t.lists.search} />
      {list.length ? <div className="grid gap-4 md:grid-cols-2">{list.map((p) => <CreatorCard key={p.id} p={p} t={t} />)}</div> : <Empty text={t.lists.emptyCreators} />}
    </>
  );
}
