"use client";
import { useEffect } from "react";

type WebApp = { ready: () => void; expand: () => void; setHeaderColor?: (c: string) => void; setBackgroundColor?: (c: string) => void; initData: string; openLink: (url: string) => void };
declare global { interface Window { Telegram?: { WebApp?: WebApp } } }

export const getWebApp = () => (typeof window === "undefined" ? undefined : window.Telegram?.WebApp);

/** Mini App ichida bo‘lsak: to‘liq ekran va rang. Oddiy brauzerda hech narsa qilmaydi. */
export function TgInit() {
  useEffect(() => {
    const w = getWebApp();
    if (!w?.initData) return;
    w.ready(); w.expand();
    try { w.setHeaderColor?.("#FFFFFF"); w.setBackgroundColor?.("#FFFFFF"); } catch { /* eski versiya */ }
  }, []);
  return null;
}
