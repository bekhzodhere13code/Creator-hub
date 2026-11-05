import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

const LINKS = [
  { href: "#platforma", label: "Platforma haqida" },
  { href: "#qanday", label: "Qanday ishlaydi" },
  { href: "#xizmatlar", label: "Xizmatlar" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-xs font-medium text-ink-soft md:flex" aria-label="Sahifa bo‘limlari">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink">{l.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/sign-in" variant="outline" className="px-3 py-2 text-xs">Kirish</ButtonLink>
          <ButtonLink href="/sign-up" className="px-3 py-2 text-xs">Ro‘yxatdan o‘tish</ButtonLink>
        </div>
      </div>
    </header>
  );
}
