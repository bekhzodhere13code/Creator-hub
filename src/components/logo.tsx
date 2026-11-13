import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#2A00FF" />
      <path d="M25 19.5v25a2 2 0 0 0 3 1.7l21-12.5a2 2 0 0 0 0-3.4l-21-12.5a2 2 0 0 0-3 1.7z" fill="#fff" />
    </svg>
  );
}

/** Bosilganda Bosh sahifaga (Home) qaytaradi — alohida "Home" tugmasi yo‘q. */
export function Logo({ dark = false, className, label = "Creator Hub" }: { dark?: boolean; className?: string; label?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={label}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className={cn("font-display text-xl font-bold tracking-tight", dark ? "text-white" : "text-ink")}>Creator Hub</span>
    </Link>
  );
}
