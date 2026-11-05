import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { Logo } from "@/components/ui/logo";
import { requireSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profilni sozlash" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireSessionUser();
  if (user.role) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <Logo className="mb-6" />
      <OnboardingForm defaultName={user.name} />
    </main>
  );
}
