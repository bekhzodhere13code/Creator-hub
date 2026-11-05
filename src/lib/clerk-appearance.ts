import type { Appearance } from "@clerk/types";

/** Clerk komponentlarini Creator Hub dizayniga moslash. */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#3A14FF",
    colorText: "#0B0B1E",
    colorTextSecondary: "#5B5B73",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    borderRadius: "0.6rem",
    fontFamily: "var(--font-body), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full rounded-2xl border border-slate-200/70 bg-white shadow-none p-6 sm:p-8",
    headerTitle: "font-display text-2xl font-bold",
    formButtonPrimary: "bg-brand hover:bg-brand-700 text-sm font-semibold normal-case shadow-none",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 shadow-none",
    formFieldInput: "border-slate-200 shadow-none",
    footerActionLink: "text-brand hover:text-brand-700 font-semibold",
    footer: "bg-transparent",
  },
};
