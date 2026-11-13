import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import { TgInit } from "@/components/tg-init";
import { LangProvider } from "@/lib/i18n-client";
import { isLang } from "@/lib/i18n";
import "./globals.css";

const body = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-body" });
const display = Syne({ subsets: ["latin", "latin-ext"], variable: "--font-display", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Creator Hub — mobilograf va SMM mutaxassislari platformasi", template: "%s · Creator Hub" },
  description:
    "Mobilograf va SMM mutaxassisini bir joyda toping: portfoliolarni ko‘ring, xizmatni tanlang va buyurtma bering.",
};

export const viewport: Viewport = { themeColor: "#3A14FF", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = (await cookies()).get("lang")?.value;
  const lang = isLang(c) ? c : "uz";
  return (
    <html lang={lang} suppressHydrationWarning className={`${body.variable} ${display.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}" }} /></head>
        <body>
          <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
          <LangProvider initial={lang}><TgInit />{children}</LangProvider>
        </body>
    </html>
  );
}
