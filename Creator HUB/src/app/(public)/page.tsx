import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { HowItWorksSection, PlatformSection, ServicesSection } from "@/components/landing/sections";
import { SiteHeader } from "@/components/landing/site-header";
import { CtaBand, SiteFooter } from "@/components/landing/site-footer";

export default async function PublicHome() {
  // Login qilgan foydalanuvchi Public Home o‘rniga o‘z dashboard'iga tushadi
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <PlatformSection />
        <HowItWorksSection />
        <ServicesSection />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
