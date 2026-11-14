import { Check } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthShell({
  heading,
  text,
  points,
  children,
}: {
  heading: string;
  text?: string;
  points?: string[];
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden hero-gradient flex-col justify-between p-10 text-white lg:flex xl:p-14">
        <Logo dark />
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight">{heading}</h1>
          {text && <p className="mt-4 text-sm leading-relaxed text-slate-300">{text}</p>}
          {points && (
            <ul className="mt-8 space-y-3 text-sm text-slate-200">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Creator Hub</p>
      </aside>
      <section className="flex flex-col items-center justify-center px-4 py-8 sm:px-8">
        <Logo className="mb-6 lg:hidden" />
        <div className="flex w-full max-w-md justify-center">{children}</div>
      </section>
    </main>
  );
}
