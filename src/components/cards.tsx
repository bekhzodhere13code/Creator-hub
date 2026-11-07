import Image from "next/image";
import Link from "next/link";
import { Camera, Film, ImageIcon, Palette, PenLine, Sparkles, TrendingUp } from "lucide-react";
import { Avatar } from "./avatar";
import type { Dict } from "@/lib/i18n";
import { fullName, formatPrice, gradientFor, type Profile, type ServiceWithOwner } from "@/lib/utils";

const CAT_ICONS = { mobilografiya: Camera, foto: ImageIcon, smm: TrendingUp, kontent: PenLine, montaj: Film, dizayn: Palette, boshqa: Sparkles } as const;

export const catLabel = (t: Dict, c: string) => t.categories[c as keyof Dict["categories"]] ?? c;

/** Rasm bo‘lmasa ham bo‘sh emas: gradient + piktogramma + yirik tipografiya. */
export function ServiceCard({ s, t, href }: { s: ServiceWithOwner; t: Dict; href?: string }) {
  const Icon = CAT_ICONS[s.category as keyof typeof CAT_ICONS] ?? Sparkles;
  const price = formatPrice(s.price);
  return (
    <Link href={href ?? `/xizmatlar/${s.id}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-brand/10">
      <div className="relative aspect-[16/10] overflow-hidden">
        {s.image_url ? (
          <Image src={s.image_url} alt={s.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className={`flex h-full w-full flex-col justify-between bg-gradient-to-br p-4 text-white ${gradientFor(s.id)}`}>
            <Icon className="h-7 w-7 opacity-90" aria-hidden="true" />
            <p className="line-clamp-2 font-display text-xl font-extrabold leading-tight">{s.title}</p>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur">{catLabel(t, s.category)}</span>
        {s.status === "inactive" && <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white">{t.service.inactive}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {s.image_url && <h3 className="line-clamp-1 font-display text-base font-bold">{s.title}</h3>}
        <p className="line-clamp-2 text-sm text-ink-soft">{s.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {s.owner ? (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar p={s.owner} size={24} />
              <span className="truncate text-xs font-medium text-ink-soft">{fullName(s.owner)}</span>
            </span>
          ) : <span />}
          <span className="shrink-0 text-sm font-bold">{price ? `${price} ${t.common.sum}` : t.service.negotiable}</span>
        </div>
      </div>
    </Link>
  );
}

type CreatorLite = Pick<Profile, "id" | "first_name" | "last_name" | "specialties" | "bio" | "avatar_url">;

export function CreatorCard({ p, t }: { p: CreatorLite; t: Dict }) {
  return (
    <Link href={`/creator/${p.id}`} className="card flex gap-4 p-4 transition-shadow hover:shadow-lg hover:shadow-brand/10">
      <Avatar p={p} size={56} />
      <div className="min-w-0">
        <h3 className="truncate font-display text-base font-bold">{fullName(p)}</h3>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(p.specialties ?? []).map((sp) => (
            <span key={sp} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand">{t.specialty[sp as keyof Dict["specialty"]] ?? sp}</span>
          ))}
        </div>
        {p.bio && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{p.bio}</p>}
      </div>
    </Link>
  );
}

export function PageHead({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-ink-soft">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="card border-dashed p-10 text-center text-sm text-ink-soft">{text}</div>;
}
