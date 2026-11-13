"use client";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-client";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div className={cn("inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold", className)} role="group" aria-label="Til / Язык / Language">
      {(["uz", "ru", "en"] as const).map((l) => (
        <button
          key={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn("rounded-md px-3 py-1.5 transition-colors", lang === l ? "bg-white text-brand shadow-sm" : "text-ink-soft hover:text-ink")}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
