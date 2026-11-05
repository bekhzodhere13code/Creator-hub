import { ButtonLink } from "@/components/ui/button";
import { DashboardHeader, EmptyState } from "./dashboard-header";

export function ClientHome({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <DashboardHeader name={name} role="mijoz" subtitle="Bugun qaysi xizmatga buyurtma bermoqchisiz?" />

      <section className="rounded-xl2 bg-[#0A0A1F] p-6 text-white sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">Mobilograf yoki SMM mutaxassisini toping</h2>
        <p className="mt-2 max-w-md text-sm text-slate-300">Portfoliolarni ko‘ring, xizmat narxlarini solishtiring va buyurtma bering.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/mobilograflar" variant="light">Mobilograflar</ButtonLink>
          <ButtonLink href="/smm-mutaxassislari">SMM mutaxassislari</ButtonLink>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">Faol buyurtmalar</h2>
        <EmptyState title="Hozircha buyurtma yo‘q" text="Mutaxassisni tanlab, birinchi buyurtmangizni yuboring." />
      </section>
    </div>
  );
}
