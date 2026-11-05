import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({ href = "/", dark = false, className }: { href?: string; dark?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label="Creator Hub bosh sahifa">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
        <Play className="h-3.5 w-3.5 fill-current" />
      </span>
      <span className={cn("font-display text-base font-bold", dark ? "text-white" : "text-ink")}>Creator Hub</span>
    </Link>
  );
}
