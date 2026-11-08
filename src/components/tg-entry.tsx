"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { Logo } from "./logo";
import { getWebApp } from "./tg-init";
import { useT } from "@/lib/i18n-client";

type State = "loading" | "not_linked" | "error" | "browser";

/** Mini App kirish eshigi: Telegram orqali avtomatik kirish; hisob topilmasa saytga yo‘naltiradi. */
export function TgEntry() {
  const { t } = useT();
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [state, setState] = useState<State>("loading");
  const started = useRef(false);

  useEffect(() => {
    if (!authLoaded) return;
    if (isSignedIn) { router.replace("/"); return; }
    if (!isLoaded || started.current) return;
    // Telegram skripti yuklanishini biroz kutamiz
    let tries = 0;
    const timer = setInterval(async () => {
      const w = getWebApp();
      if (!w?.initData) {
        if (++tries > 20) { clearInterval(timer); setState("browser"); }
        return;
      }
      clearInterval(timer);
      started.current = true;
      try {
        const res = await fetch("/api/tg/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: w.initData }) });
        const j = (await res.json()) as { ok: boolean; token?: string; reason?: string };
        if (j.ok && j.token) {
          const r = await signIn!.create({ strategy: "ticket", ticket: j.token });
          if (r.status === "complete") { await setActive!({ session: r.createdSessionId }); router.replace("/"); return; }
          setState("error");
        } else setState(j.reason === "not_linked" ? "not_linked" : "error");
      } catch { setState("error"); }
    }, 150);
    return () => clearInterval(timer);
  }, [authLoaded, isSignedIn, isLoaded, signIn, setActive, router]);

  const openSite = () => {
    const url = `${location.origin}/sign-up`;
    const w = getWebApp();
    if (w) w.openLink(url); else location.href = url;
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 px-6 text-center">
      <Logo />
      {state === "loading" && (
        <div role="status" className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="h-6 w-6 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /> {t.extra.tgAppLoading}
        </div>
      )}
      {state === "not_linked" && (
        <>
          <h1 className="text-xl font-extrabold">{t.extra.tgAppTitle}</h1>
          <p className="text-sm text-ink-soft">{t.extra.tgAppNotLinked}</p>
          <button onClick={openSite} className="btn btn-primary w-full">{t.extra.tgAppOpenSite}</button>
        </>
      )}
      {state === "error" && (
        <>
          <p className="text-sm text-ink-soft">{t.onboard.errorText}</p>
          <button onClick={() => location.reload()} className="btn btn-primary w-full">{t.onboard.retry}</button>
        </>
      )}
      {state === "browser" && (
        <>
          <p className="text-sm text-ink-soft">{t.extra.tgAppBrowser}</p>
          <button onClick={() => router.replace("/sign-in")} className="btn btn-primary w-full">{t.nav.signIn}</button>
        </>
      )}
    </div>
  );
}
