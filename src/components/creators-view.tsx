"use client";
import { useState } from "react";
import { CreatorCard, Empty, PageHead, SearchBox } from "./cards";
import { Item, Stagger } from "./motion";
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
      <SearchBox value={q} onChange={setQ} placeholder={t.lists.search} clearLabel={t.nav.close} className="mb-5 max-w-sm" />
      {list.length ? <Stagger key={s} className="grid gap-4 md:grid-cols-2">{list.map((p) => <Item key={p.id}><CreatorCard p={p} t={t} /></Item>)}</Stagger> : <Empty text={t.lists.emptyCreators} />}
    </>
  );
}
