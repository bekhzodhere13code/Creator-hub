"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Briefcase, Camera, Home, Image as ImageIcon, LogOut, Menu, Receipt, TrendingUp, User, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import type { NavItem } from "@/lib/nav";

const ICONS = { home: Home, camera: Camera, trending: TrendingUp, image: ImageIcon, briefcase: Briefcase, receipt: Receipt, user: User };

export function AppShell({
  nav,
  name,
  roleLabel,
  children,
}: {
  nav: NavItem[];
  name: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col bg-white p-3">
      <div className="flex items-center justify-between px-2 py-2">
        <Logo href="/dashboard" />
        <button className="rounded-lg p-1 lg:hidden" onClick={() => setOpen(false)} aria-label="Menyuni yopish">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-4 flex-1 space-y-1" aria-label="Asosiy menyu">
        {nav.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Home;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand" : "text-ink-soft hover:bg-slate-50 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold">{name}</span>
            <span className="block truncate text-xs text-ink-soft">{roleLabel}</span>
          </span>
        </div>
        <SignOutButton redirectUrl="/">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50 hover:text-ink">
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-slate-200/70 lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-3 lg:hidden">
        <Logo href="/dashboard" />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2" aria-label="Menyuni ochish">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl">{sidebar}</div>
        </div>
      )}

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
