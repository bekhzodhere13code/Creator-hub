import { cn } from "@/lib/cn";
import { ROLE_LABEL, type AppRole } from "@/lib/roles";

const BADGE: Record<AppRole, string> = { mobilograf: "bg-peach", smm: "bg-sky", mijoz: "bg-mint" };

export function DashboardHeader({ name, role, subtitle }: { name: string; role: AppRole; subtitle: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Xush kelibsiz, {name.split(" ")[0]}!</h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      </div>
      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", BADGE[role])}>{ROLE_LABEL[role]}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-start gap-1 p-5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm text-ink-soft">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
