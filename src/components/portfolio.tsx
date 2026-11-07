import Image from "next/image";
import { youtubeId, type PortfolioItem } from "@/lib/utils";

/** YouTube havolasi bo‘lsa — to‘g‘ridan-to‘g‘ri pleer (youtube-nocookie), bo‘lmasa rasm. */
export function PortfolioGrid({ items, empty, renderAction }: { items: PortfolioItem[]; empty: string; renderAction?: (id: string) => React.ReactNode }) {
  if (!items.length) return <div className="card border-dashed p-8 text-center text-sm text-ink-soft">{empty}</div>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it) => {
        const vid = youtubeId(it.youtube_url);
        return (
          <figure key={it.id} className="card overflow-hidden">
            <div className="relative aspect-video bg-slate-100">
              {vid ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${vid}`}
                  title={it.title}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : it.image_url ? (
                <Image src={it.image_url} alt={it.title} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
              ) : null}
            </div>
            <figcaption className="flex items-start justify-between gap-2 p-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{it.title}</span>
                {it.description && <span className="line-clamp-2 text-xs text-ink-soft">{it.description}</span>}
              </span>
              {renderAction?.(it.id)}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
