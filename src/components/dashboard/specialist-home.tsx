import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ROLE_LABEL, type AppRole } from "@/lib/roles";
import { DashboardHeader, EmptyState } from "./dashboard-header";

export async function SpecialistHome({ name, role, userId }: { name: string; role: AppRole; userId: string }) {
  // Profil to‘liqligi: DB'dan o‘qiladi. Baza ulanmagan bo‘lsa sahifa yiqilmasin.
  let hasInstagram = false;
  try {
    const dbUser = await db.user.findUnique({ where: { clerkId: userId }, include: { masterProfile: true } });
    hasInstagram = Boolean(dbUser?.masterProfile?.instagramUrl);
  } catch (e) {
    console.error("[dashboard] DB o‘qishda xatolik:", e);
  }

  const steps = [
    { label: "Rol va asosiy ma’lumotlar", done: true, href: "/profil" },
    { label: "Instagram portfolio havolasi", done: hasInstagram, href: "/profil" },
    { label: "Birinchi xizmatni qo‘shish", done: false, href: "/xizmatlar" },
    { label: "Portfolioga ish yuklash", done: false, href: "/portfolio" },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader name={name} role={role} subtitle={`${ROLE_LABEL[role]} sifatida buyurtmalar shu yerda ko‘rinadi.`} />

      <section className="space-y-3">
        <h2 className="text-base font-bold">Faol buyurtmalar</h2>
        <EmptyState title="Hozircha buyurtma yo‘q" text="Xizmat va portfolio qo‘shsangiz, mijozlar sizni topadi." />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">Profilni to‘ldiring</h2>
        <ul className="card divide-y divide-slate-100">
          {steps.map((s) => (
            <li key={s.label}>
              <Link href={s.href} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                {s.done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                <span className={s.done ? "text-ink-soft line-through" : "font-medium"}>{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
