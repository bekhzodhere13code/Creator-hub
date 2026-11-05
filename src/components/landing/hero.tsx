import { ArrowRight, Play } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand">
            Mobilograflar va SMM mutaxassislari platformasi
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Mobilograf va SMM mutaxassisini bir joyda toping
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            Portfoliolarni ko‘ring, xizmatni tanlang va buyurtmani sayt ichida yuboring. Mutaxassislar esa ishlarini joylab, mijozlardan buyurtma oladi.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up">Ro‘yxatdan o‘tish <ArrowRight className="h-4 w-4" /></ButtonLink>
            <ButtonLink href="#qanday" variant="outline">Qanday ishlaydi</ButtonLink>
          </div>
        </div>

        <div className="rounded-3xl bg-brand-50 p-5 sm:p-6" aria-hidden="true">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">JK</span>
                <div>
                  <p className="text-sm font-bold">Jasur K.</p>
                  <p className="text-xs text-ink-soft">Mobilograf · Toshkent</p>
                </div>
              </div>
              <span className="rounded-full bg-peach px-2.5 py-1 text-xs font-semibold">Mobilograf</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["bg-peach", "bg-sky", "bg-mint"].map((c) => (
                <div key={c} className={`flex aspect-[4/5] items-center justify-center rounded-xl ${c}`}>
                  <Play className="h-4 w-4 fill-ink text-ink" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-semibold">Reels paketi</span>
              <span className="font-bold">300 000 so‘m dan</span>
            </div>
          </div>
          <div className="card mt-3 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-soft">Buyurtma holati</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">Jarayonda</span>
            </div>
            <p className="mt-1 text-sm font-bold">Reels paketi · 4 ta video</p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-brand" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
