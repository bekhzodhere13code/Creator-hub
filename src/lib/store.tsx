"use client";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useT } from "./i18n-client";
import type { Order, PortfolioItem, Profile, Service, ServiceWithOwner } from "./utils";
import {
  addPortfolioAction, cancelOrderAction, createOrderAction, decideOrderAction, deletePortfolioAction,
  deleteServiceAction, saveProfileAction, saveServiceAction, saveSocialsAction, getOrderAction,
} from "@/server/actions";

export type AppSnapshot = { me: Profile; profiles: Profile[]; services: Service[]; portfolio: PortfolioItem[]; orders: Order[] };
type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

type ProfileInput = Parameters<typeof saveProfileAction>[0];
type ServiceInput = Parameters<typeof saveServiceAction>[0];
type PortfolioInput = Parameters<typeof addPortfolioAction>[0];

type Store = {
  me: Profile;
  data: Omit<AppSnapshot, "me">;
  profile: (id: string | null | undefined) => Profile | null;
  withOwner: (s: Service) => ServiceWithOwner;
  refresh: () => void;
  saveProfile: (p: ProfileInput) => Promise<Res>;
  saveSocials: (p: { instagram: string | null; telegram: string | null; youtube: string | null }) => Promise<Res>;
  saveService: (s: ServiceInput) => Promise<Res>;
  deleteService: (id: string) => Promise<Res>;
  addPortfolio: (p: PortfolioInput) => Promise<Res>;
  deletePortfolio: (id: string) => Promise<Res>;
  createOrder: (serviceId: string) => Promise<Res<{ id: string; notified: boolean }>>;
  decideOrder: (id: string, yes: boolean) => Promise<Res<{ status?: string }>>;
  cancelOrder: (id: string) => Promise<Res>;
  pollOrder: (id: string) => Promise<Order | null>;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ snapshot, children }: { snapshot: AppSnapshot; children: React.ReactNode }) {
  const { t } = useT();
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);

  // Boshqa foydalanuvchilarning yangi xizmatlari ko‘rinishi uchun: oynaga qaytganda va har 60 soniyada yangilash.
  useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") router.refresh(); };
    const id = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [router]);

  const store = useMemo<Store>(() => {
    const { me, ...data } = snapshot;
    const byId = new Map(data.profiles.map((p) => [p.id, p]));
    const profile = (id: string | null | undefined) => (id ? (byId.get(id) ?? null) : null);
    const withOwner = (s: Service): ServiceWithOwner => {
      const o = profile(s.owner_id);
      return { ...s, owner: o ? { id: o.id, first_name: o.first_name, last_name: o.last_name, avatar_url: o.avatar_url } : null };
    };
    const mut = <A extends unknown[], R extends { ok: boolean }>(fn: (...a: A) => Promise<R>) =>
      async (...a: A): Promise<R> => {
        const r = await fn(...a);
        if (r.ok) router.refresh();
        return r;
      };
    const orderErr: Record<string, string> = { notFound: t.common.notFound, own: t.service.own, noClick: t.service.noClick, profile: t.common.error, tooMany: t.common.error, failed: t.common.error };
    return {
      me, data, profile, withOwner, refresh,
      saveProfile: mut(saveProfileAction),
      saveSocials: mut(saveSocialsAction),
      saveService: mut(saveServiceAction),
      deleteService: mut(deleteServiceAction),
      addPortfolio: mut(addPortfolioAction),
      deletePortfolio: mut(deletePortfolioAction),
      createOrder: async (id) => {
        const r = await createOrderAction(id);
        if (r.ok) { router.refresh(); return r; }
        return { ok: false, error: orderErr[r.code] ?? t.common.error };
      },
      decideOrder: async (id, yes) => {
        const r = await decideOrderAction(id, yes);
        router.refresh();
        return r.ok ? { ok: true, status: r.status } : { ok: false, error: r.error === "already" ? t.order.sConfirmed : r.error === "expired" ? t.order.sExpired : t.common.error };
      },
      cancelOrder: mut(cancelOrderAction),
      pollOrder: (id) => getOrderAction(id),
    };
  }, [snapshot, router, refresh, t]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider yo‘q");
  return s;
}
