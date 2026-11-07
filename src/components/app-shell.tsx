"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useClerk } from "@clerk/nextjs";
import { Briefcase, Camera, LayoutGrid, LogOut, Menu, Receipt, TrendingUp, User, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";
import { Logo } from "./logo";
import { Avatar } from "./avatar";
import { LangSwitch } from "./lang-switch";
import { Onboarding } from "./onboarding";
import { fullName } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const { me: user, data } = useStore();
  const { signOut } = useClerk();
  const pendingIn = data.orders.filter((o) => o.owner_id === user.id && o.status === "pending").length;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const main = [
    { href: "/mobilograflar", label: t.nav.mobilografs, short: t.nav.mobilografs, Icon: Camera },
    { href: "/smm-mutaxassislari", label: t.nav.smm, short: "SMM", Icon: TrendingUp },
    { href: "/xizmatlar", label: t.nav.allServices, short: t.nav.allServices.split(" ").pop()!, Icon: LayoutGrid },
    { href: "/mening-xizmatlarim", label: t.nav.myServices, short: t.nav.myServices.split(" ").pop()!, Icon: Briefcase },
    { href: "/profil", label: t.nav.profile, short: t.nav.profile, Icon: User },
  ];
  const all = [...main.slice(0, 4), { href: "/buyurtmalar", label: t.nav.orders, short: t.nav.orders, Icon: Receipt }, main[4]];
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1" aria-label={t.nav.menu}>
      {all.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors", isActive(href) ? "bg-brand-50 text-brand" : "text-ink-soft hover:bg-slate-50 hover:text-ink")}
        >
          <Icon className="h-[18px] w-[18px]" /> <span className="flex-1">{label}</span>
          {href === "/buyurtmalar" && pendingIn > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">{pendingIn}</span>}
        </Link>
      ))}
    </nav>
  );

  const Account = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-2">
      <Link href="/profil" onClick={onNavigate} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
        <Avatar p={user} size={32} />
        <span className="truncate text-sm font-semibold">{fullName(user)}</span>
      </Link>
      <button onClick={() => signOut({ redirectUrl: "/" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-slate-50 hover:text-ink">
        <LogOut className="h-4 w-4" /> {t.nav.signOut}
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-slate-200/70 bg-white p-4 lg:flex">
        <Logo label={t.nav.home} className="px-2 pt-1" />
        <div className="flex-1 overflow-y-auto"><NavLinks /></div>
        <LangSwitch className="self-start" />
        <Account />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200/70 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
        <Logo label={t.nav.home} />
        <div className="flex items-center gap-2">
          <LangSwitch />
          <button onClick={() => setOpen(true)} className="relative rounded-lg p-2 hover:bg-slate-100" aria-label={t.nav.menu}>
            <Menu className="h-5 w-5" />
            {pendingIn > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
            <motion.div className="absolute inset-0 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="absolute inset-y-0 right-0 flex w-80 max-w-[88%] flex-col gap-5 bg-white p-4 shadow-2xl"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.22 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">{t.nav.menu}</span>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label={t.nav.close}><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto"><NavLinks onNavigate={() => setOpen(false)} /></div>
              <Account onNavigate={() => setOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Onboarding />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200/70 bg-white/95 backdrop-blur lg:hidden" aria-label={t.nav.menu}>
        {main.map(({ href, short, Icon }) => (
          <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-semibold", isActive(href) ? "text-brand" : "text-ink-soft")}>
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate">{short}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
