"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DICTS, isLang, type Dict, type Lang } from "./i18n";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const C = createContext<Ctx>({ lang: "uz", t: DICTS.uz, setLang: () => {} });

/** Til cookie’da saqlanadi (serverda ham o‘qiladi), shuning uchun sahifa yangilanganda miltillamaydi. */
export function LangProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, set] = useState<Lang>(initial);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    set(l);
    try { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; } catch { /* cookie yo‘q */ }
  }, []);
  return <C.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</C.Provider>;
}

export const useT = () => useContext(C);
export { isLang };
