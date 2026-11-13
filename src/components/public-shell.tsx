"use client";
import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LangSwitch } from "./lang-switch";
import { useT } from "@/lib/i18n-client";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo label={t.nav.home} />
          <div className="flex items-center gap-2">
            <LangSwitch />
            <ThemeToggle />
            <Link href="/aloqa" className="btn btn-ghost hidden !px-3 !py-2 sm:inline-flex">{t.extra.contactNav}</Link>
            <Link href="/sign-in" className="btn btn-ghost !px-3 !py-2">{t.nav.signIn}</Link>
            <Link href="/sign-up" className="btn btn-primary !py-2">{t.nav.signUp}</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export function Notice({ title, text, retry }: { title: string; text: string; retry?: string }) {
  return (
    <div className="mx-auto mt-24 max-w-md space-y-3 px-4 text-center">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="text-sm text-ink-soft">{text}</p>
      {retry && <a href="" className="btn btn-primary">{retry}</a>}
    </div>
  );
}
