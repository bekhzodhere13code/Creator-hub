import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Kirish" };

export default function SignInPage() {
  return (
    <AuthShell
      heading="Mutaxassislar va portfoliolar sizni kutmoqda"
      points={[
        "Mobilograf va SMM mutaxassislarini qidiring",
        "Portfoliolarni ko‘rib, xizmatni tanlang",
        "Buyurtmalaringiz holatini kuzating",
      ]}
    >
      <AuthForm mode="in" />
    </AuthShell>
  );
}
