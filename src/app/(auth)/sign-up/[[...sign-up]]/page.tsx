import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Ro‘yxatdan o‘tish" };

export default function SignUpPage() {
  return (
    <AuthShell
      heading="Rolingizni tanlang va boshlang"
      text="Mobilograf va SMM mutaxassislari xizmatlarini sotadi, kerak bo‘lsa boshqa xizmatlarni sotib ham oladi. Mijozlar xizmatlarni ko‘radi va buyurtma beradi. Rolni ro‘yxatdan o‘tgach tanlaysiz."
    >
      <SignUp />
    </AuthShell>
  );
}
