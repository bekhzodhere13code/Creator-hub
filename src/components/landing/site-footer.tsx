import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-[#0A0A1F] py-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs">Yopiq katalog</span>
        <h2 className="mt-4 max-w-md text-3xl font-bold">Mutaxassislar va portfoliolar tizimga kirganlar uchun</h2>
        <p className="mt-3 max-w-md text-sm text-slate-300">Ro‘yxatdan o‘ting yoki kiring. Shundan keyin mobilograf, SMM mutaxassislari va ularning ishlari ochiladi.</p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/sign-in" variant="light">Kirish</ButtonLink>
          <ButtonLink href="/sign-up">Ro‘yxatdan o‘tish</ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-ink-soft sm:px-6">
        <Logo />
        <p>© {new Date().getFullYear()} Creator Hub. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}
