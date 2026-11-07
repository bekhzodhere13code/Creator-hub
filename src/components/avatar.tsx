import Image from "next/image";
import { cn } from "@/lib/cn";
import { gradientFor, initials } from "@/lib/utils";

type P = { id: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null };

/** Rasm bo‘lsa — rasm, bo‘lmasa ism bosh harflaridan Initial Avatar. */
export function Avatar({ p, size = 40, className }: { p: P; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.38) };
  if (p.avatar_url) {
    return (
      <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-slate-100", className)} style={style}>
        <Image src={p.avatar_url} alt="" fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-white", gradientFor(p.id), className)}
    >
      {initials(p)}
    </span>
  );
}
