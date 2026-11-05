import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { uzLocalization } from "@/lib/clerk-uz";
import "./globals.css";

const body = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-body" });
const display = Syne({ subsets: ["latin", "latin-ext"], variable: "--font-display", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Creator Hub — mobilograf va SMM mutaxassislari platformasi", template: "%s · Creator Hub" },
  description:
    "Mobilograf va SMM mutaxassisini bir joyda toping: portfoliolarni ko‘ring, xizmatni tanlang va buyurtma bering.",
};

export const viewport: Viewport = { themeColor: "#2A00FF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance} localization={uzLocalization}>
      <html lang="uz" className={`${body.variable} ${display.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
