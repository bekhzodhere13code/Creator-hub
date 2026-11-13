"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useT } from "@/lib/i18n-client";

export function ThemeToggle() {
  const { t } = useT();
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* saqlash imkonsiz */ }
  };
  const label = `${t.extra.theme}: ${dark ? t.extra.light : t.extra.dark}`;
  return (
    <button onClick={toggle} aria-label={label} title={label} className="rounded-lg bg-slate-100 p-2 text-ink-soft transition-colors hover:text-ink">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
