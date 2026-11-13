import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Ro‘yxatdan o‘tish" };

export default function SignUpPage() {
  return (
    <AuthShell
      heading="Creator Hub’da profilingizni yarating"
      text="Mobilograf va SMM mutaxassislari xizmatlarini qo‘shadi, portfolio ko‘rsatadi va buyurtma oladi. Mutaxassislikni ro‘yxatdan o‘tgach tanlaysiz."
      points={["Google yoki email orqali tez kirish", "Xizmatlar va portfolio — bir joyda", "Buyurtma Telegram’ga darhol keladi"]}
    >
      <AuthForm mode="up" />
    </AuthShell>
  );
}
